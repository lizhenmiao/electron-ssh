<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-04 09:47:11
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-05 18:21:13
 * @FilePath: \electron-ssh\src\renderer\src\App.vue
 * @Description: App
-->
<template>
  <el-container class="!h-screen">
    <el-header class="!m-0 !py-0 !px-4 !bg-[#292b3e] !text-white !h-[50px]">
      <el-scrollbar view-class="flex items-center h-full">
        <div class="flex flex-nowrap gap-2 px-0 py-2">
          <MenuItem
            v-for="(item, index) in terminalStore.terminalList"
            :key="index"
            :active="terminalStore.activeMenu === item.menuId"
            :menu-id="item.menuId"
            :link="item.link"
            :title="item.title"
            :icon="item.icon"
            :closeable="item.closeable"
            @click="terminalStore.setActiveMenu($event)"
          />
        </div>
      </el-scrollbar>
    </el-header>
    <el-main class="!m-0 !p-0">
      <router-view v-slot="{ Component, route }">
        <transition>
          <keep-alive :exclude="terminalStore.excludedKeys">
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </transition>
      </router-view>
    </el-main>
  </el-container>
</template>

<script setup>
import MenuItem from '@renderer/components/MenuItem/index.vue'
import { useTerminalStore } from '@renderer/stores/terminalStore'

const terminalStore = useTerminalStore()
</script>
