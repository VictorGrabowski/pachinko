import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 850,              // Game: 800 + 50px padding
    height: 1050,            // Game: 1000 + 50px padding
    minWidth: 800,
    minHeight: 1000,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true        // Can disable for production
    },
    backgroundColor: '#1a1a2e',  // Matches game background
    resizable: true,
    autoHideMenuBar: true,       // Clean UI
    icon: path.join(__dirname, '../build/icon.png')
  });

  // Load the Vite build
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

  // Uncomment for debugging
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
