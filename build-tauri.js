
import { execSync } from 'child_process';

console.log('🚀 Building PAYDAY with Tauri for Windows...');

try {
  // Install the Tauri CLI if not already installed
  console.log('📦 Checking Tauri CLI...');
  try {
    execSync('npx @tauri-apps/cli@1.5.4 --version', { stdio: 'pipe' });
  } catch (e) {
    console.log('Installing @tauri-apps/cli@1.5.4...');
    execSync('npm install -D @tauri-apps/cli@1.5.4', { stdio: 'inherit' });
  }
  
  // Build the app using Tauri
  console.log('📦 Building desktop application...');
  execSync('npx @tauri-apps/cli@1.5.4 build', { stdio: 'inherit' });
  
  console.log('✅ Build completed! Check the "src-tauri/target/release/bundle" folder for your executable.');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
