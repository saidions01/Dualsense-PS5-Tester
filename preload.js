// preload.js
window.addEventListener('DOMContentLoaded', () => {
  const { contextBridge, ipcRenderer } = require('electron')

  contextBridge.exposeInMainWorld('electron', {
    onDualSenseConnected: (callback) => ipcRenderer.on('dualsense-connected', callback),
    onDualSenseDisconnected: (callback) => ipcRenderer.on('dualsense-disconnected', callback)
  })
});
