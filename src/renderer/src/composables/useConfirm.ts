import { ref, App } from 'vue'

interface ConfirmOptions {
  title?: string
  message?: string
  type?: 'warning' | 'danger' | 'info' | 'success'
  confirmText?: string
  cancelText?: string
}

const confirmState = ref({
  show: false,
  title: '',
  message: '',
  type: 'warning' as const,
  confirmText: '确认',
  cancelText: '取消',
  resolve: null as ((value: boolean) => void) | null
})

export function useConfirm() {
  const confirm = (options: ConfirmOptions = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      confirmState.value = {
        show: true,
        title: options.title || '确认操作',
        message: options.message || '您确定要执行此操作吗？',
        type: options.type || 'warning',
        confirmText: options.confirmText || '确认',
        cancelText: options.cancelText || '取消',
        resolve
      }
    })
  }

  const handleConfirm = () => {
    confirmState.value.show = false
    confirmState.value.resolve?.(true)
  }

  const handleCancel = () => {
    confirmState.value.show = false
    confirmState.value.resolve?.(false)
  }

  return {
    confirmState,
    confirm,
    handleConfirm,
    handleCancel
  }
}

// 全局确认函数
let globalConfirm: (options?: ConfirmOptions) => Promise<boolean>

export function setupConfirm(app: App) {
  const { confirm } = useConfirm()
  globalConfirm = confirm

  // 将确认函数挂载到全局属性
  app.config.globalProperties.$confirm = confirm
}

export { globalConfirm as $confirm }
