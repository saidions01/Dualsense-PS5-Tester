const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
const HID = require('node-hid')
const { DualSense } = require('dualsense.js')
const { connectBluetoothDevice, disconnectBluetoothDevice } = require('./bluetoothHandling')
const fs = require('fs');

// Define the log file path
const logFilePath = path.join(process.env.HOME, 'log', 'dualsensetester', 'info.log');

// Ensure the log directory exists
const logDirectory = path.dirname(logFilePath);
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

// Ensure the log file exists
if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, '');
}

const logFile = fs.createWriteStream(logFilePath, { flags: 'a' });

const originalLog = console.log;

console.log = function(...args) {
  const timestamp = new Date().toISOString();

  // Convert each argument to a string, handling objects with JSON.stringify
  const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg)).join(' ');

  // Write to the log file
  logFile.write(`[${timestamp}] ${message}\n`);

  // Output to the console as usual
  originalLog.apply(console, args);
};

// Check if we are in development mode
const isDev = process.env.NODE_ENV === 'development'

// if (!isDev) {
//   console.log = () => { }
// }

let dualSenseConnected = false
let ds = null

const createWindow = () => {
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
      console.log('---------------- MAIN ---------------------')
      console.log(ds.serialNumber)
      console.log('-------------------------------------------')
      return { serialNumber: ds.serialNumber, state: ds.state, output: ds.output }
    } else {
      return { serialNumber: null, state: null, output: null }
    }
  })

  ipcMain.handle('send-output-report', async (event, outputData) => {
    try {
      console.log('Received outputData')

      if (ds && ds.isConnected) {
        ds.output = { ...outputData }
        await ds.onRAFBound()
        return true
      }

      console.error('No DualSense device connected.')
      return false
    } catch (error) {
      console.error('Error handling send-output-report:', error)
      return false
    }
  })

  ipcMain.handle('connect-bluetooth', async (event, bt_SerialNumber) => {
    console.log('Starting Bluetooth setup...');
    await connectBluetoothDevice(bt_SerialNumber);
    return true
  })

  ipcMain.handle('disconnect-bluetooth', async (event, bt_SerialNumber) => {
    console.log('Disconencting Bluetooth setup...');
    await disconnectBluetoothDevice(bt_SerialNumber);
    return true
  })

  setInterval(() => {
    if (!dualSenseConnected) {
      console.log('requestDevice ... ')
      ds.requestDevice()
    }
  }, 1000)

  // Handle app close
  // app.on('before-quit', async () => {
  //   if (dualSenseDevice) {
  //     dualSenseDevice.close();
  //   }
  //   await disconnectAndRemoveDualSense(DUALSENSE_MAC_ADDRESS);
  // });
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
