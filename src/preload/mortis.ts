import { ipcRenderer } from 'electron'

// 发布消息到主进程
const ipcSend = (type: string, data?: any) => {
  ipcRenderer.send('msg-trigger', {
    type,
    data
  })
}

const asyncIpcSend = async (type: string, data?: any) => {
  return await ipcRenderer.sendSync('msg-trigger', {
    type,
    data
  })
}

// 定义 mortis 的 openAPI
export const mortisAPI = {
  copyText(text: string) {
    console.log('mortis copyText', text)
    ipcSend('copyText', text)
  },

  // 添加获取剪贴板图片的方法
  async getClipboardImage() {
    return await asyncIpcSend('getClipboardImage')
  }
}
