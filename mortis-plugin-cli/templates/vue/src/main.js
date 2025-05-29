import { createApp } from 'vue'
import App from './App.vue'

// 创建 Vue 应用
const app = createApp(App)
app.mount('#app')

// 直接添加原生事件监听，保持与 vanilla 版本一致
document.addEventListener('DOMContentLoaded', () => {
  const sendButton = document.getElementById('sendButton')
  if (sendButton) {
    sendButton.addEventListener('click', () => {
      window.electron.ipcRenderer.send('show-notification', {
        title: 'Hello Mortis',
        body: `Hello Mortis`
      })
    })
  }
})
