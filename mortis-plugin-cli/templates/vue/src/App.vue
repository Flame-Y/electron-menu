<template>
  <div class="app">
    <header class="app-header">
      <h1>🎉 Hello Mortis Plugin (Vue)</h1>
      <p>这是一个使用 Vue 3 开发的 Mortis 插件示例</p>
    </header>

    <main class="app-main">
      <div class="action-section">
        <button class="send-button" id="sendButton">发送消息到 Mortis</button>
      </div>

      <div class="info-section">
        <h2>开发信息</h2>
        <ul>
          <li>框架: Vue {{ vueVersion }}</li>
          <li>构建工具: Vite</li>
          <li>语言: JavaScript</li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup>
import { version as vueVersion } from 'vue'
</script>

<style scoped>
.app {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f0f0f0;
}

.app-header {
  text-align: center;
  margin-bottom: 30px;
}

.app-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.app-header p {
  color: #7f8c8d;
  font-size: 16px;
}

.app-main {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.action-section,
.info-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-section {
  text-align: center;
}

.send-button {
  background: #42b883;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.send-button:hover {
  background: #369870;
}

.info-section h2 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 18px;
}

.info-section ul {
  margin: 10px 0;
  padding-left: 20px;
}

.info-section li {
  margin: 8px 0;
  color: #7f8c8d;
}
</style>
