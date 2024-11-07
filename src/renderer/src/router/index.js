/*
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-05 09:31:00
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-07 15:11:18
 * @FilePath: \electron-ssh\src\renderer\src\router\index.js
 * @Description: vue-router
 */
import { createRouter, createWebHistory } from 'vue-router'
import Vaults from '@renderer/views/Vaults/index.vue'
import SFTP from '@renderer/views/SFTP/index.vue'
import Terminal from '@renderer/views/Terminal/index.vue'

const routes = [
  // 这里的 name 关联到 /stores/terminalStore.js 中的 cachedViews
  { path: '/', name: 'Home', redirect: '/vaults' },
  { path: '/vaults', name: 'Vaults', component: Vaults },
  { path: '/sftp', name: 'SFTP', component: SFTP },
  // 终端页面的缓存ID为：Terminal_{UUID V4}
  { path: '/terminal/:id', name: 'Terminal', component: Terminal, props: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
