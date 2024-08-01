const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const url = require('url')
const { startDetection } = require('./dualsense-detection')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false
    }
  })

  mainWindow.loadURL(
    url.format({
      pathname: path.join(app.getAppPath(), 'dist', 'index.html'),
      protocol: 'file:',
      slashes: true
    })
  )

  // Hide the menu bar
  Menu.setApplicationMenu(null)

  mainWindow.webContents.openDevTools() // Open DevTools

  // Start DualSense detection
  startDetection(1000, (connected, dualsense) => {
    console.log("=================");
    console.log("= connected", connected);
    console.log("= dualsense", dualsense);

    if (connected) {
      mainWindow.webContents.send('dualsense-connected', dualsense)
    } else {
      mainWindow.webContents.send('dualsense-disconnected')
    }
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
