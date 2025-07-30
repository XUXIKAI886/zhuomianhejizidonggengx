import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, Zap, Plus } from "lucide-react"
import { toolsData, getCategoryStats } from "@/lib/tool-data"

export function StatsCards() {
  const categoryStats = getCategoryStats()
  
  // 计算总使用量（模拟数据）
  const totalUsage = toolsData.reduce((sum, tool) => {
    const downloads = tool.downloads.replace('k', '000').replace('.', '')
    return sum + parseInt(downloads)
  }, 0)
  
  const stats = [
    {
      title: "总工具数",
      value: categoryStats.total.toString(),
      change: `+${categoryStats.featured}`,
      changeType: "positive" as const,
      icon: Zap,
      color: "from-blue-300 to-blue-400",
      subtitle: "精选工具"
    },
    {
      title: "预计开发",
      value: "20",
      change: "规划中",
      changeType: "neutral" as const,
      icon: Plus,
      color: "from-amber-300 to-amber-400",
      subtitle: "新增工具"
    },
    {
      title: "总使用量",
      value: `${Math.round(totalUsage / 1000)}k`,
      change: "+15%",
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "from-emerald-300 to-emerald-400",
      subtitle: "本月增长"
    },
    {
      title: "工具分类",
      value: Object.keys(categoryStats.categories).length.toString(),
      change: "完整覆盖",
      changeType: "neutral" as const,
      icon: Users,
      color: "from-purple-300 to-purple-400",
      subtitle: "岗位需求"
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={index}
            className="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-700/50"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span 
                      className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-emerald-500 dark:text-emerald-400' :
                        stat.changeType === 'negative' ? 'text-rose-500 dark:text-rose-400' : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{stat.subtitle}</span>
                  </div>
                </div>
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
