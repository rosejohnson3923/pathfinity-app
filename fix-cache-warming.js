import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixCacheWarming() {
  console.log('Fixing cache_warming_config table...');

  // First, delete entries with null container_type
  const { error: deleteError } = await supabase
    .from('cache_warming_config')
    .delete()
    .is('container_type', null);

  if (deleteError) {
    console.error('Error deleting null entries:', deleteError);
  } else {
    console.log('✅ Deleted entries with null container_type');
  }

  // Update any empty container_type to 'learn'
  const { error: updateError } = await supabase
    .from('cache_warming_config')
    .update({ container_type: 'learn' })
    .or('container_type.is.null,container_type.eq.');

  if (updateError) {
    console.error('Error updating empty entries:', updateError);
  } else {
    console.log('✅ Updated empty container_type values to "learn"');
  }

  // Check the results
  const { data, error } = await supabase
    .from('cache_warming_config')
    .select('grade_level, subject, container_type, question_types')
    .eq('grade_level', '10')
    .order('subject');

  if (error) {
    console.error('Error fetching configs:', error);
  } else {
    console.log('\nGrade 10 cache warming configs:');
    data.forEach(config => {
      console.log(`  ${config.subject}: container_type=${config.container_type}, questions=${config.question_types?.length || 0}`);
    });
  }

  console.log('\n✅ Cache warming config fixed!');
}

fixCacheWarming();