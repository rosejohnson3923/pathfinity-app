# CCM Industries Migration

## Error Encountered

```
ERROR: 23503: insert or update on table "ccm_company_rooms" violates foreign key constraint "ccm_company_rooms_industry_id_fkey"
DETAIL: Key (industry_id)=(c4488ebe-3bda-438b-846a-00a1e1fdf14c) is not present in table "ccm_industries".
```

This error occurs because existing `ccm_company_rooms` records have `industry_id` UUIDs pointing to `cc_industries`, but the foreign key constraint is trying to enforce that they point to `ccm_industries`.

## Problem

The `ccm_company_rooms` table had NULL or incorrect `industry_id` values because it was referencing `cc_industries` (Career Challenge industries), but:
1. The required industry codes didn't exist in `cc_industries`
2. Even when the constraint was updated, the old UUIDs from `cc_industries` don't exist in the new `ccm_industries` table

## Solution

Create a separate `ccm_industries` table specifically for CCM (Career Challenge Multiplayer) with all required industries, then update `ccm_company_rooms` to reference this new table.

## Migration Steps

Run these migrations **in order**:

### 1. Create CCM Industries Table
```bash
# File: 01_create_ccm_industries_table.sql
```

This migration:
- Creates the `ccm_industries` table
- Seeds 12 industries (FOOD, RETAIL, HEALTH, ENTERTAINMENT, etc.)
- Does NOT touch `ccm_company_rooms` yet (to avoid foreign key violations)

### 2. Update Company Industry IDs
```bash
# File: 02_update_ccm_company_rooms_industry_ids.sql
```

This migration:
- **Drops** old foreign key constraint to `cc_industries`
- Sets all `industry_id` to NULL temporarily
- Maps each company to its correct industry in `ccm_industries`
- Updates `industry_id` for all companies
- Handles elementary versions automatically
- **Adds** new foreign key constraint to `ccm_industries`
- Provides verification output showing distribution

**Important**: This order prevents foreign key constraint violations!

### 3. Verify Results

After running both migrations, you should see:
- All `ccm_company_rooms` have valid `industry_id` values
- Industries are properly distributed (displayed in output)
- No NULL `industry_id` values remain

## Code Updates

The following code files were also updated to reference `ccm_industries`:

### `/src/services/CCMService.ts`
- Changed `cc_industries:industry_id` to `ccm_industries:industry_id` in queries
- Added `icon` and `color_scheme` to industry selects
- Updated property references from `company.cc_industries` to `company.ccm_industries`

## Industries Seeded

| Code | Name | Icon | Usage |
|------|------|------|-------|
| FOOD | Food & Beverage | 🍽️ | Coffee shops, restaurants |
| RETAIL | Retail | 🛍️ | Bookstores, pet stores, fashion |
| HEALTH | Health & Wellness | 🏥 | Recreation centers |
| ENTERTAINMENT | Entertainment | 🎮 | Gaming arcades, studios |
| TRANSPORTATION | Transportation | 🚗 | Bike share services |
| TECHNOLOGY | Technology | 💻 | Apps, cloud services |
| FASHION | Fashion & Apparel | 👕 | Shoe stores, clothing |
| EDUCATION | Education | 📚 | Learning centers |
| HOSPITALITY | Hospitality | 🏨 | Hotels, resorts |
| SERVICES | Professional Services | 💼 | Consulting |
| CONSTRUCTION | Construction | 🏗️ | Construction firms |
| HEALTHCARE | Healthcare | 🏥 | Medical devices, services |

## Why Separate Tables?

- **CCM** (Career Challenge Multiplayer) and **CC** (Career Challenge) are different game modes
- Each has different industry requirements
- Separation allows independent content management
- Prevents conflicts and confusion
- Better database normalization

## Rollback (if needed)

If you need to rollback:

```sql
-- Drop new table
DROP TABLE IF EXISTS ccm_industries CASCADE;

-- Restore old foreign key
ALTER TABLE ccm_company_rooms
ADD CONSTRAINT ccm_company_rooms_industry_id_fkey
FOREIGN KEY (industry_id) REFERENCES cc_industries(id);
```

Note: This will restore NULL industry_id values unless you also add the missing industries to `cc_industries`.
