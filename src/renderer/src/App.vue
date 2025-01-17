<script setup lang="ts">
import Versions from './components/Versions.vue'
import TitleBar from './components/TitleBar.vue'
import AppSearch from './components/AppSearch.vue'
import wavyLines from './assets/wavy-lines.svg'

defineOptions({
  name: 'App'
})

const ipcHandle = () => window.electron.ipcRenderer.send('ping')
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center bg-cover"
    :style="{ backgroundImage: `url(${wavyLines})` }"
  >
    <TitleBar />
    <AppSearch />

    <div class="flex flex-col items-center justify-center flex-grow">
      <img
        alt="logo"
        class="w-64 h-64 no-drag mb-4 hover:scale-110 transition-all"
        src="./assets/electron.svg"
      />
      <div class="text-gray-600 mb-4">Powered by electron-vite</div>

      <div class="text-center mb-4">
        Build an Electron app with
        <span class="text-green-600">Vue</span>
        and
        <span class="text-blue-600">TypeScript</span>
      </div>

      <p class="text-gray-500 mb-6">
        Please try pressing <code class="bg-gray-100 px-2 py-1 rounded">F12</code> to open the
        devTool
      </p>

      <div class="flex gap-4 no-drag">
        <a
          href="https://electron-vite.org/"
          target="_blank"
          rel="noreferrer"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Documentation
        </a>
        <a
          target="_blank"
          rel="noreferrer"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors cursor-pointer no-drag"
          @click="ipcHandle"
        >
          Send IPC
        </a>
      </div>

      <Versions class="mt-8" />
    </div>
  </div>
</template>
