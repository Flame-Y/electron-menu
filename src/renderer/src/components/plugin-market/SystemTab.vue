<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import commonConst from '../../../../common/utils/commonConst'
declare const window: Window & typeof globalThis & { electron: { ipcRenderer: any } }

const shortcutKey = ref('CommandOrControl+Space')
const updateMessage = ref('')
const updateStatus = ref<'success' | 'error' | ''>('')
const isRecording = ref(false)

// 用于存储按键组合
const pressedKeys = new Set<string>()

// 添加插件快捷键相关的状态
const installedPlugins = ref<Array<{ id: string; name: string; shortcut: string }>>([])
const selectedPlugin = ref('')
const pluginShortcut = ref('')

watch(selectedPlugin, (newValue) => {
  // 重置快捷键输入
  pluginShortcut.value = ''
  // 如果选择了插件，显示当前插件的快捷键
  if (newValue) {
    const plugin = installedPlugins.value.find((p) => p.id === newValue)
    if (plugin?.shortcut) {
      pluginShortcut.value = plugin.shortcut
    }
  }
})

const isRecordingPlugin = ref(false)
const pluginUpdateMessage = ref('')
const pluginUpdateStatus = ref<'success' | 'error' | ''>('')

// 处理按键记录
const handleKeyDown = (e: KeyboardEvent) => {
  if (!isRecording.value) return

  e.preventDefault()

  // 清除之前的按键
  pressedKeys.clear()

  // 记录修饰键
  if (e.ctrlKey) pressedKeys.add('CommandOrControl')
  if (e.metaKey && commonConst.macOS()) pressedKeys.add('CommandOrControl')
  if (e.altKey) pressedKeys.add('Alt')
  if (e.shiftKey) pressedKeys.add('Shift')

  // 记录普通键
  if (!/^(Control|Meta|Alt|Shift)$/.test(e.key)) {
    pressedKeys.add(e.key.toUpperCase())
  }

  // 更新显示
  shortcutKey.value = Array.from(pressedKeys).join('+')
}

// 开始记录快捷键
const startRecording = () => {
  isRecording.value = true
  shortcutKey.value = '请按下快捷键...'
  window.addEventListener('keydown', handleKeyDown)
}

// 停止记录快捷键
const stopRecording = () => {
  isRecording.value = false
  window.removeEventListener('keydown', handleKeyDown)
}

