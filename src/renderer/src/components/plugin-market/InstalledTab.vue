<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { pluginConfig } from '../../../plugins/config'
import { useConfirm } from '../../composables/useConfirm'
import { useLoading } from '../../composables/useLoading'

interface Plugin {
  id: string
  name: string
  description?: string
  pluginType?: string
  indexPath?: string
  preload?: string
  logo?: string
}

declare const window: Window & typeof globalThis & {
  electron: {
    ipcRenderer: {
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
      on: (channel: string, listener: (...args: unknown[]) => void) => void
      removeListener: (channel: string, listener: (...args: unknown[]) => void) => void
      send: (channel: string, ...args: unknown[]) => void
    }
  }
}

const installedPlugins = ref<Plugin[]>([])
const activePluginId = ref<string | null>(null)
const { confirm } = useConfirm()
const { showLoading, hideLoading } = useLoading()

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
          preload: plugin.preload,
          logo: JSON.parse(plugin.configPath)?.logo
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
const handlePluginClosed = (_event: unknown, pluginId: string) => {
  if (activePluginId.value === pluginId) {
    activePluginId.value = null
  }
}

const uninstallPlugin = async (plugin: Plugin) => {
  try {
    const confirmed = await confirm({
      title: '确认卸载插件',
      message: `确定要卸载插件 "${plugin.name}" 吗？卸载后需要重新安装才能使用。`,
      type: 'danger',
      confirmText: '卸载',
      cancelText: '取消'
    })

    if (!confirmed) return

    // 显示卸载loading
    showLoading({
      title: '正在卸载插件',
      message: `正在卸载 "${plugin.name}"，请稍候...`
    })

    const result = await window.electron.ipcRenderer.invoke('uninstall-plugin', plugin.id)

    hideLoading()

    if (result.success) {
      await fetchInstalledPlugins()
      window.electron.ipcRenderer.send('show-notification', {
        title: 'Mortis',
        body: `${plugin.name} 卸载成功`
      })
    }
  } catch (error) {
    hideLoading()
    console.error('卸载插件失败:', error)
  }
}

// 同时支持url和emoji
const setPluginLogo = (element: HTMLElement | null, logoUrl: string) => {
  if (!element) return

  // 如果没有logo，设置默认样式
  if (!logoUrl) {
    element.style.backgroundColor = '#e5e7eb'
    element.style.backgroundImage = `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJTNi40OCAyMiAxMiAyMlMyMiAxNy41MiAyMiAxMlMxNy41MiAyIDEyIDJaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMiA2QzE0LjIxIDYgMTYgNy43OSAxNiAxMEM2IDE2IDYgMTQuMjEgNiAxMkM2IDkuNzkgNy43OSA4IDEwIDhDMTAuNzQgOCAxMS4zOCA4LjM1IDExLjggOC44N0MxMS4xOCA5LjE2IDEwLjYyIDkuNTYgMTAuMTYgMTBIMTBDOC44OSAxMCA4IDEwLjg5IDggMTJTOC44OSAxNCAxMCAxNEg5Ljk5SDE0QzE1LjExIDE0IDE2IDEzLjExIDE2IDEyUzE1LjExIDEwIDE0IDEwWiIgZmlsbD0iIzY4NzI4MCIvPgo8L3N2Zz4KPC9zdmc+Cg==')`
    element.style.backgroundSize = 'cover'
    element.style.backgroundPosition = 'center'
    element.textContent = ''
    return
  }

  // 检查是否是 emoji（单个字符且不是 URL）
  const isEmoji = logoUrl.length <= 4 && !logoUrl.startsWith('http') && !logoUrl.startsWith('data:')

  if (isEmoji) {
    // 如果是 emoji，直接显示文本
    element.style.backgroundImage = 'none'
    element.style.backgroundColor = '#f3f4f6'
    element.style.display = 'flex'
    element.style.alignItems = 'center'
    element.style.justifyContent = 'center'
    element.style.fontSize = '20px'
    element.textContent = logoUrl
    return
  }

  // 如果是 URL，创建Image对象来预加载图片
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    element.style.backgroundImage = `url('${logoUrl}')`
    element.style.backgroundSize = 'cover'
    element.style.backgroundPosition = 'center'
    element.style.backgroundColor = 'transparent'
    element.textContent = ''
  }
  img.onerror = () => {
    // 图片加载失败时，设置默认样式
    element.style.backgroundColor = '#e5e7eb'
    element.style.backgroundImage = `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJTNi40OCAyMiAxMiAyMlMyMiAxNy41MiAyMiAxMlMxNy41MiAyIDEyIDJaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMiA2QzE0LjIxIDYgMTYgNy43OSAxNiAxMEM2IDE2IDYgMTQuMjEgNiAxMkM2IDkuNzkgNy43OSA4IDEwIDhDMTAuNzQgOCAxMS4zOCA4LjM1IDExLjggOC44N0MxMS4xOCA5LjE2IDEwLjYyIDkuNTYgMTAuMTYgMTBIMTBDOC44OSAxMCA4IDEwLjg5IDggMTJTOC44OSAxNCAxMCAxNEg5Ljk5SDE0QzE1LjExIDE0IDE2IDEzLjExIDE2IDEyUzE1LjExIDEwIDE0IDEwWiIgZmlsbD0iIzY4NzI4MCIvPgo8L3N2Zz4KPC9zdmc+Cg==')`
    element.style.backgroundSize = 'cover'
    element.style.backgroundPosition = 'center'
    element.textContent = ''
  }
  img.src = logoUrl
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
        <div v-for="plugin in installedPlugins" :key="plugin.id"
          class="bg-gray-50 p-4 rounded-lg relative group hover:bg-gray-100 transition-colors">
          <button
            class="absolute top-[-5px] right-[-5px] w-3 h-3 rounded-full bg-gray-400 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-xs z-10"
            title="卸载插件" @click.stop="uninstallPlugin(plugin)">
            ×
          </button>

          <div class="flex items-center">
            <div :ref="(el) => setPluginLogo(el as HTMLElement, plugin.logo || '')" class="w-10 h-10 rounded-full">
            </div>
            <div class="ml-3 flex-1">
              <h3 class="text-sm font-medium text-gray-900 text-left">{{ plugin.name }}</h3>
              <p class="text-xs text-gray-500 mt-1 text-left">
                {{ plugin.description || '暂无描述' }}
              </p>
            </div>
            <div class="flex items-center">
              <button class="px-3 py-1 text-xs text-white rounded transition-colors" :class="[
                activePluginId === plugin.id
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              ]" @click="
                activePluginId === plugin.id ? unloadPlugin(plugin.id) : loadPlugin(plugin.id)
                ">
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
