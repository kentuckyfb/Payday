
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Indicate that we're running in Electron
  isElectron: true,
  
  // Get app version
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // OS-specific info
  getPlatformInfo: () => ({
    platform: process.platform,
    arch: process.arch
  }),
  
  // Basic window controls
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close')
});
