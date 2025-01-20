<script setup lang="ts">
import { ref } from 'vue'
import DeveloperTab from './plugin-market/DeveloperTab.vue'
import InstalledTab from './plugin-market/InstalledTab.vue'
import SystemTab from './plugin-market/SystemTab.vue'

const activeNav = ref('developer')

const navItems = [
  {
    id: 'developer',
    name: '开发者'
  },
  {
    id: 'installed',
    name: '已安装'
  },
  {
    id: 'system',
    name: '系统'
  }
]
</script>

<template>
  <div class="flex h-[480px] bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- 左侧导航栏 -->
    <div class="w-32 bg-gray-50 border-r border-gray-200">
      <nav class="py-4">
        <div
          v-for="item in navItems"
          :key="item.id"
          class="px-4 py-2 cursor-pointer text-sm transition-colors"
          :class="{
            'text-blue-600 bg-blue-50 font-medium': activeNav === item.id,
            'text-gray-600 hover:bg-gray-100': activeNav !== item.id
          }"
          @click="activeNav = item.id"
        >
          {{ item.name }}
        </div>
      </nav>
    </div>

    <!-- 右侧内容区 -->
    <div class="flex-1 p-6">
      <DeveloperTab v-if="activeNav === 'developer'" />
      <InstalledTab v-else-if="activeNav === 'installed'" />
      <SystemTab v-else-if="activeNav === 'system'" />
    </div>
  </div>
</template>
