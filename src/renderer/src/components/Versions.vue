<script setup lang="ts">
import { reactive } from 'vue'

const versions = reactive({ ...window.electron.process.versions })
</script>

<template>
  <ul
    class="fixed bottom-[30px] mx-auto py-[15px] font-mono inline-flex items-center rounded-[22px] bg-[#202127] backdrop-blur-2xl text-white"
  >
    <li
      class="float-left px-5 text-sm leading-[14px] opacity-80 border-r border-ev-gray-1 last:border-none hover:opacity-100"
    >
      Electron v{{ versions.electron }}
    </li>
    <li
      class="float-left px-5 text-sm leading-[14px] opacity-80 border-r border-ev-gray-1 last:border-none hover:opacity-100"
    >
      Chromium v{{ versions.chrome }}
    </li>
    <li
      class="float-left px-5 text-sm leading-[14px] opacity-80 border-r border-ev-gray-1 last:border-none hover:opacity-100"
    >
      Node v{{ versions.node }}
    </li>
  </ul>
</template>
