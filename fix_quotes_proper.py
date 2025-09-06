#!/usr/bin/env python3
import re

def fix_quotes_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    fixed_lines = []
    for line in lines:
        # Fix mismatched quotes in string literals
        # Pattern: strings that start with one quote type and end with another
        
        # First pass: fix obvious mismatches where opening and closing quotes differ
        # Look for patterns like 'text' or "text" but with mismatched quotes
        
        # Replace all string literals to use double quotes consistently
        # This regex finds strings with any quote type and normalizes them
        
        # Simple approach: if line contains quotes, ensure they match
        fixed_line = line
        
        # Count single and double quotes
        single_count = line.count("'")
        double_count = line.count('"')
        
        # If we have mismatched quotes (odd number), try to fix
        if single_count % 2 != 0 or double_count % 2 != 0:
            # Try to fix by replacing all quotes with double quotes for string literals
            # Skip if it's a comment line
            if '//' not in line or line.strip().startswith('//'):
                # For TypeScript string literals, use double quotes
                fixed_line = re.sub(r"'([^'\"]*)['\"]", r'"\1"', line)
        
        fixed_lines.append(fixed_line)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)
    print(f"Fixed quotes in {filepath}")

# Read the file and fix each string literal properly
def fix_typescript_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace all string literals to use double quotes
    # This handles the TypeScript/JavaScript string literals
    
    # Fix patterns where quotes are mismatched
    # Pattern 1: 'text" -> "text"
    content = re.sub(r"'([^'\"]*?)\"", r'"\1"', content)
    
    # Pattern 2: "text' -> "text"  
    content = re.sub(r'"([^\'\"]*?)\'', r'"\1"', content)
    
    # Fix array/object string values with mismatched quotes
    content = re.sub(r"\['([^']*)'\]", r'["\1"]', content)
    content = re.sub(r"\[\"([^\"]*)\'\]", r'["\1"]', content)
    
    # Fix property names in objects
    content = re.sub(r"'([a-zA-Z_][a-zA-Z0-9_]*)': ", r'"\1": ', content)
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed TypeScript quotes in {filepath}")

# Fix the files
fix_typescript_file('/mnt/c/Users/rosej/Documents/Projects/pathfinity-revolutionary/src/rules-engine/companions/CompanionRulesEngine.ts')
fix_typescript_file('/mnt/c/Users/rosej/Documents/Projects/pathfinity-revolutionary/src/rules-engine/containers/ExperienceAIRulesEngine.ts')

print("Done fixing quotes!")