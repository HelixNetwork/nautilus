import electron, { ipcMain as ipc, app, protocol, shell, Tray } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import electronSettings from 'electron-settings';
import { initMenu, contextMenu } from './native/menu.js';
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const url = require("url");
const isDev = require("electron-is-dev");
console.log("env", process.env.NODE_ENV);
const devMode = process.env.NODE_ENV === "development";


let mainWindow;

/**
 * Expose Garbage Collector flag for manual trigger after seed usage
 */
app.commandLine.appendSwitch('js-flags', '--expose-gc');

/**
 * Terminate application if Node remote debugging detected
 */
const argv = process.argv.join();
if (argv.includes('inspect') || argv.includes('remote') || typeof v8debug !== 'undefined') {
  app.quit();
}

const paths = {
  assets: path.resolve(devMode ? __dirname : app.getAppPath(), 'assets'),
  preload: path.resolve(devMode ? __dirname : app.getAppPath(), 'dist'),
};

let tray = null;

let windowSizeTimer = null;

/**
 * Define wallet windows
 */
const windows = {
  main: null,
  tray: null,
};

let windowState = {
  width: 1280,
  height: 720,
  x: null,
  y: null,
  maximized: false,
};

try {
  const windowStateData = electronSettings.get('window-state');
  if (windowStateData) {
    windowState = windowStateData;
  }
} catch (error) { }
console.log("moded", devMode);
function createWindow() {
  const windowOptions = {
    width: windowState.width,
    height: windowState.height,
    minWidth: 1280,
    minHeight: 720,
    x: windowState.x,
    y: windowState.y,
    backgroundColor: '#011327',
    resizable: false,
    fullscreen: false,
    webPreferences: {
      nodeIntegration: false,
      webviewTag: false,
      preload: path.resolve(paths.preload, devMode ? 'preloadDev.js' : 'preloadProd.js'),
    },
  };

  /**
     * Reinitate window maximize
     */
  if (windowState.maximized) {
    windows.main.maximize();
  }
  const url = process.env.NODE_ENV !== 'production' ? 'http://localhost:1074' : `file://${path.join(__dirname, '/index.html')}`;
  windows.main = new BrowserWindow(windowOptions);
  windows.main.setTitle(require('./package.json').productName);
  windows.main.loadURL(url);
  windows.main.on("closed", () => (windows.main = null));

  /**
     * Add right click context menu for input elements
     */
  windows.main.webContents.on('context-menu', (e, props) => {
    const { isEditable } = props;
    if (isEditable) {
      const InputMenu = contextMenu();
      InputMenu.popup(windows.main);
    }
  });
  windows.main.webContents.openDevTools();

  /**
   * Disallow external link navigation in wallet window
   * Open only whitelisted domain urls externally
   */
  windows.main.webContents.on('will-navigate', (e, targetURL) => {
    if (url.indexOf(targetURL) !== 0) {
      e.preventDefault();

      const termsAndConditionsLinks = [];
      const privacyPolicyLinks = [];
      const ledgerOnboarding = [];

      const externalWhitelist = [...privacyPolicyLinks, ...termsAndConditionsLinks, ...ledgerOnboarding];

      try {
        if (
          externalWhitelist.indexOf(
            URL.parse(targetURL)
              .host.replace('www.', '')
              .replace('mailto:', ''),
          ) > -1
        ) {
          shell.openExternal(targetURL);
        }
      } catch (error) { }
    }
  });
}

/**
 * Get Window instance helper
 * @param {string} windowName -  Target window name
 */
const getWindow = function (windowName) {
  return windows[windowName];
};
initMenu(app, getWindow);

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (windows.main === null) {
    createWindow();
  }
});
