"use client"

import { useEffect } from 'react'

export function DevToolsBlocker() {
  useEffect(() => {
    // 禁用右键菜单
    const disableContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // 禁用F12和其他开发者工具快捷键
    const disableDevToolsKeys = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault()
        return false
      }
      
      // Ctrl+Shift+I (开发者工具)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault()
        return false
      }
      
      // Ctrl+Shift+J (控制台)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault()
        return false
      }
      
      // Ctrl+U (查看源代码)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault()
        return false
      }
      
      // Ctrl+Shift+C (选择元素)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        return false
      }
      
      // Ctrl+S (保存页面)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        return false
      }
      
      // Ctrl+A (全选)
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault()
        return false
      }
      
      // Ctrl+P (打印)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault()
        return false
      }
    }

    // 禁用文本选择
    const disableTextSelection = () => {
      document.body.style.userSelect = 'none'
      document.body.style.webkitUserSelect = 'none'
      document.body.style.mozUserSelect = 'none'
      document.body.style.msUserSelect = 'none'
    }

    // 禁用拖拽
    const disableDragDrop = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    // 检测开发者工具是否打开
    const detectDevTools = () => {
      const threshold = 160
      
      setInterval(() => {
        if (
          window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold
        ) {
          // 开发者工具可能已打开，可以在这里添加处理逻辑
          console.clear()
        }
      }, 500)
    }

    // 清空控制台
    const clearConsole = () => {
      setInterval(() => {
        console.clear()
      }, 1000)
    }

    // 添加事件监听器
    document.addEventListener('contextmenu', disableContextMenu)
    document.addEventListener('keydown', disableDevToolsKeys)
    document.addEventListener('dragstart', disableDragDrop)
    document.addEventListener('drop', disableDragDrop)
    
    // 应用样式
    disableTextSelection()
    
    // 启动检测和清理
    detectDevTools()
    clearConsole()

    // 清理函数
    return () => {
      document.removeEventListener('contextmenu', disableContextMenu)
      document.removeEventListener('keydown', disableDevToolsKeys)
      document.removeEventListener('dragstart', disableDragDrop)
      document.removeEventListener('drop', disableDragDrop)
      
      // 恢复文本选择
      document.body.style.userSelect = ''
      document.body.style.webkitUserSelect = ''
      document.body.style.mozUserSelect = ''
      document.body.style.msUserSelect = ''
    }
  }, [])

  return null // 这个组件不渲染任何内容
}
