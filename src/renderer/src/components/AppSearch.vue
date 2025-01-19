<script setup lang="ts">
const emit = defineEmits(['search'])

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('search', value)
}
</script>

<template>
  <div class="w-full max-w-[600px] mx-auto no-drag h-[80px]">
    <input
      type="text"
      placeholder="搜索应用..."
      class="w-full px-3 py-2 rounded text-base focus:outline-none focus:border-gray-300 h-[80px]"
      @input="handleInput"
    />
  </div>
</template>
