<!--
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-05 09:31:48
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-08 18:09:39
 * @FilePath: \electron-ssh\src\renderer\src\views\SFTP\index.vue
 * @Description: SFTP
-->
<template>
  <div class="p-4">
    <el-button @click="handleChange">切换效果</el-button>
    <div ref="circleRef" class="circle-container"></div>
    <svg aria-hidden="true">
      <use xlink:href="#icon-connected"></use>
    </svg>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const circleRef = ref(null)
const isShrinking = ref(false)
const percentage = ref(80)

const sharkAnimate = () => {
  requestAnimationFrame(() => {
    if (percentage.value > 0) {
      updatePercentage(Math.max(percentage.value - 5, 0))

      sharkAnimate()
    } else {
      console.log('Shrink animation completed')
    }
  })
}

const handleChange = () => {
  if (isShrinking.value) {
    updatePercentage(80)
  } else {
    sharkAnimate()
  }

  isShrinking.value = !isShrinking.value
}

const updatePercentage = (val) => {
  percentage.value = val
  circleRef.value.style.setProperty('--percentage', `${percentage.value}%`)
}

onMounted(() => {
  updatePercentage(percentage.value)
})
</script>

<style>
.circle-container {
  position: relative;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #3f92f9 0% var(--percentage),
    transparent var(--percentage) 100%
  );
  mask-image: radial-gradient(circle, transparent 40%, #f2f2f2 41%);
  mask-size: contain;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
