#!/usr/bin/env python3
"""
Detailed layout analysis by grade level and subject
"""

import re
import json
from pathlib import Path
from collections import defaultdict, Counter

def analyze_layout_patterns_by_context(log_path):
    """Analyze layout patterns with more context"""

    with open(log_path, 'r', encoding='utf-8') as f:
        content = f.read()

    results = {
        'file': log_path.name,
        'student': log_path.parent.parent.name,
        'grade': extract_grade(log_path.parent.parent.name),
        'layout_by_subject': defaultdict(Counter),
        'layout_by_content_length': defaultdict(list),
        'vertical_usage': [],
        'grid_usage': [],
        'layout_issues': []
    }

    # Extract grade level
    grade_num = results['grade']

    # Find all layout decisions with context
    layout_pattern = r'🎯 ============ BENTOLEARN LAYOUT DECISION ============(.*?)🎯 ===================================================='
    layout_matches = re.findall(layout_pattern, content, re.DOTALL)

    for match in layout_matches:
        # Extract layout type
        layout_type_match = re.search(r'layoutType:\s*["\']([^"\']+)["\']', match)
        layout_type = layout_type_match.group(1) if layout_type_match else 'unknown'

        # Extract content type
        content_type_match = re.search(r'contentType:\s*["\']([^"\']+)["\']', match)
        content_type = content_type_match.group(1) if content_type_match else 'unknown'

        # Extract average length
        avg_length_match = re.search(r'avgLength:\s*["\']([^"\']+)["\']', match)
        avg_length = avg_length_match.group(1) if avg_length_match else 'unknown'

        # Extract subject
        subject_match = re.search(r'subject:\s*["\']([^"\']+)["\']', match)
        subject = subject_match.group(1) if subject_match else 'unknown'

        # Track by subject
        results['layout_by_subject'][subject][layout_type] += 1

        # Track length patterns
        if avg_length != 'unknown':
            try:
                avg_len_num = float(avg_length.split('-')[0])
                results['layout_by_content_length'][layout_type].append(avg_len_num)
            except:
                pass

        # Identify potential issues
        if layout_type == 'vertical' and content_type == 'numeric':
            results['layout_issues'].append(f"Vertical layout for numeric content (subject: {subject})")
        elif layout_type == 'grid-4' and content_type == 'longText':
            results['layout_issues'].append(f"Grid-4 layout for long text (subject: {subject})")

        # Track usage patterns
        if layout_type == 'vertical':
            results['vertical_usage'].append({
                'content_type': content_type,
                'subject': subject,
                'avg_length': avg_length
            })
        elif 'grid' in layout_type:
            results['grid_usage'].append({
                'layout': layout_type,
                'content_type': content_type,
                'subject': subject,
                'avg_length': avg_length
            })

    return results

def extract_grade(student_name):
    """Extract grade level from student name"""
    if 'k' in student_name.lower():
        return 0
    elif '-1' in student_name:
        return 1
    elif '-7' in student_name:
        return 7
    elif '-10' in student_name:
        return 10
    return -1

def analyze_grade_patterns(all_results):
    """Analyze patterns by grade level"""

    grade_patterns = {
        'K-2': {'students': [], 'layout_preference': Counter(), 'subjects': defaultdict(Counter)},
        '3-8': {'students': [], 'layout_preference': Counter(), 'subjects': defaultdict(Counter)},
        '9-12': {'students': [], 'layout_preference': Counter(), 'subjects': defaultdict(Counter)}
    }

    for result in all_results:
        grade = result['grade']

        # Determine grade category
        if grade <= 2:
            category = 'K-2'
        elif grade <= 8:
            category = '3-8'
        else:
            category = '9-12'

        grade_patterns[category]['students'].append(result['student'])

        # Aggregate layout preferences
        for subject, layouts in result['layout_by_subject'].items():
            for layout_type, count in layouts.items():
                grade_patterns[category]['layout_preference'][layout_type] += count
                grade_patterns[category]['subjects'][subject][layout_type] += count

    return grade_patterns

