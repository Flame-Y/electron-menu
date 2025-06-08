<template>
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- 遮罩层 -->
        <div class="absolute inset-0 bg-black bg-opacity-50"></div>

        <!-- 对话框 -->
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <!-- 加载图标 -->
            <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>

            <!-- 标题 -->
            <h3 class="text-lg font-medium text-gray-900 text-center mb-2">
                {{ title }}
            </h3>

            <!-- 内容 -->
            <p class="text-sm text-gray-500 text-center mb-6">
                {{ message }}
            </p>

            <!-- 进度条（可选） -->
            <div v-if="showProgress" class="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div class="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    :style="{ width: `${progress}%` }"></div>
            </div>

            <!-- 进度文本（可选） -->
            <div v-if="showProgress" class="text-xs text-gray-400 text-center">
                {{ progress }}%
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    show: boolean
    title?: string
    message?: string
    showProgress?: boolean
    progress?: number
}

withDefaults(defineProps<Props>(), {
    title: '正在加载',
    message: '请稍候...',
    showProgress: false,
    progress: 0
})
</script>