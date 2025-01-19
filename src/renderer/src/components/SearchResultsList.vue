<script setup lang="ts">
import { ref, computed, watch } from 'vue'

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

const handleAppClick = (app: App) => {
  window.electron.ipcRenderer.invoke('open-file', app.action)
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
    class="mt-2 border border-gray-100 rounded overflow-hidden bg-white shadow-lg"
    @wheel.prevent="handleScroll"
  >
    <div
      v-for="app in displayedApps"
      :key="app.path"
      class="flex items-center p-3 cursor-pointer hover:bg-gray-50 h-[60px]"
      @click="handleAppClick(app)"
    >
      <img :src="app.icon" :alt="app.name" class="w-8 h-8 mr-3" />
      <div class="flex-1">
        <div class="font-medium mb-1">{{ app.name }}</div>
        <div class="text-xs text-gray-500">{{ app.path }}</div>
      </div>
    </div>
  </div>
</template>
