
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building PAYDAY for Windows...');

try {
  // Build React app using Vite directly with production mode
  console.log('📦 Building web application...');
  execSync('npx vite build --mode production', { stdio: 'inherit' });
  
  // Ensure electron directory exists in dist
  if (!fs.existsSync(path.join(__dirname, 'dist/electron'))) {
    fs.mkdirSync(path.join(__dirname, 'dist/electron'), { recursive: true });
  }
  
  // Copy electron files
  console.log('📂 Copying Electron files...');
  fs.copyFileSync(
    path.join(__dirname, 'electron/main.js'),
    path.join(__dirname, 'dist/electron/main.js')
  );
  fs.copyFileSync(
    path.join(__dirname, 'electron/preload.js'),
    path.join(__dirname, 'dist/electron/preload.js')
  );
  
  // Read electron/package.json
  const electronPackageJson = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'electron/package.json'), 
    'utf-8'
  ));
  
  // Save a backup of the original package.json if it exists
  let originalPackageJson = null;
  if (fs.existsSync(path.join(__dirname, 'package.json'))) {
    originalPackageJson = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8');
    fs.writeFileSync(path.join(__dirname, 'package.json.bak'), originalPackageJson);
  }
  
  // Create temporary package.json in the project root with required fields
  const tempPackageJson = {
    name: electronPackageJson.name,
    version: electronPackageJson.version,
    author: electronPackageJson.author,
    main: './dist/electron/main.js',
    build: {
      extends: null, // Avoid extending other config files
      appId: "com.payday.app",
      productName: "PAYDAY",
      copyright: "Copyright © 2025 PAYDAY",
      directories: {
        output: "release",
        buildResources: "public"
      },
      files: [
        "dist/**/*",
        "electron/**/*"
      ],
      win: {
        target: ["nsis"],
        icon: "public/favicon.ico",
        artifactName: "${productName}-Setup-${version}.${ext}"
      },
      nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: "PAYDAY"
      }
    },
    devDependencies: {
      electron: electronPackageJson.devDependencies.electron
    }
  };
  
  // Write the temporary package.json
  fs.writeFileSync(
    path.join(__dirname, 'package.json'),
    JSON.stringify(tempPackageJson, null, 2)
  );
  
  // Copy package.json to dist for runtime
  fs.writeFileSync(
    path.join(__dirname, 'dist/electron/package.json'),
    JSON.stringify(electronPackageJson, null, 2)
  );
  
  // Run electron-builder
  console.log('🔨 Building Windows executable...');
  execSync('npx electron-builder build --win', { stdio: 'inherit' });
  
  // Restore original package.json
  if (originalPackageJson) {
    fs.writeFileSync(path.join(__dirname, 'package.json'), originalPackageJson);
    
    // Remove backup
    if (fs.existsSync(path.join(__dirname, 'package.json.bak'))) {
      fs.unlinkSync(path.join(__dirname, 'package.json.bak'));
    }
  }
  
  console.log('✅ Build completed! Check the "release" folder for your executable.');
} catch (error) {
  console.error('❌ Build failed:', error);
  
  // Try to restore original package.json in case of error
  if (fs.existsSync(path.join(__dirname, 'package.json.bak'))) {
    const backup = fs.readFileSync(path.join(__dirname, 'package.json.bak'), 'utf-8');
    fs.writeFileSync(path.join(__dirname, 'package.json'), backup);
    
    // Remove backup
    fs.unlinkSync(path.join(__dirname, 'package.json.bak'));
  }
  
  process.exit(1);
}
