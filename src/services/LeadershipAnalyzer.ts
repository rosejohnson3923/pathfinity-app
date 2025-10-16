/**
 * LeadershipAnalyzer
 *
 * Analyzes player decisions to calculate 6 C's of Leadership scores
 * and provide personalized feedback and career insights.
 */

import {
  SixCs,
  SolutionCard,
  CSuiteRole,
  LeadershipScore,
  LeadershipInsight,
  CareerPath,
  BusinessScenario,
  ScenarioType,
  ExecutivePlayerProgression,
} from '../types/CareerChallengeTypes';

export class LeadershipAnalyzer {
  /**
   * Analyze player's solutions to calculate 6 C's scores
   */
  public analyze6Cs(
    selectedSolutions: SolutionCard[],
    perfectSolutions: SolutionCard[],
    selectedExecutive: CSuiteRole,
    optimalExecutive: CSuiteRole,
    decisionTimeSeconds: number
  ): SixCs {
    return {
      character: this.calculateCharacterScore(selectedSolutions, perfectSolutions),
      competence: this.calculateCompetenceScore(selectedSolutions, perfectSolutions, selectedExecutive, optimalExecutive),
      communication: this.calculateCommunicationScore(selectedSolutions),
      compassion: this.calculateCompassionScore(selectedSolutions),
      commitment: this.calculateCommitmentScore(selectedSolutions, decisionTimeSeconds),
      confidence: this.calculateConfidenceScore(decisionTimeSeconds, selectedSolutions.length === 5),
    };
  }

  /**
   * Calculate Character score based on ethical decisions
   */
  public calculateCharacterScore(
    selectedSolutions: SolutionCard[],
    perfectSolutions: SolutionCard[]
  ): number {
    let score = 3; // Base score

    // Check for ethical keywords in selected solutions
    const ethicalKeywords = ['integrity', 'honest', 'transparent', 'ethical', 'trust', 'fair'];
    const unethicalKeywords = ['liability waiver', 'cover up', 'hide', 'mislead', 'blame'];

    selectedSolutions.forEach(solution => {
      const content = solution.content.toLowerCase();

      // Boost for ethical choices
      if (ethicalKeywords.some(keyword => content.includes(keyword))) {
        score = Math.min(5, score + 0.5);
      }

      // Penalty for unethical choices
      if (unethicalKeywords.some(keyword => content.includes(keyword))) {
        score = Math.max(1, score - 1);
      }

      // Check if solution has positive character impact
      if (solution.leadershipImpacts?.character && solution.leadershipImpacts.character > 0) {
        score = Math.min(5, score + (solution.leadershipImpacts.character * 0.3));
      }
    });

    // Bonus for selecting mostly perfect solutions (shows good judgment)
    const perfectCount = selectedSolutions.filter(s =>
      perfectSolutions.some(p => p.id === s.id)
    ).length;

    if (perfectCount >= 4) {
      score = Math.min(5, score + 0.5);
    }

    return Math.round(score);
  }

  /**
   * Calculate Competence score based on solution quality and executive choice
   */
  public calculateCompetenceScore(
    selectedSolutions: SolutionCard[],
    perfectSolutions: SolutionCard[],
    selectedExecutive: CSuiteRole,
    optimalExecutive: CSuiteRole
  ): number {
    let score = 3; // Base score

    // Count perfect solutions selected
    const perfectCount = selectedSolutions.filter(s =>
      perfectSolutions.some(p => p.id === s.id)
    ).length;

    // Score based on perfect solution selection
    score = 1 + (perfectCount * 0.8); // 1-5 range based on 0-5 perfect selections

    // Bonus for selecting the optimal executive
    if (selectedExecutive === optimalExecutive) {
      score = Math.min(5, score + 0.5);
    }

    // Check for competence-related impacts
    selectedSolutions.forEach(solution => {
      if (solution.leadershipImpacts?.competence) {
        score = Math.min(5, score + (solution.leadershipImpacts.competence * 0.2));
      }
    });

    return Math.round(Math.min(5, Math.max(1, score)));
  }

