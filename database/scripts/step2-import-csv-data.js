/**
 * Step 2: Import CSV data to career_code1 field and validate
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CSV_FILE = 'Supabase Snippet Career Paths List.csv';

async function importCSVData() {
  console.log('\n📊 Step 2: Importing CSV data to career_code1\n');
  console.log('=' .repeat(50));

  try {
    // Step 1: Verify career_code1 field exists
    console.log('1️⃣ Verifying career_code1 field exists...');

    try {
      const { data } = await supabase
        .from('career_paths')
        .select('career_code1')
        .limit(1);
      console.log('   ✅ career_code1 field confirmed');
    } catch (error) {
      console.log('   ❌ career_code1 field missing!', error.message);
      return false;
    }

    // Step 2: Read CSV data
    console.log('\n2️⃣ Reading CSV file...');

    if (!fs.existsSync(CSV_FILE)) {
      console.log(`   ❌ CSV file not found: ${CSV_FILE}`);
      return false;
    }

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

    console.log(`   ✅ CSV loaded: ${csvData.length} careers found`);

    // Step 3: Check which IDs exist in database
    console.log('\n3️⃣ Checking ID matching with database...');

    const csvIds = csvData.map(c => c.id);
    const { data: dbCareers, error: dbError } = await supabase
      .from('career_paths')
      .select('id, career_name, career_code')
      .in('id', csvIds);

    if (dbError) throw dbError;

    const foundIds = dbCareers.map(c => c.id);
    const missingIds = csvIds.filter(id => !foundIds.includes(id));

    console.log(`   ✅ Found ${dbCareers.length} matching IDs in database`);
    console.log(`   ⚠️  ${missingIds.length} IDs from CSV not found in database`);

    if (missingIds.length > 0) {
      console.log('   📋 Sample missing IDs:');
      missingIds.slice(0, 3).forEach(id => {
        const csvCareer = csvData.find(c => c.id === id);
        console.log(`      ${csvCareer?.career_name} (${id})`);
      });
    }

    // Step 4: Import data in batches
    console.log('\n4️⃣ Importing career codes to career_code1...');

    const validCsvData = csvData.filter(csv => foundIds.includes(csv.id));
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    const batchSize = 20;
    for (let i = 0; i < validCsvData.length; i += batchSize) {
      const batch = validCsvData.slice(i, i + batchSize);

      console.log(`   📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validCsvData.length / batchSize)}...`);

      for (const csvCareer of batch) {
        try {
          const { error } = await supabase
            .from('career_paths')
            .update({ career_code1: csvCareer.career_code })
            .eq('id', csvCareer.id);

          if (error) throw error;

          successCount++;

        } catch (error) {
          errorCount++;
          const errorMsg = `${csvCareer.career_name}: ${error.message}`;
          errors.push(errorMsg);

          if (errorCount <= 5) {
            console.log(`   ❌ ${errorMsg}`);
          }
        }
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`   ✅ Successfully imported: ${successCount}`);
    console.log(`   ❌ Failed imports: ${errorCount}`);

    // Step 5: Validation
    console.log('\n5️⃣ Validating import results...');

    const { data: importedData } = await supabase
      .from('career_paths')
      .select('id, career_name, career_code, career_code1')
      .not('career_code1', 'is', null);

    console.log(`   📊 ${importedData?.length || 0} careers now have career_code1 values`);

    // Show sample of imported data
    console.log('\n📋 Sample imported data:');
    (importedData || []).slice(0, 5).forEach((career, i) => {
      const match = career.career_code === career.career_code1 ? '✅' : '🔄';
      console.log(`   ${i + 1}. ${career.career_name}`);
      console.log(`      current: ${career.career_code}`);
      console.log(`      new: ${career.career_code1} ${match}`);
    });

    // Check readiness for next step
    const needsUpdate = (importedData || []).filter(c => c.career_code !== c.career_code1).length;

    console.log(`\n📈 Import Summary:`);
    console.log(`   Total careers with career_code1: ${importedData?.length || 0}`);
    console.log(`   Careers needing update: ${needsUpdate}`);
    console.log(`   Already matching: ${(importedData?.length || 0) - needsUpdate}`);

    if (successCount > 0) {
      return true;
    } else {
      console.log('\n❌ No data was imported successfully');
      return false;
    }

  } catch (error) {
    console.error('Error during import:', error.message);
    return false;
  }
}

importCSVData()
  .then((success) => {
    if (success) {
      console.log('\n✅ Step 2 Complete: CSV data imported to career_code1!');
      console.log('\nNext: Run step3-copy-codes.js to copy career_code1 → career_code');
    } else {
      console.log('\n❌ Step 2 Failed: Please check errors above');
    }
    console.log('\n' + '=' .repeat(50) + '\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });