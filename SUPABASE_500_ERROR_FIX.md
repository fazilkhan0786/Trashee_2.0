# Supabase 500 Error Fix Guide

## 🔍 **Problem Identified**

You're getting a **500 Internal Server Error** during signup with the message "Database error saving new user". This indicates that the database trigger `handle_new_user()` is failing when trying to create a profile after user signup.

## 🛠️ **Immediate Solutions**

### **Option 1: Quick Fix - Disable Trigger (Recommended for Testing)**

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the contents of `disable-trigger-temporarily.sql`**
4. **Execute the SQL**

This will:
- Remove the problematic trigger
- Ensure profiles table exists
- Disable RLS temporarily
- Allow signup to work immediately

### **Option 2: Fix the Trigger**

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the contents of `fix-database-trigger-error.sql`**
4. **Execute the SQL**

This will create a simpler, more robust trigger.

## 🧪 **Test After Fix**

After running either option:

1. **Try signing up** - should work without 500 errors
2. **Check console** - should see successful signup
3. **Test user type selection** - should work after login
4. **Verify profile creation** - check in database

## 🔧 **Alternative: Check Supabase Logs**

To get more specific error details:

1. **Go to Supabase Dashboard → Logs**
2. **Filter for Authentication logs**
3. **Look for errors around the time of signup**
4. **Check for specific database errors**

## 📊 **Common Causes of 500 Errors**

1. **Missing profiles table** - Trigger tries to insert into non-existent table
2. **Wrong column names** - Trigger references columns that don't exist
3. **RLS policies blocking** - Row Level Security prevents trigger from working
4. **Enum type mismatches** - Trigger tries to insert invalid enum values
5. **Function errors** - Syntax or logic errors in the trigger function

## 🚀 **Expected Results After Fix**

- ✅ **No 500 errors during signup**
- ✅ **Users can sign up successfully**
- ✅ **User type selection works after login**
- ✅ **Profiles are created properly**

## 🔄 **Re-enabling the Trigger Later**

Once everything works, you can create a proper trigger:

```sql
-- Create a working trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, user_type, updated_at)
  VALUES (NEW.id, NEW.email, 'consumer', NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail signup if profile creation fails
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🎯 **Success Indicators**

- ✅ Signup completes without 500 errors
- ✅ Users receive confirmation emails (if enabled)
- ✅ User type selection appears after login
- ✅ Profiles are created in the database
- ✅ Dashboard redirection works correctly

## 📝 **Next Steps**

1. **Run the disable trigger SQL** (quickest fix)
2. **Test signup functionality**
3. **Test user type selection**
4. **Create a proper trigger later** (optional)
5. **Re-enable RLS** (for production security)
