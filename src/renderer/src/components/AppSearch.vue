<script setup lang="ts">
import { ref } from 'vue'

const keyword = ref('')

const emit = defineEmits(['search'])

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('search', value)
}

// 暴露清空搜索的方法
const clearSearch = () => {
  keyword.value = ''
}

defineExpose({
  clearSearch
})
</script>

<template>
  <div
    class="w-full max-w-[600px] mx-auto no-drag h-[80px] rounded flex items-center justify-center relative"
  >
    <!-- 背景图片 -->
    <div class="absolute inset-0 overflow-hidden -z-10">
      <img src="../assets/background.jpg" alt="" class="w-full h-full object-cover opacity-20" />
    </div>

    <input
      v-model="keyword"
      type="text"
      placeholder="搜索应用..."
      class="w-full px-3 py-2 rounded text-base focus:outline-none focus:border-gray-300 h-[80px] bg-transparent"
      @input="handleInput"
    />
  </div>
</template>
