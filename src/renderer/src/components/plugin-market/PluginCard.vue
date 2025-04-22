<script setup lang="ts">
interface Plugin {
  id: string
  name: string
  description: string
  icon: string
  author: string
  downloads: number
  category: string
}

defineProps<{
  plugin: Plugin
}>()
</script>

<template>
  <div
    class="backdrop-panel rounded-xl p-4 hover:ring-1 ring-slate-200 dark:ring-slate-800 transition-all duration-200"
  >
    <div class="flex items-center space-x-4">
      <div
        class="w-14 h-14 shrink-0 rounded-xl flex items-center justify-center text-2xl"
        :class="[
          'bg-gradient-to-br',
          'from-slate-100 to-slate-200',
          'dark:from-slate-800 dark:to-slate-900'
        ]"
      >
        {{ plugin.icon }}
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-slate-900 dark:text-slate-100">{{ plugin.name }}</h3>
          <button
            class="px-4 py-1.5 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity text-sm"
          >
            安装
          </button>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {{ plugin.description }}
        </p>
        <div class="flex items-center space-x-4 mt-2 text-sm">
          <span class="text-slate-500 dark:text-slate-400">{{ plugin.author }}</span>
          <span class="text-slate-400 dark:text-slate-500">{{ plugin.downloads }}次下载</span>
          <span class="text-slate-400 dark:text-slate-500">{{ plugin.category }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
