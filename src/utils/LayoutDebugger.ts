/**
 * Layout Debugger Utility
 * Tracks and summarizes intelligent layout decisions for testing
 */

interface LayoutDecision {
  timestamp: string;
  questionId: string;
  questionType: string;
  questionText: string;
  optionCount: number;
  avgOptionLength: number;
  maxWords: number;
  layoutType: string;
  contentType: string;
  gradeLevel?: string;
}

class LayoutDebugger {
  private decisions: LayoutDecision[] = [];
  private enabled: boolean = true;

  constructor() {
    // Enable debugging based on localStorage flag
    if (typeof window !== 'undefined') {
      this.enabled = localStorage.getItem('DEBUG_LAYOUT') === 'true';

      // Auto-enable for testing
      if (window.location.search.includes('debug=layout')) {
        this.enabled = true;
        localStorage.setItem('DEBUG_LAYOUT', 'true');
      }
    }
  }

  /**
   * Track a layout decision
   */
  track(decision: Partial<LayoutDecision>) {
    if (!this.enabled) return;

    const fullDecision: LayoutDecision = {
      timestamp: new Date().toISOString(),
      questionId: decision.questionId || 'unknown',
      questionType: decision.questionType || 'unknown',
      questionText: decision.questionText || '',
      optionCount: decision.optionCount || 0,
      avgOptionLength: decision.avgOptionLength || 0,
      maxWords: decision.maxWords || 0,
      layoutType: decision.layoutType || 'unknown',
      contentType: decision.contentType || 'unknown',
      gradeLevel: decision.gradeLevel
    };

    this.decisions.push(fullDecision);

    // Keep only last 100 decisions to prevent memory issues
    if (this.decisions.length > 100) {
      this.decisions.shift();
    }
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    if (!this.enabled || this.decisions.length === 0) {
      return 'No layout decisions tracked. Enable with localStorage.setItem("DEBUG_LAYOUT", "true")';
    }

    const layoutCounts: Record<string, number> = {};
    const contentCounts: Record<string, number> = {};
    const gradeCounts: Record<string, number> = {};

    this.decisions.forEach(d => {
      layoutCounts[d.layoutType] = (layoutCounts[d.layoutType] || 0) + 1;
      contentCounts[d.contentType] = (contentCounts[d.contentType] || 0) + 1;
      if (d.gradeLevel) {
        gradeCounts[d.gradeLevel] = (gradeCounts[d.gradeLevel] || 0) + 1;
      }
    });

    const avgOptionLength = this.decisions.reduce((sum, d) => sum + d.avgOptionLength, 0) / this.decisions.length;
    const avgWords = this.decisions.reduce((sum, d) => sum + d.maxWords, 0) / this.decisions.length;

    return {
      totalDecisions: this.decisions.length,
      layoutDistribution: layoutCounts,
      contentDistribution: contentCounts,
      gradeDistribution: gradeCounts,
      averageOptionLength: avgOptionLength.toFixed(1),
      averageMaxWords: avgWords.toFixed(1),
      recentDecisions: this.decisions.slice(-5).map(d => ({
        time: d.timestamp.split('T')[1].split('.')[0],
        layout: d.layoutType,
        content: d.contentType,
        avgLength: d.avgOptionLength.toFixed(1)
      }))
    };
  }

  /**
   * Print formatted summary to console
   */
  printSummary() {
    if (!this.enabled) {
      console.log('Layout debugging disabled. Enable with: localStorage.setItem("DEBUG_LAYOUT", "true")');
      return;
    }

    const summary = this.getSummary();

    console.log('');
    console.log('📊 ========== LAYOUT SYSTEM SUMMARY ==========');
    console.log('📈 Total Decisions:', this.decisions.length);
    console.log('');

    console.log('🎨 Layout Distribution:');
    if (typeof summary === 'object' && summary.layoutDistribution) {
      Object.entries(summary.layoutDistribution).forEach(([type, count]) => {
        const percentage = ((count as number / this.decisions.length) * 100).toFixed(1);
        console.log(`   ${type}: ${count} (${percentage}%)`);
      });
    }

    console.log('');
    console.log('📝 Content Type Distribution:');
    if (typeof summary === 'object' && summary.contentDistribution) {
      Object.entries(summary.contentDistribution).forEach(([type, count]) => {
        const percentage = ((count as number / this.decisions.length) * 100).toFixed(1);
        console.log(`   ${type}: ${count} (${percentage}%)`);
      });
    }

    console.log('');
    console.log('📊 Statistics:');
    if (typeof summary === 'object') {
      console.log(`   Avg Option Length: ${summary.averageOptionLength} chars`);
      console.log(`   Avg Max Words: ${summary.averageMaxWords}`);
    }

    console.log('');
    console.log('🕐 Recent Decisions:');
    if (typeof summary === 'object' && summary.recentDecisions) {
      summary.recentDecisions.forEach((d: any, i: number) => {
        console.log(`   ${i + 1}. [${d.time}] ${d.layout} | ${d.content} | ${d.avgLength} chars`);
      });
    }

    console.log('📊 ==========================================');
  }

  /**
   * Clear all tracked decisions
   */
  clear() {
    this.decisions = [];
    console.log('🧹 Layout debugger cleared');
  }

  /**
   * Export decisions as CSV for analysis
   */
  exportCSV() {
    if (this.decisions.length === 0) {
      console.log('No data to export');
      return;
    }

    const headers = ['Timestamp', 'Question ID', 'Type', 'Options', 'Avg Length', 'Max Words', 'Layout', 'Content Type', 'Grade'];
    const rows = this.decisions.map(d => [
      d.timestamp,
      d.questionId,
      d.questionType,
      d.optionCount,
      d.avgOptionLength.toFixed(1),
      d.maxWords,
      d.layoutType,
      d.contentType,
      d.gradeLevel || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `layout-debug-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    console.log('📥 Layout data exported as CSV');
  }

  /**
   * Enable/disable debugging
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('DEBUG_LAYOUT', enabled.toString());
    }
    console.log(`🔧 Layout debugging ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Export singleton instance
export const layoutDebugger = new LayoutDebugger();

// Make available globally for console access during testing
if (typeof window !== 'undefined') {
  (window as any).layoutDebugger = layoutDebugger;
  (window as any).layoutSummary = () => layoutDebugger.printSummary();
  (window as any).layoutExport = () => layoutDebugger.exportCSV();
  (window as any).layoutClear = () => layoutDebugger.clear();

  console.log('🎨 Layout Debugger Ready! Commands available:');
  console.log('   layoutDebugger.setEnabled(true/false) - Toggle debugging');
  console.log('   layoutSummary() - Print layout statistics');
  console.log('   layoutExport() - Export data as CSV');
  console.log('   layoutClear() - Clear tracked decisions');
}