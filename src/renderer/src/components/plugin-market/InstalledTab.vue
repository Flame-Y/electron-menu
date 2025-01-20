<script setup lang="ts">
import { ref, onMounted } from 'vue'

declare const window: Window & typeof globalThis & { electron: { ipcRenderer: any } }

const installedPlugins = ref<any[]>([])

const fetchInstalledPlugins = async () => {
  try {
    installedPlugins.value = await window.electron.ipcRenderer.invoke('get-plugins')
  } catch (error) {
    console.error('获取插件列表失败:', error)
  }
}

const loadPlugin = async (pluginId: string) => {
  try {
    await window.electron.ipcRenderer.invoke('load-plugin', pluginId)
  } catch (error) {
    console.error('Error loading plugin:', error)
  }
}

onMounted(() => {
  fetchInstalledPlugins()
})
</script>

<template>
  <div>
    <h2 class="text-lg font-medium text-gray-900 mb-4">已安装插件</h2>
    <div class="space-y-4">
      <div
        v-for="plugin in installedPlugins"
        :key="plugin.id"
        class="bg-gray-50 p-4 rounded-lg relative group"
      >
        <!-- 插件信息 -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">{{ plugin.name }}</h3>
            <p class="text-xs text-gray-500 mt-1">{{ plugin.description || '暂无描述' }}</p>
          </div>
          <button
            class="px-3 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
            @click="loadPlugin(plugin.id)"
          >
            运行
          </button>
        </div>
      </div>
      <div v-if="!installedPlugins.length" class="text-center text-gray-500 py-8">
        暂无已安装插件
      </div>
    </div>
  </div>
</template>
