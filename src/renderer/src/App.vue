<script setup lang="ts">
import { ref } from 'vue'
import AppSearch from './components/AppSearch.vue'
import PluginContainer from './components/PluginContainer.vue'
import SearchResultsList from './components/SearchResultsList.vue'

defineOptions({
  name: 'App'
})

const showPlugins = ref(false)
const searchResultsRef = ref()

const togglePlugins = async () => {
  const baseHeight = 80 // 搜索框基础高度
  const pluginHeight = 120 // 插件菜单高度
  const minHeight = baseHeight + pluginHeight

  // 获取当前窗口大小
  const currentSize = await window.electron.ipcRenderer.invoke('get-window-size')
  const currentHeight = currentSize.height

  console.log('togglePlugins', currentHeight)
  if (!showPlugins.value && currentHeight < minHeight) {
    window.electron.ipcRenderer.invoke('resize-window', {
      width: 600,
      height: minHeight
    })
  } else if (showPlugins.value && currentHeight === minHeight) {
    window.electron.ipcRenderer.invoke('resize-window', {
      width: 600,
      height: baseHeight
    })
  }
  showPlugins.value = !showPlugins.value
}

const handleSearch = (keyword: string) => {
  searchResultsRef.value?.handleSearch(keyword)
}
</script>

<template>
  <div class="w-full max-w-[600px] mx-auto relative px-4">
    <!-- 搜索框容器 -->
    <div class="flex items-center">
      <!-- 菜单图标 -->
      <div class="cursor-pointer p-1 rounded-full hover:bg-gray-100 no-drag" @click="togglePlugins">
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
      </div>
      <!-- 搜索组件 -->
      <AppSearch @search="handleSearch" />
    </div>
    <SearchResultsList ref="searchResultsRef" class="no-drag" />
    <!-- 插件菜单 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
      class="no-drag"
    >
      <PluginContainer
        v-if="showPlugins"
        class="absolute left-0 top-12 z-50 shadow-lg"
        @click="showPlugins = false"
      />
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
  background: transparent;
  height: 100%;
  overflow: hidden;
}

#app {
  background: transparent;
  height: 100%;
  display: flex;
  align-items: flex-start;
}
</style>
