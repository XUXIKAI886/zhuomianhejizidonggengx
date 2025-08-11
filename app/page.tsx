"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { ToolGrid } from "@/components/tool-grid"
import { StatsCards } from "@/components/stats-cards"
import { AuthGuard } from "@/components/auth/auth-guard"
import { useState } from "react"

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("全部工具")
  const [searchQuery, setSearchQuery] = useState("")

  // 处理搜索查询变化
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    // 如果有搜索内容，自动切换到"全部工具"以显示所有匹配结果
    if (query.trim() && activeCategory !== "全部工具") {
      setActiveCategory("全部工具")
    }
  }

  return (
    <AuthGuard>
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900/50">
      <Header searchQuery={searchQuery} onSearchChange={handleSearchChange} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Welcome Section */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-3xl"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-gray-700/20 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">
                        欢迎使用呈尚策划工具中心
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300 text-lg">集成运营、美工、销售、人事、客服等专业工具，一站式提升团队协作效率</p>
                    </div>
                    <div className="hidden lg:block">
                      <div className="relative">
                        <div className="w-32 h-32 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20 dark:border-gray-600/20">
                          <img
                            src="/welcome-image.png"
                            alt="呈尚策划工具中心"
                            className="w-full h-full object-contain rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <StatsCards />

              {/* Tools Grid */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {searchQuery ? `搜索结果: "${searchQuery}"` : (activeCategory === "全部工具" ? "精选工具" : activeCategory)}
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>实时更新</span>
                  </div>
                </div>
                <ToolGrid category={activeCategory} searchQuery={searchQuery} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    </AuthGuard>
  )
}
