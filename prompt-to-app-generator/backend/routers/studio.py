from fastapi import APIRouter, Response, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os
import json
import re
import hashlib
from itertools import cycle
from openai import OpenAI
from dotenv import load_dotenv
from utils.code_validator import validate_and_fix_react_code
from utils.templates import get_all_templates, get_template_by_id

# Load .env file variables into the environment
load_dotenv()

def _load_groq_api_keys():
    keys = []

    joined_keys = os.getenv("GROQ_API_KEYS", "")
    if joined_keys:
        keys.extend([key.strip() for key in re.split(r"[;,]\s*", joined_keys) if key.strip()])

    for index in range(1, 10):
        key = os.getenv(f"GROQ_API_KEY_{index}")
        if key and key.strip():
            keys.append(key.strip())

    single_key = os.getenv("GROQ_API_KEY")
    if single_key and single_key.strip():
        keys.append(single_key.strip())

    # Preserve order but remove duplicates.
    deduped = []
    seen = set()
    for key in keys:
        if key not in seen:
            seen.add(key)
            deduped.append(key)
    return deduped


_groq_api_keys = _load_groq_api_keys()


def _load_groq_models():
    models = []

    env_models = os.getenv("GROQ_MODELS", "")
    if env_models:
        models.extend([model.strip() for model in re.split(r"[;,]\s*", env_models) if model.strip()])

    single_model = os.getenv("GROQ_MODEL")
    if single_model and single_model.strip():
        models.append(single_model.strip())

    # Sensible defaults ordered from lighter to heavier.
    models.extend([
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
    ])

    deduped = []
    seen = set()
    for model in models:
        if model not in seen:
            seen.add(model)
            deduped.append(model)
    return deduped


_groq_models = _load_groq_models()

_groq_clients = [
    OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
    for api_key in _groq_api_keys
]
_groq_client_cycle = cycle(enumerate(_groq_clients)) if _groq_clients else None


def _extract_retry_seconds(error_text: str) -> Optional[int]:
    patterns = [
        r"retry in ([0-9]+(?:\.[0-9]+)?)s",
        r"'retryDelay': '([0-9]+)s'",
    ]
    for pattern in patterns:
        match = re.search(pattern, error_text, re.IGNORECASE)
        if match:
            try:
                return int(float(match.group(1)))
            except ValueError:
                return None
    return None


def _build_user_facing_groq_error(error_text: str) -> str:
    lowered = error_text.lower()
    if "quota exceeded" in lowered or "rate limit" in lowered or "error code: 429" in lowered:
        retry_after = _extract_retry_seconds(error_text)
        retry_hint = f" Retry after about {retry_after} seconds." if retry_after else ""
        return (
            "Groq API quota/rate limit reached for this project."
            f"{retry_hint} "
            "Try the next Groq key or check quota and billing for the active key/project."
        )

    if "api key" in lowered and ("invalid" in lowered or "not valid" in lowered):
        return "Groq API key is invalid or restricted. Verify the configured GROQ_API_KEY values in backend/.env."

    return "Groq request failed. Check backend logs for details and verify API key, model availability, and quota."


def _http_exception_for_groq_error(error_text: str) -> HTTPException:
    lowered = error_text.lower()
    if "quota exceeded" in lowered or "rate limit" in lowered or "error code: 429" in lowered:
        return HTTPException(status_code=429, detail=_build_user_facing_groq_error(error_text))
    return HTTPException(status_code=500, detail=_build_user_facing_groq_error(error_text))


def _is_quota_error(error_text: str) -> bool:
    lowered = error_text.lower()
    return "quota exceeded" in lowered or "resource_exhausted" in lowered or "error code: 429" in lowered


def _call_groq_with_rotation(messages, temperature: float, force_json: bool = True):
    if not _groq_clients:
        raise RuntimeError("No GROQ_API_KEY entries configured for fallback.")
    if not _groq_models:
        raise RuntimeError("No GROQ_MODEL values configured for fallback.")

    last_error = None
    attempts = len(_groq_clients) * len(_groq_models)

    for _ in range(attempts):
        client_index, groq_client = next(_groq_client_cycle)
        for model in _groq_models:
            try:
                print(f"Using Groq fallback key #{client_index + 1} with model {model}.")
                kwargs = {
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                }
                if force_json:
                    kwargs["response_format"] = {"type": "json_object"}
                return groq_client.chat.completions.create(**kwargs)
            except Exception as groq_error:
                last_error = groq_error
                print(f"Groq fallback key #{client_index + 1} with model {model} failed: {groq_error}")
                if not _is_quota_error(str(groq_error)) and "rate limit" not in str(groq_error).lower():
                    break

    if last_error:
        raise last_error
    raise RuntimeError("Groq fallback failed without a specific error.")


