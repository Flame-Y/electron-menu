<script setup lang="ts">
import { ref } from 'vue'

declare const window: Window & typeof globalThis & { electron: { ipcRenderer: any } }

const shortcutKey = ref('CommandOrControl+Space')
const updateMessage = ref('')
const updateStatus = ref<'success' | 'error' | ''>('')

const updateShortcut = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('update-shortcut', shortcutKey.value)
    if (result.success) {
      updateStatus.value = 'success'
      updateMessage.value = '快捷键更新成功'
    } else {
      updateStatus.value = 'error'
      updateMessage.value = result.error || '快捷键更新失败'
    }
  } catch (error) {
    updateStatus.value = 'error'
    updateMessage.value = '快捷键更新失败'
  }

  setTimeout(() => {
    updateMessage.value = ''
    updateStatus.value = ''
  }, 3000)
}
</script>

<template>
  <div>
    <h2 class="text-lg font-medium text-gray-900 mb-4">系统设置</h2>
    <div class="space-y-4">
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-700 mb-2">快捷键设置</h3>
        <div class="flex items-center space-x-4">
          <input
            v-model="shortcutKey"
            type="text"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="请输入快捷键"
          />
          <button
            @click="updateShortcut"
            class="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
          >
            保存
          </button>
        </div>
        <div
          v-if="updateMessage"
          class="mt-2 text-sm"
          :class="{
            'text-green-600': updateStatus === 'success',
            'text-red-600': updateStatus === 'error'
          }"
        >
          {{ updateMessage }}
        </div>
        <p class="mt-2 text-xs text-gray-500">
          支持的组合键：CommandOrControl, Option/Alt, Shift + 字母/数字
        </p>
      </div>
    </div>
  </div>
</template>
