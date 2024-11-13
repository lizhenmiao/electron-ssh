<template>
  <div class="h-full flex flex-col">
    <section
      v-if="$slots.header"
      class="flex-shrink-0 flex items-center flex-wrap bg-[#F5F7FA] px-4 h-[3rem]"
    >
      <slot name="header"></slot>
    </section>
    <el-divider v-if="$slots.header" class="m-0" />
    <div v-if="$slots.headerBottom" class="p-2 bg-[#F5F7FA]">
      <slot name="headerBottom"></slot>
    </div>
    <el-divider v-if="$slots.headerBottom" class="m-0" />
    <el-scrollbar v-if="$slots.default" class="flex-1 p-4 bg-[#EDF1F2]">
      <slot></slot>
    </el-scrollbar>
    <slot v-if="$slots.extra" name="extra"></slot>
  </div>
</template>
