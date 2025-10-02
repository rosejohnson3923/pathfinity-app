/**
 * Complete Career Migration Script
 * Migrates ALL careers with tier classifications
 * Creates minimal records for careers without full data
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
);

// Default career templates by category
const CATEGORY_DEFAULTS = {
    education: { icon: '📚', color: '#3B82F6' },
    health: { icon: '🏥', color: '#14B8A6' },
    safety: { icon: '🛡️', color: '#DC2626' },
    community: { icon: '🏘️', color: '#F59E0B' },
    creative: { icon: '🎨', color: '#8B5CF6' },
    technology: { icon: '💻', color: '#7C3AED' },
    business: { icon: '💼', color: '#10B981' },
    science: { icon: '🔬', color: '#06B6D4' },
    finance: { icon: '💰', color: '#059669' },
    engineering: { icon: '⚙️', color: '#EA580C' },
    media: { icon: '📺', color: '#EC4899' },
    service: { icon: '🤝', color: '#78716C' },
    trades: { icon: '🔨', color: '#92400E' },
    sports: { icon: '⚽', color: '#16A34A' }
};

// Format career name from code
function formatCareerName(code) {
    return code
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Get category from career code
function guessCategory(code) {
    if (code.includes('teacher') || code.includes('coach')) return 'education';
    if (code.includes('doctor') || code.includes('nurse') || code.includes('therapist')) return 'health';
    if (code.includes('engineer')) return 'engineering';
    if (code.includes('developer') || code.includes('programmer')) return 'technology';
    if (code.includes('manager') || code.includes('entrepreneur')) return 'business';
    if (code.includes('scientist') || code.includes('researcher')) return 'science';
    if (code.includes('artist') || code.includes('designer') || code.includes('musician')) return 'creative';
    if (code.includes('analyst') || code.includes('banker') || code.includes('accountant')) return 'finance';
    if (code.includes('writer') || code.includes('journalist') || code.includes('youtuber')) return 'media';
    if (code.includes('electrician') || code.includes('plumber') || code.includes('carpenter')) return 'trades';
    if (code.includes('athlete') || code.includes('player')) return 'sports';
    if (code.includes('police') || code.includes('firefighter')) return 'safety';
    return 'community';
}

// All career definitions with tiers
const ALL_CAREERS = [
    // Elementary Basic (10 careers)
    { code: 'teacher', tier: 'basic', grade: 'elementary', minGrade: 'K', name: 'Teacher' },
    { code: 'doctor', tier: 'basic', grade: 'elementary', minGrade: 'K', name: 'Doctor' },
    { code: 'firefighter', tier: 'basic', grade: 'elementary', minGrade: 'K', name: 'Firefighter' },
    { code: 'police-officer', tier: 'basic', grade: 'elementary', minGrade: 'K', name: 'Police Officer' },
    { code: 'veterinarian', tier: 'basic', grade: 'elementary', minGrade: 'K', name: 'Veterinarian' },
    { code: 'chef', tier: 'basic', grade: 'elementary', minGrade: 'K', name: 'Chef' },
    { code: 'artist', tier: 'basic', grade: 'elementary', minGrade: 'K', name: 'Artist' },
    { code: 'nurse', tier: 'basic', grade: 'elementary', minGrade: 'K', name: 'Nurse' },
    { code: 'dentist', tier: 'basic', grade: 'elementary', minGrade: 'K', name: 'Dentist' },
    { code: 'librarian', tier: 'basic', grade: 'elementary', minGrade: 'K', name: 'Librarian' },

    // Elementary Premium (15 careers)
    { code: 'park-ranger', tier: 'premium', grade: 'elementary', minGrade: 'K', name: 'Park Ranger' },
    { code: 'bus-driver', tier: 'premium', grade: 'elementary', minGrade: 'K', name: 'Bus Driver' },
    { code: 'mail-carrier', tier: 'premium', grade: 'elementary', minGrade: 'K', name: 'Mail Carrier' },
    { code: 'coach', tier: 'premium', grade: 'elementary', minGrade: 'K', name: 'Coach' },
    { code: 'grocery-worker', tier: 'premium', grade: 'elementary', minGrade: 'K', name: 'Grocery Worker' },
    { code: 'janitor', tier: 'premium', grade: 'elementary', minGrade: 'K', name: 'Janitor' },
    { code: 'cafeteria-worker', tier: 'premium', grade: 'elementary', minGrade: 'K', name: 'Cafeteria Worker' },
    { code: 'crossing-guard', tier: 'premium', grade: 'elementary', minGrade: 'K', name: 'Crossing Guard' },
    { code: 'musician', tier: 'premium', grade: 'elementary', minGrade: 'K', name: 'Musician' },
    { code: 'farmer', tier: 'premium', grade: 'elementary', minGrade: 'K', name: 'Farmer' },
    { code: 'baker', tier: 'premium', grade: 'elementary', minGrade: 'K', name: 'Baker' },
    { code: 'pilot', tier: 'premium', grade: 'elementary', minGrade: 'K', name: 'Pilot' },
    { code: 'scientist-basic', tier: 'premium', grade: 'elementary', minGrade: 'K', name: 'Scientist' },
    { code: 'zookeeper', tier: 'premium', grade: 'elementary', minGrade: 'K', name: 'Zookeeper' },
    { code: 'astronaut-basic', tier: 'premium', grade: 'elementary', minGrade: 'K', name: 'Astronaut' },

    // Middle School Basic (20 careers)
    { code: 'programmer', tier: 'basic', grade: 'middle', minGrade: '6', name: 'Programmer' },
    { code: 'entrepreneur', tier: 'basic', grade: 'middle', minGrade: '6', name: 'Entrepreneur' },
    { code: 'manager', tier: 'basic', grade: 'middle', minGrade: '6', name: 'Manager' },
    { code: 'bank-teller', tier: 'basic', grade: 'middle', minGrade: '6', name: 'Bank Teller' },
    { code: 'writer', tier: 'basic', grade: 'middle', minGrade: '6', name: 'Writer' },
    { code: 'photographer', tier: 'basic', grade: 'middle', minGrade: '6', name: 'Photographer' },
    { code: 'engineer', tier: 'basic', grade: 'middle', minGrade: '6', name: 'Engineer' },
    { code: 'electrician', tier: 'basic', grade: 'middle', minGrade: '6', name: 'Electrician' },
    { code: 'plumber', tier: 'basic', grade: 'middle', minGrade: '6', name: 'Plumber' },
    { code: 'carpenter', tier: 'basic', grade: 'middle', minGrade: '6', name: 'Carpenter' },
    { code: 'athlete', tier: 'basic', grade: 'middle', minGrade: '6', name: 'Athlete' },
    { code: 'social-worker', tier: 'basic', grade: 'middle', minGrade: '6', name: 'Social Worker' },
    { code: 'lawyer', tier: 'basic', grade: 'middle', minGrade: '6', name: 'Lawyer' },
    { code: 'real-estate-agent', tier: 'basic', grade: 'middle', minGrade: '6', name: 'Real Estate Agent' },
    { code: 'journalist', tier: 'basic', grade: 'middle', minGrade: '6', name: 'Journalist' },
    { code: 'scientist', tier: 'basic', grade: 'middle', minGrade: '6', name: 'Scientist' },
    { code: 'environmental-scientist', tier: 'basic', grade: 'middle', minGrade: '6', name: 'Environmental Scientist' },
    { code: 'graphic-designer', tier: 'basic', grade: 'middle', minGrade: '6', name: 'Graphic Designer' },
    { code: 'dancer', tier: 'basic', grade: 'middle', minGrade: '6', name: 'Dancer' },
    { code: 'web-designer', tier: 'basic', grade: 'middle', minGrade: '6', name: 'Web Designer' },

    // Middle School Premium (30 careers)
    { code: 'game-developer', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Game Developer' },
    { code: 'youtuber', tier: 'premium', grade: 'middle', minGrade: '6', name: 'YouTuber' },
    { code: 'podcast-producer', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Podcast Producer' },
    { code: 'drone-operator', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Drone Operator' },
    { code: 'app-developer', tier: 'premium', grade: 'middle', minGrade: '6', name: 'App Developer' },
    { code: 'data-analyst', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Data Analyst' },
    { code: 'social-media-manager', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Social Media Manager' },
    { code: 'ux-designer', tier: 'premium', grade: 'middle', minGrade: '6', name: 'UX Designer' },
    { code: 'animator', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Animator' },
    { code: '3d-modeler', tier: 'premium', grade: 'middle', minGrade: '6', name: '3D Modeler' },
    { code: 'esports-player', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Esports Player' },
    { code: 'influencer', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Influencer' },
    { code: 'digital-marketer', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Digital Marketer' },
    { code: 'seo-specialist', tier: 'premium', grade: 'middle', minGrade: '6', name: 'SEO Specialist' },
    { code: 'content-strategist', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Content Strategist' },
    { code: 'brand-manager', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Brand Manager' },
    { code: 'event-planner', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Event Planner' },
    { code: 'interior-designer', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Interior Designer' },
    { code: 'fashion-designer', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Fashion Designer' },
    { code: 'makeup-artist', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Makeup Artist' },
    { code: 'personal-trainer', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Personal Trainer' },
    { code: 'nutritionist', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Nutritionist' },
    { code: 'life-coach', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Life Coach' },
    { code: 'therapist', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Therapist' },
    { code: 'veterinary-tech', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Veterinary Tech' },
    { code: 'dental-hygienist', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Dental Hygienist' },
    { code: 'physical-therapist', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Physical Therapist' },
    { code: 'occupational-therapist', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Occupational Therapist' },
    { code: 'translator', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Translator' },
    { code: 'voice-actor', tier: 'premium', grade: 'middle', minGrade: '6', name: 'Voice Actor' },

    // High School Basic (20 careers)
    { code: 'software-engineer', tier: 'basic', grade: 'high', minGrade: '9', name: 'Software Engineer' },
    { code: 'marketing-manager', tier: 'basic', grade: 'high', minGrade: '9', name: 'Marketing Manager' },
    { code: 'financial-analyst', tier: 'basic', grade: 'high', minGrade: '9', name: 'Financial Analyst' },
    { code: 'nurse-practitioner', tier: 'basic', grade: 'high', minGrade: '9', name: 'Nurse Practitioner' },
    { code: 'mechanical-engineer', tier: 'basic', grade: 'high', minGrade: '9', name: 'Mechanical Engineer' },
    { code: 'accountant', tier: 'basic', grade: 'high', minGrade: '9', name: 'Accountant' },
    { code: 'teacher-secondary', tier: 'basic', grade: 'high', minGrade: '9', name: 'Secondary Teacher' },
    { code: 'sales-manager', tier: 'basic', grade: 'high', minGrade: '9', name: 'Sales Manager' },
    { code: 'hr-manager', tier: 'basic', grade: 'high', minGrade: '9', name: 'HR Manager' },
    { code: 'project-manager', tier: 'basic', grade: 'high', minGrade: '9', name: 'Project Manager' },
    { code: 'civil-engineer', tier: 'basic', grade: 'high', minGrade: '9', name: 'Civil Engineer' },
    { code: 'chemical-engineer', tier: 'basic', grade: 'high', minGrade: '9', name: 'Chemical Engineer' },
    { code: 'architect-basic', tier: 'basic', grade: 'high', minGrade: '9', name: 'Architect' },
    { code: 'pharmacist-basic', tier: 'basic', grade: 'high', minGrade: '9', name: 'Pharmacist' },
    { code: 'psychologist', tier: 'basic', grade: 'high', minGrade: '9', name: 'Psychologist' },
    { code: 'consultant', tier: 'basic', grade: 'high', minGrade: '9', name: 'Consultant' },
    { code: 'researcher', tier: 'basic', grade: 'high', minGrade: '9', name: 'Researcher' },
    { code: 'operations-manager', tier: 'basic', grade: 'high', minGrade: '9', name: 'Operations Manager' },
    { code: 'product-manager', tier: 'basic', grade: 'high', minGrade: '9', name: 'Product Manager' },
    { code: 'business-analyst', tier: 'basic', grade: 'high', minGrade: '9', name: 'Business Analyst' },

    // High School Premium (40+ careers)
    { code: 'ai-engineer', tier: 'premium', grade: 'high', minGrade: '9', name: 'AI Engineer' },
    { code: 'data-scientist', tier: 'premium', grade: 'high', minGrade: '9', name: 'Data Scientist' },
    { code: 'cybersecurity-specialist', tier: 'premium', grade: 'high', minGrade: '9', name: 'Cybersecurity Specialist' },
    { code: 'cloud-architect', tier: 'premium', grade: 'high', minGrade: '9', name: 'Cloud Architect' },
    { code: 'blockchain-developer', tier: 'premium', grade: 'high', minGrade: '9', name: 'Blockchain Developer' },
    { code: 'robotics-engineer', tier: 'premium', grade: 'high', minGrade: '9', name: 'Robotics Engineer' },
    { code: 'biotech-researcher', tier: 'premium', grade: 'high', minGrade: '9', name: 'Biotech Researcher' },
    { code: 'sustainability-consultant', tier: 'premium', grade: 'high', minGrade: '9', name: 'Sustainability Consultant' },
    { code: 'space-industry-worker', tier: 'premium', grade: 'high', minGrade: '9', name: 'Space Industry Worker' },
    { code: 'quantum-computing-specialist', tier: 'premium', grade: 'high', minGrade: '9', name: 'Quantum Computing Specialist' },
    { code: 'ar-vr-developer', tier: 'premium', grade: 'high', minGrade: '9', name: 'AR/VR Developer' },
    { code: 'machine-learning-engineer', tier: 'premium', grade: 'high', minGrade: '9', name: 'Machine Learning Engineer' },
    { code: 'devops-engineer', tier: 'premium', grade: 'high', minGrade: '9', name: 'DevOps Engineer' },
    { code: 'full-stack-developer', tier: 'premium', grade: 'high', minGrade: '9', name: 'Full Stack Developer' },
    { code: 'mobile-app-developer', tier: 'premium', grade: 'high', minGrade: '9', name: 'Mobile App Developer' },
    { code: 'ceo', tier: 'premium', grade: 'high', minGrade: '9', name: 'CEO' },
    { code: 'cfo', tier: 'premium', grade: 'high', minGrade: '9', name: 'CFO' },
    { code: 'cto', tier: 'premium', grade: 'high', minGrade: '9', name: 'CTO' },
    { code: 'investment-banker', tier: 'premium', grade: 'high', minGrade: '9', name: 'Investment Banker' },
    { code: 'venture-capitalist', tier: 'premium', grade: 'high', minGrade: '9', name: 'Venture Capitalist' },
    { code: 'private-equity-analyst', tier: 'premium', grade: 'high', minGrade: '9', name: 'Private Equity Analyst' },
    { code: 'hedge-fund-manager', tier: 'premium', grade: 'high', minGrade: '9', name: 'Hedge Fund Manager' },
    { code: 'surgeon', tier: 'premium', grade: 'high', minGrade: '9', name: 'Surgeon' },
    { code: 'psychiatrist', tier: 'premium', grade: 'high', minGrade: '9', name: 'Psychiatrist' },
    { code: 'anesthesiologist', tier: 'premium', grade: 'high', minGrade: '9', name: 'Anesthesiologist' },
    { code: 'radiologist', tier: 'premium', grade: 'high', minGrade: '9', name: 'Radiologist' },
    { code: 'cardiologist', tier: 'premium', grade: 'high', minGrade: '9', name: 'Cardiologist' },
    { code: 'neurologist', tier: 'premium', grade: 'high', minGrade: '9', name: 'Neurologist' },
    { code: 'oncologist', tier: 'premium', grade: 'high', minGrade: '9', name: 'Oncologist' },
    { code: 'aerospace-engineer', tier: 'premium', grade: 'high', minGrade: '9', name: 'Aerospace Engineer' },
    { code: 'biomedical-engineer', tier: 'premium', grade: 'high', minGrade: '9', name: 'Biomedical Engineer' },
    { code: 'renewable-energy-engineer', tier: 'premium', grade: 'high', minGrade: '9', name: 'Renewable Energy Engineer' },
    { code: 'nuclear-engineer', tier: 'premium', grade: 'high', minGrade: '9', name: 'Nuclear Engineer' },
    { code: 'materials-scientist', tier: 'premium', grade: 'high', minGrade: '9', name: 'Materials Scientist' },
    { code: 'nanotechnology-researcher', tier: 'premium', grade: 'high', minGrade: '9', name: 'Nanotechnology Researcher' },
    { code: 'geneticist', tier: 'premium', grade: 'high', minGrade: '9', name: 'Geneticist' },
    { code: 'marine-biologist', tier: 'premium', grade: 'high', minGrade: '9', name: 'Marine Biologist' },
    { code: 'climate-scientist', tier: 'premium', grade: 'high', minGrade: '9', name: 'Climate Scientist' },
    { code: 'epidemiologist', tier: 'premium', grade: 'high', minGrade: '9', name: 'Epidemiologist' },
    { code: 'forensic-scientist', tier: 'premium', grade: 'high', minGrade: '9', name: 'Forensic Scientist' }
];

async function migrateCareer(career) {
    try {
        const category = guessCategory(career.code);
        const defaults = CATEGORY_DEFAULTS[category] || CATEGORY_DEFAULTS.community;

        const { data, error } = await supabase
            .from('career_paths')
            .upsert({
                career_code: career.code,
                career_name: career.name,
                career_category: category,

                // Visual
                icon: defaults.icon,
                color: defaults.color,

                // Access control
                access_tier: career.tier,
                min_grade_level: career.minGrade,
                max_grade_level: '12',
                grade_category: career.grade,

                // Basic description
                description: `Explore the exciting career of ${career.name}`,

                // Metadata
                is_active: true,
                sort_order: career.tier === 'premium' ? 200 : 100,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'career_code'
            });

        if (error) {
            console.error(`❌ Error migrating ${career.code}:`, error.message);
            return false;
        }

        console.log(`✅ Migrated ${career.code} as ${career.tier} career for ${career.grade}`);
        return true;
    } catch (err) {
        console.error(`❌ Failed to migrate ${career.code}:`, err);
        return false;
    }
}

async function runMigration() {
    console.log('🚀 Starting complete career migration...\n');

    let successCount = 0;
    let failCount = 0;

    for (const career of ALL_CAREERS) {
        const success = await migrateCareer(career);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Complete!');
    console.log(`✅ Successfully migrated: ${successCount} careers`);
    console.log(`❌ Failed: ${failCount} careers`);
    console.log('='.repeat(50));

    // Verify counts
    const { data: basicCount } = await supabase
        .from('career_paths')
        .select('career_code', { count: 'exact', head: true })
        .eq('access_tier', 'basic');

    const { data: premiumCount } = await supabase
        .from('career_paths')
        .select('career_code', { count: 'exact', head: true })
        .eq('access_tier', 'premium');

    console.log('\n📈 Database Status:');
    console.log(`   Basic careers: ${basicCount?.length || 0}`);
    console.log(`   Premium careers: ${premiumCount?.length || 0}`);
    console.log(`   Total careers: ${(basicCount?.length || 0) + (premiumCount?.length || 0)}`);
}

// Run the migration
runMigration().catch(console.error);