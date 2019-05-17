const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const url = require("url");
const isDev = require("electron-is-dev");
const devMode = process.env.NODE_ENV === "development";

let mainWindow;

function createWindow() {
  const windowOptions = {
    width: 1080,
    minWidth: 768,
    height: 840,
    minHeight: 620,
    title: app.getName(),
    webPreferences: {
      nodeIntegration: true
    }
  };
  mainWindow = new BrowserWindow(windowOptions);
  mainWindow.loadURL("http://localhost:1074");
  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  console.log("here");
  if (mainWindow === null) {
    createWindow();
  }
});
