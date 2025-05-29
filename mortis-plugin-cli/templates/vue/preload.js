const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  sendToMortis: (data) => {
    ipcRenderer.send('plugin-message', data)
  },
  onMessage: (callback) => {
    ipcRenderer.on('message-from-mortis', callback)
  }
})