def _create_completion(messages, temperature: float, force_json: bool = True):
    if not _groq_clients:
        raise RuntimeError(
            "No GROQ_API_KEY values configured. Set GROQ_API_KEYS, GROQ_API_KEY_1, or GROQ_API_KEY in backend/.env."
        )
    return _call_groq_with_rotation(messages, temperature, force_json=force_json)


def _extract_json_payload(content: str) -> Dict[str, Any]:
    if not isinstance(content, str) or not content.strip():
        raise json.JSONDecodeError("Empty model response.", content or "", 0)

    trimmed = content.strip()

    # Strip markdown fences if model returns ```json ... ```
    fence_match = re.match(r"^```(?:json)?\s*([\s\S]*?)\s*```$", trimmed, re.IGNORECASE)
    if fence_match:
        trimmed = fence_match.group(1).strip()

    try:
        return json.loads(trimmed)
    except json.JSONDecodeError:
        pass

    decoder = json.JSONDecoder()
    for idx, ch in enumerate(trimmed):
        if ch != "{":
            continue
        try:
            parsed_obj, _ = decoder.raw_decode(trimmed[idx:])
            if isinstance(parsed_obj, dict):
                return parsed_obj
        except json.JSONDecodeError:
            continue

    raise json.JSONDecodeError("Could not parse valid JSON object from model response.", trimmed, 0)


def _prompt_profile(prompt: str) -> Dict[str, Any]:
    source = (prompt or "").strip()
    normalized = re.sub(r"\s+", " ", source)
    words = [w for w in re.findall(r"[A-Za-z0-9]+", normalized.lower()) if len(w) > 2]
    unique_words = []
    seen = set()
    for word in words:
        if word not in seen:
            seen.add(word)
            unique_words.append(word)

    digest = hashlib.sha1(normalized.encode("utf-8")).hexdigest() if normalized else "0" * 40
    seed = int(digest[:8], 16)

    palettes = [
        ("#67e8f9", "#818cf8"),
        ("#34d399", "#22d3ee"),
        ("#f59e0b", "#ef4444"),
        ("#a78bfa", "#ec4899"),
    ]
    stats_presets = [
        ("Adoption", "36.4%", "+4.1%"),
        ("Satisfaction", "92%", "+1.8%"),
        ("Completion", "78.2%", "+3.9%"),
        ("Retention", "68.0%", "+2.4%"),
        ("Engagement", "81.3%", "+5.0%"),
        ("Conversion", "24.7%", "+2.6%"),
        ("Throughput", "1.2k/day", "+9.3%"),
        ("Latency", "142ms", "-11ms"),
    ]

    title_bits = unique_words[:2]
    if title_bits:
        app_name = " ".join(w.capitalize() for w in title_bits) + " Studio"
    else:
        app_name = "Prompt Driven Studio"
    focus = unique_words[:4] if unique_words else ["custom", "interactive", "dashboard", "workflow"]

    selected_palette = palettes[seed % len(palettes)]
    selected_stats = []
    for i in range(4):
        selected_stats.append(stats_presets[(seed + i) % len(stats_presets)])

    return {
        "appName": app_name,
        "focusKeywords": focus,
        "accentStart": selected_palette[0],
        "accentEnd": selected_palette[1],
        "stats": selected_stats,
    }


