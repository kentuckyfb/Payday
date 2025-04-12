
const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Keep a global reference of the window object to avoid garbage collection
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: isDev,
      sandbox: false,
      webSecurity: !isDev, // Disable web security in development for easier local testing
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    backgroundColor: '#121212',
    // Improved window settings for better user experience
    minWidth: 800,
    minHeight: 600,
    title: 'PAYDAY',
    autoHideMenuBar: !isDev, // Auto hide menu bar in production
  });

  // Load app
  const startUrl = isDev
    ? 'http://localhost:8080'  // Dev server URL
    : `file://${path.join(__dirname, '../dist/index.html')}`; // Production build
  
  mainWindow.loadURL(startUrl);

  // Show window when ready to avoid flickering
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open dev tools if in development mode
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when app is ready
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
