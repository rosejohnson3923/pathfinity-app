#!/usr/bin/env python3
import re

def fix_quotes_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix lines that start with single quote and end with double quote
    # Pattern: 'text ending with !"
    content = re.sub(r"'([^']*!)\"", r'"\1"', content)
    content = re.sub(r"'([^']*\?)\"", r'"\1"', content)
    content = re.sub(r"'([^']*\.)\"", r'"\1"', content)
    
    # Fix any remaining mismatched quotes in the companions file
    # Look for patterns like 'Text with apostrophe's content!'
    content = re.sub(r"'([^']*'[^']*)'", r'"\1"', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed quotes in {filepath}")

# Fix the files
fix_quotes_in_file('/mnt/c/Users/rosej/Documents/Projects/pathfinity-revolutionary/src/rules-engine/companions/CompanionRulesEngine.ts')
fix_quotes_in_file('/mnt/c/Users/rosej/Documents/Projects/pathfinity-revolutionary/src/rules-engine/containers/ExperienceAIRulesEngine.ts')

print("Done!")