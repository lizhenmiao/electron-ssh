<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-04 09:47:11
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-06 14:15:16
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
          <keep-alive :include="terminalStore.cachedViews">
            <component :is="dynamicComponentName(Component, route)" :key="route.fullPath" />
          </keep-alive>
        </transition>
      </router-view>
    </el-main>
  </el-container>
</template>

<script setup>
import { h, getCurrentInstance } from 'vue'
import MenuItem from '@renderer/components/MenuItem/index.vue'
import { useTerminalStore } from '@renderer/stores/terminalStore'

const { proxy } = getCurrentInstance()
const terminalStore = useTerminalStore()

const wrapperMap = new Map()
// 参考教程1：https://blog.csdn.net/qq_42611074/article/details/127206469
// 参考教程2：https://juejin.cn/post/7237306107746877501

const dynamicComponentName = (component, route) => {
  if (!component) return

  const componentName = proxy.$utils.getTerminalName({ route })

  let wrapper = null

  if (wrapperMap.has(componentName)) {
    wrapper = wrapperMap.get(componentName)
  } else {
    wrapper = {
      name: componentName,
      render: () => h(component)
    }
    wrapperMap.set(componentName, wrapper)
  }

  return h(wrapper)
}
</script>
