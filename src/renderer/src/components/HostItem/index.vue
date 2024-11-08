<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-08 14:08:36
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-08 14:20:28
 * @FilePath: \electron-ssh\src\renderer\src\components\HostItem\index.vue
 * @Description: 单个主机项
-->
<template>
  <div class="flex items-center gap-2 cursor-pointer transition-all duration-300 ease-in-out">
    <div
      class="flex items-center justify-center flex-shrink-0"
      :style="{
        backgroundColor: props.iconBg,
        width: props.iconWidth + 'px',
        height: props.iconWidth + 'px',
        color: props.iconColor,
        borderRadius: props.iconRounded
      }"
    >
      <el-icon :size="Math.ceil(props.iconWidth / 1.5)"><ElementPlus /></el-icon>
    </div>
    <div class="flex-1 overflow-hidden">
      <div class="text-[14px] text-[#3F4049] font-medium">{{ props.params.name }}</div>
      <div v-if="props.showHost" class="text-[12px] text-gray-500">
        {{ `${props.params.protocol},${props.params.host}:${props.params.port}` }}
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  params: {
    type: Object,
    required: true,
    default: () => ({})
  },
  // 图标背景色
  iconBg: {
    type: String,
    default: '#EB0000'
  },
  // 图标宽度
  iconWidth: {
    type: Number,
    default: 40
  },
  // 图标颜色
  iconColor: {
    type: String,
    default: 'white'
  },
  // 图标圆角
  iconRounded: {
    type: String,
    default: '0.75rem'
  },
  // 是否显示 protocol, host, port
  showHost: {
    type: Boolean,
    default: true
  }
})
</script>
