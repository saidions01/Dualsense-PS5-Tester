const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  receive: (channel, func) => {
    const validChannels = ['ds-connected', 'ds-disconnected', 'ds-state-change']
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  },
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  getDualSense: async () => {
    const ds = await ipcRenderer.invoke('get-dualsense')
    return ds
  },
  sendOutputReport: async (outputData) => {
    const result = await ipcRenderer.invoke('send-output-report', outputData)
    if (result) {
      console.log('Output report sent successfully')
    } else {
      console.error('Failed to send output report')
    }
  }
})
