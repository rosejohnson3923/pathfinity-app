#!/usr/bin/env python3
import re
import os

def fix_typescript_quotes(filepath):
    """Fix all quote issues in TypeScript files"""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix common contractions with mismatched quotes
    replacements = [
        (r'"Don"t', r'"Don\'t'),
        (r'"Let"s', r'"Let\'s'),
        (r'"I"ll', r'"I\'ll'),
        (r'"I"m', r'"I\'m'),
        (r'"We"ll', r'"We\'ll'),
        (r'"We"re', r'"We\'re'),
        (r'"We"ve', r'"We\'ve'),
        (r'"You"re', r'"You\'re'),
        (r'"You"ve', r'"You\'ve'),
        (r'"You"ll', r'"You\'ll'),
        (r'"It"s', r'"It\'s'),
        (r'"That"s', r'"That\'s'),
        (r'"What"s', r'"What\'s'),
        (r'"There"s', r'"There\'s'),
        (r'"Here"s', r'"Here\'s'),
        (r'"Who"s', r'"Who\'s'),
        (r'"Where"s', r'"Where\'s'),
        (r'"How"s', r'"How\'s'),
        (r'"They"re', r'"They\'re'),
        (r'"They"ve', r'"They\'ve'),
        (r'"They"ll', r'"They\'ll'),
        (r'"Can"t', r'"Can\'t'),
        (r'"Won"t', r'"Won\'t'),
        (r'"Didn"t', r'"Didn\'t'),
        (r'"Doesn"t', r'"Doesn\'t'),
        (r'"Isn"t', r'"Isn\'t'),
        (r'"Aren"t', r'"Aren\'t'),
        (r'"Wasn"t', r'"Wasn\'t'),
        (r'"Weren"t', r'"Weren\'t'),
        (r'"Haven"t', r'"Haven\'t'),
        (r'"Hasn"t', r'"Hasn\'t'),
        (r'"Hadn"t', r'"Hadn\'t'),
        (r'"Couldn"t', r'"Couldn\'t'),
        (r'"Wouldn"t', r'"Wouldn\'t'),
        (r'"Shouldn"t', r'"Shouldn\'t'),
        (r'"Teacher"s', r'"Teacher\'s'),
        (r'"Let"s', r'"Let\'s'),
        (r'"sky"s', r'"sky\'s'),
        (r'"that"s', r'"that\'s'),
    ]
    
    # Apply all replacements
    for old, new in replacements:
        content = re.sub(old, new, content, flags=re.IGNORECASE)
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Fixed quotes in {filepath}")

# Process all TypeScript files in the rules-engine directory
rules_dir = '/mnt/c/Users/rosej/Documents/Projects/pathfinity-revolutionary/src/rules-engine'

for root, dirs, files in os.walk(rules_dir):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            try:
                fix_typescript_quotes(filepath)
            except Exception as e:
                print(f"Error processing {filepath}: {e}")

print("Done fixing all quotes!")