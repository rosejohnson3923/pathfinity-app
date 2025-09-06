/**
 * Import Common Core Standards from Text File to Database
 * This script reads commonCore_HighSchool_Complete.txt and imports it into the database
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '../..');

// Load environment variables
config({ path: path.join(PROJECT_ROOT, '.env.local') });
config({ path: path.join(PROJECT_ROOT, '.env.development') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Parse the Common Core standards text file
 */
async function parseCommonCoreFile() {
    const filePath = path.join(__dirname, '../../src/data/commonCore_HighSchool_Complete.txt');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    
    const standards = [];
    const careerMappings = [];
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split('\t');
        if (parts.length < 8) continue;
        
        const [
            commonCoreId,
            commonCoreDescription,
            subject,
            grade,
            skillsArea,
            skillsCluster,
            skillNumber,
            skillName,
            careerRelevance
        ] = parts;
        
        // Determine cognitive level and difficulty
        let cognitiveLevel = 'Remember';
        let difficultyLevel = 2;
        
        const descLower = commonCoreDescription.toLowerCase();
        if (descLower.includes('create') || descLower.includes('design') || descLower.includes('develop')) {
            cognitiveLevel = 'Create';
            difficultyLevel = 5;
        } else if (descLower.includes('evaluate') || descLower.includes('critique') || descLower.includes('assess')) {
            cognitiveLevel = 'Evaluate';
            difficultyLevel = 4;
        } else if (descLower.includes('analyze') || descLower.includes('compare') || descLower.includes('contrast')) {
            cognitiveLevel = 'Analyze';
            difficultyLevel = 4;
        } else if (descLower.includes('apply') || descLower.includes('use') || descLower.includes('solve')) {
            cognitiveLevel = 'Apply';
            difficultyLevel = 3;
        } else if (descLower.includes('understand') || descLower.includes('explain') || descLower.includes('describe')) {
            cognitiveLevel = 'Understand';
            difficultyLevel = 2;
        }
        
        // Extract domain and cluster codes
        let domainCode = null;
        let clusterCode = null;
        let standardLevel = null;
        
        if (commonCoreId.startsWith('HS')) {
            domainCode = commonCoreId.substring(0, 5);
        } else if (commonCoreId.startsWith('RST')) {
            domainCode = commonCoreId.substring(0, 3);
        } else if (commonCoreId.startsWith('W')) {
            domainCode = commonCoreId.substring(0, 1);
        }
        
        if (commonCoreId.includes('-')) {
            clusterCode = commonCoreId.split('-')[1]?.split('.')[0];
        }
        
        if (commonCoreId.includes('.')) {
            standardLevel = commonCoreId.substring(commonCoreId.indexOf('.'));
        }
        
        // Calculate estimated hours based on difficulty
        const estimatedHours = {
            5: 8.0,
            4: 6.0,
            3: 4.0,
            2: 2.0,
            1: 1.5
        }[difficultyLevel] || 2.0;
        
        standards.push({
            common_core_id: commonCoreId,
            common_core_description: commonCoreDescription,
            subject,
            grade,
            skills_area: skillsArea,
            skills_cluster: skillsCluster,
            skill_number: skillNumber,
            skill_name: skillName,
            domain_code: domainCode,
            cluster_code: clusterCode,
            standard_level: standardLevel,
            cognitive_level: cognitiveLevel,
            difficulty_level: difficultyLevel,
            estimated_time_hours: estimatedHours,
            is_active: true,
            is_essential: true
        });
        
        // Process career relevance
        if (careerRelevance && careerRelevance.trim()) {
            const careers = careerRelevance.split(',').map(c => c.trim());
            for (const career of careers) {
                if (career) {
                    // Determine relevance based on subject and career
                    let relevanceLevel = 'Recommended';
                    let relevanceScore = 7;
                    let importanceEntry = 6;
                    let importanceMid = 6;
                    let importanceSenior = 5;
                    
                    // STEM careers need math and science
                    if ((career === 'engineering' || career === 'computer_science' || career === 'data_science') && 
                        (subject === 'Math' || subject === 'Science')) {
                        relevanceLevel = 'Essential';
                        relevanceScore = 9;
                        importanceEntry = 8;
                        importanceMid = 8;
                        importanceSenior = 7;
                    }
                    
                    // Finance needs math
                    if (career === 'finance' && subject === 'Math') {
                        relevanceLevel = 'Essential';
                        relevanceScore = 9;
                        importanceEntry = 8;
                        importanceMid = 9;
                        importanceSenior = 9;
                    }
                    
                    // Law and marketing need ELA
                    if ((career === 'law' || career === 'marketing') && subject === 'ELA') {
                        relevanceLevel = 'Essential';
                        relevanceScore = 9;
                        importanceEntry = 8;
                        importanceMid = 8;
                        importanceSenior = 7;
                    }
                    
                    careerMappings.push({
                        career_code: career,
                        common_core_id: commonCoreId,
                        relevance_level: relevanceLevel,
                        relevance_score: relevanceScore,
                        application_context: `Application of ${skillName} in ${career} field`,
                        real_world_example: `${skillName} is used in ${career} for ${skillsArea.toLowerCase()} tasks`,
                        importance_entry_level: importanceEntry,
                        importance_mid_career: importanceMid,
                        importance_senior_level: importanceSenior
                    });
                }
            }
        }
    }
    
    return { standards, careerMappings };
}

