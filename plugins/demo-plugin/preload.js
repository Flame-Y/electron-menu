const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, data) => {
      ipcRenderer.send(channel, data)
    },
    invoke: (channel, ...args) => {
      return ipcRenderer.invoke(channel, ...args)
    },
    on: (channel, func) => {
      ipcRenderer.on(channel, (_, ...args) => func(...args))
    },
    removeListener: (channel, func) => {
      ipcRenderer.removeListener(channel, func)
    }
  }
})
