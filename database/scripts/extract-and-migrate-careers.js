/**
 * Extract and Migrate Careers from pathIQService.ts
 * Reads the existing career definitions and migrates them to database with tier assignments
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
);

// Define which careers should be premium based on business model
const PREMIUM_CAREERS = new Set([
    // Elementary Premium (extended community roles)
    'park-ranger', 'bus-driver', 'mail-carrier', 'grocery-worker',
    'janitor', 'cafeteria-worker', 'crossing-guard', 'musician',

    // Middle School Premium (modern/specialized)
    'game-developer', 'youtuber', 'podcast-producer', 'app-developer',
    'social-media-manager', 'influencer', 'content-creator',
    'ux-designer', 'animator', 'esports-player',
    'digital-artist', 'vlogger', 'streamer',

    // High School Premium (emerging/specialized)
    'ai-engineer', 'data-scientist', 'cybersecurity-specialist',
    'cloud-architect', 'blockchain-developer', 'robotics-engineer',
    'machine-learning-engineer', 'quantum-computing-researcher',
    'ar-vr-developer', 'ceo', 'cfo', 'cto',
    'investment-banker', 'venture-capitalist', 'surgeon',
    'psychiatrist', 'cardiologist', 'neurologist',
    'aerospace-engineer', 'biomedical-engineer',
    'genetic-counselor', 'nanotechnology-engineer'
]);

// Extract careers from pathIQService.ts
function extractCareersFromFile() {
    const filePath = join(__dirname, '../../src/services/pathIQService.ts');
    const fileContent = readFileSync(filePath, 'utf-8');

    // Regular expression to match career objects
    const careerRegex = /{\s*id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"],\s*icon:\s*['"]([^'"]+)['"],\s*color:\s*['"]([^'"]+)['"],\s*category:\s*['"]([^'"]+)['"](?:,\s*skills:\s*\[([^\]]+)\])?(?:,\s*level:\s*['"]([^'"]+)['"])?(?:,\s*description:\s*['"]([^'"]+)['"])?(?:,\s*dailyTasks:\s*\[([^\]]+)\])?[^}]*}/g;

    const careers = [];
    let match;

    // Extract KINDERGARTEN_CAREERS
    const kindergartenSection = fileContent.match(/KINDERGARTEN_CAREERS\s*=\s*\[([\s\S]*?)\];/);
    if (kindergartenSection) {
        const content = kindergartenSection[1];
        const regex = /{\s*id:\s*['"]([^'"]+)['"][\s\S]*?}/g;
        while ((match = regex.exec(content)) !== null) {
            const careerObj = extractCareerObject(match[0]);
            if (careerObj) {
                careerObj.gradeLevel = 'kindergarten';
                careerObj.minGrade = 'K';
                careers.push(careerObj);
            }
        }
    }

    // Extract ELEMENTARY_CAREERS
    const elementarySection = fileContent.match(/ELEMENTARY_CAREERS\s*=\s*\[([\s\S]*?)\];/);
    if (elementarySection) {
        const content = elementarySection[1];
        const regex = /{\s*id:\s*['"]([^'"]+)['"][\s\S]*?}/g;
        while ((match = regex.exec(content)) !== null) {
            const careerObj = extractCareerObject(match[0]);
            if (careerObj) {
                careerObj.gradeLevel = 'elementary';
                careerObj.minGrade = 'K';
                careers.push(careerObj);
            }
        }
    }

    // Extract MIDDLE_SCHOOL_CAREERS
    const middleSection = fileContent.match(/MIDDLE_SCHOOL_CAREERS\s*=\s*\[([\s\S]*?)\];/);
    if (middleSection) {
        const content = middleSection[1];
        const regex = /{\s*id:\s*['"]([^'"]+)['"][\s\S]*?}/g;
        while ((match = regex.exec(content)) !== null) {
            const careerObj = extractCareerObject(match[0]);
            if (careerObj) {
                careerObj.gradeLevel = 'middle';
                careerObj.minGrade = '6';
                careers.push(careerObj);
            }
        }
    }

    // Extract HIGH_SCHOOL_CAREERS
    const highSection = fileContent.match(/HIGH_SCHOOL_CAREERS\s*=\s*\[([\s\S]*?)\];/);
    if (highSection) {
        const content = highSection[1];
        const regex = /{\s*id:\s*['"]([^'"]+)['"][\s\S]*?}/g;
        while ((match = regex.exec(content)) !== null) {
            const careerObj = extractCareerObject(match[0]);
            if (careerObj) {
                careerObj.gradeLevel = 'high';
                careerObj.minGrade = '9';
                careers.push(careerObj);
            }
        }
    }

    return careers;
}

function extractCareerObject(objString) {
    const obj = {};

    // Extract id
    const idMatch = objString.match(/id:\s*['"]([^'"]+)['"]/);
    if (idMatch) obj.id = idMatch[1];

    // Extract name
    const nameMatch = objString.match(/name:\s*['"]([^'"]+)['"]/);
    if (nameMatch) obj.name = nameMatch[1];

    // Extract icon
    const iconMatch = objString.match(/icon:\s*['"]([^'"]+)['"]/);
    if (iconMatch) obj.icon = iconMatch[1];

    // Extract color
    const colorMatch = objString.match(/color:\s*['"]([^'"]+)['"]/);
    if (colorMatch) obj.color = colorMatch[1];

    // Extract category
    const categoryMatch = objString.match(/category:\s*['"]([^'"]+)['"]/);
    if (categoryMatch) obj.category = categoryMatch[1];

    // Extract description
    const descMatch = objString.match(/description:\s*['"]([^'"]+)['"]/);
    if (descMatch) obj.description = descMatch[1];

    // Extract skills array
    const skillsMatch = objString.match(/skills:\s*\[([^\]]+)\]/);
    if (skillsMatch) {
        obj.skills = skillsMatch[1]
            .split(',')
            .map(s => s.trim().replace(/['"]/g, ''))
            .filter(s => s.length > 0);
    }

    // Extract dailyTasks array
    const tasksMatch = objString.match(/dailyTasks:\s*\[([^\]]+)\]/);
    if (tasksMatch) {
        obj.dailyTasks = tasksMatch[1]
            .split(',')
            .map(s => s.trim().replace(/['"]/g, ''))
            .filter(s => s.length > 0);
    }

    return obj.id ? obj : null;
}

// Simple parser for extracting all career objects
function extractAllCareers() {
    console.log('📖 Reading pathIQService.ts...');

    const filePath = join(__dirname, '../../src/services/pathIQService.ts');
    const fileContent = readFileSync(filePath, 'utf-8');

    const careers = [];

    // Split into lines and process
    const lines = fileContent.split('\n');
    let currentCareer = null;
    let inCareerObject = false;
    let braceCount = 0;
    let currentSection = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Detect which section we're in
        if (line.includes('KINDERGARTEN_CAREERS')) {
            currentSection = { level: 'kindergarten', minGrade: 'K', category: 'elementary' };
        } else if (line.includes('ELEMENTARY_CAREERS')) {
            currentSection = { level: 'elementary', minGrade: 'K', category: 'elementary' };
        } else if (line.includes('MIDDLE_SCHOOL_CAREERS')) {
            currentSection = { level: 'middle', minGrade: '6', category: 'middle' };
        } else if (line.includes('HIGH_SCHOOL_CAREERS')) {
            currentSection = { level: 'high', minGrade: '9', category: 'high' };
        }

        // Look for career object start
        if (line.includes('{ id:')) {
            inCareerObject = true;
            currentCareer = '';
            braceCount = 0;
        }

        if (inCareerObject) {
            currentCareer += line + '\n';

            // Count braces to find end of object
            for (const char of line) {
                if (char === '{') braceCount++;
                if (char === '}') braceCount--;
            }

            // If braces are balanced, we've found the end
            if (braceCount === 0 && currentCareer.includes('}')) {
                // Parse the career object
                try {
                    // Convert to valid JSON-like format
                    let careerStr = currentCareer
                        .replace(/id:/g, '"id":')
                        .replace(/name:/g, '"name":')
                        .replace(/icon:/g, '"icon":')
                        .replace(/color:/g, '"color":')
                        .replace(/category:/g, '"category":')
                        .replace(/skills:/g, '"skills":')
                        .replace(/level:/g, '"level":')
                        .replace(/description:/g, '"description":')
                        .replace(/dailyTasks:/g, '"dailyTasks":')
                        .replace(/'/g, '"')
                        .replace(/,\s*}/g, '}')  // Remove trailing commas
                        .replace(/,\s*\]/g, ']'); // Remove trailing commas in arrays

                    // Extract the object manually since it might not be valid JSON
                    const career = extractCareerObject(currentCareer);

                    if (career && currentSection) {
                        career.gradeLevel = currentSection.level;
                        career.minGrade = currentSection.minGrade;
                        career.gradeCategory = currentSection.category;
                        careers.push(career);
                    }
                } catch (e) {
                    // Skip if we can't parse
                }

                inCareerObject = false;
                currentCareer = null;
            }
        }
    }

    return careers;
}

async function migrateCareer(career) {
    try {
        // Determine tier based on career ID
        const tier = PREMIUM_CAREERS.has(career.id) ? 'premium' : 'basic';

        const careerData = {
            career_code: career.id,
            career_name: career.name,
            career_category: career.category,
            description: career.description || `Explore the exciting career of ${career.name}`,

            // Visual
            icon: career.icon,
            color: career.color,

            // Details
            daily_tasks: career.dailyTasks || null,
            required_skills: career.skills || null,

            // Access control
            access_tier: tier,
            min_grade_level: career.minGrade,
            max_grade_level: '12',
            grade_category: career.gradeCategory,

            // Metadata
            is_active: true,
            sort_order: tier === 'premium' ? 200 : 100,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('career_paths')
            .upsert(careerData, {
                onConflict: 'career_code'
            });

        if (error) {
            console.error(`❌ Error migrating ${career.id}:`, error.message);
            return false;
        }

        console.log(`✅ Migrated ${career.id} (${career.name}) as ${tier} career for ${career.gradeCategory}`);
        return true;
    } catch (err) {
        console.error(`❌ Failed to migrate ${career.id}:`, err);
        return false;
    }
}

async function runMigration() {
    console.log('🚀 Starting career extraction and migration...\n');

    // Extract all careers from pathIQService.ts
    const careers = extractAllCareers();
    console.log(`📊 Found ${careers.length} careers to migrate\n`);

    // Remove duplicates (same career might appear in multiple grade levels)
    const uniqueCareers = new Map();
    for (const career of careers) {
        if (!uniqueCareers.has(career.id)) {
            uniqueCareers.set(career.id, career);
        }
    }

    console.log(`📊 ${uniqueCareers.size} unique careers after deduplication\n`);

    let successCount = 0;
    let failCount = 0;

    // Group by grade level for organized output
    const byGrade = {
        kindergarten: [],
        elementary: [],
        middle: [],
        high: []
    };

    for (const career of uniqueCareers.values()) {
        if (byGrade[career.gradeLevel]) {
            byGrade[career.gradeLevel].push(career);
        }
    }

    // Migrate by grade level
    for (const [grade, gradeCareers] of Object.entries(byGrade)) {
        if (gradeCareers.length > 0) {
            console.log(`\n📚 Migrating ${grade} careers (${gradeCareers.length} total)...`);
            for (const career of gradeCareers) {
                const success = await migrateCareer(career);
                if (success) {
                    successCount++;
                } else {
                    failCount++;
                }
            }
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Complete!');
    console.log(`✅ Successfully migrated: ${successCount} careers`);
    console.log(`❌ Failed: ${failCount} careers`);
    console.log('='.repeat(50));

    // Verify final counts
    const { count: basicCount } = await supabase
        .from('career_paths')
        .select('*', { count: 'exact', head: true })
        .eq('access_tier', 'basic');

    const { count: premiumCount } = await supabase
        .from('career_paths')
        .select('*', { count: 'exact', head: true })
        .eq('access_tier', 'premium');

    const { count: totalCount } = await supabase
        .from('career_paths')
        .select('*', { count: 'exact', head: true });

    console.log('\n📈 Database Status:');
    console.log(`   Basic careers: ${basicCount || 0}`);
    console.log(`   Premium careers: ${premiumCount || 0}`);
    console.log(`   Total careers: ${totalCount || 0}`);
}

// Run the migration
runMigration().catch(console.error);