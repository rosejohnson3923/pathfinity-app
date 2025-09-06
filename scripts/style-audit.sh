#!/bin/bash
# style-audit.sh
# Automated style validation script for Pathfinity
# Checks for style violations and CSS best practices

echo "🔍 Pathfinity Style Audit Starting..."
echo "=================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TOTAL_ISSUES=0

# Check for hardcoded colors in CSS files
echo "📌 Checking for hardcoded colors in CSS files..."
HARDCODED_COLORS=$(grep -r --include="*.css" --include="*.module.css" -E "#[0-9a-fA-F]{3,6}" src/ | grep -v "node_modules" | grep -v "^[[:space:]]*\/\/" | wc -l)
echo "   Found: $HARDCODED_COLORS hardcoded color values"
if [ $HARDCODED_COLORS -gt 0 ]; then
    echo -e "   ${YELLOW}⚠ Consider using CSS variables instead${NC}"
    TOTAL_ISSUES=$((TOTAL_ISSUES + HARDCODED_COLORS))
fi
echo ""

# Check for inline styles in TSX files
echo "📌 Checking for inline styles in TSX files..."
INLINE_STYLES=$(grep -r --include="*.tsx" "style={{" src/ | grep -v "node_modules" | wc -l)
echo "   Found: $INLINE_STYLES inline style instances"
if [ $INLINE_STYLES -gt 0 ]; then
    echo -e "   ${YELLOW}⚠ Move static styles to CSS modules${NC}"
    TOTAL_ISSUES=$((TOTAL_ISSUES + INLINE_STYLES))
fi
echo ""

# Check for non-module CSS imports
echo "📌 Checking for non-module CSS imports..."
NON_MODULE_CSS=$(grep -r --include="*.tsx" "import.*\.css'" src/ | grep -v ".module.css" | grep -v "node_modules" | wc -l)
echo "   Found: $NON_MODULE_CSS non-module CSS imports"
if [ $NON_MODULE_CSS -gt 0 ]; then
    echo -e "   ${YELLOW}⚠ Consider converting to CSS modules${NC}"
fi
echo ""

# Check for CSS variable usage
echo "📌 Checking CSS variable adoption..."
CSS_VAR_USAGE=$(grep -r --include="*.css" --include="*.module.css" "var(--" src/ | wc -l)
echo "   Found: $CSS_VAR_USAGE CSS variable usages"
if [ $CSS_VAR_USAGE -lt 100 ]; then
    echo -e "   ${YELLOW}⚠ Low CSS variable usage detected${NC}"
else
    echo -e "   ${GREEN}✓ Good CSS variable adoption${NC}"
fi
echo ""

# Check for duplicate CSS imports
echo "📌 Checking for duplicate CSS imports..."
DUPLICATE_IMPORTS=$(grep -r --include="*.tsx" "import.*\.css" src/ | sort | uniq -d | wc -l)
echo "   Found: $DUPLICATE_IMPORTS potential duplicate imports"
echo ""

# Check for theme consistency
echo "📌 Checking theme implementation..."
THEME_HOOKS=$(grep -r --include="*.tsx" "useTheme()" src/ | wc -l)
DATA_THEME=$(grep -r --include="*.tsx" "data-theme=" src/ | wc -l)
echo "   Theme hook usage: $THEME_HOOKS"
echo "   data-theme attributes: $DATA_THEME"
if [ $THEME_HOOKS -lt 10 ]; then
    echo -e "   ${YELLOW}⚠ Consider using theme hook more consistently${NC}"
fi
echo ""

# Check for accessibility focus styles
echo "📌 Checking accessibility focus styles..."
FOCUS_VISIBLE=$(grep -r --include="*.css" --include="*.module.css" ":focus-visible" src/ | wc -l)
echo "   Found: $FOCUS_VISIBLE :focus-visible rules"
if [ $FOCUS_VISIBLE -lt 5 ]; then
    echo -e "   ${RED}✗ Missing accessibility focus styles${NC}"
    TOTAL_ISSUES=$((TOTAL_ISSUES + 5))
else
    echo -e "   ${GREEN}✓ Accessibility focus styles present${NC}"
fi
echo ""

# Check for responsive design
echo "📌 Checking responsive design implementation..."
MEDIA_QUERIES=$(grep -r --include="*.css" --include="*.module.css" "@media" src/ | wc -l)
echo "   Found: $MEDIA_QUERIES media queries"
if [ $MEDIA_QUERIES -lt 20 ]; then
    echo -e "   ${YELLOW}⚠ Consider adding more responsive breakpoints${NC}"
fi
echo ""

# Check for animation performance
echo "📌 Checking animation performance..."
WILL_CHANGE=$(grep -r --include="*.css" --include="*.module.css" "will-change" src/ | wc -l)
TRANSFORM_ANIMATIONS=$(grep -r --include="*.css" --include="*.module.css" "transform\|translate\|scale\|rotate" src/ | wc -l)
echo "   Transform-based animations: $TRANSFORM_ANIMATIONS"
echo "   will-change declarations: $WILL_CHANGE"
echo ""

# Summary
echo "=================================="
echo "📊 AUDIT SUMMARY"
echo "=================================="

if [ $TOTAL_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ No critical style issues found!${NC}"
else
    echo -e "${YELLOW}⚠ Total issues to address: $TOTAL_ISSUES${NC}"
fi

echo ""
echo "Recommendations:"
echo "1. Replace hardcoded colors with CSS variables"
echo "2. Move inline styles to CSS modules"
echo "3. Ensure consistent theme implementation"
echo "4. Add focus-visible styles for accessibility"
echo "5. Test responsive design across breakpoints"
echo ""

# Generate detailed report if requested
if [ "$1" == "--detailed" ]; then
    echo "Generating detailed report..."
    echo ""
    echo "FILES WITH HARDCODED COLORS:"
    grep -r --include="*.css" --include="*.module.css" -l -E "#[0-9a-fA-F]{3,6}" src/ | grep -v "node_modules" | head -10
    echo ""
    echo "FILES WITH INLINE STYLES:"
    grep -r --include="*.tsx" -l "style={{" src/ | grep -v "node_modules" | head -10
    echo ""
fi

echo "✅ Style audit complete!"
echo ""
echo "Run with --detailed flag for file-specific information"

exit $TOTAL_ISSUES