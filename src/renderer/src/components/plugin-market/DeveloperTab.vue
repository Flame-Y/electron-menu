<script setup lang="ts">
import { ref, onMounted } from 'vue'

declare const window: Window & typeof globalThis & { electron: { ipcRenderer: any } }

const pluginUrl = ref('')
const installStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const statusMessage = ref('')
const pluginPath = ref('')

// 获取插件安装路径
const getPluginPath = async () => {
  const path = await window.electron.ipcRenderer.invoke('get-plugin-path')
  pluginPath.value = path
}

onMounted(() => {
  getPluginPath()
})

const installPlugin = async () => {
  if (!pluginUrl.value.trim()) {
    statusMessage.value = '请输入插件地址'
    installStatus.value = 'error'
    return
  }

  try {
    installStatus.value = 'loading'
    const result = await window.electron.ipcRenderer.invoke('install-plugin', pluginUrl.value)

    if (result.success) {
      installStatus.value = 'success'
      statusMessage.value = '插件安装成功'
      pluginUrl.value = ''
    } else {
      installStatus.value = 'error'
      statusMessage.value = result.error || '插件安装失败'
    }
  } catch (error) {
    installStatus.value = 'error'
    statusMessage.value = '插件安装失败'
  }

  setTimeout(() => {
    statusMessage.value = ''
    installStatus.value = 'idle'
  }, 3000)
}

const openApiDocs = () => {
  window.electron.ipcRenderer.send('open-api-docs')
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-medium text-gray-900">开发者插件</h2>
      <button
        class="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        @click="openApiDocs"
      >
        打开 API 手册
      </button>
    </div>
    <div class="space-y-4">
      <!-- 插件安装路径（更新后的UI） -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-700 mb-2">插件安装位置</h3>
        <p class="text-xs text-gray-600">{{ pluginPath }}</p>
      </div>

      <!-- 现有的安装表单 -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-700 mb-2">安装插件</h3>
        <div class="flex items-center space-x-4">
          <input
            v-model="pluginUrl"
            type="text"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="请输入插件的 NPM 包名"
            :disabled="installStatus === 'loading'"
          />
          <button
            :disabled="installStatus === 'loading'"
            class="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors disabled:bg-gray-400"
            @click="installPlugin"
          >
            {{ installStatus === 'loading' ? '安装中...' : '安装' }}
          </button>
        </div>
        <div
          v-if="statusMessage"
          class="mt-2 text-sm"
          :class="{
            'text-green-600': installStatus === 'success',
            'text-red-600': installStatus === 'error'
          }"
        >
          {{ statusMessage }}
        </div>
        <p class="mt-2 text-xs text-gray-500">支持安装已发布到 NPM 的插件包</p>
      </div>
    </div>
  </div>
</template>
