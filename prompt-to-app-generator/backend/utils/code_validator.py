import re
from typing import Dict, Any

def validate_and_fix_react_code(components: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validates and attempts to fix common issues in generated React component code.

    Args:
        components: A dictionary of component filenames to their code.

    Returns:
        A dictionary containing the (potentially fixed) components and a flag indicating if fixes were applied.
    """
    was_auto_fixed = False
    fixed_components = components.copy()

    for filename, code in fixed_components.items():
        if not code or not filename.endswith((".jsx", ".js")):
            continue

        # Find buttons without an onClick handler
        # This is a simplified check. A more robust solution might involve AST parsing.
        # Pattern: <button ... (no onClick) ... >
        pattern = re.compile(r"<button\s+(?![^>]*onClick\s*=)[^>]*>", re.IGNORECASE)
        
        matches = list(pattern.finditer(code))
        if matches:
            was_auto_fixed = True
            offset = 0
            for match in matches:
                original_button_tag = match.group(0)
                # Add a placeholder onClick handler
                fixed_button_tag = original_button_tag[:-1] + ' onClick={() => alert("Button clicked!")}>'
                
                start = match.start() + offset
                end = match.end() + offset
                
                code = code[:start] + fixed_button_tag + code[end:]
                offset += len(fixed_button_tag) - len(original_button_tag)
        
        fixed_components[filename] = code

    return {
        "components": fixed_components,
        "wasAutoFixed": was_auto_fixed
    }
