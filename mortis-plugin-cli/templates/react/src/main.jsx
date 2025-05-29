import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'

// 创建 React 应用
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)

// 添加与原生版本相同的功能
document.addEventListener('DOMContentLoaded', () => {
  // React 应用已经渲染，可以直接添加事件监听
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
  }, 100) // 等待 React 组件渲染完成
})