  /**
   * Calculate Communication score based on solution choices
   */
  public calculateCommunicationScore(selectedSolutions: SolutionCard[]): number {
    let score = 3; // Base score

    // Keywords indicating good communication
    const commKeywords = [
      'communicate', 'announce', 'inform', 'update', 'meeting',
      'transparency', 'message', 'dialogue', 'feedback', 'listen'
    ];

    // Keywords indicating poor communication
    const poorCommKeywords = ['silence', 'withhold', 'secret', 'hide information'];

    selectedSolutions.forEach(solution => {
      const content = solution.content.toLowerCase();

      // Boost for communication-focused solutions
      if (commKeywords.some(keyword => content.includes(keyword))) {
        score = Math.min(5, score + 0.4);
      }

      // Penalty for poor communication choices
      if (poorCommKeywords.some(keyword => content.includes(keyword))) {
        score = Math.max(1, score - 0.8);
      }

      // Check leadership impacts
      if (solution.leadershipImpacts?.communication) {
        score = Math.min(5, score + (solution.leadershipImpacts.communication * 0.3));
      }
    });

    // Check for balanced internal/external communication
    const hasInternal = selectedSolutions.some(s =>
      s.content.toLowerCase().includes('employee') ||
      s.content.toLowerCase().includes('team')
    );
    const hasExternal = selectedSolutions.some(s =>
      s.content.toLowerCase().includes('customer') ||
      s.content.toLowerCase().includes('public')
    );

    if (hasInternal && hasExternal) {
      score = Math.min(5, score + 0.5); // Bonus for balanced communication
    }

    return Math.round(Math.min(5, Math.max(1, score)));
  }

  /**
   * Calculate Compassion score based on people-focused decisions
   */
  public calculateCompassionScore(selectedSolutions: SolutionCard[]): number {
    let score = 3; // Base score

    // Keywords indicating compassion
    const compassionKeywords = [
      'wellbeing', 'support', 'help', 'care', 'empathy',
      'understanding', 'flexibility', 'mental health', 'work-life'
    ];

    // Keywords indicating lack of compassion
    const coldKeywords = [
      'terminate', 'layoff', 'monitor', 'track productivity',
      'mandatory', 'penalty', 'punish'
    ];

    selectedSolutions.forEach(solution => {
      const content = solution.content.toLowerCase();

      // Boost for compassionate choices
      if (compassionKeywords.some(keyword => content.includes(keyword))) {
        score = Math.min(5, score + 0.5);
      }

      // Penalty for cold/harsh choices
      if (coldKeywords.some(keyword => content.includes(keyword))) {
        score = Math.max(1, score - 0.7);
      }

      // Check leadership impacts
      if (solution.leadershipImpacts?.compassion) {
        score = Math.min(5, score + (solution.leadershipImpacts.compassion * 0.4));
      }
    });

    return Math.round(Math.min(5, Math.max(1, score)));
  }

  /**
   * Calculate Commitment score based on solution consistency and decisiveness
   */
  public calculateCommitmentScore(
    selectedSolutions: SolutionCard[],
    decisionTimeSeconds: number
  ): number {
    let score = 3; // Base score

    // Check for long-term focus
    const longTermKeywords = ['long-term', 'sustainable', 'future', 'invest', 'develop'];
    const shortTermKeywords = ['quick fix', 'temporary', 'band-aid', 'short-term'];

    selectedSolutions.forEach(solution => {
      const content = solution.content.toLowerCase();

      if (longTermKeywords.some(keyword => content.includes(keyword))) {
        score = Math.min(5, score + 0.4);
      }

      if (shortTermKeywords.some(keyword => content.includes(keyword))) {
        score = Math.max(1, score - 0.4);
      }

      // Check leadership impacts
      if (solution.leadershipImpacts?.commitment) {
        score = Math.min(5, score + (solution.leadershipImpacts.commitment * 0.3));
      }
    });

    // Check for solution coherence (do they work together?)
    const categories = new Set(selectedSolutions.map(s => s.category).filter(Boolean));
    if (categories.size >= 3 && categories.size <= 4) {
      // Good variety but not scattered
      score = Math.min(5, score + 0.5);
    }

    return Math.round(Math.min(5, Math.max(1, score)));
  }

