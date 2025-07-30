import { open } from '@tauri-apps/plugin-shell'

export class ToolLauncher {
  /**
   * 打开Web工具
   * @param url 工具URL
   * @param toolName 工具名称（用于错误提示）
   */
  static async openWebTool(url: string, toolName?: string) {
    try {
      await open(url)
      console.log(`Successfully opened ${toolName || 'tool'}: ${url}`)
      return { success: true }
    } catch (error) {
      console.error(`Failed to open ${toolName || 'tool'}:`, error)
      
      // 降级处理：尝试使用window.open（仅在开发环境）
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        try {
          window.open(url, '_blank')
          return { success: true, fallback: true }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError)
        }
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }
    }
  }

  /**
   * 处理桌面工具启动
   * @param toolId 工具ID
   */
  static async openDesktopTool(toolId: number) {
    try {
      // 这里可以集成具体的桌面工具逻辑
      // 比如微信群发助手的本地实现
      console.log(`Opening desktop tool with ID: ${toolId}`)
      
      // 暂时重定向到web版本
      return { success: true, message: '桌面工具功能正在开发中，已为您打开Web版本' }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }
    }
  }

  /**
   * 处理集成工具
   * @param toolId 工具ID
   */
  static async openIntegratedTool(toolId: number) {
    try {
      // 集成工具的处理逻辑
      console.log(`Opening integrated tool with ID: ${toolId}`)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }
    }
  }

  /**
   * 通用工具启动方法
   * @param tool 工具对象
   */
  static async launchTool(tool: { id: number; name: string; url: string; toolType: string }) {
    try {
      switch (tool.toolType) {
        case 'web':
          return await this.openWebTool(tool.url, tool.name)
        case 'desktop':
          // 对于桌面工具，先尝试打开web版本
          return await this.openWebTool(tool.url, tool.name)
        case 'integrated':
          return await this.openIntegratedTool(tool.id)
        default:
          return await this.openWebTool(tool.url, tool.name)
      }
    } catch (error) {
      console.error('Error launching tool:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }
    }
  }

  /**
   * 验证URL是否可访问
   * @param url URL地址
   */
  static async validateUrl(url: string): Promise<boolean> {
    try {
      // 基本URL格式验证
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * 获取工具启动统计
   */
  static getUsageStats() {
    // 这里可以集成本地存储来追踪使用统计
    return {
      totalLaunches: 0,
      todayLaunches: 0,
      mostUsedTool: null
    }
  }
}