def _fallback_app_code(message: str, prompt: str = "") -> str:
    safe_message = json.dumps(message)
    profile = _prompt_profile(prompt)
    safe_app_name = json.dumps(profile["appName"])
    safe_focus_keywords = json.dumps(profile["focusKeywords"])
    safe_accent_start = json.dumps(profile["accentStart"])
    safe_accent_end = json.dumps(profile["accentEnd"])
    safe_stats = json.dumps(
        [
            {"label": label, "value": value, "delta": delta}
            for (label, value, delta) in profile["stats"]
        ]
    )
    code = (
        "export default function App() {\n"
        "  const msg = " + safe_message + ";\n"
        "  const appName = " + safe_app_name + ";\n"
        "  const focusKeywords = " + safe_focus_keywords + ";\n"
        "  const accentStart = " + safe_accent_start + ";\n"
        "  const accentEnd = " + safe_accent_end + ";\n"
        "  const [tab, setTab] = useState('overview');\n"
        "  const tabs = ['Overview', 'Features', 'Activity', 'Roadmap'];\n"
        "  const stats = " + safe_stats + ";\n"
        "  const s = {\n"
        "    root: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #131326 50%, #0a0a18 100%)', color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0 },\n"
        "    header: { position: 'sticky', top: 0, zIndex: 20, background: 'rgba(10,10,24,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },\n"
        "    logo: { fontSize: 20, fontWeight: 700, background: `linear-gradient(90deg, ${accentStart}, ${accentEnd})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },\n"
        "    badge: { fontSize: 11, background: 'rgba(103,232,249,0.12)', color: accentStart, border: '1px solid rgba(103,232,249,0.25)', borderRadius: 20, padding: '4px 12px', letterSpacing: '0.12em', textTransform: 'uppercase' },\n"
        "    main: { maxWidth: 1100, margin: '0 auto', padding: '40px 32px' },\n"
        "    hero: { marginBottom: 40, padding: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' },\n"
        "    heroLabel: { fontSize: 11, color: accentStart, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 10 },\n"
        "    heroTitle: { fontSize: 32, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.2, background: 'linear-gradient(90deg, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },\n"
        "    heroMsg: { fontSize: 14, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 24px' },\n"
        "    tabRow: { display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' },\n"
        "    tabBtn: (active) => ({ padding: '8px 20px', borderRadius: 30, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.2s', background: active ? 'linear-gradient(90deg,#67e8f9,#818cf8)' : 'rgba(255,255,255,0.04)', borderColor: active ? 'transparent' : 'rgba(255,255,255,0.1)', color: active ? '#0f0f1a' : '#94a3b8' }),\n"
        "    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 },\n"
        "    card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px 20px' },\n"
        "    cardLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 },\n"
        "    cardValue: { fontSize: 28, fontWeight: 700, color: '#f8fafc', marginBottom: 4 },\n"
        "    cardDelta: { fontSize: 13, color: '#34d399', fontWeight: 600 },\n"
        "    bottomGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },\n"
        "    panel: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 },\n"
        "    panelTitle: { fontSize: 17, fontWeight: 700, marginBottom: 10, color: '#f1f5f9' },\n"
        "    panelText: { fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 16 },\n"
        "    ctaBtn: { padding: '10px 24px', borderRadius: 30, background: 'linear-gradient(90deg,#67e8f9,#818cf8)', color: '#0f0f1a', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' },\n"
        "    focusBox: { background: 'rgba(103,232,249,0.06)', border: '1px dashed rgba(103,232,249,0.2)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#67e8f9' },\n"
        "  };\n"
        "  return (\n"
        "    <div style={s.root}>\n"
        "      <header style={s.header}>\n"
        "        <span style={s.logo}>{appName}</span>\n"
        "        <span style={s.badge}>Preview Ready</span>\n"
        "      </header>\n"
        "      <main style={s.main}>\n"
        "        <div style={s.hero}>\n"
        "          <p style={s.heroLabel}>Prompt-Aware Fallback</p>\n"
        "          <h1 style={s.heroTitle}>Your App Is Almost Ready</h1>\n"
        "          <p style={s.heroMsg}>{msg}</p>\n"
        "          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>\n"
        "            {focusKeywords.map((k) => (\n"
        "              <span key={k} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 9999, border: '1px solid rgba(255,255,255,0.15)', color: '#cbd5e1' }}>#{k}</span>\n"
        "            ))}\n"
        "          </div>\n"
        "          <div style={s.tabRow}>\n"
        "            {tabs.map(t => <button key={t} style={s.tabBtn(tab === t.toLowerCase())} onClick={() => setTab(t.toLowerCase())}>{t}</button>)}\n"
        "          </div>\n"
        "        </div>\n"
        "        <div style={s.grid}>\n"
        "          {stats.map(st => (\n"
        "            <div key={st.label} style={s.card}>\n"
        "              <div style={s.cardLabel}>{st.label}</div>\n"
        "              <div style={s.cardValue}>{st.value}</div>\n"
        "              <div style={s.cardDelta}>{st.delta} this month</div>\n"
        "            </div>\n"
        "          ))}\n"
        "        </div>\n"
        "        <div style={s.bottomGrid}>\n"
        "          <div style={s.panel}>\n"
        "            <div style={s.panelTitle}>Interactive Preview</div>\n"
        "            <p style={s.panelText}>Tabs and buttons are fully interactive. Current focus: <strong style={{color:accentStart}}>{tab}</strong></p>\n"
        "            <div style={s.focusBox}>Active section -> {tab}</div>\n"
        "          </div>\n"
        "          <div style={s.panel}>\n"
        "            <div style={s.panelTitle}>Get Started</div>\n"
        "            <p style={s.panelText}>Refine your prompt to generate the full app with all your desired features and design.</p>\n"
        "            <button style={s.ctaBtn}>Regenerate App →</button>\n"
        "          </div>\n"
        "        </div>\n"
        "      </main>\n"
        "    </div>\n"
        "  );\n"
        "}"
    )
    return code


