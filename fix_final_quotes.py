#!/usr/bin/env python3
import re

def fix_all_quotes(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix specific patterns that were missed
    fixes = [
        # Fix "you"re patterns
        (r'"Imagine you"re', r'"Imagine you\'re'),
        # Fix "today"s patterns  
        (r'"today"s', r'"today\'s'),
        (r'"Welcome to today"s', r'"Welcome to today\'s'),
        (r'"Ready for today"s', r'"Ready for today\'s'),
        (r'"Time to write today"s', r'"Time to write today\'s'),
        # Fix "student"s patterns
        (r'"student"s', r'"student\'s'),
        # Fix "we"ve patterns
        (r'"we"ve', r'"we\'ve'),
        (r'"Time to apply what we"ve', r'"Time to apply what we\'ve'),
        # Fix "Here"s patterns
        (r'"Here"s', r'"Here\'s'),
        (r'"Good effort! Here"s', r'"Good effort! Here\'s'),
        # Fix "I"m patterns
        (r'"I"m', r'"I\'m'),
        (r'"Welcome back, I"m', r'"Welcome back, I\'m'),
        # Fix "there"s patterns
        (r'"there"s', r'"there\'s'),
        (r'"Take your time, there"s', r'"Take your time, there\'s'),
        # Fix "sky"s patterns
        (r'"sky"s', r'"sky\'s'),
        (r'"The sky"s', r'"The sky\'s'),
        # Fix "Where"s patterns
        (r'"Where"s', r'"Where\'s'),
        # Fix "What"s patterns
        (r'"What"s', r'"What\'s'),
        # Fix "Let"s patterns
        (r'"Let"s', r'"Let\'s'),
    ]
    
    for old, new in fixes:
        content = re.sub(old, new, content, flags=re.IGNORECASE)
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Fixed final quotes in {filepath}")

# Fix the problematic files
files_to_fix = [
    '/mnt/c/Users/rosej/Documents/Projects/pathfinity-revolutionary/src/rules-engine/companions/CompanionRulesEngine.ts',
    '/mnt/c/Users/rosej/Documents/Projects/pathfinity-revolutionary/src/rules-engine/containers/ExperienceAIRulesEngine.ts'
]

for file in files_to_fix:
    try:
        fix_all_quotes(file)
    except Exception as e:
        print(f"Error fixing {file}: {e}")

print("Done fixing final quotes!")