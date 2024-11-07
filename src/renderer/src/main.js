import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import '@xterm/xterm/css/xterm.css'
import utils from './utils'
import directives from './directives'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import './assets/main.css'

const app = createApp(App)

app.component('RecycleScroller', RecycleScroller)
app.config.globalProperties.$utils = utils
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(directives).use(router).use(store).mount('#app')
