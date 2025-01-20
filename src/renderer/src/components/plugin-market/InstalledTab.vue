<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { pluginConfig } from '../../../plugins/config'

declare const window: Window & typeof globalThis & { electron: { ipcRenderer: any } }

const installedPlugins = ref<any[]>([])
const activePluginId = ref<string | null>(null)

const fetchInstalledPlugins = async () => {
  try {
    // 获取已安装的 npm 插件和插件路径
    const result = await window.electron.ipcRenderer.invoke('list-installed-plugins')
    if (result.success) {
      // 合并本地配置的插件和已安装的 npm 插件
      installedPlugins.value = [
        ...pluginConfig,
        ...result.plugins.map((plugin) => ({
          id: plugin.name,
          name: plugin.name,
          description: plugin.description || '已安装的 NPM 插件',
          pluginType: 'ui',
          indexPath: plugin.indexPath,
          preload: plugin.preload
        }))
      ]
    }
  } catch (error) {
    console.error('获取插件列表失败:', error)
  }
}

const loadPlugin = async (pluginId: string) => {
  try {
    const result = await window.electron.ipcRenderer.invoke('load-plugin', pluginId)
    if (result.success) {
      activePluginId.value = pluginId
    } else {
      console.error('Failed to load plugin:', result.error)
    }
  } catch (error) {
    console.error('Error loading plugin:', error)
  }
}

const unloadPlugin = async (pluginId: string) => {
  try {
    const result = await window.electron.ipcRenderer.invoke('unload-plugin', pluginId)
    if (result.success) {
      activePluginId.value = null
    }
  } catch (error) {
    console.error('Error unloading plugin:', error)
  }
}

// 处理插件关闭事件
const handlePluginClosed = (_event: any, pluginId: string) => {
  if (activePluginId.value === pluginId) {
    activePluginId.value = null
  }
}

onMounted(() => {
  fetchInstalledPlugins()
  window.electron.ipcRenderer.on('plugin-closed', handlePluginClosed)
})

onBeforeUnmount(() => {
  window.electron.ipcRenderer.removeListener('plugin-closed', handlePluginClosed)
})
</script>

<template>
  <div>
    <h2 class="text-lg font-medium text-gray-900 mb-4">已安装插件</h2>
    <div class="space-y-4">
      <div v-for="plugin in installedPlugins" :key="plugin.id" class="bg-gray-50 p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">{{ plugin.name }}</h3>
            <p class="text-xs text-gray-500 mt-1">{{ plugin.description || '暂无描述' }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              class="px-3 py-1 text-xs text-white rounded transition-colors"
              :class="[
                activePluginId === plugin.id
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              ]"
              @click="
                activePluginId === plugin.id ? unloadPlugin(plugin.id) : loadPlugin(plugin.id)
              "
            >
              {{ activePluginId === plugin.id ? '停止' : '运行' }}
            </button>
          </div>
        </div>
      </div>
      <div v-if="!installedPlugins.length" class="text-center text-gray-500 py-8">
        暂无已安装插件
      </div>
    </div>
  </div>
</template>
