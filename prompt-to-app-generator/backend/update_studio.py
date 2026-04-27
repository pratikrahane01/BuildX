import re
import sys

file_path = r"c:\Users\Admin\OneDrive\Documents\Desktop\DEV CLASH\prompt-to-app-generator\backend\routers\studio.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Find the start of @router.post("/generate-app")
start_idx = content.find('@router.post("/generate-app")')
# Find the start of the next route @router.post("/regenerate-component")
end_idx = content.find('@router.post("/regenerate-component")')

if start_idx == -1 or end_idx == -1:
    print("Could not find the function boundaries.")
    sys.exit(1)

new_func = """@router.post("/generate-app")
async def generate_app(req: GenerateRequest, response: Response):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    
    system_prompt = \"\"\"
You are an expert React developer. You generate modern, beautiful, and interactive React applications based on user prompts.
You MUST respond with a JSON object containing EXACTLY these keys:
- "appName": A short, catchy name for the app.
- "components": A dictionary mapping filenames (e.g., "App.jsx", "Navbar.jsx") to their full source code strings.
- "componentTree": A tree structure of the components. Example: {"name": "App", "children": [{"name": "Navbar", "props": {}}]}

IMPORTANT RULES FOR COMPONENT CODE:
- Use standard React (functional components, hooks). Assume `react` is in scope (do not import React, but you can assume useState, useEffect exist globally or just use them).
- DO NOT use external libraries except `lucide-react` for icons.
- Use Tailwind CSS for styling. Prefer a modern, high-contrast, beautiful aesthetic with dark mode themes.
- Always include an "App.jsx" file which acts as the root router and main layout.
- Always use `export default function ComponentName()` syntax.
- Ensure buttons and forms have some basic interactivity (e.g. useState for 'processing' states).
\"\"\"

    user_prompt = f"Prompt: {req.prompt}"
    if req.existingApp:
        user_prompt += f"\\n\\nIterate on the following existing application state by making the requested changes. ONLY return the modified components and any unmodified components so the full app works:\\n{json.dumps(req.existingApp)}"

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7
        )
        
        result_content = completion.choices[0].message.content
        result_json = json.loads(result_content)
        
        return {
            "appName": result_json.get("appName", "Generated App"),
            "components": result_json.get("components", {}),
            "componentTree": result_json.get("componentTree", {"name": "App", "children": []})
        }
    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        return {
            "appName": "Error App",
            "components": {
                "App.jsx": f"export default function App() {{\\n  return (\\n    <div className='min-h-screen bg-black text-red-500 p-8 flex items-center justify-center text-center'>\\n      <div>\\n        <h1 className='text-2xl font-bold mb-4'>Error Generating App</h1>\\n        <p className='text-zinc-400'>{str(e)}</p>\\n        <p className='mt-4 text-zinc-500 text-sm'>Make sure your OPENAI_API_KEY is set correctly in backend/.env</p>\\n      </div>\\n    </div>\\n  );\\n}}"
            },
            "componentTree": {"name": "App", "children": []}
        }

"""

new_content = content[:start_idx] + new_func + content[end_idx:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Successfully updated studio.py")
