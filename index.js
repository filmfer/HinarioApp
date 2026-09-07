const { app, BrowserWindow, ipcMain, screen, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let videoDir = '';

function getConfigFile() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'config.json');
}

function loadConfig() {
  const configFile = getConfigFile();
  if (fs.existsSync(configFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
      if (data.videoDir) videoDir = data.videoDir;
    } catch (e) {
      console.error('Failed to load config', e);
    }
  }
}

function saveConfig() {
  const configFile = getConfigFile();
  try {
    const dir = path.dirname(configFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(configFile, JSON.stringify({ videoDir }));
  } catch (e) {
    console.error('Failed to save config', e);
  }
}

let playerWindow;
let aboutWindow;

function createAboutWindow() {
  if (aboutWindow) {
    aboutWindow.focus();
    return;
  }

  aboutWindow = new BrowserWindow({
    width: 300,
    height: 200,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    title: 'About',
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  aboutWindow.loadURL(`data:text/html,
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
          background: #1e1e1e;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
          padding: 20px;
        }
        h2 { font-size: 16px; font-weight: 500; margin-bottom: 12px; }
        p { font-size: 13px; color: #aaa; margin-bottom: 8px; }
        a { color: #007aff; text-decoration: none; font-size: 13px; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h2>Hinário IASD</h2>
      <p>Developer: J. Filipe Fernandes</p>
      <a href="mailto:filmfer@gmail.com">filmfer@gmail.com</a>
    </body>
    </html>
  `);

  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 360,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  loadConfig();
  createWindow();

  // Create application menu with About item
  const template = [
    {
      label: app.name,
      submenu: [
        {
          label: 'About Hinário IASD',
          click: createAboutWindow
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Select directory IPC
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    videoDir = result.filePaths[0];
    saveConfig();
    return videoDir;
  }
  return null;
});

// Get saved directory IPC
ipcMain.handle('get-saved-directory', () => {
  return videoDir;
});

// Search files IPC
ipcMain.handle('search-files', async (event, query) => {
  if (!videoDir) {
    return { error: 'Por favor, selecione primeiro a pasta onde estão os vídeos.' };
  }

  try {
    if (!fs.existsSync(videoDir)) {
      return { error: `Directory not found: ${videoDir}` };
    }

    const files = fs.readdirSync(videoDir);
    const mp4Files = files.filter(f => {
      // Must be an mp4 and MUST NOT be a macOS hidden/metadata file starting with ._ or .
      return f.toLowerCase().endsWith('.mp4') && !f.startsWith('._') && !f.startsWith('.');
    });
    
    // If no query, return first 10
    if (!query) {
      return { results: mp4Files.slice(0, 10).map(f => ({ name: f, path: path.join(videoDir, f) })) };
    }

    const lowerQuery = query.toLowerCase();
    const matches = mp4Files.filter(f => f.toLowerCase().includes(lowerQuery));
    
    return { results: matches.slice(0, 10).map(f => ({ name: f, path: path.join(videoDir, f) })) };
  } catch (error) {
    if (error.code === 'EPERM' || error.message.includes('operation not permitted')) {
      dialog.showErrorBox(
        'Permission Denied',
        `macOS blocked access to the external drive (${videoDir}).\n\nPlease grant Full Disk Access or Removable Volumes access to the app in System Settings > Privacy & Security.`
      );
      return { error: `Permission Denied: macOS blocked access. Please grant "Removable Volumes" access in System Settings.` };
    }
    return { error: error.message };
  }
});

// Get displays IPC
ipcMain.handle('get-displays', async () => {
  const displays = screen.getAllDisplays();
  return displays.map((display, index) => ({
    id: display.id,
    label: `Display ${index + 1} (${display.bounds.width}x${display.bounds.height})`,
    bounds: display.bounds
  }));
});

// Play video IPC
ipcMain.handle('play-video', async (event, videoPath, displayId) => {
  const displays = screen.getAllDisplays();
  const selectedDisplay = displays.find(d => d.id === displayId) || screen.getPrimaryDisplay();

  if (playerWindow) {
    playerWindow.close();
  }

  playerWindow = new BrowserWindow({
    x: selectedDisplay.bounds.x,
    y: selectedDisplay.bounds.y,
    width: selectedDisplay.bounds.width,
    height: selectedDisplay.bounds.height,
    fullscreen: true,
    frame: false,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Pass video path to player window via query parameter or direct load
  playerWindow.loadFile('player.html', { query: { video: videoPath } });

  playerWindow.on('closed', () => {
    playerWindow = null;
  });
});

// Close player IPC
ipcMain.on('close-player', () => {
  if (playerWindow) {
    playerWindow.close();
  }
});
