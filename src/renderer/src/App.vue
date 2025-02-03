<script setup lang="ts">
import { ref } from 'vue'
import AppSearch from './components/AppSearch.vue'
import PluginMarket from './components/PluginMarket.vue'
import SearchResultsList from './components/SearchResultsList.vue'

defineOptions({
  name: 'App'
})

const showPlugins = ref(false)
const searchResultsRef = ref()

const togglePlugins = async () => {
  showPlugins.value = !showPlugins.value

  // 等待清除搜索结果完成
  await searchResultsRef.value?.handleSearch('')

  if (showPlugins.value) {
    // 固定高度为搜索框高度 + 插件市场高度
    await window.electron.ipcRenderer.invoke('resize-window', {
      width: 600,
      height: 560 // 80 + 480
    })
  } else {
    await window.electron.ipcRenderer.invoke('resize-window', {
      width: 600,
      height: 80
    })
  }
}

const handleSearch = (keyword: string) => {
  searchResultsRef.value?.handleSearch(keyword)
}
</script>
<!-- todo: 样式优化 -->
<template>
  <div class="w-full max-w-[600px] mx-auto relative">
    <!-- 搜索框容器 -->
    <div class="flex items-center px-4">
      <!-- 菜单图标 -->
      <div
        class="flex items-center cursor-pointer px-2 h-7 rounded-lg hover:bg-gray-100 no-drag"
        :class="{ 'bg-gray-100': showPlugins }"
        @click="togglePlugins"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <span
          class="ml-1 text-sm text-gray-500 transition-all duration-200 w-0 overflow-hidden whitespace-nowrap"
          :class="{ 'w-[4em]': showPlugins }"
          >插件市场</span
        >
      </div>
      <!-- 搜索组件 -->
      <AppSearch @search="handleSearch" />
    </div>
    <SearchResultsList ref="searchResultsRef" class="no-drag" />
    <!-- 插件市场 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
      class="no-drag"
    >
      <PluginMarket v-if="showPlugins" class="mt-4" />
    </Transition>
  </div>
</template>

<style>
html {
  margin: 0;
  padding: 0;
  height: 100%;
}

body {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: rgba(0, 0, 0, 0);
  overflow: hidden;
}

#app {
  height: 100%;
  display: flex;
  align-items: flex-start;
  text-align: center;
  background-color: #fff;
  border-radius: 24px;
}
</style>