def _repair_common_quote_breaks(code: str) -> str:
    if not code:
        return code

    # Repair common malformed single-quoted strings like: setResult('It's a tie!')
    code = re.sub(
        r"(\(\s*)'([^'\n\r]*)'([A-Za-z][^'\n\r]*)'(\s*\))",
        lambda m: f"{m.group(1)}\"{m.group(2)}'{m.group(3)}\"{m.group(4)}",
        code,
    )

    code = re.sub(
        r"(:\s*)'([^'\n\r]*)'([A-Za-z][^'\n\r]*)'(?=\s*[,}\]])",
        lambda m: f"{m.group(1)}\"{m.group(2)}'{m.group(3)}\"",
        code,
    )

    code = re.sub(
        r"(=\s*)'([^'\n\r]*)'([A-Za-z][^'\n\r]*)'(?=\s*[;,\n])",
        lambda m: f"{m.group(1)}\"{m.group(2)}'{m.group(3)}\"",
        code,
    )

    return code


def _normalize_generated_payload(result_json: Dict[str, Any], source_error: str = "", was_auto_fixed: bool = False) -> Dict[str, Any]:
    normalized = result_json if isinstance(result_json, dict) else {}

    app_name = normalized.get("appName")
    if not isinstance(app_name, str) or not app_name.strip():
        app_name = "Generated App"

    components = normalized.get("components")
    if not isinstance(components, dict):
        components = {}

    cleaned_components = {}
    for filename, code in components.items():
        if isinstance(filename, str) and filename.strip():
            if isinstance(code, str) and code.strip():
                cleaned_components[filename] = _repair_common_quote_breaks(code)
            else:
                cleaned_components[filename] = ""

    used_fallback = False
    if not isinstance(cleaned_components.get("App.jsx"), str) or not cleaned_components.get("App.jsx", "").strip():
        cleaned_components["App.jsx"] = _fallback_app_code(
            source_error or "The model returned an incomplete component payload.",
            normalized.get("promptContext", ""),
        )
        used_fallback = True

    component_tree = normalized.get("componentTree")
    if not isinstance(component_tree, dict):
        component_tree = {"name": "App", "children": []}

    return {
        "appName": app_name,
        "components": cleaned_components,
        "componentTree": component_tree,
        "wasAutoFixed": was_auto_fixed,
        "generationMeta": {
            "usedFallback": used_fallback,
            "fallbackReason": source_error if used_fallback else "",
        },
    }


def _should_run_improvement_loop(code: str) -> tuple[bool, str]:
    if not isinstance(code, str):
        return False, "generated code was not a string"

    stripped_code = code.strip()
    if not stripped_code:
        return False, "generated code was empty"

    line_count = len(stripped_code.splitlines())
    hook_count = len(re.findall(r"\buse(?:State|Effect|Memo|Reducer|Ref|Callback|LayoutEffect)\b", stripped_code))
    section_count = len(re.findall(r"<(?:main|section|article|aside|nav|header|footer|form|table|dialog|canvas)\b", stripped_code, re.IGNORECASE))
    interaction_count = len(re.findall(r"\bon(?:Click|Submit|Change|Input|KeyDown|KeyUp|Focus|Blur)\s*=", stripped_code))
    map_count = len(re.findall(r"\.map\s*\(", stripped_code))
    form_count = len(re.findall(r"<form\b", stripped_code, re.IGNORECASE))
    table_count = len(re.findall(r"<table\b", stripped_code, re.IGNORECASE))
    custom_component_count = len(set(re.findall(r"<([A-Z][A-Za-z0-9_]*)\b", stripped_code)))

    complexity_score = (
        line_count
        + hook_count * 30
        + section_count * 20
        + interaction_count * 12
        + map_count * 16
        + form_count * 18
        + table_count * 24
        + custom_component_count * 10
    )

    complex_signals = sum(
        1
        for signal in (
            line_count >= 160,
            hook_count >= 2,
            section_count >= 3,
            interaction_count >= 4,
            map_count >= 2,
            form_count >= 1 and hook_count >= 2,
            table_count >= 1,
            custom_component_count >= 2,
        )
        if signal
    )

    if complexity_score < 220 or complex_signals < 2:
        return (
            False,
            f"simple app detected (lines={line_count}, hooks={hook_count}, sections={section_count}, interactions={interaction_count}, maps={map_count})",
        )

    return True, (
        f"complex app detected (lines={line_count}, hooks={hook_count}, sections={section_count}, "
        f"interactions={interaction_count}, maps={map_count}, score={complexity_score})"
    )