def main():
    """Main analysis function"""

    # Find all log files
    log_dir = Path('.')
    log_files = list(log_dir.glob('*/AllSubjects/*.log'))

    if not log_files:
        print("No log files found!")
        return

    print(f"Found {len(log_files)} log files to analyze\n")
    print("=" * 80)
    print("DETAILED LAYOUT ANALYSIS")
    print("=" * 80)

    all_results = []

    for log_file in sorted(log_files):
        result = analyze_layout_patterns_by_context(log_file)
        all_results.append(result)

    # Analyze by grade patterns
    grade_patterns = analyze_grade_patterns(all_results)

    print("\n" + "=" * 80)
    print("LAYOUT PATTERNS BY GRADE LEVEL")
    print("=" * 80)

    for category, data in grade_patterns.items():
        print(f"\n{category} (Students: {', '.join(data['students'])})")
        print("-" * 40)

        print("Overall Layout Preferences:")
        total = sum(data['layout_preference'].values())
        for layout, count in data['layout_preference'].most_common():
            percentage = (count / total * 100) if total > 0 else 0
            print(f"  {layout}: {count} ({percentage:.1f}%)")

        print("\nBy Subject:")
        for subject, layouts in data['subjects'].items():
            print(f"  {subject}:")
            subject_total = sum(layouts.values())
            for layout, count in layouts.most_common(3):
                percentage = (count / subject_total * 100) if subject_total > 0 else 0
                print(f"    {layout}: {count} ({percentage:.1f}%)")

    print("\n" + "=" * 80)
    print("LAYOUT ISSUES SUMMARY")
    print("=" * 80)

    all_issues = []
    for result in all_results:
        all_issues.extend(result['layout_issues'])

    if all_issues:
        issue_counts = Counter(all_issues)
        for issue, count in issue_counts.most_common(10):
            print(f"  - {issue}: {count} occurrences")
    else:
        print("  No specific layout issues detected")

    print("\n" + "=" * 80)
    print("RECOMMENDATIONS")
    print("=" * 80)

    print("\n1. GRADE-SPECIFIC OPTIMIZATIONS:")
    print("   K-2: Prefer grid-4 for visual/emoji content, larger touch targets")
    print("   3-8: Balance between vertical (for text) and grid (for choices)")
    print("   9-12: Prefer vertical for complex text, grid-2 for paired comparisons")

    print("\n2. SUBJECT-SPECIFIC PATTERNS:")
    print("   Math: Grid layouts work well for numeric choices")
    print("   ELA: Vertical layouts better for longer text options")
    print("   Science: Mixed approach based on question complexity")
    print("   Social Studies: Vertical for historical text, grid for dates/locations")

    print("\n3. CONTENT-TYPE RULES:")
    print("   Short answers (< 10 chars): grid-4")
    print("   Medium answers (10-30 chars): grid-2 or wrapped-grid")
    print("   Long answers (> 30 chars): vertical")
    print("   Mixed lengths: vertical for consistency")

    # Save detailed analysis
    with open('detailed_layout_analysis.json', 'w') as f:
        analysis_data = {
            'grade_patterns': {
                category: {
                    'students': data['students'],
                    'layout_preference': dict(data['layout_preference']),
                    'subjects': {subj: dict(layouts) for subj, layouts in data['subjects'].items()}
                }
                for category, data in grade_patterns.items()
            },
            'individual_results': [
                {
                    'student': r['student'],
                    'grade': r['grade'],
                    'layout_by_subject': {subj: dict(layouts) for subj, layouts in r['layout_by_subject'].items()},
                    'issues': r['layout_issues'][:10]  # Top 10 issues
                }
                for r in all_results
            ]
        }
        json.dump(analysis_data, f, indent=2)

    print("\n✅ Detailed analysis complete! Results saved to detailed_layout_analysis.json")

if __name__ == "__main__":
    main()