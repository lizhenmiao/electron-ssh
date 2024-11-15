import { createApp } from 'vue'
import App from './App.vue'
import router from '@renderer/router'
import store from '@renderer/store'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import '@xterm/xterm/css/xterm.css'
import utils from '@renderer/utils'
import directives from '@renderer/directives'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import '@renderer/assets/main.css'
/**
 * https://github.com/vbenjs/vite-plugin-svg-icons
 * 需引入 icon 注册脚本
 */
import 'virtual:svg-icons-register'

import CustomDialog from '@renderer/components/CustomDialog/index.vue'

const app = createApp(App)

app.component('CustomDialog', CustomDialog)
app.component('RecycleScroller', RecycleScroller)
app.config.globalProperties.$utils = utils
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(directives).use(router).use(store).mount('#app')
