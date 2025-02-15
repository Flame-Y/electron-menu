<template>
  <div
    v-if="show"
    ref="menuRef"
    id="context-menu"
    class="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48 z-50"
    :style="{
      left: `${adjustedPosition.x}px`,
      top: `${adjustedPosition.y}px`
    }"
  >
    <div
      class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
      @click="handleMenuClick('open')"
    >
      <i class="ri-play-line mr-2"></i>
      <span>运行程序</span>
    </div>
    <div
      class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
      @click="handleMenuClick('folder')"
    >
      <i class="ri-folder-line mr-2"></i>
      <span>打开所在文件夹</span>
    </div>
    <div class="border-t border-gray-200 my-1"></div>
    <div
      class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center text-red-500"
      @click="handleMenuClick('uninstall')"
    >
      <i class="ri-delete-bin-line mr-2"></i>
      <span>卸载程序</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

interface MenuPosition {
  x: number
  y: number
}

interface App {
  name: string
  icon: string
  path: string
  desc: string
  type: string
  keyWords: string[]
  action: string
}

const props = defineProps<{
  show: boolean
  position: MenuPosition
  app: App
}>()

const emit = defineEmits(['close', 'openApp', 'openFolder', 'uninstall'])

const menuRef = ref<HTMLElement | null>(null)

// 计算菜单位置，确保在窗口内
const adjustedPosition = computed(() => {
  if (!menuRef.value) return props.position

  const menu = menuRef.value
  const menuRect = menu.getBoundingClientRect()
  const windowHeight = window.innerHeight
  const windowWidth = window.innerWidth

  let { x, y } = props.position

  // 检查右边界
  if (x + menuRect.width > windowWidth) {
    x = windowWidth - menuRect.width - 5
  }

  // 检查下边界
  if (y + menuRect.height > windowHeight) {
    y = windowHeight - menuRect.height - 5
  }

  // 确保不会超出左上边界
  x = Math.max(5, x)
  y = Math.max(5, y)

  return { x, y }
})

// 点击外部关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  const menu = document.getElementById('context-menu')
  if (menu && !menu.contains(event.target as Node)) {
    emit('close')
  }
}

// 处理菜单项点击
const handleMenuClick = (action: string) => {
  switch (action) {
    case 'open':
      emit('openApp', props.app)
      break
    case 'folder':
      emit('openFolder', props.app)
      break
    case 'uninstall':
      emit('uninstall', props.app)
      break
  }
  emit('close')
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.context-menu {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  z-index: 1000;
}
</style>
