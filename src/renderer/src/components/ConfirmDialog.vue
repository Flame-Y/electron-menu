<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- 遮罩层 -->
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="handleCancel"></div>

    <!-- 对话框 -->
    <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
      <!-- 图标 -->
      <div
        class="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full"
        :class="iconBgClass"
      >
        <i :class="iconClass" class="text-2xl"></i>
      </div>

      <!-- 标题 -->
      <h3 class="text-lg font-medium text-gray-900 text-center mb-2">
        {{ title }}
      </h3>

      <!-- 内容 -->
      <p class="text-sm text-gray-500 text-center mb-6">
        {{ message }}
      </p>

      <!-- 按钮组 -->
      <div class="flex space-x-3">
        <button
          class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          @click="handleCancel"
        >
          {{ cancelText }}
        </button>
        <button
          class="flex-1 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
          :class="confirmButtonClass"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  show: boolean
  title?: string
  message?: string
  type?: 'warning' | 'danger' | 'info' | 'success'
  confirmText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '确认操作',
  message: '您确定要执行此操作吗？',
  type: 'warning',
  confirmText: '确认',
  cancelText: '取消'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

// 根据类型计算图标和样式
const iconClass = computed(() => {
  const icons = {
    warning: 'ri-alert-line text-yellow-600',
    danger: 'ri-error-warning-line text-red-600',
    info: 'ri-information-line text-blue-600',
    success: 'ri-check-line text-green-600'
  }
  return icons[props.type]
})

const iconBgClass = computed(() => {
  const bgClasses = {
    warning: 'bg-yellow-100',
    danger: 'bg-red-100',
    info: 'bg-blue-100',
    success: 'bg-green-100'
  }
  return bgClasses[props.type]
})

const confirmButtonClass = computed(() => {
  const buttonClasses = {
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
  }
  return buttonClasses[props.type]
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>
