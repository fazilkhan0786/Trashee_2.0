# User Profile Setup

## Overview
This document explains how user profiles are stored in the Supabase database, including role/status information.

## Database Structure

### Profiles Table
The `profiles` table stores additional information about users beyond what is stored in the Supabase Auth system:

- `id`: UUID primary key
- `user_id`: UUID foreign key to auth.users(id)
- `name`: User's name
- `phone`: User's phone number
- `user_type`: User type/role (0 for Consumer, 1 for Partner, 2 for Collector, 3 for Admin)
- `status`: User status (active, pending, blocked, etc.)
- `created_at`: Timestamp when the profile was created
- `updated_at`: Timestamp when the profile was last updated

## Implementation Details

### Automatic Profile Creation
Profiles are created automatically in two ways:

1. **During Signup**: When a user signs up, a profile is created in the `profiles` table with their user_type and status set to 'active'.

2. **Via Database Trigger**: A database trigger `on_auth_user_created` automatically creates a profile entry when a new user is created in the auth.users table.

### User Type Selection
If a user signs up without selecting a user type, or if they need to change their user type later, the `UserTypeSelection` component allows them to select a user type. This updates both:

- The user's metadata in the auth.users table
- The user's profile in the profiles table

## Applying the Migration

To apply the database migration and create the profiles table:

1. Make sure you have the Supabase CLI installed:
   ```
   npm install -g supabase
   ```

2. Apply the migration:
   ```
   supabase migration up
   ```

   Or if you're using a local Supabase instance:
   ```
   npx supabase migration up
   ```

## API Usage

The following functions are available in `client/lib/profileService.ts`:

### createUserProfile
Creates a new profile for a user.

```typescript
createUserProfile(userId: string, userData: any): Promise<{ success: boolean, data?: any, error?: string }>
```

### updateUserProfile
Updates an existing user profile.

```typescript
updateUserProfile(userId: string, profileData: any): Promise<{ success: boolean, data?: any, error?: string }>
```

### getUserProfile
Retrieves a user's profile.

```typescript
getUserProfile(userId: string): Promise<{ success: boolean, profile?: any, error?: string }>
```