def _is_groq_rate_limit(error_text: str) -> bool:
    lowered = error_text.lower()
    return "rate limit" in lowered or "quota exceeded" in lowered or "error code: 429" in lowered or "rate_limit_exceeded" in lowered

router = APIRouter(prefix="/api/studio", tags=["Studio"])

class GenerateAppPayload(BaseModel):
    prompt: str
    framework: Optional[str] = "react"
    theme: Optional[str] = "dark"
    template: Optional[str] = None
    existingApp: Optional[Dict[str, Any]] = None


class RegenerateRequest(BaseModel):
    componentName: str
    instruction: str



class FixCodeRequest(BaseModel):
    code: str
    error: str

@router.get("/templates")
async def list_templates():
    """Returns a list of available app templates."""
    return get_all_templates()


@router.post("/generate-app")
async def generate_app(payload: GenerateAppPayload):
    print("Received prompt:", payload.prompt)

    # Template handling (unchanged)
    if payload.template:
        template_data = get_template_by_id(payload.template)
        if template_data:
            return {
                "appName": template_data["appName"],
                "components": {"App.jsx": template_data["code"]},
                "componentTree": {"name": "App", "children": []},
                "wasAutoFixed": False,
            }

    # -------------------------
    # SYSTEM PROMPT (UNCHANGED BUT CLEANED)
    # -------------------------
    system_prompt = f"""You are a SENIOR FRONTEND ENGINEER and PRODUCT DESIGNER (UI/UX).

Generate a PREMIUM, PRODUCTION-LEVEL React app.

Return ONLY JSON:
{{
"appName": "App Name",
"components": {{
"App.jsx": "full code"
}},
"componentTree": {{
"name": "App",
"children": []
}}
}}

Rules:

* Use Tailwind CSS
* Modern UI (cards, spacing, hierarchy)
* Include interactivity (state, buttons)
* No placeholders
* Single file App.jsx
* Do NOT use any external libraries that require installation (e.g., `@fortawesome/react-fontawesome`). For icons, ONLY use `lucide-react` or inline SVGs."""

    user_prompt_content = payload.prompt

    # Memory support (existing app editing)
    if payload.existingApp:
        user_prompt_content = (
            f"Prompt: {payload.prompt}\n\n"
            f"Modify existing app:\n{json.dumps(payload.existingApp)}"
        )

    try:
        # =========================
        # STEP 1: INITIAL GENERATION
        # =========================
        completion = _create_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt_content}
            ],
            temperature=0.3
        )

        content = completion.choices[0].message.content
        print("Raw AI output:", content)

        result_json = _extract_json_payload(content)
        result_json["promptContext"] = payload.prompt

        initial_code = result_json.get("components", {}).get("App.jsx", "")

        # Safety check
        if not initial_code or len(initial_code) < 100:
            print("⚠️ Weak generation, skipping improvement loop")
            return _normalize_generated_payload(result_json)

        should_improve, improvement_reason = _should_run_improvement_loop(initial_code)
        if not should_improve:
            print(f"⚠️ Skipping improvement loop: {improvement_reason}")
            return _normalize_generated_payload(result_json)

        print(f"✅ Running improvement loop: {improvement_reason}")

        # =========================
        # STEP 2 & 3: CRITIC & IMPROVER WITH FALLBACK
        # =========================
        try:
            critic_prompt = f"""
You are a strict senior UI/UX reviewer.

Analyze this React app and list problems in:

* UI design
* Layout structure
* Interactivity
* Real-world usability

Be harsh and specific.

The code is already provided. Do NOT ask for it again.

Code:
{initial_code}
"""

            critic_response = _create_completion(
                messages=[{"role": "user", "content": critic_prompt}],
                temperature=0.3,
                force_json=False
            )

            issues = critic_response.choices[0].message.content
            print("Critic Issues:", issues[:300])

            improve_prompt = f"""
You are a senior frontend engineer and product designer.

Improve this app to production-level quality.

Fix all issues:
{issues}

Enhance:

* UI (modern, premium)
* Layout (sections, spacing)
* Interactivity (state updates, animations)
* Visual hierarchy

IMPORTANT:

* Return FULL React code only
* No explanation
* Keep all working features

Code:
{initial_code}
"""

            improve_response = _create_completion(
                messages=[{"role": "user", "content": improve_prompt}],
                temperature=0.2,
                force_json=False
            )

            improved_code = improve_response.choices[0].message.content

            # =========================
            # STEP 4: APPLY IMPROVED CODE
            # =========================
            if not improved_code or len(improved_code) < 100:
                print("⚠️ Improved code too short or empty, falling back to original code.")
            else:
                result_json["components"]["App.jsx"] = improved_code

        except Exception as ai_error:
            print(f"⚠️ AI improvement loop failed: {ai_error}. Falling back to original code.")
            # Retain original initial_code in result_json

        # =========================
        # STEP 5: VALIDATION
        # =========================
        validation_result = validate_and_fix_react_code(result_json["components"])

        result_json["components"] = validation_result["components"]
        result_json["wasAutoFixed"] = validation_result["wasAutoFixed"]

        return _normalize_generated_payload(result_json)

    except json.JSONDecodeError as json_error:
        print(f"JSON parsing error: {json_error}")
        return _normalize_generated_payload(
            {"promptContext": payload.prompt},
            f"Invalid JSON response: {json_error}",
        )

    except Exception as e:
        print(f"Error during app generation: {e}")
        raise _http_exception_for_groq_error(str(e)) from e


