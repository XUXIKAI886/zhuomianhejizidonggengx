'use client'

import { AdminGuard } from '@/components/auth/auth-guard'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { MoreHorizontal, UserPlus, Edit, Trash2, RotateCcw, Users, Activity, TrendingUp, Database, Shuffle, Copy, Home } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { apiCall } from '@/lib/tauri-api'
import { MongoDBDashboard } from '@/components/admin/mongodb-dashboard'
import { useRouter } from 'next/navigation'

// 类型定义
interface AdminUser {
  id: string
  username: string
  role: 'admin' | 'user'
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
  totalUsageTime: number
  loginCount: number
}

interface SystemStats {
  totalUsers: number
  activeUsersToday: number
  totalSessions: number
  mostPopularTools: Array<{
    toolId: number
    toolName: string
    totalClicks: number
    totalUsageTime: number
    uniqueUsers: number
  }>
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [createUserForm, setCreateUserForm] = useState({
    username: '',
    password: '',
    role: 'user' as 'admin' | 'user'
  })
  const [editUserForm, setEditUserForm] = useState({
    username: '',
    role: 'user' as 'admin' | 'user',
    isActive: true
  })
  const [resetPasswordForm, setResetPasswordForm] = useState({
    userId: '',
    newPassword: ''
  })

