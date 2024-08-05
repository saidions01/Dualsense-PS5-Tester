const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const url = require('url')
const HID = require('node-hid')
const { DualSense } = require('dualsense.js')

let dualSenseConnected = false
let ds = null

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

  // Mode DEV
  Menu.setApplicationMenu(null) // Hide the menu bar
  mainWindow.webContents.openDevTools() // Open DevTools

  // Register ipcMain handler only once
  ipcMain.handle('get-dualsense', () => {
    if (ds) {
      console.log('MAIN ---------------------- get--dualsense', ds.state)
      console.log('MAIN ---------------------- get--dualsense', ds.output)
      return { state: ds.state, output: ds.output }
    } else {
      return { state: null, output: null }
    }
  })


  ds = new DualSense({ persistCalibration: true }, HID)
  ds.on('connected', () => {
    console.log('MAIN ---------------------- connected')
    dualSenseConnected = true
    mainWindow.webContents.send('ds-connected')
  });

  ds.on('disconnected', () => {
    console.log('MAIN ---------------------- disconnected')
    dualSenseConnected = false
    mainWindow.webContents.send('ds-disconnected')
  })

  ds.on('state-change', (state) => {
    console.log('MAIN ---------------------- state-change')
    mainWindow.webContents.send('ds-state-change', state)
  });

  // Check for DualSense connection periodically
  setInterval(() => {
    if (!dualSenseConnected) {
      ds.requestDevice()
    }
  }, 1000)
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
