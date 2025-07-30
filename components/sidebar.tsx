"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Layers, TrendingUp, Palette, ShoppingCart, Users, MessageCircle, Star, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const categories = [
  { id: "all", name: "全部工具", icon: Layers, count: 19, color: "from-gray-300 to-gray-400" },
  { id: "operations", name: "运营工具", icon: TrendingUp, count: 10, color: "from-blue-300 to-blue-400", hot: true },
  { id: "design", name: "美工工具", icon: Palette, count: 2, color: "from-purple-300 to-purple-400" },
  { id: "sales", name: "销售工具", icon: ShoppingCart, count: 2, color: "from-emerald-300 to-emerald-400" },
  { id: "hr", name: "人事工具", icon: Users, count: 4, color: "from-amber-300 to-amber-400" },
  { id: "service", name: "客服工具", icon: MessageCircle, count: 1, color: "from-rose-300 to-rose-400", new: true },
]

interface SidebarProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function Sidebar({ activeCategory, onCategoryChange }: SidebarProps) {

  return (
    <aside className="w-72 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50 shadow-lg">
      <div className="p-6">
        {/* Category Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">工具分类</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">选择您需要的工具类型</p>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = activeCategory === category.name
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.name)}
                className={cn(
                  "w-full group relative overflow-hidden rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200/50 dark:border-blue-700/50 shadow-md scale-[1.02]"
                    : "hover:bg-gray-50/80 dark:hover:bg-gray-700/50 hover:scale-[1.01]",
                )}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
                        isActive
                          ? `bg-gradient-to-br ${category.color} shadow-lg`
                          : "bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600",
                      )}
                    >
                      <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-white" : "text-gray-600 dark:text-gray-300")} />
                    </div>
                    <div className="text-left">
                      <span
                        className={cn("font-medium transition-colors", isActive ? "text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-200")}
                      >
                        {category.name}
                      </span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{category.count} 个工具</span>
                        {category.hot && (
                          <Badge className="bg-rose-400 hover:bg-rose-400 text-white text-xs px-1.5 py-0.5 h-5">
                            <Zap className="w-3 h-3 mr-1" />
                            热门
                          </Badge>
                        )}
                        {category.new && (
                          <Badge className="bg-emerald-400 hover:bg-emerald-400 text-white text-xs px-1.5 py-0.5 h-5">
                            <Star className="w-3 h-3 mr-1" />
                            新增
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-8 bg-gradient-to-b from-blue-300 to-purple-400 rounded-full"></div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">快速操作</h3>
          <div className="space-y-2">
            <button className="w-full text-left text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              📊 查看使用统计
            </button>
            <button className="w-full text-left text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              ⭐ 我的收藏
            </button>
            <button className="w-full text-left text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              🔄 最近使用
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
