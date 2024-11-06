/*
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-05 09:31:00
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-05 13:57:48
 * @FilePath: \electron-ssh\src\renderer\src\router\index.js
 * @Description: vue-router
 */
import { createRouter, createWebHistory } from 'vue-router'
import Vaults from '@renderer/views/Vaults/index.vue'
import SFTP from '@renderer/views/SFTP/index.vue'
import Terminal from '@renderer/views/Terminal/index.vue'

const routes = [
  { path: '/', redirect: '/vaults' },
  { path: '/vaults', component: Vaults },
  { path: '/sftp', component: SFTP },
  { path: '/terminal/:id', component: Terminal, props: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
