import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import started from 'electron-squirrel-startup';
import { findLowestGweiTransaction } from './gasTracker.js';
import { AppConfig, defaultConfig, GasTrackerData } from './config'; // Consolidated imports

const CONFIG_FILE_NAME = 'config.json';

const getDefaultConfig = (): AppConfig => ({
  ...defaultConfig, // Use values from src/config.ts
});

const getConfigPath = (): string => {
  return path.join(app.getPath('userData'), CONFIG_FILE_NAME);
};

const readConfig = (): AppConfig => {
  const configPath = getConfigPath();
  try {
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      return { ...getDefaultConfig(), ...JSON.parse(configContent) };
    }
  } catch (error) {
    console.error('Error reading config file:', error);
  }
  return getDefaultConfig();
};

const writeConfig = (config: AppConfig): void => {
  const configPath = getConfigPath();
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing config file:', error);
  }
};

if (started) {
  app.quit();
}

const userDataPath = app.getPath('userData');
const windowStateFile = path.join(userDataPath, 'window-state.json');

let windowState: { width: number; height: number; x: number | null; y: number | null; };

try {
  windowState = JSON.parse(fs.readFileSync(windowStateFile, 'utf-8'));
} catch (e) {
  windowState = { width: 800, height: 600, x: null, y: null };
}


const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 820, // Default width
    height: 580, // Default height
    x: windowState.x, // Use saved x
    y: windowState.y, // Use saved y
    frame: false,
    transparent: true,
    show: false,
    hasShadow: false,
    alwaysOnTop: false,
    resizable: false,   // New: Make window not resizable
    maximizable: false, // New: Disable maximize button
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  let saveStateTimeout: NodeJS.Timeout;
  const saveState = () => {
    clearTimeout(saveStateTimeout);
    saveStateTimeout = setTimeout(() => {
      const bounds = mainWindow.getBounds();
      // Only save x and y
      fs.writeFileSync(windowStateFile, JSON.stringify({ x: bounds.x, y: bounds.y }));
    }, 5000); 
  };

  mainWindow.on('move', saveState);


  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  //mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

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

ipcMain.handle('get-window-size', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    return window.getSize();
  }
  return [0, 0];
});

ipcMain.handle('get-window-content-size', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    return window.getContentSize();
  }
  return [0, 0];
});

ipcMain.on('minimize-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    window.minimize();
  }
});

ipcMain.on('maximize-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }
});

ipcMain.on('close-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    window.close();
  }
});

ipcMain.on('resize-window', (event, options: { width: number, height: number }) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    const newWidth = Math.round(options.width);
    const newHeight = Math.round(options.height);
    if (newWidth > 0 && newHeight > 0) { // newHeight is already content height
      window.setContentSize(newWidth, newHeight);
    }
  }
});

// Add IPC handlers for gas tracker functions
ipcMain.handle('find-lowest-gas-fee', async (): Promise<GasTrackerData> => { // Changed return type
  console.log('Main process: Finding lowest gas fee...');
  const lowestFeeResult = await findLowestGweiTransaction();
  return lowestFeeResult; // Return the structured data
});

// Add IPC handlers for config management
ipcMain.handle('get-config', () => {
  return readConfig();
});

ipcMain.handle('set-api-key', (event, newApiKey: string) => {
  const config = readConfig();
  config.apiKey = newApiKey;
  writeConfig(config);
  return true;
});

ipcMain.handle('set-contract-address', (event, newContractAddress: string) => {
  const config = readConfig();
  config.contractAddress = newContractAddress;
  writeConfig(config);
  return true;
});

// New: IPC handler for setting transactions per page
ipcMain.handle('set-transactions-per-page', (event, newTransactionsPerPage: number) => {
  const config = readConfig();
  config.transactionsPerPage = newTransactionsPerPage;
  writeConfig(config);
  return true;
});

// New: IPC handler for setting max transactions to scan
ipcMain.handle('set-max-transactions-to-scan', (event, newMaxTransactionsToScan: number) => {
  const config = readConfig();
  config.maxTransactionsToScan = newMaxTransactionsToScan;
  writeConfig(config);
  return true;
});
