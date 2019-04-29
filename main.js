const path = require('path')
const {app, BrowserWindow} = require('electron')

app.on('ready', function(){
  const windowOptions = {
    width: 1080,
    minWidth: 768,
    height: 840,
    minHeight:620,
    title: app.getName(),
    webPreferences: {
      nodeIntegration: true
    }
  }
  let mainWindow = new BrowserWindow(windowOptions)
  mainWindow.loadURL(path.join('file://', __dirname, '/index.html'))
  mainWindow.on('closed', () => {
    mainWindow = null
  })
})