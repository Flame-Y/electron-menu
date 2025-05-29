const { contextBridge, ipcRenderer } = require('electron')
const {
  getColorHexRGB,
  darwinGetScreenPermissionGranted,
  darwinRequestScreenPermissionPopup
} = require('electron-color-picker')
const os = require('os')

// 暴露必要的 API 到 window 对象
contextBridge.exposeInMainWorld('colorPicker', {
  getColorHexRGB,
  darwinGetScreenPermissionGranted,
  darwinRequestScreenPermissionPopup
})

contextBridge.exposeInMainWorld('os', {
  platform: os.platform()
})

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
