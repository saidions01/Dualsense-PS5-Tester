const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const url = require('url')
const { DualSense } = require('dualsense.js')
const HID = require('node-hid')

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


  const ds = new DualSense({ persistCalibration: true }, HID)

  ds.addEventListener('connected', () => {
    console.log("MAIN ---------------------- connected")
    mainWindow.webContents.send('ds-connected')
  })

  ds.addEventListener('disconnected', () => {
    console.log("MAIN ---------------------- disconnected")
    mainWindow.webContents.send('ds-disconnected')
  })

  ds.addEventListener('state-change', (state) => {
    console.log("MAIN ---------------------- state-change")
    mainWindow.webContents.send('ds-state-change', { detail: state })
  })

  ipcMain.handle('get-dualsense', () => {
    console.log("MAIN ---------------------- state-change", ds)
    return { state: ds.state, output: ds.output }
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
