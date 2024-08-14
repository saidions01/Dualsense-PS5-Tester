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

  ds = new DualSense({ persistCalibration: true }, HID)
  ds.on('connected', () => {
    console.log('MAIN ---------------------- connected')
    dualSenseConnected = true
    mainWindow.webContents.send('ds-connected')
    //startPolling() // Start polling when the device is connected
  });

  ds.on('disconnected', () => {
    console.log('MAIN ---------------------- disconnected')
    dualSenseConnected = false
    //stopPolling() // Stop polling when the device is disconnected
    mainWindow.webContents.send('ds-disconnected')
  })

  ds.on('state-change', (state) => {
    mainWindow.webContents.send('ds-state-change', state)
  });

  // Register ipcMain handler only once
  ipcMain.handle('get-dualsense', () => {
    if (ds) {
      console.log('MAIN ---------------------- get--dualsense')
      return { state: ds.state, output: ds.output }
    } else {
      return { state: null, output: null }
    }
  })

  // Handle output report from renderer process
  ipcMain.handle('send-output-report', async (event, outputData) => {
    try {
      console.log('MAIN ---------------------- Received outputData:')

      // Ensure that the DualSense device is connected
      if (ds && ds.isConnected) {
        // Send the output report to the DualSense controller
        ds.output = { ...outputData }
        return true
      }

      console.error('MAIN ---------------------- No DualSense device connected.')
      return false
    } catch (error) {
      console.error('MAIN ---------------------- Error handling send-output-report:', error)
      return false
    }
  })

  // Check for DualSense connection periodically
  setInterval(() => {
    if (true /*!dualSenseConnected*/) {
      console.log('MAIN --------------------- requestDevice')
      ds.requestDevice()
    }
  }, 1000)

//   function startPolling() {
//     if (ds) {
//       const poll = async () => {
//         if (dualSenseConnected) {
//           await ds.onRAFBound()
//           setImmediate(poll) // Continue polling
//         }
//       }
//       setImmediate(poll) // Start the polling loop
//     }
//   }
//
//   function stopPolling() {
//     dualSenseConnected = false
//     // No need to explicitly stop, the loop will exit due to the check
//   }
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
