<script setup lang="ts">
import { ref } from 'vue'
import AppSearch from './components/AppSearch.vue'
import PluginMarket from './components/PluginMarket.vue'
import SearchResultsList from './components/SearchResultsList.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import LoadingDialog from './components/LoadingDialog.vue'
import { useConfirm } from './composables/useConfirm'
import { useLoading } from './composables/useLoading'

defineOptions({
  name: 'App'
})

const showPlugins = ref(false)
const searchResultsRef = ref()

// 使用确认组件
const { confirmState, handleConfirm, handleCancel } = useConfirm()

// 使用加载组件
const { loadingState } = useLoading()

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
        class="flex items-center cursor-pointer px-2 h-7 rounded-lg hover:bg-gray-100 no-drag transition-all duration-300"
        :class="{ 'bg-indigo-50/80': showPlugins }" @click="togglePlugins">
        <span class="text-2xl">🥒</span>

        <span class="ml-1 text-sm text-gray-500 transition-all duration-200 w-0 overflow-hidden whitespace-nowrap"
          :class="{ 'w-[4em]': showPlugins }">插件市场</span>
      </div>
      <!-- 搜索组件 -->
      <AppSearch @search="handleSearch" @toggle-plugins="togglePlugins" />
    </div>
    <SearchResultsList ref="searchResultsRef" class="no-drag" />
    <!-- 插件市场 -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0" class="no-drag">
      <PluginMarket v-if="showPlugins" class="mt-4" />
    </Transition>

    <!-- 确认对话框 -->
    <ConfirmDialog :show="confirmState.show" :title="confirmState.title" :message="confirmState.message"
      :type="confirmState.type" :confirm-text="confirmState.confirmText" :cancel-text="confirmState.cancelText"
      @confirm="handleConfirm" @cancel="handleCancel" />

    <!-- 加载对话框 -->
    <LoadingDialog :show="loadingState.show" :title="loadingState.title" :message="loadingState.message"
      :show-progress="loadingState.showProgress" :progress="loadingState.progress" />
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
  border-radius: 24px;
  background-image: url('./assets/background.jpg');
  background-color: #fff;
  background-size: 220%;
  background-position: -250px 0;
}
</style>