  /**
   * Calculate Confidence score based on decision speed and consistency
   */
  public calculateConfidenceScore(
    decisionTimeSeconds: number,
    madeAllSelections: boolean
  ): number {
    let score = 3; // Base score

    // Speed bonus (faster decisions show confidence)
    if (decisionTimeSeconds < 20) {
      score = Math.min(5, score + 1.5);
    } else if (decisionTimeSeconds < 30) {
      score = Math.min(5, score + 1);
    } else if (decisionTimeSeconds < 45) {
      score = Math.min(5, score + 0.5);
    } else if (decisionTimeSeconds > 55) {
      score = Math.max(1, score - 0.5); // Penalty for indecision
    }

    // Bonus for making all selections
    if (madeAllSelections) {
      score = Math.min(5, score + 0.5);
    } else {
      score = Math.max(1, score - 1); // Penalty for incomplete selection
    }

    return Math.round(Math.min(5, Math.max(1, score)));
  }

  /**
   * Generate insights based on 6 C's scores
   */
  public generateInsights(sixCs: SixCs): LeadershipInsight[] {
    const insights: LeadershipInsight[] = [];

    // Analyze each C
    const categories: (keyof SixCs)[] = ['character', 'competence', 'communication', 'compassion', 'commitment', 'confidence'];

    categories.forEach(category => {
      const score = sixCs[category];
      let feedback = '';
      let example = '';
      let improvementTip = '';

      if (category === 'character') {
        if (score >= 4) {
          feedback = 'Strong ethical foundation. You prioritize integrity in decision-making.';
          example = 'Like Paul Polman at Unilever, you understand that ethical leadership drives long-term success.';
        } else if (score >= 3) {
          feedback = 'Generally ethical approach, but some decisions compromised integrity.';
          example = 'Remember Wells Fargo\'s account scandal - shortcuts destroy trust.';
          improvementTip = 'Always ask: "Would I be comfortable if this decision was public?"';
        } else {
          feedback = 'Your decisions showed concerning ethical compromises.';
          example = 'Enron\'s collapse shows what happens when character is sacrificed for results.';
          improvementTip = 'Prioritize transparency and honesty, even when it\'s difficult.';
        }
      } else if (category === 'competence') {
        if (score >= 4) {
          feedback = 'Excellent problem-solving skills. You identified optimal solutions effectively.';
          example = 'Like Satya Nadella transforming Microsoft, you show strong strategic thinking.';
        } else if (score >= 3) {
          feedback = 'Decent analytical skills, but missed some optimal solutions.';
          example = 'Even Jeff Bezos emphasizes being "right a lot" comes from changing your mind when presented with new data.';
          improvementTip = 'Consider multiple perspectives before deciding.';
        } else {
          feedback = 'Struggled to identify effective solutions. Need to develop analytical skills.';
          example = 'Blockbuster\'s failure to adapt shows the cost of poor strategic decisions.';
          improvementTip = 'Study the problem thoroughly before jumping to solutions.';
        }
      } else if (category === 'communication') {
        if (score >= 4) {
          feedback = 'Excellent communication strategy. You balance stakeholder messaging well.';
          example = 'Like Howard Schultz at Starbucks, you understand communication builds culture.';
        } else if (score >= 3) {
          feedback = 'Good communication basics, but could be more comprehensive.';
          example = 'Clear communication prevented panic during Johnson & Johnson\'s Tylenol crisis.';
          improvementTip = 'Consider all stakeholders when planning communications.';
        } else {
          feedback = 'Communication gaps could lead to confusion and mistrust.';
          example = 'BP\'s poor crisis communication made the Deepwater Horizon disaster worse.';
          improvementTip = 'Prioritize clear, timely, and honest communication.';
        }
      } else if (category === 'compassion') {
        if (score >= 4) {
          feedback = 'Strong people-first leadership. You genuinely consider human impact.';
          example = 'Like Dan Price at Gravity Payments, you understand that caring for people drives success.';
        } else if (score >= 3) {
          feedback = 'Some consideration for people, but could be more empathetic.';
          example = 'Companies that supported employees during COVID-19 saw higher loyalty and productivity.';
          improvementTip = 'Always consider: "How does this affect our people?"';
        } else {
          feedback = 'Decisions lacked human consideration. This will hurt morale and retention.';
          example = 'Amazon\'s warehouse conditions show how lack of compassion damages reputation.';
          improvementTip = 'Remember that business is ultimately about people.';
        }
      } else if (category === 'commitment') {
        if (score >= 4) {
          feedback = 'Strong commitment to long-term success. Your decisions show persistence.';
          example = 'Like Elon Musk\'s dedication to Tesla through near-bankruptcy, you show resilience.';
        } else if (score >= 3) {
          feedback = 'Reasonable commitment, but some short-term thinking evident.';
          example = 'Netflix\'s commitment to streaming over DVDs shows the power of long-term vision.';
          improvementTip = 'Balance immediate needs with long-term sustainability.';
        } else {
          feedback = 'Lack of consistent commitment. Too much focus on quick fixes.';
          example = 'Sears\' failure came from lack of commitment to digital transformation.';
          improvementTip = 'Develop a clear vision and stick to it through challenges.';
        }
      } else if (category === 'confidence') {
        if (score >= 4) {
          feedback = 'Decisive and confident leadership. You make timely decisions under pressure.';
          example = 'Like Indra Nooyi at PepsiCo, you balance confidence with wisdom.';
        } else if (score >= 3) {
          feedback = 'Generally confident, but some hesitation in decision-making.';
          example = 'Steve Jobs said "Deciding what not to do is as important as deciding what to do."';
          improvementTip = 'Trust your analysis and commit to your decisions.';
        } else {
          feedback = 'Lack of confidence led to indecisive or delayed actions.';
          example = 'Kodak\'s hesitation to embrace digital photography cost them everything.';
          improvementTip = 'Build confidence through preparation and practice.';
        }
      }

      insights.push({
        category,
        score,
        feedback,
        example,
        improvementTip,
      });
    });

    return insights;
  }

