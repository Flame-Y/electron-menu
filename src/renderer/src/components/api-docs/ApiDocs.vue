<script setup lang="ts">
import { ref } from 'vue'
import { api } from './docs'

const apiDocs = ref(api)
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Uiko API 手册</h1>
    <div class="space-y-4">
      <div v-for="api in apiDocs" :key="api.name" class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-gray-700 mb-2">{{ api.name }}</h3>
        <p class="text-sm text-gray-600 mb-2">{{ api.description }}</p>

        <!-- 参数列表 -->
        <div v-if="api.params.length" class="mb-2">
          <h4 class="text-xs font-medium text-gray-600 mb-1">参数：</h4>
          <div v-for="param in api.params" :key="param.name" class="ml-2">
            <code class="text-xs bg-gray-100 px-1 rounded">{{ param.name }}: {{ param.type }}</code>
            <span class="text-xs text-gray-500 ml-2">{{ param.description }}</span>
          </div>
        </div>

        <!-- 返回值 -->
        <div>
          <h4 class="text-xs font-medium text-gray-600 mb-1">返回值：</h4>
          <code class="text-xs bg-gray-100 px-1 rounded">{{ api.returns }}</code>
        </div>
      </div>
    </div>
  </div>
</template>
