import { ref, App } from 'vue'

interface LoadingOptions {
  title?: string
  message?: string
  showProgress?: boolean
}

const loadingState = ref({
  show: false,
  title: '',
  message: '',
  showProgress: false,
  progress: 0
})

export function useLoading() {
  const showLoading = (options: LoadingOptions = {}) => {
    loadingState.value = {
      show: true,
      title: options.title || '正在加载',
      message: options.message || '请稍候...',
      showProgress: options.showProgress || false,
      progress: 0
    }
  }

  const hideLoading = () => {
    loadingState.value.show = false
  }

  const updateProgress = (progress: number) => {
    loadingState.value.progress = Math.min(Math.max(progress, 0), 100)
  }

  const updateLoadingText = (title?: string, message?: string) => {
    if (title !== undefined) {
      loadingState.value.title = title
    }
    if (message !== undefined) {
      loadingState.value.message = message
    }
  }

  return {
    loadingState,
    showLoading,
    hideLoading,
    updateProgress,
    updateLoadingText
  }
}

// 全局加载函数
let globalShowLoading: (options?: LoadingOptions) => void
let globalHideLoading: () => void
let globalUpdateProgress: (progress: number) => void

export function setupLoading(app: App) {
  const { showLoading, hideLoading, updateProgress } = useLoading()
  globalShowLoading = showLoading
  globalHideLoading = hideLoading
  globalUpdateProgress = updateProgress

  // 将加载函数挂载到全局属性
  app.config.globalProperties.$showLoading = showLoading
  app.config.globalProperties.$hideLoading = hideLoading
  app.config.globalProperties.$updateProgress = updateProgress
}

export {
  globalShowLoading as $showLoading,
  globalHideLoading as $hideLoading,
  globalUpdateProgress as $updateProgress
}
