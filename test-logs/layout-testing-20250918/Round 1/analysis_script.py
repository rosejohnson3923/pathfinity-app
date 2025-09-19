#!/usr/bin/env python3
"""
Analyze layout testing logs for intelligent layout system
"""

import re
import json
from pathlib import Path
from collections import defaultdict, Counter

def analyze_log_file(log_path):
    """Analyze a single log file for layout decisions and issues"""

    with open(log_path, 'r', encoding='utf-8') as f:
        content = f.read()

    results = {
        'file': log_path.name,
        'student': log_path.parent.parent.name,
        'layout_decisions': [],
        'layout_types': Counter(),
        'content_types': Counter(),
        'issues': [],
        'practice_questions': defaultdict(int),
        'uppercase_issues': [],
        'errors': []
    }

    # Find all layout decisions
    layout_pattern = r'🎯 ============ BENTOLEARN LAYOUT DECISION ============.*?🎯 ===================================================='
    layout_matches = re.findall(layout_pattern, content, re.DOTALL)

    for match in layout_matches:
        # Extract layout type
        layout_type_match = re.search(r'layoutType:\s*["\']([^"\']+)["\']', match)
        if layout_type_match:
            layout_type = layout_type_match.group(1)
            results['layout_types'][layout_type] += 1

        # Extract content type
        content_type_match = re.search(r'contentType:\s*["\']([^"\']+)["\']', match)
        if content_type_match:
            content_type = content_type_match.group(1)
            results['content_types'][content_type] += 1

        # Extract average length
        avg_length_match = re.search(r'avgLength:\s*["\']([^"\']+)["\']', match)

        # Check for question text
        question_match = re.search(r'text:\s*["\']([^"\']{0,100})', match)
        if question_match:
            question_text = question_match.group(1)

            # Check for uppercase/lowercase issues
            if 'uppercase' in question_text.lower() or 'capital' in question_text.lower():
                # Look for problematic patterns like PLAY instead of Play
                if re.search(r'\b[A-Z]{2,}\b', question_text) and 'uppercase' in question_text.lower():
                    results['uppercase_issues'].append(question_text)

    # Count practice questions per subject
    practice_pattern = r'Practice question \d+ generated|practice-\d+-\d+-\d+|RENDERING PRACTICE PHASE.*?totalQuestions:\s*(\d+)'
    practice_matches = re.findall(r'totalQuestions:\s*(\d+)', content)
    for match in practice_matches:
        count = int(match)
        results['practice_questions'][count] += 1

    # Find the actual subjects tested
    subject_pattern = r'subject:\s*["\']([^"\']+)["\']'
    subjects = re.findall(subject_pattern, content)
    results['subjects_tested'] = list(set(subjects))

    # Check for only 3 practice questions issue
    three_practice_pattern = r'convertedQuestionsReady:\s*3|totalQuestions:\s*3'
    if re.search(three_practice_pattern, content):
        results['issues'].append('Only 3 practice questions shown (expected 5)')

    # Check for errors
    error_patterns = [
        (r'TypeError:', 'TypeError'),
        (r'undefined is not', 'Undefined error'),
        (r'Cannot read properties of undefined', 'Undefined property access'),
        (r'is_undefined: true', 'Missing correct_answer'),  # Only flag when actually undefined
        # Note: '❌ handleAssessmentSubmit ABORTED' is not an error - it's a safety check during re-renders
    ]

    for pattern, error_type in error_patterns:
        if re.search(pattern, content):
            results['errors'].append(error_type)

    return results