  /**
   * Generate career path recommendations based on 6 C's pattern
   */
  public getCareerRecommendations(
    sixCs: SixCs,
    historicalData?: ExecutivePlayerProgression,
    gradeCategory?: 'elementary' | 'middle' | 'high'
  ): CareerPath[] {
    const paths: CareerPath[] = [];

    // Calculate strengths and weaknesses
    const scores = {
      character: sixCs.character,
      competence: sixCs.competence,
      communication: sixCs.communication,
      compassion: sixCs.compassion,
      commitment: sixCs.commitment,
      confidence: sixCs.confidence,
    };

    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const topStrengths = sortedScores.slice(0, 3).map(([key]) => key);
    const weaknesses = sortedScores.slice(4).filter(([, score]) => score < 3).map(([key]) => key);

    // For elementary students, provide simplified career descriptions
    const isElementary = gradeCategory === 'elementary';

    // Chief Executive Officer
    if (scores.competence >= 3 && scores.confidence >= 3) {
      paths.push({
        title: isElementary ? 'Company Leader' : 'Chief Executive Officer',
        matchPercentage: this.calculateMatchPercentage(sixCs, [4, 5, 4, 3, 4, 5]),
        requiredStrengths: isElementary
          ? ['Making good choices', 'Helping the team', 'Planning ahead']
          : ['Strategic thinking', 'Decision making', 'Vision'],
        yourStrengths: topStrengths.map(s => this.strengthToSkill(s, isElementary)),
        developmentNeeded: weaknesses.map(w => this.weaknessToDevArea(w, isElementary)),
      });
    }

    // Chief People Officer / CHRO
    if (scores.compassion >= 3 && scores.communication >= 2) {
      paths.push({
        title: isElementary ? 'People Helper' : 'Chief People Officer',
        matchPercentage: this.calculateMatchPercentage(sixCs, [4, 3, 4, 5, 4, 3]),
        requiredStrengths: isElementary
          ? ['Caring for others', 'Talking with people', 'Making friends feel welcome']
          : ['Empathy', 'Communication', 'Culture building'],
        yourStrengths: topStrengths.map(s => this.strengthToSkill(s, isElementary)),
        developmentNeeded: weaknesses.map(w => this.weaknessToDevArea(w, isElementary)),
      });
    }

    // Chief Marketing Officer
    if (scores.communication >= 3 && scores.confidence >= 2) {
      paths.push({
        title: isElementary ? 'Brand Storyteller' : 'Chief Marketing Officer',
        matchPercentage: this.calculateMatchPercentage(sixCs, [3, 3, 5, 3, 3, 4]),
        requiredStrengths: isElementary
          ? ['Sharing ideas', 'Being creative', 'Understanding customers']
          : ['Communication', 'Creativity', 'Market insight'],
        yourStrengths: topStrengths.map(s => this.strengthToSkill(s, isElementary)),
        developmentNeeded: weaknesses.map(w => this.weaknessToDevArea(w, isElementary)),
      });
    }

    // Chief Financial Officer
    if (scores.competence >= 3 && scores.character >= 3) {
      paths.push({
        title: isElementary ? 'Money Manager' : 'Chief Financial Officer',
        matchPercentage: this.calculateMatchPercentage(sixCs, [5, 5, 3, 2, 4, 4]),
        requiredStrengths: isElementary
          ? ['Working with numbers', 'Being honest', 'Making safe choices']
          : ['Analytical thinking', 'Integrity', 'Risk management'],
        yourStrengths: topStrengths.map(s => this.strengthToSkill(s, isElementary)),
        developmentNeeded: weaknesses.map(w => this.weaknessToDevArea(w, isElementary)),
      });
    }

    // Chief Operating Officer
    if (scores.competence >= 2 && scores.commitment >= 3) {
      paths.push({
        title: isElementary ? 'Operations Organizer' : 'Chief Operating Officer',
        matchPercentage: this.calculateMatchPercentage(sixCs, [4, 4, 3, 3, 5, 4]),
        requiredStrengths: isElementary
          ? ['Organizing things', 'Getting work done', 'Keeping going']
          : ['Process optimization', 'Execution', 'Persistence'],
        yourStrengths: topStrengths.map(s => this.strengthToSkill(s, isElementary)),
        developmentNeeded: weaknesses.map(w => this.weaknessToDevArea(w, isElementary)),
      });
    }

    // Management Consultant
    if (scores.competence >= 3 && scores.communication >= 3) {
      paths.push({
        title: isElementary ? 'Business Helper' : 'Management Consultant',
        matchPercentage: this.calculateMatchPercentage(sixCs, [3, 5, 5, 2, 3, 4]),
        requiredStrengths: isElementary
          ? ['Solving problems', 'Explaining ideas', 'Figuring things out']
          : ['Problem solving', 'Communication', 'Analysis'],
        yourStrengths: topStrengths.map(s => this.strengthToSkill(s, isElementary)),
        developmentNeeded: weaknesses.map(w => this.weaknessToDevArea(w, isElementary)),
      });
    }

    // Entrepreneur
    if (scores.confidence >= 3 && scores.commitment >= 3) {
      paths.push({
        title: isElementary ? 'Business Starter' : 'Entrepreneur',
        matchPercentage: this.calculateMatchPercentage(sixCs, [4, 3, 3, 3, 5, 5]),
        requiredStrengths: isElementary
          ? ['Trying new things', 'Never giving up', 'Having big ideas']
          : ['Risk taking', 'Persistence', 'Vision'],
        yourStrengths: topStrengths.map(s => this.strengthToSkill(s, isElementary)),
        developmentNeeded: weaknesses.map(w => this.weaknessToDevArea(w, isElementary)),
      });
    }

    // Sort by match percentage and return top 3
    // If no paths match strict criteria, return top 3 best matches based on overall score
    if (paths.length === 0) {
      // Add all paths with match percentages for fallback
      const allPaths = [
        {
          title: isElementary ? 'Problem Solver' : 'Business Analyst',
          matchPercentage: this.calculateMatchPercentage(sixCs, [3, 4, 3, 2, 3, 3]),
          requiredStrengths: isElementary
            ? ['Thinking carefully', 'Solving puzzles', 'Noticing details']
            : ['Analytical thinking', 'Problem solving', 'Attention to detail'],
          yourStrengths: topStrengths.map(s => this.strengthToSkill(s, isElementary)),
          developmentNeeded: weaknesses.map(w => this.weaknessToDevArea(w, isElementary)),
        },
        {
          title: isElementary ? 'Project Planner' : 'Project Manager',
          matchPercentage: this.calculateMatchPercentage(sixCs, [3, 3, 4, 3, 4, 3]),
          requiredStrengths: isElementary
            ? ['Staying organized', 'Talking with others', 'Using time wisely']
            : ['Organization', 'Communication', 'Time management'],
          yourStrengths: topStrengths.map(s => this.strengthToSkill(s, isElementary)),
          developmentNeeded: weaknesses.map(w => this.weaknessToDevArea(w, isElementary)),
        },
        {
          title: isElementary ? 'Team Captain' : 'Team Lead',
          matchPercentage: this.calculateMatchPercentage(sixCs, [3, 3, 3, 4, 3, 3]),
          requiredStrengths: isElementary
            ? ['Leading friends', 'Encouraging others', 'Working together']
            : ['People management', 'Motivation', 'Collaboration'],
          yourStrengths: topStrengths.map(s => this.strengthToSkill(s, isElementary)),
          developmentNeeded: weaknesses.map(w => this.weaknessToDevArea(w, isElementary)),
        }
      ];
      return allPaths.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    return paths.sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 3);
  }

