/*
 * @Author: lizhenmiao 431521978@qq.com
 * @Date: 2024-11-06 18:11:06
 * @LastEditors: lizhenmiao 431521978@qq.com
 * @LastEditTime: 2024-11-08 13:57:59
 * @FilePath: \electron-ssh\src\renderer\src\directives\ellipsisTooltip.js
 * @Description: 文本超出显示省略号以及鼠标悬浮显示 tooltip
 */

const backgroundColor = '#2a2a2a'

const ellipsisTooltip = {
  mounted(el, binding) {
    applyStyles(el, {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    })

    // 创建或获取全局 Tooltip 实例
    if (!globalTooltip) {
      globalTooltip = createTooltip()
    }

    const maxWidth = binding.value?.maxWidth || null // 仅在提供时设置最大宽度
    const preferredDirection = binding.value?.direction || 'bottom' // 默认方向为下方

    const showTooltip = () => {
      if (!globalTooltip) return

      // 更新 tooltip 文本内容
      globalTooltip.textElement.textContent = el.textContent

      // 清除 tooltip.textElement 上的选中文本
      // clearTextSelection(globalTooltip.textElement)

      applyStyles(globalTooltip, {
        // 设置最大宽度
        maxWidth: maxWidth ? `${maxWidth}px` : '',
        visibility: 'visible',
        opacity: 1,
        transform: 'translateY(0)'
      })

      const rect = el.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const tooltipRect = globalTooltip.getBoundingClientRect()

      // 默认显示在指定方向
      let top, left
      let adjustedDirection = preferredDirection

      // tooltip 距离元素的距离
      const margin = 10

      const fitsBottom = rect.bottom + tooltipRect.height + margin <= viewportHeight
      const fitsTop = rect.top - tooltipRect.height - margin >= 0
      const fitsRight = rect.right + tooltipRect.width + margin <= viewportWidth
      const fitsLeft = rect.left - tooltipRect.width - margin >= 0

      if (adjustedDirection === 'bottom' && !fitsBottom) {
        adjustedDirection = fitsTop ? 'top' : fitsRight ? 'right' : 'left'
      }
      if (adjustedDirection === 'top' && !fitsTop) {
        adjustedDirection = fitsBottom ? 'bottom' : fitsRight ? 'right' : 'left'
      }
      if (adjustedDirection === 'right' && !fitsRight) {
        adjustedDirection = fitsLeft ? 'left' : fitsBottom ? 'bottom' : 'top'
      }
      if (adjustedDirection === 'left' && !fitsLeft) {
        adjustedDirection = fitsRight ? 'right' : fitsBottom ? 'bottom' : 'top'
      }

      switch (adjustedDirection) {
        case 'top':
          top = rect.top - tooltipRect.height - margin
          left = rect.left + rect.width / 2 - tooltipRect.width / 2

          applyStyles(globalTooltip.arrow, {
            borderWidth: '5px 5px 0 5px',
            borderColor: `${backgroundColor} transparent transparent transparent`,
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)'
          })

          break
        case 'right':
          top = rect.top + rect.height / 2 - tooltipRect.height / 2
          left = rect.right + margin

          applyStyles(globalTooltip.arrow, {
            borderWidth: '5px 5px 5px 0',
            borderColor: `transparent ${backgroundColor} transparent transparent`,
            top: '50%',
            left: '-5px',
            transform: 'translateY(-50%)'
          })

          break
        case 'left':
          top = rect.top + rect.height / 2 - tooltipRect.height / 2
          left = rect.left - tooltipRect.width - margin

          applyStyles(globalTooltip.arrow, {
            borderWidth: '5px 0 5px 5px',
            borderColor: `transparent transparent transparent ${backgroundColor}`,
            top: '50%',
            left: '100%',
            transform: 'translateY(-50%)'
          })

          break
        default:
          // 'bottom'
          top = rect.bottom + margin
          left = rect.left + rect.width / 2 - tooltipRect.width / 2

          applyStyles(globalTooltip.arrow, {
            borderWidth: '0 5px 5px 5px',
            borderColor: `transparent transparent ${backgroundColor} transparent`,
            top: '-5px',
            left: '50%',
            transform: 'translateX(-50%)'
          })

          break
      }

      // 确保 tooltip 不会超出视口
      if (left < margin) left = margin
      if (left + tooltipRect.width > viewportWidth) {
        left = viewportWidth - tooltipRect.width - margin
      }

      applyStyles(globalTooltip, {
        top: `${top}px`,
        left: `${left}px`
      })
    }

    const hideTooltip = () => {
      setTimeout(() => {
        if (!isHovering) {
          applyStyles(globalTooltip, {
            opacity: 0,
            transform: 'translateY(-10px)'
          })
          setTimeout(() => {
            applyStyles(globalTooltip, 'visibility', 'hidden')
          }, 200) // 延迟以等待动画完成
        }
      }, 300)
    }

    const onMouseEnter = () => {
      if (el.scrollWidth > el.clientWidth) {
        isHovering = true
        showTooltip()
      }
    }

    const onMouseLeave = () => {
      isHovering = false
      hideTooltip()
    }

    const onTooltipMouseEnter = () => {
      isHovering = true
    }

    const onTooltipMouseLeave = () => {
      isHovering = false
      hideTooltip()
    }

    el.addEventListener('mouseenter', onMouseEnter)
    el.addEventListener('mouseleave', onMouseLeave)

    if (globalTooltip) {
      globalTooltip.addEventListener('mouseenter', onTooltipMouseEnter)
      globalTooltip.addEventListener('mouseleave', onTooltipMouseLeave)
    }
  },
  unmounted() {
    if (globalTooltip) {
      globalTooltip.remove()
      globalTooltip = null
    }
  }
}

