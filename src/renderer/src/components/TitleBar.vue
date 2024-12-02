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
  <div class="title-bar">
    <div class="info">
      <!-- <img :src="plugInfo.logo" /> -->
      <span>菜单</span>
    </div>
    <div class="handle-container no-drag">
      <div v-if="process.platform !== 'darwin'" class="window-handle">
        <div class="minimize" @click="minimize"></div>
        <div class="maximize" @click="maximize"></div>
        <div class="close" @click="close"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.title-bar {
  position: fixed;
  width: 100%;
  height: 60px;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;

  .info {
    color: black;
    display: flex;
    align-items: center;
    padding-left: 16px;
  }

  .handle-container {
    display: flex;
    align-items: center;
    height: 100%;

    .window-handle {
      display: flex;
      align-items: center;
      height: 100%;

      .minimize {
        background: center / 20px no-repeat url('../assets/minimize.svg');
      }

      .maximize {
        background: center / 20px no-repeat url('../assets/maximize.svg');
      }

      .unmaximize {
        background: center / 20px no-repeat url('../assets/unmaximize.svg');
      }

      .close {
        background: center / 20px no-repeat url('../assets/close.svg');

        &:hover {
          background-color: #e53935;
          background-image: url('../assets/close-hover.svg');
        }
      }
    }
  }
}

.handle > div,
.window-handle > div {
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
