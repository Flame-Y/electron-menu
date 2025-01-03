<script setup lang="ts">
import { ref, watch } from 'vue'

const { ipcRenderer } = window.electron

// 搜索关键词
const keyword = ref('')
// 搜索结果
const searchResults = ref([])

// 处理搜索
const searchApps = async () => {
  if (keyword.value.trim()) {
    try {
      searchResults.value = await window.electron.ipcRenderer.invoke('search-apps', keyword.value)
    } catch (error) {
      console.error('搜索失败：', error)
      searchResults.value = []
    }
  } else {
    searchResults.value = []
  }
}

// value改变时搜索
watch(keyword, () => {
  searchApps()
})
</script>

<template>
  <div class="app-search no-drag">
    <div class="search-input">
      <input v-model="keyword" type="text" placeholder="搜索应用..." @input="searchApps" />
    </div>

    <div v-if="searchResults.length" class="search-results">
      <div v-for="app in searchResults" :key="app.path" class="result-item">
        <img :src="app.icon" :alt="app.name" class="app-icon" />
        <div class="app-info">
          <div class="app-name">{{ app.name }}</div>
          <div class="app-path">{{ app.path }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-search {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.search-input input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-results {
  margin-top: 12px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
}

.result-item:hover {
  background-color: #f5f5f5;
}

.app-icon {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}

.app-info {
  flex: 1;
}

.app-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.app-path {
  font-size: 12px;
  color: #666;
}
</style>
