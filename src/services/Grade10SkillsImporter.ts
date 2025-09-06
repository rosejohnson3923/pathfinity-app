/**
 * Grade 10 Skills Importer
 * Imports the Grade 10 skills from skillsDataComplete_Grade10.txt into database
 */

import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

interface SkillData {
  subject: string;
  grade: string;
  skillsArea: string;
  skillCluster: string;
  skillNumber: string;
  skillName: string;
}

export class Grade10SkillsImporter {
  private skills: SkillData[] = [];

  /**
   * Parse the tab-delimited skills file
   */
  async parseSkillsFile(): Promise<void> {
    const filePath = path.join(process.cwd(), 'src/data/skillsDataComplete_Grade10.txt');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split('\t');
      if (parts.length >= 6) {
        const skill: SkillData = {
          subject: parts[0],
          grade: parts[1],
          skillsArea: parts[2],
          skillCluster: parts[3],
          skillNumber: parts[4],
          skillName: parts[5]
        };

        // Only add Grade 10 skills
        if (skill.grade === '10') {
          this.skills.push(skill);
        }
      }
    }

    console.log(`Parsed ${this.skills.length} Grade 10 skills`);
  }

  /**
   * Import skills to database
   */
  async importToDatabase(): Promise<void> {
    console.log('Importing Grade 10 skills to database...');

    // Group skills by subject
    const skillsBySubject = new Map<string, SkillData[]>();
    for (const skill of this.skills) {
      if (!skillsBySubject.has(skill.subject)) {
        skillsBySubject.set(skill.subject, []);
      }
      skillsBySubject.get(skill.subject)!.push(skill);
    }

    // Import each subject's skills
    for (const [subject, subjectSkills] of skillsBySubject) {
      console.log(`\nImporting ${subjectSkills.length} skills for ${subject}...`);

      // Prepare batch insert
      const skillsToInsert = subjectSkills.map(skill => ({
        subject: skill.subject,
        grade: skill.grade,
        skills_area: skill.skillsArea,
        skills_cluster: skill.skillCluster,
        skill_number: skill.skillNumber,
        skill_name: skill.skillName,
        skill_description: `${skill.skillsArea} - ${skill.skillName}`,
        difficulty_level: this.calculateDifficulty(skill),
        estimated_time_minutes: this.estimateTime(skill)
      }));

      // Insert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < skillsToInsert.length; i += batchSize) {
        const batch = skillsToInsert.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('skills_master')
          .upsert(batch, { 
            onConflict: 'subject,grade,skill_number',
            ignoreDuplicates: false 
          });

        if (error) {
          console.error(`Error importing batch for ${subject}:`, error);
        } else {
          console.log(`  Imported batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(skillsToInsert.length / batchSize)}`);
        }
      }
    }
  }

  /**
   * Calculate difficulty level based on skill cluster position
   */
  private calculateDifficulty(skill: SkillData): number {
    // Extract cluster letter (A, B, C, etc.)
    const clusterLetter = skill.skillCluster.replace('.', '');
    const clusterIndex = clusterLetter.charCodeAt(0) - 'A'.charCodeAt(0);
    
    // Map to difficulty 1-5
    const maxClusters = 26; // A-Z
    const difficulty = Math.min(5, Math.floor(clusterIndex / 5) + 1);
    
    return difficulty;
  }

  /**
   * Estimate time based on skill complexity
   */
  private estimateTime(skill: SkillData): number {
    // Base time varies by subject
    const baseTimeBySubject: Record<string, number> = {
      'Math': 15,
      'ELA': 20,
      'Science': 25,
      'Social Studies': 20
    };

    const baseTime = baseTimeBySubject[skill.subject] || 20;
    const difficulty = this.calculateDifficulty(skill);
    
    // Add time based on difficulty
    return baseTime + (difficulty * 5);
  }

  /**
   * Get summary statistics
   */
  getStatistics(): Record<string, any> {
    const stats: Record<string, any> = {
      totalSkills: this.skills.length,
      bySubject: {}
    };

    // Count skills by subject
    for (const skill of this.skills) {
      if (!stats.bySubject[skill.subject]) {
        stats.bySubject[skill.subject] = {
          count: 0,
          clusters: new Set<string>()
        };
      }
      stats.bySubject[skill.subject].count++;
      stats.bySubject[skill.subject].clusters.add(skill.skillCluster);
    }

    // Convert sets to counts
    for (const subject in stats.bySubject) {
      stats.bySubject[subject].clusterCount = stats.bySubject[subject].clusters.size;
      delete stats.bySubject[subject].clusters;
    }

    return stats;
  }

  /**
   * Get skills for testing
   */
  getSkillsForSubject(subject: string, limit: number = 10): SkillData[] {
    return this.skills
      .filter(s => s.subject === subject)
      .slice(0, limit);
  }

  /**
   * Get a representative sample of skills for each subject
   */
  getSampleSkills(): Map<string, SkillData[]> {
    const samples = new Map<string, SkillData[]>();
    const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];

    for (const subject of subjects) {
      const subjectSkills = this.skills.filter(s => s.subject === subject);
      
      // Get skills from different clusters for variety
      const byCluster = new Map<string, SkillData[]>();
      for (const skill of subjectSkills) {
        if (!byCluster.has(skill.skillCluster)) {
          byCluster.set(skill.skillCluster, []);
        }
        byCluster.get(skill.skillCluster)!.push(skill);
      }

      // Select one skill from each of the first 5 clusters
      const selectedSkills: SkillData[] = [];
      let clusterCount = 0;
      for (const [cluster, clusterSkills] of byCluster) {
        if (clusterCount >= 5) break;
        selectedSkills.push(clusterSkills[0]);
        clusterCount++;
      }

      samples.set(subject, selectedSkills);
    }

    return samples;
  }
}

export default Grade10SkillsImporter;