import { createApp } from 'vue'
import App from './App.vue'
import './assets/base.css'
import './assets/main.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'remixicon/fonts/remixicon.css'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.mount('#app')
