# Apply Database Migration Instructions

## Issue
The error "invalid input value for enum user_role: 'CONSUMER'" indicates that the `user_role` enum doesn't exist or doesn't have the expected values in your database.

## Solution
You need to apply the migration that creates the correct enum and table schema.

## Step 1: Apply the Migration

### Option A: Using Supabase CLI (Recommended)
```bash
# Navigate to your project directory
cd "/Users/fazilkhanmalek/Downloads/Project/Trashee copy"

# Apply the migration
supabase db push

# Or apply specific migration
supabase migration up
```

### Option B: Manual SQL Execution
If you don't have Supabase CLI, you can run the migration SQL manually:

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the contents of**: `supabase/migrations/20250115000006_fix_profiles_table_schema.sql`
4. **Execute the SQL**

### Option C: Using Supabase Dashboard
1. **Go to Supabase Dashboard → Database → Migrations**
2. **Click "Apply" on the migration file**

## Step 2: Verify Migration Applied

After applying the migration, run this test:
```bash
node check-enum-values.js
```

## Step 3: Alternative Quick Fix

If you can't apply the migration right now, you can temporarily use a different approach:

### Modify UserTypeSelection.tsx
Instead of using enum values, use simple strings and let the database handle the conversion.

## Expected Result
After applying the migration, your database should have:
- `user_role` enum with values: `'CONSUMER', 'PARTNER', 'COLLECTOR'`
- `profiles` table with correct schema
- Proper database trigger for profile creation

## Troubleshooting

### If migration fails:
1. Check if you have the correct permissions
2. Ensure no existing data conflicts
3. Try dropping the profiles table manually first

### If enum values still don't work:
1. Check the actual enum values in your database
2. Use the `check-enum-values.js` script to test different values
3. Update the code to use the correct enum values
