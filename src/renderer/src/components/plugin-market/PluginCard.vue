<script setup lang="ts">
import { onMounted } from 'vue'
import { useConfirm } from '../../composables/useConfirm'
import { useLoading } from '../../composables/useLoading'

const { confirm } = useConfirm()
const { showLoading, hideLoading, updateProgress } = useLoading()

interface Plugin {
  id: string
  name: string
  description: string
  icon: string
  author: string
  downloads: number
  category: string
  from?: 'offical' | 'npm'
  install?: boolean
  url: string
  npmUrl?: string
}

const props = defineProps<{
  plugin: Plugin
}>()

const checkInstall = async (plugin: Plugin) => {
  const result = await window.electron.ipcRenderer.invoke('list-installed-plugins')
  if (result.success) {
    plugin.install = result.plugins.some((plugin) => plugin.id === props.plugin.id)
  }
  return plugin.install
}
onMounted(() => {
  checkInstall(props.plugin)
})
const uninstallPlugin = async (plugin: Plugin) => {
  try {
    const confirmed = await confirm({
      title: '确认卸载插件',
      message: `确定要卸载插件 "${plugin.name}" 吗？卸载后需要重新安装才能使用。`,
      type: 'danger',
      confirmText: '卸载',
      cancelText: '取消'
    })

    if (!confirmed) return

    // 显示卸载loading
    showLoading({
      title: '正在卸载插件',
      message: `正在卸载 "${plugin.name}"，请稍候...`
    })

    const result = await window.electron.ipcRenderer.invoke('uninstall-plugin', plugin.id)

    hideLoading()

    if (result.success) {
      plugin.install = false
      window.electron.ipcRenderer.send('show-notification', {
        title: 'Mortis',
        body: `${plugin.name} 卸载成功`
      })
    }
  } catch (error) {
    hideLoading()
    console.error('卸载插件失败:', error)
  }
}
const installPlugin = async () => {
  const { plugin } = props
  const install = await checkInstall(plugin)
  if (install) {
    // 提示已安装，二次确认是否卸载
    uninstallPlugin(plugin)
    return
  }

  try {
    // 显示安装loading，带进度条
    showLoading({
      title: '正在安装插件',
      message: `正在安装 "${plugin.name}"，请稍候...`,
      showProgress: true
    })

    // 模拟安装进度
    let progress = 0
    const progressInterval = setInterval(() => {
      progress += 20
      updateProgress(progress)
      if (progress >= 80) {
        clearInterval(progressInterval)
      }
    }, 200)

    const result = await window.electron.ipcRenderer.invoke('install-plugin', plugin.url)

    // 完成进度条
    updateProgress(100)

    setTimeout(() => {
      hideLoading()

      if (result.success) {
        plugin.install = true
        window.electron.ipcRenderer.send('show-notification', {
          title: 'Mortis',
          body: '插件安装成功'
        })
      }
    }, 300)

  } catch (error) {
    hideLoading()
    console.error('安装插件失败:', error)
  }
}
</script>

<template>
  <div
    class="backdrop-panel rounded-xl p-4 hover:ring-1 ring-slate-200 dark:ring-slate-800 transition-all duration-200">
    <div class="flex items-center space-x-4">
      <a :href="plugin.npmUrl" target="_blank">
        <div class="w-14 h-14 shrink-0 rounded-xl flex items-center justify-center text-2xl" :class="[
          'bg-gradient-to-br',
          'from-slate-100 to-slate-200',
          'dark:from-slate-800 dark:to-slate-900'
        ]">
          {{ plugin.icon }}
        </div>
      </a>

      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-slate-900 dark:text-slate-100">{{ plugin.name }}</h3>
          <button
            class="px-4 py-1.5 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity text-sm"
            @click="installPlugin">
            {{ plugin.install ? '已安装' : '安装' }}
          </button>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 text-left">
          {{ plugin.description }}
        </p>
        <div class="flex items-center space-x-4 mt-2 text-sm">
          <span class="text-slate-500 dark:text-slate-400">{{ plugin.author }}</span>
          <span class="text-slate-400 dark:text-slate-500">{{ plugin.downloads }}次下载</span>
          <span class="text-slate-400 dark:text-slate-500">{{ plugin.category }}</span>
          <span class="text-slate-400 dark:text-slate-500">{{
            plugin.from === 'offical' ? '官方' : 'npm社区'
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
