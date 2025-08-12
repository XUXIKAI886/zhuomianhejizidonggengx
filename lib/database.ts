// MongoDB数据库连接工具
import { MongoClient, Db, Collection } from 'mongodb'
import bcrypt from 'bcryptjs'

const CONNECTION_STRING = 'mongodb://root:6scldk9f@dbconn.sealosbja.site:39056/?directConnection=true'
const DATABASE_NAME = 'chengshang_tools'

let client: MongoClient | null = null
let db: Db | null = null

// 获取数据库连接
export async function getDatabase(): Promise<Db> {
  if (!client) {
    client = new MongoClient(CONNECTION_STRING)
    await client.connect()
    db = client.db(DATABASE_NAME)
    console.log('📡 MongoDB connected successfully')
  }
  return db!
}

// 关闭数据库连接
export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    db = null
    console.log('📡 MongoDB connection closed')
  }
}

// 用户数据接口
export interface User {
  _id?: string
  username: string
  password?: string
  role: 'admin' | 'user'
  isActive: boolean
  createdAt: Date
  lastLoginAt?: Date | null
  totalUsageTime: number
  loginCount: number
}

// 用户响应接口（不包含密码）
export interface UserResponse {
  id: string
  username: string
  role: 'admin' | 'user'
  isActive: boolean
  createdAt: string
  lastLoginAt?: string | null
  totalUsageTime: number
  loginCount: number
}

// 系统统计接口
export interface SystemStats {
  totalUsers: number
  activeUsersToday: number
  totalSessions: number
  mostPopularTools: PopularTool[]
}

export interface PopularTool {
  toolId: number
  toolName: string
  totalClicks: number
  totalUsageTime: number
  uniqueUsers: number
}

// 密码哈希函数（与Rust后端保持一致）
export function hashPassword(password: string): string {
  const salt = 'chengshang2025'
  const crypto = require('crypto')
  const hasher = crypto.createHash('sha256')
  hasher.update(password)  // 先更新密码
  hasher.update(salt)      // 再更新盐值，与Rust后端保持一致
  return hasher.digest('hex')
}

// 验证密码
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

// 将User转换为UserResponse
export function userToResponse(user: User): UserResponse {
  return {
    id: user._id?.toString() || '',
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() || null,
    totalUsageTime: user.totalUsageTime,
    loginCount: user.loginCount
  }
}

// 数据库操作函数
export class DatabaseService {
  static async getUsers(): Promise<Collection<User>> {
    const db = await getDatabase()
    return db.collection<User>('users')
  }

  static async getUserSessions(): Promise<Collection> {
    const db = await getDatabase()
    return db.collection('user_sessions')
  }

  static async getToolUsage(): Promise<Collection> {
    const db = await getDatabase()
    return db.collection('tool_usage')
  }

  // 用户登录
  static async loginUser(username: string, password: string): Promise<UserResponse> {
    const users = await this.getUsers()
    
    const user = await users.findOne({ username })
    if (!user) {
      throw new Error('用户名或密码错误')
    }

    if (!verifyPassword(password, user.password!)) {
      throw new Error('用户名或密码错误')
    }

    if (!user.isActive) {
      throw new Error('账号已被禁用，请联系管理员')
    }

    // 更新最后登录时间和登录次数
    const now = new Date()
    await users.updateOne(
      { _id: user._id },
      {
        $set: { lastLoginAt: now },
        $inc: { loginCount: 1 }
      }
    )

    // 创建会话记录
    const sessions = await this.getUserSessions()
    await sessions.insertOne({
      userId: user._id,
      loginAt: now,
      logoutAt: null,
      sessionDuration: null
    })

    // 更新用户信息并返回
    user.lastLoginAt = now
    user.loginCount += 1
    
    return userToResponse(user)
  }

  // 用户登出
  static async logoutUser(userId: string): Promise<void> {
    const sessions = await this.getUserSessions()
    const { ObjectId } = require('mongodb')
    
    await sessions.updateOne(
      {
        userId: new ObjectId(userId),
        logoutAt: { $exists: false }
      },
      {
        $set: { logoutAt: new Date() }
      }
    )
  }

  // 获取所有用户（管理员功能）
  static async getAllUsers(): Promise<UserResponse[]> {
    const users = await this.getUsers()
    const userList = await users.find({}, { projection: { password: 0 } }).toArray()
    return userList.map(userToResponse)
  }

  // 获取系统概览
  static async getSystemOverview(): Promise<SystemStats> {
    const users = await this.getUsers()
    const sessions = await this.getUserSessions()
    
    const totalUsers = await users.countDocuments({ isActive: true })
    const totalSessions = await sessions.countDocuments()
    
    // 简化实现，可以后续优化
    const activeUsersToday = Math.min(totalUsers, Math.ceil(totalSessions / 2))
    
    return {
      totalUsers,
      activeUsersToday,
      totalSessions,
      mostPopularTools: [] // 可以后续实现
    }
  }

  // 记录用户活动
  static async trackUserActivity(
    userId: string, 
    activityType: string, 
    toolId?: number, 
    duration?: number
  ): Promise<void> {
    const { ObjectId } = require('mongodb')
    const userObjectId = new ObjectId(userId)
    
    if (activityType === 'tool_click' && toolId) {
      const toolUsage = await this.getToolUsage()
      
      await toolUsage.updateOne(
        { userId: userObjectId, toolId },
        {
          $inc: { clickCount: 1 },
          $set: { lastUsedAt: new Date() },
          $setOnInsert: {
            toolName: `工具${toolId}`,
            totalUsageTime: 0
          }
        },
        { upsert: true }
      )
    } else if (activityType === 'tool_usage' && toolId && duration) {
      const toolUsage = await this.getToolUsage()
      
      await toolUsage.updateOne(
        { userId: userObjectId, toolId },
        { $inc: { totalUsageTime: duration } }
      )
    }
  }

  // 切换用户状态
  static async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
    const users = await this.getUsers()
    const { ObjectId } = require('mongodb')
    
    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { isActive } }
    )
  }

  // 删除用户
  static async deleteUser(userId: string): Promise<void> {
    const users = await this.getUsers()
    const { ObjectId } = require('mongodb')
    
    await users.deleteOne({ _id: new ObjectId(userId) })
  }

  // 创建用户
  static async createUser(username: string, password: string, role: 'admin' | 'user' = 'user'): Promise<UserResponse> {
    const users = await this.getUsers()
    
    // 检查用户名是否已存在
    const existingUser = await users.findOne({ username })
    if (existingUser) {
      throw new Error('用户名已存在')
    }

    // 创建新用户
    const newUser: User = {
      username,
      password: hashPassword(password),
      role,
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: null,
      totalUsageTime: 0,
      loginCount: 0
    }

    const result = await users.insertOne(newUser)
    newUser._id = result.insertedId.toString()

    return userToResponse(newUser)
  }

  // 更新用户信息
  static async updateUser(userId: string, updates: {
    username?: string
    role?: 'admin' | 'user'
    isActive?: boolean
  }): Promise<UserResponse> {
    const users = await this.getUsers()
    const { ObjectId } = require('mongodb')
    
    // 如果更新用户名，需要检查是否重复
    if (updates.username) {
      const existingUser = await users.findOne({ 
        username: updates.username,
        _id: { $ne: new ObjectId(userId) }
      })
      if (existingUser) {
        throw new Error('用户名已存在')
      }
    }

    // 更新用户
    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updates }
    )

    // 返回更新后的用户信息
    const updatedUser = await users.findOne({ _id: new ObjectId(userId) })
    if (!updatedUser) {
      throw new Error('用户不存在')
    }

    return userToResponse(updatedUser)
  }

  // 重置用户密码
  static async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    const users = await this.getUsers()
    const { ObjectId } = require('mongodb')
    
    await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashPassword(newPassword) } }
    )
  }
}