def summarize_results(all_results):
    """Create a summary of all test results"""

    summary = {
        'total_layout_decisions': 0,
        'layout_distribution': Counter(),
        'content_distribution': Counter(),
        'common_issues': Counter(),
        'practice_question_counts': Counter(),
        'subjects_by_student': {},
        'uppercase_issues_count': 0,
        'errors_by_student': {}
    }

    for result in all_results:
        student = result['student']

        # Aggregate layout types
        for layout_type, count in result['layout_types'].items():
            summary['layout_distribution'][layout_type] += count
            summary['total_layout_decisions'] += count

        # Aggregate content types
        for content_type, count in result['content_types'].items():
            summary['content_distribution'][content_type] += count

        # Track issues
        for issue in result['issues']:
            summary['common_issues'][issue] += 1

        # Track practice question counts
        for count, freq in result['practice_questions'].items():
            summary['practice_question_counts'][count] += freq

        # Track subjects tested
        summary['subjects_by_student'][student] = result.get('subjects_tested', [])

        # Track uppercase issues
        summary['uppercase_issues_count'] += len(result['uppercase_issues'])

        # Track errors
        if result['errors']:
            summary['errors_by_student'][student] = result['errors']

    return summary

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

    all_results = []

    for log_file in sorted(log_files):
        print(f"\nAnalyzing: {log_file}")
        result = analyze_log_file(log_file)
        all_results.append(result)

        print(f"  Student: {result['student']}")
        print(f"  Subjects tested: {', '.join(result['subjects_tested'])}")
        print(f"  Layout decisions: {sum(result['layout_types'].values())}")
        print(f"  Most common layout: {result['layout_types'].most_common(1)[0] if result['layout_types'] else 'None'}")
        print(f"  Issues found: {len(result['issues'])}")
        if result['uppercase_issues']:
            print(f"  ⚠️  Uppercase/lowercase issues: {len(result['uppercase_issues'])}")

    print("\n" + "=" * 80)
    print("OVERALL SUMMARY")
    print("=" * 80)

    summary = summarize_results(all_results)

    print(f"\nTotal Layout Decisions: {summary['total_layout_decisions']}")

    print("\nLayout Type Distribution:")
    total = summary['total_layout_decisions']
    for layout_type, count in summary['layout_distribution'].most_common():
        percentage = (count / total * 100) if total > 0 else 0
        print(f"  {layout_type}: {count} ({percentage:.1f}%)")

    print("\nContent Type Distribution:")
    for content_type, count in summary['content_distribution'].most_common():
        print(f"  {content_type}: {count}")

    print("\nPractice Question Counts:")
    for count, frequency in sorted(summary['practice_question_counts'].items()):
        print(f"  {count} questions: appeared {frequency} times")

    if summary['common_issues']:
        print("\n⚠️  Common Issues:")
        for issue, count in summary['common_issues'].most_common():
            print(f"  - {issue}: {count} occurrences")

    if summary['uppercase_issues_count'] > 0:
        print(f"\n⚠️  Total uppercase/lowercase formatting issues: {summary['uppercase_issues_count']}")

    if summary['errors_by_student']:
        print("\n❌ Errors by Student:")
        for student, errors in summary['errors_by_student'].items():
            print(f"  {student}: {', '.join(set(errors))}")

    print("\nSubjects Tested by Student:")
    for student, subjects in summary['subjects_by_student'].items():
        print(f"  {student}: {', '.join(subjects) if subjects else 'Unknown'}")

    # Save detailed results to JSON
    with open('analysis_results.json', 'w') as f:
        # Convert Counter objects to dict for JSON serialization
        json_summary = {
            'summary': {
                'total_layout_decisions': summary['total_layout_decisions'],
                'layout_distribution': dict(summary['layout_distribution']),
                'content_distribution': dict(summary['content_distribution']),
                'common_issues': dict(summary['common_issues']),
                'practice_question_counts': dict(summary['practice_question_counts']),
                'subjects_by_student': summary['subjects_by_student'],
                'uppercase_issues_count': summary['uppercase_issues_count'],
                'errors_by_student': summary['errors_by_student']
            },
            'detailed_results': [
                {
                    'student': r['student'],
                    'layout_types': dict(r['layout_types']),
                    'content_types': dict(r['content_types']),
                    'issues': r['issues'],
                    'errors': r['errors']
                }
                for r in all_results
            ]
        }
        json.dump(json_summary, f, indent=2)

    print("\n✅ Analysis complete! Results saved to analysis_results.json")

if __name__ == "__main__":
    main()