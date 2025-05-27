<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { pluginConfig } from '../../../plugins/config'
import { useConfirm } from '../../composables/useConfirm'

declare const window: Window & typeof globalThis & { electron: { ipcRenderer: any } }

const installedPlugins = ref<any[]>([])
const activePluginId = ref<string | null>(null)
const { confirm } = useConfirm()

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

const uninstallPlugin = async (plugin: any) => {
  try {
    const confirmed = await confirm({
      title: '确认卸载插件',
      message: `确定要卸载插件 "${plugin.name}" 吗？卸载后需要重新安装才能使用。`,
      type: 'danger',
      confirmText: '卸载',
      cancelText: '取消'
    })

    if (!confirmed) return

    const result = await window.electron.ipcRenderer.invoke('uninstall-plugin', plugin.id)
    if (result.success) {
      await fetchInstalledPlugins()
      window.electron.ipcRenderer.send('show-notification', {
        title: 'Mortis',
        body: `${plugin.name} 卸载成功`
      })
    }
  } catch (error) {
    console.error('卸载插件失败:', error)
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
  <div class="h-full flex flex-col">
    <h2 class="text-lg font-medium text-gray-900 mb-4">已安装插件</h2>
    <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
      <div class="space-y-4">
        <div
          v-for="plugin in installedPlugins"
          :key="plugin.id"
          class="bg-gray-50 p-4 rounded-lg relative group hover:bg-gray-100 transition-colors"
        >
          <button
            class="absolute top-[-5px] right-[-5px] w-3 h-3 rounded-full bg-gray-400 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-xs z-10"
            title="卸载插件"
            @click.stop="uninstallPlugin(plugin)"
          >
            ×
          </button>

          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-gray-900">{{ plugin.name }}</h3>
              <p class="text-xs text-gray-500 mt-1">{{ plugin.description || '暂无描述' }}</p>
            </div>
            <div class="flex items-center">
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
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}
</style>
