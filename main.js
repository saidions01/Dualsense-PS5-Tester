const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const url = require('url')
const HID = require('node-hid')
const { DualSense } = require('dualsense.js')

// Check if we are in development mode
const isDev = process.env.NODE_ENV === 'development'

if (!isDev) {
  console.log = ()=> {}
}

let dualSenseConnected = false
let ds = null

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: !isDev, // Fullscreen mode in production
    autoHideMenuBar: true, // Hides the menu bar
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

  if (isDev) {
    mainWindow.webContents.openDevTools() // Open DevTools in development
  }
  // this was added to activate devtools you need to delete after finishing with it
 // mainWindow.webContents.openDevTools()
  ds = new DualSense({ persistCalibration: true }, HID)
  ds.on('connected', () => {
    dualSenseConnected = true
    mainWindow.webContents.send('ds-connected')
  })

  ds.on('disconnected', () => {
    dualSenseConnected = false
    mainWindow.webContents.send('ds-disconnected')
  })

  ds.on('state-change', (state) => {
    mainWindow.webContents.send('ds-state-change', state)
  })

  ipcMain.handle('get-dualsense', () => {
    if (ds) {
      return { state: ds.state, output: ds.output }
    } else {
      return { state: null, output: null }
    }
  })

  ipcMain.handle('send-output-report', async (event, outputData) => {
    try {
      console.log('Received outputData:')

      if (ds && ds.isConnected) {
        ds.output = { ...outputData }
        return true
      }

      console.error('No DualSense device connected.')
      return false
    } catch (error) {
      console.error('Error handling send-output-report:', error)
      return false
    }
  })

  setInterval(() => {
    if (!dualSenseConnected) {
      console.log('requestDevice ... ')
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
