<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ContextMenu from './ContextMenu.vue'

interface App {
  name: string
  icon: string
  path: string
  desc: string
  type: string
  keyWords: string[]
  action: string
}

const searchResults = ref<App[]>([])
const currentScrollIndex = ref(0)

const contextMenu = ref({
  show: false,
  position: { x: 0, y: 0 },
  app: null as App | null
})

const displayedApps = computed(() => {
  return searchResults.value.slice(currentScrollIndex.value, currentScrollIndex.value + 9)
})

// 监听搜索结果变化，调整窗口大小
watch(
  displayedApps,
  (apps) => {
    const baseHeight = 80 // 搜索框和padding的基础高度
    const itemHeight = 60 // 每个结果项的高度
    const resultHeight = apps.length * itemHeight
    const totalHeight = apps.length ? baseHeight + resultHeight : baseHeight

    // 调用主进程调整窗口大小
    window.electron.ipcRenderer.invoke('resize-window', {
      width: 600,
      height: totalHeight
    })
  },
  { immediate: true }
)

// 处理搜索
const handleSearch = async (keyword: string) => {
  currentScrollIndex.value = 0 // 重置滚动位置
  if (keyword.trim()) {
    try {
      searchResults.value = await window.electron.ipcRenderer.invoke('search-apps', keyword)
    } catch (error) {
      console.error('搜索失败：', error)
      searchResults.value = []
    }
  } else {
    searchResults.value = []
  }
}

// 处理右键点击
const handleContextMenu = (event: MouseEvent, app: App) => {
  event.preventDefault()
  contextMenu.value = {
    show: true,
    position: {
      x: event.clientX,
      y: event.clientY
    },
    app
  }
}

// 关闭上下文菜单
const closeContextMenu = () => {
  contextMenu.value.show = false
}

// 处理菜单操作
const handleOpenApp = (app: App) => {
  console.log('openfile')

  window.electron.ipcRenderer.invoke('open-file', app.action)
}

const handleOpenFolder = (app: App) => {
  console.log('openfolder')
  window.electron.ipcRenderer.invoke('open-folder', app.desc)
}

const handleUninstall = (app: App) => {
  if (confirm(`确定要卸载 ${app.name} 吗？`)) {
    window.electron.ipcRenderer.invoke('remove-app', app.action)
  }
}

// 修改点击处理为直接运行程序
const handleAppClick = (app: App) => {
  handleOpenApp(app)
}

// 处理滚动事件
const handleScroll = (event: WheelEvent) => {
  event.preventDefault()
  const direction = event.deltaY > 0 ? 1 : -1
  const newIndex = currentScrollIndex.value + direction

  if (newIndex >= 0 && newIndex <= searchResults.value.length - 9) {
    currentScrollIndex.value = newIndex
  }
}

defineExpose({
  handleSearch
})
</script>

<template>
  <div
    v-if="searchResults.length"
    class="mt-2 border border-gray-100 rounded overflow-hidden bg-white shadow-lg no-drag"
    @wheel.prevent="handleScroll"
  >
    <div
      v-for="app in displayedApps"
      :key="app.path"
      class="flex items-center p-3 cursor-pointer hover:bg-gray-50 h-[60px]"
      @click="handleAppClick(app)"
      @contextmenu="handleContextMenu($event, app)"
    >
      <img :src="app.icon" :alt="app.name" class="w-8 h-8 mr-3" />
      <div class="flex-1">
        <div class="font-medium mb-1">{{ app.name }}</div>
        <div class="text-xs text-gray-500">{{ app.action }}</div>
      </div>
    </div>
  </div>

  <ContextMenu
    :show="contextMenu.show"
    :position="contextMenu.position"
    :app="contextMenu.app"
    @close="closeContextMenu"
    @open-app="handleOpenApp"
    @open-folder="handleOpenFolder"
    @uninstall="handleUninstall"
  />
</template>