  /**
   * Calculate match percentage between player's 6 C's and ideal profile
   */
  private calculateMatchPercentage(actual: SixCs, ideal: number[]): number {
    const actualArray = [
      actual.character,
      actual.competence,
      actual.communication,
      actual.compassion,
      actual.commitment,
      actual.confidence,
    ];

    let totalDiff = 0;
    for (let i = 0; i < 6; i++) {
      totalDiff += Math.abs(actualArray[i] - ideal[i]);
    }

    // Convert difference to percentage (max diff is 24)
    return Math.round(100 - (totalDiff / 24) * 100);
  }

  /**
   * Convert C category to skill description
   */
  private strengthToSkill(category: string, isElementary: boolean = false): string {
    if (isElementary) {
      const elementarySkillMap: Record<string, string> = {
        character: 'Making good choices',
        competence: 'Solving problems',
        communication: 'Sharing ideas clearly',
        compassion: 'Caring about others',
        commitment: 'Sticking with it',
        confidence: 'Being brave',
      };
      return elementarySkillMap[category] || category;
    }

    const skillMap: Record<string, string> = {
      character: 'Ethical decision-making',
      competence: 'Strategic thinking',
      communication: 'Stakeholder engagement',
      compassion: 'People leadership',
      commitment: 'Long-term vision',
      confidence: 'Decisive action',
    };
    return skillMap[category] || category;
  }