/**
 * 创建并初始化一个 tooltip 元素。
 * @returns {HTMLElement} 创建的 tooltip 元素。
 */
function createTooltip() {
  const tooltip = document.createElement('div')
  applyStyles(tooltip, {
    position: 'fixed',
    whiteSpace: 'normal',
    backgroundColor,
    color: 'white',
    padding: '8px 15px',
    borderRadius: '4px',
    visibility: 'hidden',
    zIndex: 999999999,
    boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)',
    transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
    opacity: 0,
    transform: 'translateY(-10px)',
    pointerEvents: 'all',
    userSelect: 'text',
    cursor: 'auto'
  })

  // 创建文本元素
  const textElement = document.createElement('span')
  tooltip.appendChild(textElement)
  tooltip.textElement = textElement
  applyStyles(tooltip.textElement, {
    display: 'block',
    overflow: 'hidden',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    wordBreak: 'break-word',
    fontSize: '16px',
    lineHeight: 1.5
  })

  // 创建箭头元素
  const arrow = document.createElement('div')
  applyStyles(arrow, {
    position: 'absolute',
    width: '0',
    height: '0',
    borderStyle: 'solid'
  })
  tooltip.appendChild(arrow)

  document.body.appendChild(tooltip)
  tooltip.arrow = arrow
  return tooltip
}

/**
 * 清除指定元素上的文本选择。
 * @param {HTMLElement} element - 需要清除文本选择的元素。
 */
/* function clearTextSelection(element) {
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    // 判断当前选中范围是否在指定元素内
    if (element.contains(range.startContainer)) {
      selection.removeAllRanges() // 仅清除指定元素的选中
    }
  }
} */

/**
 * 应用一组样式到指定的元素上。
 * @param {HTMLElement} element - 需要应用样式的元素。
 * @param {Object|string} styles - 样式对象或单个样式名。
 * @param {string} [value] - 单个样式的值（如果 styles 是字符串）。
 */
function applyStyles(element, styles, value) {
  if (!element) return

  if (typeof styles === 'object') {
    for (const property in styles) {
      if (Object.prototype.hasOwnProperty.call(styles, property)) {
        element.style[property] = styles[property]
      }
    }
  } else if (typeof styles === 'string' && value !== undefined) {
    element.style[styles] = value
  }
}

let globalTooltip = null
let isHovering = false

export default ellipsisTooltip
