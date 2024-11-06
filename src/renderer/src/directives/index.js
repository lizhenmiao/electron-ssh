/*
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-06 18:10:44
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-06 18:12:43
 * @FilePath: \electron-ssh\src\renderer\src\directives\index.js
 * @Description: 自定义指令
 */
import ellipsisTooltip from './ellipsisTooltip'

// 自定义指令
const directives = {
  ellipsisTooltip
}

export default {
  install(Vue) {
    Object.keys(directives).forEach((key) => {
      Vue.directive(key, directives[key])
    })
  }
}
