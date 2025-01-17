<template>
  <div class="w-full mt-[60px] bg-white no-drag">
    <div class="flex gap-2.5 p-2.5">
      <div
        v-for="plugin in plugins"
        :key="plugin.id"
        class="px-4 py-2 border border-gray-300 rounded cursor-pointer bg-pink-100"
        :class="{ 'bg-blue-50 border-blue-400': activePluginId === plugin.id }"
        @click="loadPlugin(plugin.id)"
      >
        {{ plugin.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface Plugin {
  id: string
  name: string
}

const plugins = ref<Plugin[]>([])
const activePluginId = ref<string | null>(null)

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

// 处理插件关闭事件
const handlePluginClosed = (pluginId: string) => {
  if (activePluginId.value === pluginId) {
    activePluginId.value = null
  }
}

onMounted(async () => {
  try {
    plugins.value = await window.electron.ipcRenderer.invoke('get-plugins')
    // 添加插件关闭事件监听
    window.electron.ipcRenderer.on('plugin-closed', handlePluginClosed)
  } catch (error) {
    console.error('Error fetching plugins:', error)
  }
})

// 清理事件监听
onBeforeUnmount(() => {
  window.electron.ipcRenderer.removeListener('plugin-closed', handlePluginClosed)
})
</script>
