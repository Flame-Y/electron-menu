const { contextBridge, ipcRenderer } = require('electron')

// 使用更具体的命名空间
contextBridge.exposeInMainWorld('mortisScreenshot', {
  capture: () => ipcRenderer.invoke('screenshot:capture')
})
