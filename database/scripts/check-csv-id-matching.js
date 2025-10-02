/**
 * Check if career codes were updated based on CSV ID matching
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CSV_FILE = 'Supabase Snippet Career Paths List.csv';

async function checkIDMatching() {
  console.log('\n🔍 Checking ID-based Career Code Updates\n');
  console.log('=' .repeat(60));

  try {
    // Read CSV data
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

    console.log(`📊 CSV contains ${csvData.length} careers`);

    // Get current database data
    const { data: dbCareers, error } = await supabase
      .from('career_paths')
      .select('id, career_name, career_code')
      .eq('is_active', true);

    if (error) throw error;

    console.log(`📊 Database contains ${dbCareers.length} active careers`);

    // Check ID matching
    let matchedIds = 0;
    let updatedCorrectly = 0;
    let notUpdated = 0;
    let missingInDb = 0;

    const detailedResults = [];

    csvData.forEach(csvCareer => {
      const dbCareer = dbCareers.find(db => db.id === csvCareer.id);

      if (!dbCareer) {
        missingInDb++;
        detailedResults.push({
          csv_name: csvCareer.career_name,
          csv_code: csvCareer.career_code,
          db_name: 'NOT FOUND',
          db_code: 'NOT FOUND',
          status: 'MISSING_IN_DB'
        });
      } else {
        matchedIds++;

        if (dbCareer.career_code === csvCareer.career_code) {
          updatedCorrectly++;
          detailedResults.push({
            csv_name: csvCareer.career_name,
            csv_code: csvCareer.career_code,
            db_name: dbCareer.career_name,
            db_code: dbCareer.career_code,
            status: 'UPDATED_CORRECTLY'
          });
        } else {
          notUpdated++;
          detailedResults.push({
            csv_name: csvCareer.career_name,
            csv_code: csvCareer.career_code,
            db_name: dbCareer.career_name,
            db_code: dbCareer.career_code,
            status: 'NOT_UPDATED'
          });
        }
      }
    });

    console.log('\n📈 ID Matching Results:');
    console.log(`   IDs found in database: ${matchedIds}`);
    console.log(`   Missing from database: ${missingInDb}`);
    console.log(`   Updated correctly: ${updatedCorrectly}`);
    console.log(`   Not updated: ${notUpdated}`);

    // Show sample of each category
    console.log('\n✅ Sample UPDATED CORRECTLY:');
    detailedResults
      .filter(r => r.status === 'UPDATED_CORRECTLY')
      .slice(0, 5)
      .forEach(r => {
        console.log(`   ${r.db_name}: ${r.db_code}`);
      });

    console.log('\n❌ Sample NOT UPDATED:');
    detailedResults
      .filter(r => r.status === 'NOT_UPDATED')
      .slice(0, 10)
      .forEach(r => {
        console.log(`   ${r.db_name}: ${r.db_code} (should be: ${r.csv_code})`);
      });

    if (missingInDb > 0) {
      console.log('\n🚫 Sample MISSING IN DATABASE:');
      detailedResults
        .filter(r => r.status === 'MISSING_IN_DB')
        .slice(0, 5)
        .forEach(r => {
          console.log(`   ${r.csv_name}: ${r.csv_code} (ID not found in database)`);
        });
    }

    // Check if career_code1 field still exists
    try {
      const { data: code1Check } = await supabase
        .from('career_paths')
        .select('career_code1')
        .limit(1);

      if (code1Check) {
        console.log('\n🔧 career_code1 field still exists - checking its contents...');

        const { data: code1Data } = await supabase
          .from('career_paths')
          .select('id, career_name, career_code, career_code1')
          .not('career_code1', 'is', null)
          .limit(10);

        if (code1Data && code1Data.length > 0) {
          console.log('\n📋 Sample career_code1 data:');
          code1Data.forEach(career => {
            console.log(`   ${career.career_name}: ${career.career_code} -> ${career.career_code1}`);
          });
        }
      }
    } catch (code1Error) {
      console.log('\n✅ career_code1 field has been dropped');
    }

    // Summary and recommendation
    console.log('\n🎯 Summary:');
    const updateRate = matchedIds > 0 ? Math.round((updatedCorrectly / matchedIds) * 100) : 0;
    console.log(`   Update success rate: ${updateRate}% (${updatedCorrectly}/${matchedIds})`);

    if (notUpdated > 0) {
      console.log('\n💡 Recommendation:');
      console.log(`   ${notUpdated} careers still need their career_code updated to match CSV`);
      console.log('   This suggests the career_code1 -> career_code copy step may not have completed fully');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkIDMatching()
  .then(() => {
    console.log('\n🎉 ID matching check complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });