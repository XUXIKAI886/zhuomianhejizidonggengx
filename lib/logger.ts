// 日志管理系统
import fs from 'fs'
import path from 'path'

// 日志级别
export enum LogLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS', 
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

// 日志接口
export interface LogEntry {
  timestamp: string
  level: LogLevel
  category: string
  action: string
  details: any
  userId?: string
  ip?: string
  userAgent?: string
}

// 日志管理类
export class Logger {
  private static logDir = path.join(process.cwd(), 'logs')
  
  static {
    // 确保日志目录存在
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  // 记录日志
  static log(
    level: LogLevel,
    category: string,
    action: string,
    details: any,
    request?: Request,
    userId?: string
  ): void {
    const timestamp = new Date().toISOString()
    const ip = this.getClientIP(request)
    const userAgent = request?.headers.get('user-agent') || 'Unknown'

    const logEntry: LogEntry = {
      timestamp,
      level,
      category,
      action,
      details,
      userId,
      ip,
      userAgent: userAgent.substring(0, 200) // 限制长度
    }

    // 控制台输出
    this.logToConsole(logEntry)
    
    // 文件输出
    this.logToFile(logEntry)
  }

  // 控制台日志输出
  private static logToConsole(entry: LogEntry): void {
    const color = this.getLogColor(entry.level)
    const resetColor = '\x1b[0m'
    
    const message = `${color}[${entry.timestamp}] ${entry.level} - ${entry.category}:${entry.action}${resetColor}`
    const details = entry.details ? ` | ${JSON.stringify(entry.details)}` : ''
    const user = entry.userId ? ` | User: ${entry.userId}` : ''
    const ip = entry.ip ? ` | IP: ${entry.ip}` : ''
    
    console.log(`${message}${details}${user}${ip}`)
  }

  // 文件日志输出
  private static logToFile(entry: LogEntry): void {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const logFileName = `${today}-admin.log`
    const logFilePath = path.join(this.logDir, logFileName)
    
    const logLine = JSON.stringify(entry) + '\n'
    
    try {
      fs.appendFileSync(logFilePath, logLine, 'utf8')
    } catch (error) {
      console.error('写入日志文件失败:', error)
    }
  }

  // 获取客户端IP
  private static getClientIP(request?: Request): string {
    if (!request) return 'Unknown'
    
    // 尝试从各种头部获取真实IP
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfIP = request.headers.get('cf-connecting-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    if (realIP) {
      return realIP
    }
    if (cfIP) {
      return cfIP
    }
    
    return 'Unknown'
  }

  // 获取日志颜色
  private static getLogColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.SUCCESS:
        return '\x1b[32m' // 绿色
      case LogLevel.INFO:
        return '\x1b[36m' // 青色
      case LogLevel.WARNING:
        return '\x1b[33m' // 黄色
      case LogLevel.ERROR:
        return '\x1b[31m' // 红色
      case LogLevel.DEBUG:
        return '\x1b[35m' // 紫色
      default:
        return '\x1b[0m'  // 默认
    }
  }

  // 便捷方法
  static info(category: string, action: string, details?: any, request?: Request, userId?: string) {
    this.log(LogLevel.INFO, category, action, details, request, userId)
  }

  static success(category: string, action: string, details?: any, request?: Request, userId?: string) {
    this.log(LogLevel.SUCCESS, category, action, details, request, userId)
  }

  static warning(category: string, action: string, details?: any, request?: Request, userId?: string) {
    this.log(LogLevel.WARNING, category, action, details, request, userId)
  }

  static error(category: string, action: string, details?: any, request?: Request, userId?: string) {
    this.log(LogLevel.ERROR, category, action, details, request, userId)
  }

  static debug(category: string, action: string, details?: any, request?: Request, userId?: string) {
    this.log(LogLevel.DEBUG, category, action, details, request, userId)
  }

  // 读取日志文件
  static async readLogs(date?: string, category?: string, limit?: number): Promise<LogEntry[]> {
    const targetDate = date || new Date().toISOString().split('T')[0]
    const logFileName = `${targetDate}-admin.log`
    const logFilePath = path.join(this.logDir, logFileName)
    
    try {
      if (!fs.existsSync(logFilePath)) {
        return []
      }
      
      const content = fs.readFileSync(logFilePath, 'utf8')
      const lines = content.trim().split('\n').filter(line => line)
      
      let logs: LogEntry[] = lines.map(line => {
        try {
          return JSON.parse(line)
        } catch {
          return null
        }
      }).filter(Boolean)
      
      // 按类别过滤
      if (category) {
        logs = logs.filter(log => log.category === category)
      }
      
      // 限制数量（从最新开始）
      if (limit) {
        logs = logs.slice(-limit)
      }
      
      return logs.reverse() // 最新的在前面
      
    } catch (error) {
      console.error('读取日志文件失败:', error)
      return []
    }
  }

  // 获取可用的日志日期列表
  static getAvailableDates(): string[] {
    try {
      const files = fs.readdirSync(this.logDir)
      const logFiles = files
        .filter(file => file.endsWith('-admin.log'))
        .map(file => file.replace('-admin.log', ''))
        .sort()
        .reverse()
      
      return logFiles
    } catch (error) {
      console.error('读取日志目录失败:', error)
      return []
    }
  }
}