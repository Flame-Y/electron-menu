import { createApp } from 'vue'
import App from './App.vue'

// 创建 Vue 应用
const app = createApp(App)
app.mount('#app')

// 添加与原生版本相同的功能
document.addEventListener('DOMContentLoaded', () => {
  // Vue 应用已经挂载，可以直接添加事件监听
  setTimeout(() => {
    const sendButton = document.getElementById('sendButton')
    if (sendButton) {
      sendButton.addEventListener('click', () => {
        window.electron.ipcRenderer.send('show-notification', {
          title: 'Hello Mortis',
          body: `Hello Mortis`
        })
      })
    }
  }, 100) // 等待 Vue 组件渲染完成
})