  /**
   * Convert weakness to development area
   */
  private weaknessToDevArea(category: string, isElementary: boolean = false): string {
    if (isElementary) {
      const elementaryDevMap: Record<string, string> = {
        character: 'Practice making fair choices',
        competence: 'Practice solving harder problems',
        communication: 'Practice explaining ideas',
        compassion: 'Practice thinking about feelings',
        commitment: 'Practice not giving up',
        confidence: 'Practice being more brave',
      };
      return elementaryDevMap[category] || `Practice ${category}`;
    }

    const devMap: Record<string, string> = {
      character: 'Strengthen ethical framework',
      competence: 'Develop analytical skills',
      communication: 'Improve stakeholder messaging',
      compassion: 'Build empathy and people focus',
      commitment: 'Develop persistence and vision',
      confidence: 'Build decision-making confidence',
    };
    return devMap[category] || `Develop ${category}`;
  }

  /**
   * Generate a comprehensive leadership report
   */
  public generateLeadershipReport(
    sixCs: SixCs,
    scenario: BusinessScenario,
    selectedExecutive: CSuiteRole,
    perfectSolutionsCount: number
  ): {
    overallGrade: string;
    leadershipStyle: string;
    topStrength: string;
    biggestOpportunity: string;
    nextSteps: string[];
  } {
    const avgScore = Object.values(sixCs).reduce((sum, score) => sum + score, 0) / 6;

    // Determine grade
    let overallGrade = 'C';
    if (avgScore >= 4.5) overallGrade = 'A+';
    else if (avgScore >= 4.0) overallGrade = 'A';
    else if (avgScore >= 3.5) overallGrade = 'B+';
    else if (avgScore >= 3.0) overallGrade = 'B';
    else if (avgScore >= 2.5) overallGrade = 'C+';

    // Determine leadership style
    let leadershipStyle = 'Developing Leader';
    if (sixCs.compassion >= 4 && sixCs.character >= 4) {
      leadershipStyle = 'Servant Leader';
    } else if (sixCs.competence >= 4 && sixCs.confidence >= 4) {
      leadershipStyle = 'Strategic Leader';
    } else if (sixCs.communication >= 4 && sixCs.compassion >= 4) {
      leadershipStyle = 'People-First Leader';
    } else if (sixCs.commitment >= 4 && sixCs.confidence >= 4) {
      leadershipStyle = 'Visionary Leader';
    } else if (sixCs.character >= 4 && sixCs.competence >= 4) {
      leadershipStyle = 'Ethical Leader';
    }

    // Find top strength
    const scores = Object.entries(sixCs);
    const topC = scores.reduce((max, [key, value]) =>
      value > max[1] ? [key, value] : max
    );
    const topStrength = this.strengthToSkill(topC[0]);

    // Find biggest opportunity
    const weakestC = scores.reduce((min, [key, value]) =>
      value < min[1] ? [key, value] : min
    );
    const biggestOpportunity = this.weaknessToDevArea(weakestC[0]);

    // Generate next steps
    const nextSteps: string[] = [];
    if (sixCs.competence < 4) {
      nextSteps.push('Practice analyzing complex business scenarios');
    }
    if (sixCs.communication < 4) {
      nextSteps.push('Develop multi-stakeholder communication plans');
    }
    if (sixCs.compassion < 4) {
      nextSteps.push('Consider human impact in all decisions');
    }
    if (perfectSolutionsCount < 3) {
      nextSteps.push('Study industry best practices for crisis management');
    }
    if (nextSteps.length === 0) {
      nextSteps.push('Continue practicing to maintain excellence');
      nextSteps.push('Mentor others in leadership development');
    }

    return {
      overallGrade,
      leadershipStyle,
      topStrength,
      biggestOpportunity,
      nextSteps,
    };
  }
}

// Export singleton instance
export const leadershipAnalyzer = new LeadershipAnalyzer();