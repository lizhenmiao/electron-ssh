<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-05 09:31:25
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-05 17:03:42
 * @FilePath: \electron-ssh\src\renderer\src\views\Vaults\index.vue
 * @Description: 主机列表页
-->
<template>
  <div class="p-4">
    <section class="flex items-center justify-items-start flex-wrap">
      <el-button type="primary" @click="handleAddHost">
        <el-icon :size="18" class="rotate-90"><SwitchFilled /></el-icon>
        <span class="ml-2">添加主机</span>
      </el-button>
    </section>

    <hostDetails ref="hostDetailsRef" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import hostDetails from './module/hostDetails/index.vue'

const hostDetailsRef = ref(null)

const handleAddHost = () => {
  hostDetailsRef.value.open()
}
</script>