  // 加载数据
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersData, statsData] = await Promise.all([
        apiCall('get_all_users_admin'),
        apiCall('get_system_analytics')
      ])
      setUsers(usersData)
      setStats(statsData)
    } catch (error) {
      console.error('加载数据失败:', error)
      toast.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await apiCall('toggle_user_status', { userId })
      toast.success(isActive ? '用户已启用' : '用户已禁用')

      // 在开发模式下直接更新本地状态，避免重新加载
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, isActive }
            : user
        )
      )

      // 仍然调用loadData以保持一致性
      loadData()
    } catch (error) {
      console.error('切换用户状态失败:', error)
      toast.error('操作失败')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await apiCall('delete_user', { userId })
      toast.success('用户已删除')

      // 在开发模式下直接更新本地状态
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId))

      // 仍然调用loadData以保持一致性
      loadData()
    } catch (error) {
      console.error('删除用户失败:', error)
      toast.error('删除失败')
    }
  }

  // 生成随机密码
  const generateRandomPassword = () => {
    const length = 12
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    
    // 确保包含至少一个大写字母、小写字母、数字和特殊字符
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
    password += '0123456789'[Math.floor(Math.random() * 10)]
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
    
    // 填充剩余位数
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)]
    }
    
    // 打乱密码字符顺序
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  // 生成并设置随机密码
  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword()
    setCreateUserForm(prev => ({ ...prev, password: newPassword }))
    toast.success('密码已生成')
  }

  // 复制用户信息到剪贴板
  const handleCopyUserInfo = async () => {
    const { username, password } = createUserForm
    if (!username || !password) {
      toast.error('请先填写完整用户信息')
      return
    }

    const userInfo = `用户名: ${username}\n密码: ${password}`
    
    try {
      await navigator.clipboard.writeText(userInfo)
      toast.success('用户信息已复制到剪贴板')
    } catch (error) {
      // 备用方案：创建临时textarea元素
      const textArea = document.createElement('textarea')
      textArea.value = userInfo
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        toast.success('用户信息已复制到剪贴板')
      } catch (fallbackError) {
        toast.error('复制失败，请手动复制')
      }
      
      document.body.removeChild(textArea)
    }
  }

  // 创建用户
  const handleCreateUser = async () => {
    try {
      const { username, password, role } = createUserForm
      
      if (!username || !password) {
        toast.error('用户名和密码不能为空')
        return
      }

      await apiCall('create_user', { username, password, role })
      toast.success('用户创建成功')
      
      // 重置表单
      setCreateUserForm({ username: '', password: '', role: 'user' })
      setShowCreateDialog(false)
      
      // 重新加载数据
      loadData()
    } catch (error) {
      console.error('创建用户失败:', error)
      toast.error(error instanceof Error ? error.message : '创建失败')
    }
  }

  // 编辑用户
  const handleEditUser = async () => {
    if (!editingUser) return

    try {
      const { username, role, isActive } = editUserForm
      
      await apiCall('edit_user', { 
        userId: editingUser.id, 
        username, 
        role, 
        isActive 
      })
      toast.success('用户更新成功')
      
      // 关闭编辑对话框
      setEditingUser(null)
      
      // 重新加载数据
      loadData()
    } catch (error) {
      console.error('编辑用户失败:', error)
      toast.error(error instanceof Error ? error.message : '更新失败')
    }
  }

  // 重置密码
  const handleResetPassword = async (userId: string) => {
    const newPassword = prompt('请输入新密码（至少6个字符）:')
    if (!newPassword) return
    
    if (newPassword.length < 6) {
      toast.error('密码至少需要6个字符')
      return
    }

    try {
      await apiCall('reset_user_password', { userId, newPassword })
      toast.success('密码重置成功')
    } catch (error) {
      console.error('重置密码失败:', error)
      toast.error('重置密码失败')
    }
  }

  // 打开编辑对话框
  const openEditDialog = (user: AdminUser) => {
    setEditingUser(user)
    setEditUserForm({
      username: user.username,
      role: user.role,
      isActive: user.isActive
    })
  }

  const formatUsageTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AdminGuard>
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900/50">
        <Header />
        
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* 页面标题 */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  系统管理
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  管理用户账号、查看系统统计和监控应用状态
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
              >
                <Home className="w-4 h-4" />
                返回主页
              </Button>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总用户数</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    系统注册用户总数
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">今日活跃</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeUsersToday || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    今日登录用户数
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总会话数</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalSessions || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    累计登录会话
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">数据库状态</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">正常</div>
                  <p className="text-xs text-muted-foreground">
                    MongoDB连接正常
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 主要内容 */}
            <Tabs defaultValue="users" className="space-y-4">
              <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <TabsTrigger value="users">用户管理</TabsTrigger>
                <TabsTrigger value="analytics">MongoDB 分析</TabsTrigger>
                <TabsTrigger value="statistics">数据统计</TabsTrigger>
                <TabsTrigger value="tools">工具分析</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-4">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>用户管理</CardTitle>
                        <CardDescription>管理系统用户账号和权限</CardDescription>
                      </div>
                      <Button onClick={() => setShowCreateDialog(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        新增用户
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>用户名</TableHead>
                            <TableHead>角色</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>创建时间</TableHead>
                            <TableHead>最后登录</TableHead>
                            <TableHead>登录次数</TableHead>
                            <TableHead>使用时长</TableHead>
                            <TableHead>操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.username}</TableCell>
                              <TableCell>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                  {user.role === 'admin' ? '管理员' : '用户'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Switch
                                  checked={user.isActive}
                                  onCheckedChange={(checked) => handleToggleUserStatus(user.id, checked)}
                                />
                              </TableCell>
                              <TableCell>{formatDate(user.createdAt)}</TableCell>
                              <TableCell>
                                {user.lastLoginAt ? formatDate(user.lastLoginAt) : '从未登录'}
                              </TableCell>
                              <TableCell>{user.loginCount}</TableCell>
                              <TableCell>{formatUsageTime(user.totalUsageTime)}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      编辑
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                                      <RotateCcw className="mr-2 h-4 w-4" />
                                      重置密码
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem 
                                          className="text-red-600"
                                          onSelect={(e) => e.preventDefault()}
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          删除
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>确认删除用户</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            此操作将永久删除用户 "{user.username}" 及其所有数据。此操作不可恢复。
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>取消</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            删除
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <MongoDBDashboard />
              </TabsContent>

              <TabsContent value="statistics" className="space-y-4">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                  <CardHeader>
                    <CardTitle>数据统计</CardTitle>
                    <CardDescription>系统使用情况和用户行为分析</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">统计功能开发中...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tools" className="space-y-4">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
                  <CardHeader>
                    <CardTitle>工具使用分析</CardTitle>
                    <CardDescription>各工具的使用情况和受欢迎程度</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.mostPopularTools?.map((tool, index) => (
                        <div key={tool.toolId} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Badge variant="secondary">#{index + 1}</Badge>
                            <div>
                              <p className="font-medium">{tool.toolName}</p>
                              <p className="text-sm text-gray-500">
                                {tool.uniqueUsers} 个用户使用
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{tool.totalClicks} 次点击</p>
                            <p className="text-sm text-gray-500">
                              {formatUsageTime(tool.totalUsageTime)}
                            </p>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">暂无工具使用数据</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* 创建用户对话框 */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增用户</DialogTitle>
              <DialogDescription>创建新的用户账户</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-username" className="text-right">用户名</Label>
                <Input 
                  id="create-username" 
                  className="col-span-3"
                  value={createUserForm.username}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="至少3个字符"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-password" className="text-right">密码</Label>
                <div className="col-span-3 flex gap-2">
                  <Input 
                    id="create-password" 
                    type="password" 
                    className="flex-1"
                    value={createUserForm.password}
                    onChange={(e) => setCreateUserForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="至少6个字符"
                  />
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={handleGeneratePassword}
                    className="px-3"
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-role" className="text-right">角色</Label>
                <Select 
                  value={createUserForm.role} 
                  onValueChange={(value) => setCreateUserForm(prev => ({ ...prev, role: value as 'admin' | 'user' }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">用户</SelectItem>
                    <SelectItem value="admin">管理员</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                取消
              </Button>
              <Button onClick={handleCreateUser}>创建用户</Button>
              <Button 
                variant="outline" 
                onClick={handleCopyUserInfo}
                className="ml-2"
              >
                <Copy className="h-4 w-4 mr-2" />
                复制
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 编辑用户对话框 */}
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑用户</DialogTitle>
              <DialogDescription>修改用户信息</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-username" className="text-right">用户名</Label>
                <Input 
                  id="edit-username" 
                  className="col-span-3"
                  value={editUserForm.username}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">角色</Label>
                <Select 
                  value={editUserForm.role} 
                  onValueChange={(value) => setEditUserForm(prev => ({ ...prev, role: value as 'admin' | 'user' }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">用户</SelectItem>
                    <SelectItem value="admin">管理员</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-active" className="text-right">状态</Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch
                    id="edit-active"
                    checked={editUserForm.isActive}
                    onCheckedChange={(checked) => setEditUserForm(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="edit-active">
                    {editUserForm.isActive ? '启用' : '禁用'}
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                取消
              </Button>
              <Button onClick={handleEditUser}>保存更改</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  )
}