const updateShortcut = async () => {
  try {
    stopRecording()
    const result = await window.electron.ipcRenderer.invoke('update-shortcut', shortcutKey.value)
    if (result.success) {
      // 立即重新注册快捷键
      await window.electron.ipcRenderer.invoke('reload-shortcut')
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

// 获取已安装的插件列表
const fetchInstalledPlugins = async () => {
  try {
    const plugins = await window.electron.ipcRenderer.invoke('get-installed-plugins')
    installedPlugins.value = plugins
  } catch (error) {
    console.error('获取插件列表失败:', error)
  }
}

// 处理插件快捷键记录
const handlePluginKeyDown = (e: KeyboardEvent) => {
  if (!isRecordingPlugin.value) return

  e.preventDefault()
  pressedKeys.clear()

  if (e.ctrlKey) pressedKeys.add('CommandOrControl')
  if (e.metaKey && commonConst.macOS()) pressedKeys.add('CommandOrControl')
  if (e.altKey) pressedKeys.add('Alt')
  if (e.shiftKey) pressedKeys.add('Shift')

  if (!/^(Control|Meta|Alt|Shift)$/.test(e.key)) {
    pressedKeys.add(e.key.toUpperCase())
  }

  pluginShortcut.value = Array.from(pressedKeys).join('+')
}

// 开始记录插件快捷键
const startPluginRecording = () => {
  isRecordingPlugin.value = true
  pluginShortcut.value = '请按下快捷键...'
  window.addEventListener('keydown', handlePluginKeyDown)
}

// 停止记录插件快捷键
const stopPluginRecording = () => {
  isRecordingPlugin.value = false
  window.removeEventListener('keydown', handlePluginKeyDown)
}

// 保存插件快捷键
const savePluginShortcut = async () => {
  if (!selectedPlugin.value || !pluginShortcut.value) return

  // 添加验证：检查快捷键是否有效
  if (pluginShortcut.value === '请按下快捷键...') {
    pluginUpdateStatus.value = 'error'
    pluginUpdateMessage.value = '请输入有效的快捷键组合'
    return
  }

  try {
    const result = await window.electron.ipcRenderer.invoke('save-plugin-shortcut', {
      pluginId: selectedPlugin.value,
      shortcut: pluginShortcut.value
    })

    if (result.success) {
      // 立即重新注册插件快捷键
      await window.electron.ipcRenderer.invoke('reload-plugin-shortcuts')
      pluginUpdateStatus.value = 'success'
      pluginUpdateMessage.value = '插件快捷键保存成功'
      // 更新本地插件列表中的快捷键
      const pluginIndex = installedPlugins.value.findIndex((p) => p.id === selectedPlugin.value)
      if (pluginIndex !== -1) {
        installedPlugins.value[pluginIndex].shortcut = pluginShortcut.value
      }
    } else {
      pluginUpdateStatus.value = 'error'
      pluginUpdateMessage.value = result.error || '插件快捷键保存失败'
    }
  } catch (error) {
    pluginUpdateStatus.value = 'error'
    pluginUpdateMessage.value = '插件快捷键保存失败'
  }

  setTimeout(() => {
    pluginUpdateMessage.value = ''
    pluginUpdateStatus.value = ''
  }, 3000)
}

// 组件挂载时获取插件列表
onMounted(() => {
  fetchInstalledPlugins()
})
</script>

<template>
  <div>
    <h2 class="text-lg font-medium text-gray-900 mb-4">系统设置</h2>
    <div class="space-y-4">
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-700 mb-2">打开应用快捷键设置</h3>
        <div class="flex items-center space-x-4">
          <input
            v-model="shortcutKey"
            type="text"
            readonly
            :class="{
              'flex-1 px-3 py-2 border rounded-md shadow-sm text-sm': true,
              'border-blue-500 bg-blue-50': isRecording,
              'border-gray-300': !isRecording,
              'focus:ring-blue-500 focus:border-blue-500': !isRecording
            }"
            @focus="startRecording"
            @blur="stopRecording"
          />
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
            @click="updateShortcut"
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
        <p class="mt-2 text-xs text-gray-500">点击输入框并按下快捷键组合进行设置</p>
      </div>

      <!-- 添加插件快捷键设置部分 -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-700 mb-2">插件快捷键设置</h3>
        <div class="space-y-4">
          <div class="flex items-center space-x-4">
            <select
              v-model="selectedPlugin"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">选择插件</option>
              <option v-for="plugin in installedPlugins" :key="plugin.id" :value="plugin.id">
                {{ plugin.name }}
              </option>
            </select>
          </div>

          <div class="flex items-center space-x-4">
            <input
              v-model="pluginShortcut"
              type="text"
              readonly
              :class="{
                'flex-1 px-3 py-2 border rounded-md shadow-sm text-sm': true,
                'border-blue-500 bg-blue-50': isRecordingPlugin,
                'border-gray-300': !isRecordingPlugin,
                'focus:ring-blue-500 focus:border-blue-500': !isRecordingPlugin
              }"
              :disabled="!selectedPlugin"
              @focus="startPluginRecording"
              @blur="stopPluginRecording"
            />
            <button
              :disabled="!selectedPlugin || !pluginShortcut"
              class="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              @click="savePluginShortcut"
            >
              保存
            </button>
          </div>
          <div
            v-if="pluginUpdateMessage"
            class="mt-2 text-sm"
            :class="{
              'text-green-600': pluginUpdateStatus === 'success',
              'text-red-600': pluginUpdateStatus === 'error'
            }"
          >
            {{ pluginUpdateMessage }}
          </div>
        </div>
        <p class="mt-2 text-xs text-gray-500">选择插件并设置启动快捷键</p>
      </div>
    </div>
  </div>
</template>
