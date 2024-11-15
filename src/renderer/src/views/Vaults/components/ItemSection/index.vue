<template>
  <div v-if="props.items.length > 0">
    <h3 class="text-sm font-bold mb-2">{{ props.title }}</h3>
    <div
      class="grid grid-cols-1 gap-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xs:gap-2 md:gap-3"
    >
      <HostItem
        v-for="(item, index) in props.items"
        :key="index"
        class="p-2 bg-white rounded-md hover:bg-[#E6EBED] shadow-sm"
        :title="item.name"
        :desc="generateDescription(item)"
        :icon="props.icon"
        :icon-bg="props.iconBg"
        :loading="loadingList.includes(`${props.type}-${item.id}`)"
        @dblclick="emit('dblclick', item)"
        @edit="emit('edit', item)"
        @delete="handleDelete(item)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTerminalStore } from '@renderer/stores/terminalStore'
import HostItem from '@renderer/components/HostItem/index.vue'

const terminalStore = useTerminalStore()
const loadingList = ref([])

const props = defineProps({
  // 数据信息
  items: {
    type: Array,
    default: () => []
  },
  // 标题
  title: {
    type: String,
    default: ''
  },
  // 每项的图标
  icon: {
    type: String,
    default: ''
  },
  // 每项的图标背景色
  iconBg: {
    type: [String, Array],
    default: ''
  },
  // 数据类型
  type: {
    type: String,
    default: ''
  },
  // 描述
  generateDescription: {
    type: Function,
    default: () => ''
  },
  // 删除接口的名称, 在 window.api 中定义
  deleteApiMethod: {
    type: String,
    default: ''
  },
  // 刷新数据的接口的名称, 在 terminalStore.js 中定义
  refreshStoreMethod: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['dblclick', 'edit', 'delete'])

const handleDelete = (item) => {
  const { name, id } = item || {}
  ElMessageBox.confirm(`确定要删除${props.title} ${name} 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const loadingId = `${props.type}-${id}`
      loadingList.value.push(loadingId)

      window.api[props.deleteApiMethod](id)
        .then(() => {
          terminalStore[props.refreshStoreMethod]()
          ElMessage.success('删除成功')
          loadingList.value = loadingList.value.filter((item) => item !== loadingId)
        })
        .catch(() => {
          ElMessage.error('删除失败')
          loadingList.value = loadingList.value.filter((item) => item !== loadingId)
        })
    })
    .catch(() => {})
}
</script>
