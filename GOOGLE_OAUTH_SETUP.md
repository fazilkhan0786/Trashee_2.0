# Google OAuth Setup Instructions

## Overview
This document provides instructions for setting up Google OAuth for the Trashee application.

## Configuration Steps

### 1. Google Cloud Console Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to "APIs & Services" > "Credentials"
4. Find or create an OAuth 2.0 Client ID
5. Add the following authorized redirect URI:
   ```
   https://ascqdjqxiuygvvmawyrx.supabase.co/auth/v1/callback
   ```
6. Make sure you're using this client ID:
   ```
   613643296116-bgmbk7hvkkirk6a9suo0nc06ehcoi2fe.apps.googleusercontent.com
   ```
7. Save your changes

### 2. Supabase Configuration

The following configurations have already been made in the codebase:

1. Updated `supabase/config.toml` with:
   - Google OAuth client ID
   - Redirect URI
   - Enabled Google authentication
   - Set `skip_nonce_check = true` for local development

2. Updated redirect URLs in `supabase/config.toml` to include:
   - `http://localhost:8080`
   - `http://127.0.0.1:8080`
   - `http://192.0.0.2:8080`

3. Updated client-side code in `Login.tsx` and `Signup.tsx` to use `${window.location.origin}` as the redirect URL

### 3. Supabase Dashboard Configuration

If you're using Supabase's hosted service:

1. Go to the [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Navigate to Authentication > Providers
4. Enable Google provider
5. Enter your Google OAuth client ID and secret
6. Save your changes

## Testing

After completing the configuration:

1. Start your application with `npm run dev`
2. Navigate to the login page
3. Click the "Sign in with Google" button
4. You should be redirected to Google's authentication page
5. After successful authentication, you should be redirected back to your application
6. The user type selection component should appear if the user doesn't have a user_type set

## Troubleshooting

If you encounter a "redirect_uri_mismatch" error:

1. Double-check that the redirect URI in Google Cloud Console exactly matches `https://ascqdjqxiuygvvmawyrx.supabase.co/auth/v1/callback`
2. Ensure that the Google OAuth client ID in your code matches the one in Google Cloud Console
3. Check that your Supabase project is properly configured with the correct redirect URIs
4. Try creating a new OAuth Client ID in Google Cloud Console with the same specifications

For local development issues:

1. Ensure Docker is running for local Supabase development
2. Run `npx supabase start` to start the local Supabase services