/**
 * Import standards into the database
 */
async function importToDatabase(standards, careerMappings) {
    console.log(`Importing ${standards.length} Common Core standards...`);
    
    // Insert standards in batches
    const batchSize = 50;
    for (let i = 0; i < standards.length; i += batchSize) {
        const batch = standards.slice(i, i + batchSize);
        
        const { data, error } = await supabase
            .from('common_core_standards')
            .upsert(batch, { 
                onConflict: 'common_core_id',
                ignoreDuplicates: false 
            });
        
        if (error) {
            console.error(`Error inserting standards batch ${i / batchSize + 1}:`, error);
        } else {
            console.log(`Imported standards ${i + 1} to ${Math.min(i + batchSize, standards.length)}`);
        }
    }
    
    console.log(`\nImporting ${careerMappings.length} career-standard mappings...`);
    
    // Insert career mappings in batches
    for (let i = 0; i < careerMappings.length; i += batchSize) {
        const batch = careerMappings.slice(i, i + batchSize);
        
        const { data, error } = await supabase
            .from('career_standard_mapping')
            .upsert(batch, { 
                onConflict: 'career_code,common_core_id',
                ignoreDuplicates: false 
            });
        
        if (error) {
            console.error(`Error inserting mappings batch ${i / batchSize + 1}:`, error);
        } else {
            console.log(`Imported mappings ${i + 1} to ${Math.min(i + batchSize, careerMappings.length)}`);
        }
    }
}

/**
 * Verify the import
 */
async function verifyImport() {
    console.log('\nVerifying import...');
    
    // Count standards
    const { count: standardCount, error: standardError } = await supabase
        .from('common_core_standards')
        .select('*', { count: 'exact', head: true });
    
    if (!standardError) {
        console.log(`Total standards in database: ${standardCount}`);
    }
    
    // Count career mappings
    const { count: mappingCount, error: mappingError } = await supabase
        .from('career_standard_mapping')
        .select('*', { count: 'exact', head: true });
    
    if (!mappingError) {
        console.log(`Total career mappings in database: ${mappingCount}`);
    }
    
    // Sample data verification
    const { data: sampleStandards, error: sampleError } = await supabase
        .from('common_core_standards')
        .select('common_core_id, skill_name, subject, grade')
        .limit(5);
    
    if (!sampleError && sampleStandards) {
        console.log('\nSample imported standards:');
        sampleStandards.forEach(s => {
            console.log(`  ${s.common_core_id}: ${s.skill_name} (${s.subject}, Grade ${s.grade})`);
        });
    }
    
    // Career mapping sample
    const { data: sampleMappings, error: mappingError2 } = await supabase
        .from('career_standard_mapping')
        .select('career_code, common_core_id, relevance_level')
        .limit(5);
    
    if (!mappingError2 && sampleMappings) {
        console.log('\nSample career mappings:');
        sampleMappings.forEach(m => {
            console.log(`  ${m.career_code} -> ${m.common_core_id} (${m.relevance_level})`);
        });
    }
}

/**
 * Main execution
 */
async function main() {
    try {
        console.log('Starting Common Core standards import...\n');
        
        // Parse the file
        const { standards, careerMappings } = await parseCommonCoreFile();
        console.log(`Parsed ${standards.length} standards and ${careerMappings.length} career mappings\n`);
        
        // Import to database
        await importToDatabase(standards, careerMappings);
        
        // Verify the import
        await verifyImport();
        
        console.log('\nImport completed successfully!');
    } catch (error) {
        console.error('Error during import:', error);
        process.exit(1);
    }
}

// Run the import
main();