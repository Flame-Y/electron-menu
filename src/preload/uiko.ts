import { ipcRenderer } from 'electron'

// 发布消息到主进程
const ipcSend = (type: string, data: any) => {
  ipcRenderer.send('msg-trigger', {
    type,
    data
  })
}

// 定义 uiko 的 openAPI
export const uikoAPI = {
  copyText(text: string) {
    console.log('uiko copyText', text)
    ipcSend('copyText', text)
  }
}
