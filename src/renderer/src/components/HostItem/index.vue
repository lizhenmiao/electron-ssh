<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-08 14:08:36
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-12 16:53:08
 * @FilePath: \electron-ssh\src\renderer\src\components\HostItem\index.vue
 * @Description: 单个主机项 / 单个分组项
-->
<template>
  <div
    v-loading="loading"
    class="flex flex-nowrap items-center gap-2 cursor-pointer transition-all duration-300 ease-in-out group"
  >
    <div
      v-if="props.icon"
      class="flex items-center justify-center flex-shrink-0"
      :style="{
        backgroundColor: props.iconBg
          ? typeof props.iconBg === 'string'
            ? props.iconBg
            : props.iconBg[Math.floor(Math.random() * props.iconBg.length)]
          : '#E6EBED',
        width: props.iconWidth + 'px',
        height: props.iconWidth + 'px',
        color: props.iconColor,
        borderRadius: props.iconRounded
      }"
    >
      <el-icon :size="Math.ceil(props.iconWidth / 1.5)">
        <component :is="props.icon" />
      </el-icon>
    </div>
    <div class="flex-1 overflow-hidden">
      <div class="text-[14px] text-[#3F4049] font-medium truncate" :title="props.title">
        {{ props.title }}
      </div>
      <div v-if="props.desc" class="text-[12px] text-gray-500 truncate" :title="props.desc">
        {{ props.desc }}
      </div>
    </div>
    <div
      v-if="showEdit || showDelete"
      class="flex-shrink-0 hidden group-hover:block group-hover:pl-1"
    >
      <el-button
        v-if="showEdit"
        type="primary"
        icon="Edit"
        circle
        size="small"
        @click="emit('edit')"
      />
      <el-button
        v-if="showDelete"
        type="danger"
        icon="Delete"
        circle
        size="small"
        class="!ml-2"
        @click="emit('delete')"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  // 是否在加载
  loading: {
    type: Boolean,
    default: false
  },
  // 标题
  title: {
    type: [String, Number],
    default: ''
  },
  // 说明
  desc: {
    type: [String, Number],
    default: ''
  },
  // 图标
  icon: {
    type: String,
    default: 'ElementPlus'
  },
  // 图标背景色
  iconBg: {
    type: [Array, String],
    default: () => ['#EB0000', '#C60055', '#D0571E']
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
  // 是否显示编辑按钮
  showEdit: {
    type: Boolean,
    default: true
  },
  // 是否显示删除按钮
  showDelete: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['edit', 'delete'])
</script>
