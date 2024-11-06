/*
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-05 10:26:07
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-06 10:01:47
 * @FilePath: \electron-ssh\tailwind.config.js
 * @Description: tailwindcss 配置 -- https://www.tailwindcss.cn/docs/installation
 */
/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/renderer/src/**/*.{html,js,vue}'],
  theme: {
    extend: {},
    screens: {
      xs: '475px',
      ...defaultTheme.screens
    }
  },
  plugins: []
}