@router.post("/regenerate-component")
async def regenerate_component(req: RegenerateRequest):
    system_prompt = """You are a SENIOR FRONTEND ENGINEER and PRODUCT DESIGNER. Regenerate a single React component based on the given instruction, ensuring PREMIUM, PRODUCT-LEVEL UI/UX and HIGH INTERACTIVITY.
You MUST respond with a JSON object containing EXACTLY one key:
- "code": The full source code string for the updated component.

IMPORTANT RULES:
- Use standard React functional components with hooks.
- DESIGN & QUALITY: Use Tailwind CSS. Ensure clear visual hierarchy, modern styling (gradients, shadows, rounded layouts), and realistic content (images, icons, real names). It must look like a premium product component (Stripe/Zomato level).
- FUNCTIONALITY: Ensure real interactivity, state changes, dynamic updates, and visual feedback (hover animations, toasts). No fake UI or placeholder text.
- DO NOT use external libraries except `lucide-react` for icons.
- Always use `export default function ComponentName()` syntax.
- Return ONLY the component code, no explanations outside the JSON."""

    user_prompt = f"Component name: {req.componentName}\nInstruction: {req.instruction}"

    try:
        completion = _create_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7
        )
        result_json = json.loads(completion.choices[0].message.content)
        return {
            "componentName": req.componentName,
            "code": result_json.get("code", f"export default function {req.componentName}() {{ return <div>Updated {req.componentName}</div>; }}")
        }
    except Exception as e:
        print(f"Error calling Groq API for regenerate-component: {e}")
        raise _http_exception_for_groq_error(str(e))


@router.post("/fix-code")
async def fix_code(req: FixCodeRequest):
    system_prompt = """You are an expert React and JavaScript debugger. Fix the provided code based on the given error message.
You MUST respond with a JSON object containing EXACTLY one key:
- "fixedCode": The complete fixed source code string.

IMPORTANT RULES:
- Preserve the original component structure and intent.
- Only fix what is broken — do not rewrite unnecessarily.
- Use Tailwind CSS for styling.
- Always use `export default function ComponentName()` syntax.
- Return ONLY the fixed code inside the JSON, no explanations."""

    user_prompt = f"Error message:\n{req.error}\n\nBroken code:\n{req.code}"

    try:
        completion = _create_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3
        )
        result_json = json.loads(completion.choices[0].message.content)
        return {
            "fixedCode": result_json.get("fixedCode", req.code)
        }
    except Exception as e:
        print(f"Error calling Groq API for fix-code: {e}")
        raise _http_exception_for_groq_error(str(e))
