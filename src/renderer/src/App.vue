<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-04 09:47:11
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-11 14:13:11
 * @FilePath: \electron-ssh\src\renderer\src\App.vue
 * @Description: App
-->
<template>
  <el-container class="!h-screen">
    <el-header
      class="custom-header-wrapper !m-0 !py-0 !px-4 !h-[50px]"
      :class="{ 'is-terminal': !['vaults', 'sftp'].includes(terminalStore.activeMenu) }"
    >
      <div class="flex items-center flex-nowrap gap-2 px-0 py-2">
        <div class="flex-shrink-0 flex items-center gap-2">
          <el-icon :size="20" class="custom-menu-icon" @click="settingsModal.open()">
            <Operation class="p-[2px] transition-all duration-300 ease-in-out" />
          </el-icon>
          <MenuItem
            v-for="item in terminalStore.menuList"
            :key="item.menuId"
            :active="terminalStore.activeMenu === item.menuId"
            :menu-id="item.menuId"
            :link="item.link"
            :title="item.title"
            :icon="item.icon"
            @click="terminalStore.setActiveMenu($event)"
          />
          <el-divider
            v-if="terminalStore.terminalList.length > 0"
            direction="vertical"
            class="m-0 custom-menu-divider"
          />
        </div>
        <el-scrollbar>
          <div class="flex items-center gap-2">
            <MenuItem
              v-for="item in terminalStore.terminalList"
              :key="item.menuId"
              :active="terminalStore.activeMenu === item.menuId"
              :menu-id="item.menuId"
              :link="item.link"
              :title="item.title"
              :icon="item.icon"
              is-terminal
              @click="terminalStore.setActiveMenu($event)"
            />
          </div>
        </el-scrollbar>
        <div class="flex-shrink-0 flex items-center">
          <el-icon :size="20" class="custom-menu-icon" @click="chooseHostModal.open()">
            <Plus class="p-[2px] transition-all duration-300 ease-in-out" />
          </el-icon>
        </div>
      </div>
    </el-header>
    <el-main class="!m-0 !p-0">
      <router-view v-slot="{ Component, route }">
        <transition name="fade">
          <keep-alive :include="terminalStore.cachedViews">
            <component :is="dynamicComponentName(Component, route)" :key="route.fullPath" />
          </keep-alive>
        </transition>
      </router-view>
      <!-- 选择主机的弹窗 -->
      <chooseHost ref="chooseHostModal"></chooseHost>
      <!-- 设置弹窗 -->
      <settings ref="settingsModal"></settings>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, h, getCurrentInstance } from 'vue'
import MenuItem from '@renderer/components/MenuItem/index.vue'
import { useTerminalStore } from '@renderer/stores/terminalStore'
import chooseHost from '@renderer/views/ChooseHost/index.vue'
import settings from '@renderer/components/Settings/index.vue'

const { proxy } = getCurrentInstance()
const terminalStore = useTerminalStore()

const chooseHostModal = ref(null)
const settingsModal = ref(null)

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
