const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  screenshot: {
    capture: () => ipcRenderer.invoke('screenshot:capture')
  },
  ipcRenderer: {
    send: (channel, data) => {
      ipcRenderer.send(channel, data)
    },
    on: (channel, func) => {
      ipcRenderer.on(channel, (_, ...args) => func(...args))
    },
    removeListener: (channel, func) => {
      ipcRenderer.removeListener(channel, func)
    }
  }
})
