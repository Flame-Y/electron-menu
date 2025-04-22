<script setup lang="ts">
import { ref } from 'vue'
import DeveloperTab from './plugin-market/DeveloperTab.vue'
import InstalledTab from './plugin-market/InstalledTab.vue'
import SystemTab from './plugin-market/SystemTab.vue'
import ExploreTab from './plugin-market/ExploreTab.vue'

const activeNav = ref('explore')

const navItems = [
  {
    id: 'explore',
    name: '探索',
    icon: 'Compass'
  },
  {
    id: 'installed',
    name: '已安装',
    icon: 'Download'
  },
  {
    id: 'developer',
    name: '开发者',
    icon: 'ChromeFilled'
  },
  {
    id: 'system',
    name: '系统',
    icon: 'Setting'
  },
  {
    id: 'workflow',
    name: '工作流',
    icon: 'Cpu'
  }
]
</script>

<template>
  <div class="flex h-[480px] shadow-lg overflow-hidden">
    <!-- 左侧导航栏 -->
    <div class="w-32 border-r border-gray-200">
      <nav class="py-4">
        <div
          v-for="item in navItems"
          :key="item.id"
          class="px-4 py-2 cursor-pointer text-sm transition-colors flex items-center"
          :class="{
            'text-blue-600 bg-blue-50 font-medium': activeNav === item.id,
            'text-gray-600 hover:bg-gray-100': activeNav !== item.id
          }"
          @click="activeNav = item.id"
        >
          <component :is="item.icon" class="mr-2 w-4 h-4 inline-block" />
          <p>
            {{ item.name }}
          </p>
        </div>
      </nav>
    </div>

    <!-- 右侧内容区 -->
    <div class="flex-1 p-6">
      <ExploreTab v-if="activeNav === 'explore'" />
      <DeveloperTab v-else-if="activeNav === 'developer'" />
      <InstalledTab v-else-if="activeNav === 'installed'" />
      <SystemTab v-else-if="activeNav === 'system'" />
    </div>
  </div>
</template>
