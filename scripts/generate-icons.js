import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple SVG icon for Trashee
const createTrasheeIcon = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4ade80;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#16a34a;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#grad1)" stroke="#ffffff" stroke-width="2"/>
  
  <!-- Trash bin icon -->
  <g transform="translate(${size * 0.2}, ${size * 0.2}) scale(${size * 0.006})">
    <!-- Lid -->
    <rect x="20" y="30" width="60" height="8" rx="4" fill="#ffffff"/>
    <rect x="35" y="20" width="30" height="15" rx="3" fill="#ffffff"/>
    
    <!-- Body -->
    <path d="M25 40 L75 40 L72 90 L28 90 Z" fill="#ffffff"/>
    
    <!-- Lines -->
    <line x1="40" y1="50" x2="38" y2="80" stroke="#4ade80" stroke-width="3" stroke-linecap="round"/>
    <line x1="50" y1="50" x2="50" y2="80" stroke="#4ade80" stroke-width="3" stroke-linecap="round"/>
    <line x1="60" y1="50" x2="62" y2="80" stroke="#4ade80" stroke-width="3" stroke-linecap="round"/>
  </g>
  
  <!-- Recycling symbol -->
  <g transform="translate(${size * 0.65}, ${size * 0.65}) scale(${size * 0.003})">
    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="#ffffff"/>
  </g>
</svg>`;
};

// iOS icon sizes
const iosIconSizes = [
  { size: 20, name: 'icon-20.png' },
  { size: 29, name: 'icon-29.png' },
  { size: 40, name: 'icon-40.png' },
  { size: 58, name: 'icon-58.png' },
  { size: 60, name: 'icon-60.png' },
  { size: 80, name: 'icon-80.png' },
  { size: 87, name: 'icon-87.png' },
  { size: 120, name: 'icon-120.png' },
  { size: 180, name: 'icon-180.png' },
  { size: 1024, name: 'icon-1024.png' }
];

// Android icon sizes
const androidIconSizes = [
  { size: 48, density: 'mdpi' },
  { size: 72, density: 'hdpi' },
  { size: 96, density: 'xhdpi' },
  { size: 144, density: 'xxhdpi' },
  { size: 192, density: 'xxxhdpi' }
];

// Create directories if they don't exist
const createDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Generate iOS icons
const generateiOSIcons = () => {
  const iosIconDir = path.join(__dirname, '../ios/App/App/Assets.xcassets/AppIcon.appiconset');
  createDir(iosIconDir);
  
  iosIconSizes.forEach(({ size, name }) => {
    const svg = createTrasheeIcon(size);
    fs.writeFileSync(path.join(iosIconDir, name.replace('.png', '.svg')), svg);
  });
  
  // Create Contents.json for iOS
  const contentsJson = {
    "images": [
      { "idiom": "iphone", "scale": "2x", "size": "20x20", "filename": "icon-40.svg" },
      { "idiom": "iphone", "scale": "3x", "size": "20x20", "filename": "icon-60.svg" },
      { "idiom": "iphone", "scale": "1x", "size": "29x29", "filename": "icon-29.svg" },
      { "idiom": "iphone", "scale": "2x", "size": "29x29", "filename": "icon-58.svg" },
      { "idiom": "iphone", "scale": "3x", "size": "29x29", "filename": "icon-87.svg" },
      { "idiom": "iphone", "scale": "2x", "size": "40x40", "filename": "icon-80.svg" },
      { "idiom": "iphone", "scale": "3x", "size": "40x40", "filename": "icon-120.svg" },
      { "idiom": "iphone", "scale": "2x", "size": "60x60", "filename": "icon-120.svg" },
      { "idiom": "iphone", "scale": "3x", "size": "60x60", "filename": "icon-180.svg" },
      { "idiom": "ios-marketing", "scale": "1x", "size": "1024x1024", "filename": "icon-1024.svg" }
    ],
    "info": {
      "author": "xcode",
      "version": 1
    }
  };
  
  fs.writeFileSync(path.join(iosIconDir, 'Contents.json'), JSON.stringify(contentsJson, null, 2));
  console.log('✅ iOS icons generated');
};

// Generate Android icons
const generateAndroidIcons = () => {
  androidIconSizes.forEach(({ size, density }) => {
    const androidIconDir = path.join(__dirname, `../android/app/src/main/res/mipmap-${density}`);
    createDir(androidIconDir);
    
    const svg = createTrasheeIcon(size);
    fs.writeFileSync(path.join(androidIconDir, 'ic_launcher.svg'), svg);
    fs.writeFileSync(path.join(androidIconDir, 'ic_launcher_round.svg'), svg);
  });
  
  console.log('✅ Android icons generated');
};

// Generate splash screen
const generateSplashScreen = () => {
  const splashSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1125" height="2436" viewBox="0 0 1125 2436" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f0fdf4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#dcfce7;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1125" height="2436" fill="url(#bgGrad)"/>
  
  <!-- Logo -->
  <g transform="translate(462.5, 1018)">
    ${createTrasheeIcon(200).match(/<g.*?<\/g>/gs).join('')}
  </g>
  
  <!-- App Name -->
  <text x="562.5" y="1350" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#16a34a">Trashee</text>
  <text x="562.5" y="1400" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#22c55e">Green Revolutionary</text>
</svg>`;

  // iOS splash
  const iosSplashDir = path.join(__dirname, '../ios/App/App/Assets.xcassets/Splash.imageset');
  createDir(iosSplashDir);
  fs.writeFileSync(path.join(iosSplashDir, 'splash.svg'), splashSvg);
  
  // Android splash
  const androidSplashDir = path.join(__dirname, '../android/app/src/main/res/drawable');
  createDir(androidSplashDir);
  fs.writeFileSync(path.join(androidSplashDir, 'splash.svg'), splashSvg);
  
  console.log('✅ Splash screens generated');
};

// Run all generators
console.log('🎨 Generating app icons and splash screens...');
generateiOSIcons();
generateAndroidIcons();
generateSplashScreen();
console.log('✨ All assets generated successfully!');
console.log('\n📝 Next steps:');
console.log('1. Convert SVG icons to PNG using online tools or ImageMagick');
console.log('2. Run: npm run build:mobile');
console.log('3. Run: npm run mobile:open:ios (for iOS)');
console.log('4. Run: npm run mobile:open:android (for Android)');
