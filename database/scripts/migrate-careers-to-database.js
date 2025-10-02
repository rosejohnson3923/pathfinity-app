/**
 * Career Data Migration Script
 * Migrates hardcoded careers from pathIQService.ts to database
 * Categorizes careers into Select and Premium tiers
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
);

// Career tier definitions based on business model
const CAREER_TIERS = {
    // Elementary Select (10 careers) - Core community helpers
    ELEMENTARY_SELECT: [
        'teacher', 'doctor', 'firefighter', 'police-officer',
        'veterinarian', 'chef', 'artist', 'nurse',
        'dentist', 'librarian'
    ],

    // Elementary Premium (+15 careers) - Extended community roles
    ELEMENTARY_PREMIUM: [
        'park-ranger', 'bus-driver', 'mail-carrier', 'coach',
        'grocery-worker', 'janitor', 'cafeteria-worker',
        'crossing-guard', 'musician', 'farmer', 'baker',
        'pilot', 'scientist-select', 'zookeeper', 'astronaut-select'
    ],

    // Middle School Select (20 careers) - Traditional career paths
    MIDDLE_SELECT: [
        'programmer', 'entrepreneur', 'manager', 'bank-teller',
        'writer', 'photographer', 'engineer', 'electrician',
        'plumber', 'carpenter', 'athlete', 'social-worker',
        'lawyer', 'real-estate-agent', 'journalist', 'scientist',
        'environmental-scientist', 'graphic-designer', 'dancer', 'web-designer'
    ],

    // Middle School Premium (+30 careers) - Specialized/Modern careers
    MIDDLE_PREMIUM: [
        'game-developer', 'youtuber', 'podcast-producer', 'drone-operator',
        'app-developer', 'data-analyst', 'social-media-manager', 'ux-designer',
        'animator', '3d-modeler', 'esports-player', 'influencer',
        'digital-marketer', 'seo-specialist', 'content-strategist', 'brand-manager',
        'event-planner', 'interior-designer', 'fashion-designer', 'makeup-artist',
        'personal-trainer', 'nutritionist', 'life-coach', 'therapist',
        'veterinary-tech', 'dental-hygienist', 'physical-therapist', 'occupational-therapist',
        'translator', 'voice-actor'
    ],

    // High School Select (20 careers) - Traditional professional paths
    HIGH_SELECT: [
        'software-engineer', 'marketing-manager', 'financial-analyst',
        'nurse-practitioner', 'mechanical-engineer', 'accountant',
        'teacher-secondary', 'sales-manager', 'hr-manager', 'project-manager',
        'civil-engineer', 'chemical-engineer', 'architect-select',
        'pharmacist-select', 'psychologist', 'consultant', 'researcher',
        'operations-manager', 'product-manager', 'business-analyst'
    ],

    // High School Premium (+40 careers) - Emerging/Specialized careers
    HIGH_PREMIUM: [
        'ai-engineer', 'data-scientist', 'cybersecurity-specialist',
        'cloud-architect', 'blockchain-developer', 'robotics-engineer',
        'biotech-researcher', 'sustainability-consultant', 'space-industry-worker',
        'quantum-computing-specialist', 'ar-vr-developer', 'machine-learning-engineer',
        'devops-engineer', 'full-stack-developer', 'mobile-app-developer',
        'ceo', 'cfo', 'cto', 'investment-banker', 'venture-capitalist',
        'private-equity-analyst', 'hedge-fund-manager', 'surgeon',
        'psychiatrist', 'anesthesiologist', 'radiologist', 'cardiologist',
        'neurologist', 'oncologist', 'aerospace-engineer', 'biomedical-engineer',
        'renewable-energy-engineer', 'nuclear-engineer', 'materials-scientist',
        'nanotechnology-researcher', 'geneticist', 'marine-biologist',
        'climate-scientist', 'epidemiologist', 'forensic-scientist'
    ]
};

// Full career data (combining from pathIQService.ts)
const CAREER_DATA = {
    // Elementary careers
    'teacher': {
        name: 'Teacher',
        icon: '👨‍🏫',
        color: '#3B82F6',
        category: 'education',
        description: 'Help children learn new things every day',
        skills: ['communication', 'patience', 'organization'],
        daily_tasks: [
            'Plan and teach lessons',
            'Grade assignments and tests',
            'Meet with parents',
            'Help students with problems'
        ],
        salary_range: '$40,000-$70,000',
        growth_outlook: 'Stable',
        education_required: "Bachelor's Degree + Teaching Certificate"
    },
    'doctor': {
        name: 'Doctor',
        icon: '👩‍⚕️',
        color: '#14B8A6',
        category: 'health',
        description: 'Help people feel better when they are sick',
        skills: ['empathy', 'science', 'decision-making'],
        daily_tasks: [
            'Examine patients',
            'Diagnose illnesses',
            'Prescribe medicine',
            'Perform medical procedures'
        ],
        salary_range: '$200,000-$400,000',
        growth_outlook: 'High Growth',
        education_required: 'Medical School + Residency'
    },
    'firefighter': {
        name: 'Firefighter',
        icon: '🚒',
        color: '#DC2626',
        category: 'safety',
        description: 'Keep people safe from fires and help in emergencies',
        skills: ['bravery', 'teamwork', 'physical-fitness'],
        daily_tasks: [
            'Respond to emergency calls',
            'Fight fires and rescue people',
            'Maintain equipment',
            'Educate community on fire safety'
        ],
        salary_range: '$50,000-$80,000',
        growth_outlook: 'Stable',
        education_required: 'Fire Academy Training'
    },
    // ... Add all other careers with full data

    // Premium careers examples
    'ai-engineer': {
        name: 'AI/ML Engineer',
        icon: '🤖',
        color: '#6366F1',
        category: 'technology',
        description: 'Build intelligent systems that can learn and make decisions',
        skills: ['programming', 'mathematics', 'machine-learning', 'problem-solving'],
        daily_tasks: [
            'Design and train AI models',
            'Process and analyze large datasets',
            'Optimize algorithms for performance',
            'Deploy AI solutions to production',
            'Research latest AI techniques'
        ],
        salary_range: '$130,000-$250,000',
        growth_outlook: 'Very High Growth',
        education_required: "Bachelor's/Master's in Computer Science or AI"
    },
    'data-scientist': {
        name: 'Data Scientist',
        icon: '📊',
        color: '#0891B2',
        category: 'technology',
        description: 'Turn data into insights that drive business decisions',
        skills: ['statistics', 'programming', 'analysis', 'visualization'],
        daily_tasks: [
            'Analyze complex datasets',
            'Build predictive models',
            'Create data visualizations',
            'Present insights to stakeholders',
            'Design A/B tests and experiments'
        ],
        salary_range: '$120,000-$200,000',
        growth_outlook: 'Very High Growth',
        education_required: "Bachelor's/Master's in Statistics, Math, or CS"
    }
    // ... Continue with all careers
};

async function migrateCareer(careerCode, careerData, tier, gradeCategory, minGrade, maxGrade) {
    try {
        const { data, error } = await supabase
            .from('career_paths')
            .upsert({
                career_code: careerCode,
                career_name: careerData.name,
                career_category: careerData.category,
                description: careerData.description,

                // Visual
                icon: careerData.icon,
                color: careerData.color,

                // Details
                daily_tasks: careerData.daily_tasks,
                required_skills: careerData.skills,
                salary_range: careerData.salary_range,
                growth_outlook: careerData.growth_outlook,
                typical_education: careerData.education_required,

                // Access control
                access_tier: tier,
                min_grade_level: minGrade,
                max_grade_level: maxGrade,
                grade_category: gradeCategory,

                // Metadata
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'career_code'
            });

        if (error) {
            console.error(`Error migrating ${careerCode}:`, error);
            return false;
        }

        console.log(`✅ Migrated ${careerCode} as ${tier} career for ${gradeCategory}`);
        return true;
    } catch (err) {
        console.error(`Failed to migrate ${careerCode}:`, err);
        return false;
    }
}

async function runMigration() {
    console.log('🚀 Starting career migration to database...\n');

    let successCount = 0;
    let failCount = 0;

    // Elementary Select
    console.log('📚 Migrating Elementary Select careers...');
    for (const careerCode of CAREER_TIERS.ELEMENTARY_SELECT) {
        if (CAREER_DATA[careerCode]) {
            const success = await migrateCareer(
                careerCode,
                CAREER_DATA[careerCode],
                'select',
                'elementary',
                'K',
                '12'
            );
            success ? successCount++ : failCount++;
        }
    }

    // Elementary Premium
    console.log('\n✨ Migrating Elementary Premium careers...');
    for (const careerCode of CAREER_TIERS.ELEMENTARY_PREMIUM) {
        if (CAREER_DATA[careerCode]) {
            const success = await migrateCareer(
                careerCode,
                CAREER_DATA[careerCode],
                'premium',
                'elementary',
                'K',
                '12'
            );
            success ? successCount++ : failCount++;
        }
    }

    // Middle School Select
    console.log('\n📚 Migrating Middle School Select careers...');
    for (const careerCode of CAREER_TIERS.MIDDLE_SELECT) {
        if (CAREER_DATA[careerCode]) {
            const success = await migrateCareer(
                careerCode,
                CAREER_DATA[careerCode],
                'select',
                'middle',
                '6',
                '12'
            );
            success ? successCount++ : failCount++;
        }
    }

    // Middle School Premium
    console.log('\n✨ Migrating Middle School Premium careers...');
    for (const careerCode of CAREER_TIERS.MIDDLE_PREMIUM) {
        if (CAREER_DATA[careerCode]) {
            const success = await migrateCareer(
                careerCode,
                CAREER_DATA[careerCode],
                'premium',
                'middle',
                '6',
                '12'
            );
            success ? successCount++ : failCount++;
        }
    }

    // High School Select
    console.log('\n📚 Migrating High School Select careers...');
    for (const careerCode of CAREER_TIERS.HIGH_SELECT) {
        if (CAREER_DATA[careerCode]) {
            const success = await migrateCareer(
                careerCode,
                CAREER_DATA[careerCode],
                'select',
                'high',
                '9',
                '12'
            );
            success ? successCount++ : failCount++;
        }
    }

    // High School Premium
    console.log('\n✨ Migrating High School Premium careers...');
    for (const careerCode of CAREER_TIERS.HIGH_PREMIUM) {
        if (CAREER_DATA[careerCode]) {
            const success = await migrateCareer(
                careerCode,
                CAREER_DATA[careerCode],
                'premium',
                'high',
                '9',
                '12'
            );
            success ? successCount++ : failCount++;
        }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Complete!');
    console.log(`✅ Successfully migrated: ${successCount} careers`);
    console.log(`❌ Failed: ${failCount} careers`);
    console.log('='.repeat(50));

    // Verify counts
    const { data: selectCount } = await supabase
        .from('career_paths')
        .select('career_code', { count: 'exact' })
        .eq('access_tier', 'select');

    const { data: premiumCount } = await supabase
        .from('career_paths')
        .select('career_code', { count: 'exact' })
        .eq('access_tier', 'premium');

    console.log(`\n📈 Database Status:`);
    console.log(`   Select careers: ${selectCount?.length || 0}`);
    console.log(`   Premium careers: ${premiumCount?.length || 0}`);
    console.log(`   Total careers: ${(selectCount?.length || 0) + (premiumCount?.length || 0)}`);
}

// Run the migration
runMigration().catch(console.error);

export { runMigration, CAREER_TIERS, CAREER_DATA };