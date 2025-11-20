# Trashee 2.0

A green revolutionary mobile application for waste management and recycling.

## Deployment Instructions

### Option 1: Deploy via Vercel Dashboard

1. Go to [https://vercel.com](https://vercel.com) and sign in/up
2. Click "New Project"
3. Import your GitHub repository: `https://github.com/fazilkhan0786/Trashee_2.0.git`
4. Configure the project with these settings:
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `dist/spa`
   - Install Command: `npm install`

### Option 2: Deploy via Command Line

1. Install Vercel CLI (if not already installed):
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy the project:
   ```
   vercel --prod
   ```

### Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. The app will be available at `http://localhost:8080`

### Building for Production

```
npm run build
```

This will generate:
- Client-side files in `dist/spa/`
- Server files in `dist/server/`

### Mobile App

To build the mobile app:

1. Sync with Capacitor:
   ```
   npm run build:mobile
   ```

2. Open in respective IDEs:
   - iOS: `npm run mobile:open:ios`
   - Android: `npm run mobile:open:android`

### Environment Variables

Create a `.env` file in the root directory with your configuration:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```