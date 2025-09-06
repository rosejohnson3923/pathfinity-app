#!/bin/bash

# Fix all the malformed onChange syntax from the accessibility fixes
echo "Fixing onChange syntax errors..."

# Find and fix all occurrences
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "onChange={(e) = aria-label=" "$file"; then
    echo "Fixing: $file"
    # Create a temporary file with fixes
    sed -i.bak 's/onChange={(e) = aria-label="[^"]*"> /onChange={(e) => /g' "$file"
    # Remove backup
    rm "$file.bak"
  fi
done

echo "Syntax fixes complete!"