-- Quick check to see what columns skills_master_v2 has
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'skills_master_v2' 
ORDER BY ordinal_position;

-- Or just select one row to see all columns
SELECT * FROM skills_master_v2 LIMIT 1;