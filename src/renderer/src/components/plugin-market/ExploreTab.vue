<script setup lang="ts">
import { ref, computed } from 'vue'
import PluginCard from './PluginCard.vue'
import { plugins } from '../../../plugins/explor-plugin-list'

const categories = ['全部', '工具', '效率', '娱乐', '开发']
const activeCategory = ref('全部')

// 添加筛选计算属性
const filteredPlugins = computed(() => {
  if (activeCategory.value === '全部') {
    return plugins
  }
  return plugins.filter((plugin) => plugin.category === activeCategory.value)
})
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-medium text-slate-900 dark:text-slate-100">探索插件</h2>
      <div class="flex space-x-2">
        <button
          v-for="category in categories"
          :key="category"
          class="px-3 py-1 text-sm rounded-full transition-colors duration-200"
          :class="[
            activeCategory === category
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          ]"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
      <!-- 使用筛选后的插件列表 -->
      <div class="space-y-4">
        <PluginCard v-for="plugin in filteredPlugins" :key="plugin.id" :plugin="plugin" />
      </div>

      <!-- 添加空状态提示 -->
      <div
        v-if="filteredPlugins.length === 0"
        class="text-center py-8 text-slate-500 dark:text-slate-400"
      >
        当前分类暂无插件
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
  @apply bg-slate-200 dark:bg-slate-700;
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  @apply bg-slate-300 dark:bg-slate-600;
}
</style>
