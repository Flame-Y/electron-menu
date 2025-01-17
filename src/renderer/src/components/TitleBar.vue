<script setup lang="ts">
const { ipcRenderer, process } = window.electron

// 最小化
const minimize = () => {
  ipcRenderer.send('detach:service', { type: 'minimize' })
}
// 最大化
const maximize = () => {
  ipcRenderer.send('detach:service', { type: 'maximize' })
}
// 关闭窗口
const close = () => {
  ipcRenderer.send('detach:service', { type: 'close' })
}
</script>

<template>
  <div class="fixed w-full h-[60px] top-0 flex items-center justify-between bg-white">
    <div class="text-black flex items-center pl-4">
      <span>菜单</span>
    </div>
    <div class="flex items-center h-full no-drag">
      <div v-if="process.platform !== 'darwin'" class="flex items-center h-full">
        <div
          class="w-10 h-10 cursor-pointer flex items-center justify-center hover:bg-gray-100 bg-center bg-no-repeat bg-[length:20px] bg-[url('../assets/minimize.svg')]"
          @click="minimize"
        />
        <div
          class="w-10 h-10 cursor-pointer flex items-center justify-center hover:bg-gray-100 bg-center bg-no-repeat bg-[length:20px] bg-[url('../assets/maximize.svg')]"
          @click="maximize"
        />
        <div
          class="w-10 h-10 cursor-pointer flex items-center justify-center hover:bg-red-500 group bg-center bg-no-repeat bg-[length:20px] bg-[url('../assets/close.svg')] hover:bg-[url('../assets/close-hover.svg')]"
          @click="close"
        />
      </div>
    </div>
  </div>
</template>
