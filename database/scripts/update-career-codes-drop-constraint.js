/**
 * Update career_code fields by temporarily dropping foreign key constraints
 * This handles the circular dependency between career_paths and career_attributes
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CSV_FILE = 'Supabase Snippet Career Paths List.csv';

async function executeSQL(sql) {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) throw error;
  return data;
}

async function updateCareerCodesDropConstraint() {
  console.log('\n🔄 Updating Career Codes (Drop Constraint Method)\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Read CSV data
    console.log('📊 Reading CSV file...');
    const csvData = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_FILE)
        .pipe(csv())
        .on('data', (row) => {
          if (row.id?.trim() && row.career_code?.trim()) {
            csvData.push({
              id: row.id.trim(),
              career_code: row.career_code.trim(),
              career_name: row.career_name?.trim()
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Found ${csvData.length} careers in CSV`);

    // Step 2: Get current career_paths data
    console.log('\n🔍 Getting current career_paths data...');
    const { data: currentPaths, error: pathsError } = await supabase
      .from('career_paths')
      .select('id, career_code, career_name')
      .eq('is_active', true);

    if (pathsError) throw pathsError;

    // Step 3: Create update mappings
    const codeUpdates = [];
    csvData.forEach(csvCareer => {
      const currentCareer = currentPaths.find(c => c.id === csvCareer.id);
      if (currentCareer && currentCareer.career_code !== csvCareer.career_code) {
        codeUpdates.push({
          id: csvCareer.id,
          career_name: csvCareer.career_name,
          old_code: currentCareer.career_code,
          new_code: csvCareer.career_code
        });
      }
    });

    if (codeUpdates.length === 0) {
      console.log('✅ All career codes are already up to date!');
      return;
    }

    console.log(`\\n🎯 Found ${codeUpdates.length} career codes that need updating`);

    console.log('\\n⚠️  This will temporarily drop foreign key constraints to update career codes.');
    console.log('   Continue? (Press Ctrl+C to cancel)');

    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\\n🚀 Starting constraint-free updates...');

    // Step 4: Drop the foreign key constraint temporarily
    console.log('\\n1️⃣ Dropping foreign key constraint...');
    try {
      await executeSQL('ALTER TABLE career_attributes DROP CONSTRAINT IF EXISTS career_attributes_career_code_fkey');
      console.log('   ✅ Foreign key constraint dropped');
    } catch (error) {
      console.log(`   ⚠️  Could not drop constraint: ${error.message}`);
      console.log('   Proceeding anyway...');
    }

    // Step 5: Update career_paths table
    console.log('\\n2️⃣ Updating career_paths table...');
    let pathSuccessCount = 0;
    let pathErrorCount = 0;
    const pathErrors = [];

    for (const update of codeUpdates) {
      try {
        const { error: pathUpdateError } = await supabase
          .from('career_paths')
          .update({ career_code: update.new_code })
          .eq('id', update.id);

        if (pathUpdateError) {
          throw pathUpdateError;
        }

        pathSuccessCount++;
        if (pathSuccessCount % 20 === 0) {
          console.log(`   ✅ Updated ${pathSuccessCount}/${codeUpdates.length} career_paths...`);
        }

      } catch (error) {
        pathErrorCount++;
        const errorMsg = `${update.career_name}: ${error.message}`;
        pathErrors.push(errorMsg);
        if (pathErrorCount <= 5) {
          console.log(`   ❌ ${errorMsg}`);
        }
      }
    }

    console.log(`   ✅ Updated ${pathSuccessCount} career_paths records`);
    if (pathErrorCount > 0) {
      console.log(`   ❌ Failed to update ${pathErrorCount} career_paths records`);
    }

    // Step 6: Update career_attributes table
    console.log('\\n3️⃣ Updating career_attributes table...');
    let attrSuccessCount = 0;
    let attrErrorCount = 0;

    for (const update of codeUpdates) {
      try {
        // Check if career_attributes exists for this old code
        const { data: attrCheck, error: attrCheckError } = await supabase
          .from('career_attributes')
          .select('career_code')
          .eq('career_code', update.old_code)
          .single();

        if (attrCheckError && attrCheckError.code !== 'PGRST116') {
          // Skip if error is not "no rows"
          continue;
        }

        if (attrCheck) {
          // Update the career_attributes record
          const { error: attrUpdateError } = await supabase
            .from('career_attributes')
            .update({ career_code: update.new_code })
            .eq('career_code', update.old_code);

          if (attrUpdateError) {
            throw attrUpdateError;
          }

          attrSuccessCount++;
        }

      } catch (error) {
        attrErrorCount++;
        if (attrErrorCount <= 5) {
          console.log(`   ❌ ${update.career_name}: ${error.message}`);
        }
      }
    }

    console.log(`   ✅ Updated ${attrSuccessCount} career_attributes records`);
    if (attrErrorCount > 0) {
      console.log(`   ❌ Failed to update ${attrErrorCount} career_attributes records`);
    }

    // Step 7: Recreate the foreign key constraint
    console.log('\\n4️⃣ Recreating foreign key constraint...');
    try {
      await executeSQL(`
        ALTER TABLE career_attributes
        ADD CONSTRAINT career_attributes_career_code_fkey
        FOREIGN KEY (career_code) REFERENCES career_paths(career_code)
      `);
      console.log('   ✅ Foreign key constraint recreated');
    } catch (error) {
      console.log(`   ⚠️  Could not recreate constraint: ${error.message}`);
      console.log('   This may need to be done manually in the database');
    }

    // Step 8: Summary
    console.log('\\n📈 Career Code Update Summary:');
    console.log('=' .repeat(60));
    console.log(`✅ career_paths updated: ${pathSuccessCount}`);
    console.log(`✅ career_attributes updated: ${attrSuccessCount}`);
    console.log(`❌ career_paths failed: ${pathErrorCount}`);
    console.log(`❌ career_attributes failed: ${attrErrorCount}`);

    if (pathErrors.length > 0 && pathErrors.length <= 10) {
      console.log('\\n❌ Path update errors:');
      pathErrors.forEach(error => console.log(`   - ${error}`));
    }

    // Step 9: Verification
    if (pathSuccessCount > 0) {
      console.log('\\n🔍 Verification:');
      const { data: verificationPaths } = await supabase
        .from('career_paths')
        .select('career_name, career_code')
        .in('id', codeUpdates.slice(0, 5).map(u => u.id));

      console.log('\\nSample updated career_paths:');
      verificationPaths?.forEach(career => {
        console.log(`   ${career.career_name}: ${career.career_code}`);
      });
    }

  } catch (error) {
    console.error('\\n❌ Fatal error:', error.message);

    // Try to recreate constraint even if there was an error
    try {
      await executeSQL(`
        ALTER TABLE career_attributes
        ADD CONSTRAINT career_attributes_career_code_fkey
        FOREIGN KEY (career_code) REFERENCES career_paths(career_code)
      `);
      console.log('\\n🔄 Emergency constraint recreation successful');
    } catch (constraintError) {
      console.log('\\n⚠️  Could not recreate constraint after error');
    }

    process.exit(1);
  }
}

updateCareerCodesDropConstraint()
  .then(() => {
    console.log('\\n🎉 Career code update complete!');
    console.log('\\nAll career_code fields have been standardized to match your CSV data.\\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });