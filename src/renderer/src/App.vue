<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-04 09:47:11
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-08 13:11:30
 * @FilePath: \electron-ssh\src\renderer\src\App.vue
 * @Description: App
-->
<template>
  <el-container class="!h-screen">
    <el-header
      class="custom-header-wrapper !m-0 !py-0 !px-4 !h-[50px]"
      :class="{ 'is-terminal': !['vaults', 'sftp'].includes(terminalStore.activeMenu) }"
    >
      <el-scrollbar view-class="flex items-center h-full">
        <div class="flex items-center flex-nowrap gap-2 px-0 py-2">
          <template v-for="(item, index) in terminalStore.terminalList" :key="index">
            <MenuItem
              :active="terminalStore.activeMenu === item.menuId"
              :menu-id="item.menuId"
              :link="item.link"
              :title="item.title"
              :icon="item.icon"
              :is-terminal="item.isTerminal"
              @click="terminalStore.setActiveMenu($event)"
            />
            <el-divider
              v-if="terminalStore.terminalList.length > 2 && item.menuId === 'sftp'"
              direction="vertical"
              class="m-0 custom-menu-divider"
            />
            <el-icon
              v-if="index === terminalStore.terminalList.length - 1"
              :size="20"
              class="custom-menu-add-icon"
              @click="chooseHostModal.open()"
            >
              <Plus class="p-[2px] transition-all duration-300 ease-in-out" />
            </el-icon>
          </template>
        </div>
      </el-scrollbar>
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
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, h, getCurrentInstance } from 'vue'
import MenuItem from '@renderer/components/MenuItem/index.vue'
import { useTerminalStore } from '@renderer/stores/terminalStore'
import chooseHost from '@renderer/views/ChooseHost/index.vue'

const { proxy } = getCurrentInstance()
const terminalStore = useTerminalStore()

const chooseHostModal = ref(null)

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
