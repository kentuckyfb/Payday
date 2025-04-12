import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Check if project is in a nested folder structure
const currentDir = process.cwd();
console.log('Current directory:', currentDir);

// Check if important files exist
const requiredFiles = [
  'src-tauri/tauri.conf.json',
  'src-tauri/Cargo.toml',
  'src-tauri/src/main.rs',
  'build-tauri.js',
  'build-windows.bat'
];

console.log('\nChecking for required files:');
let allFilesExist = true;
for (const file of requiredFiles) {
  const exists = fs.existsSync(path.join(currentDir, file));
  console.log(`${file}: ${exists ? '✓ Found' : '✗ Missing'}`);
  if (!exists) {
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.log('\n⚠️ Some files are missing. You might be in the wrong directory.');
  console.log('Make sure to run the build command from the root of the project.');
  process.exit(1);
}

// Check for Tauri CLI
console.log('\nChecking Tauri CLI:');
try {
  const tauriVersion = execSync('npx @tauri-apps/cli --version', { encoding: 'utf8' });
  console.log(`Tauri CLI version: ${tauriVersion.trim()}`);
} catch (error) {
  console.log('❌ Tauri CLI not found or not installed correctly.');
  console.log('Installing @tauri-apps/cli...');
  try {
    execSync('npm install -D @tauri-apps/cli@latest', { stdio: 'inherit' });
    console.log('✓ Tauri CLI installed successfully');
  } catch (installError) {
    console.error('Failed to install Tauri CLI:', installError);
    process.exit(1);
  }
}

// Make sure package.json has the necessary scripts
try {
  const packageJsonPath = path.join(currentDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (!packageJson.scripts || !packageJson.scripts.build) {
      console.log('\n⚠️ Missing "build" script in package.json. Adding it...');
      if (!packageJson.scripts) packageJson.scripts = {};
      packageJson.scripts.build = "vite build";
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
      console.log('✓ Added build script to package.json');
    }
  }
} catch (error) {
  console.warn('Warning: Could not check or update package.json:', error.message);
}

console.log('\n✓ Environment check completed. You can continue with the build.');
