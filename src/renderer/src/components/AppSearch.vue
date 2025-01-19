<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface App {
  name: string
  icon: string
  path: string
  desc: string
  type: string
  keyWords: string[]
  action: string
}

// 搜索关键词
const keyword = ref('')
// 搜索结果
const searchResults = ref<App[]>([])

// 添加当前滚动索引
const currentScrollIndex = ref(0)

// 计算显示的应用列表
const displayedApps = computed(() => {
  return searchResults.value.slice(currentScrollIndex.value, currentScrollIndex.value + 9)
})

// 处理搜索
const searchApps = async () => {
  if (keyword.value.trim()) {
    try {
      searchResults.value = await window.electron.ipcRenderer.invoke('search-apps', keyword.value)
    } catch (error) {
      console.error('搜索失败：', error)
      searchResults.value = []
    }
  } else {
    searchResults.value = []
  }
}

// value改变时搜索
watch(keyword, () => {
  currentScrollIndex.value = 0 // 重置滚动位置
  searchApps()
})

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
</script>

<template>
  <div class="w-full max-w-[600px] mx-auto mt-[80px] no-drag">
    <div>
      <input
        v-model="keyword"
        type="text"
        placeholder="搜索应用..."
        class="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-300"
        @input="searchApps"
      />
    </div>

    <div
      v-if="searchResults.length"
      class="mt-3 border border-gray-100 rounded overflow-hidden"
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
  </div>
</template>
