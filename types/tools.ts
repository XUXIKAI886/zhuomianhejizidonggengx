import { LucideIcon } from "lucide-react"

export interface Tool {
  id: number
  name: string
  description: string
  category: "运营工具" | "美工工具" | "销售工具" | "人事工具" | "客服工具"
  url: string
  icon: LucideIcon
  rating: number
  downloads: string
  tags: string[]
  color: string
  featured: boolean
  lastUpdated: string
  toolType: "web" | "desktop" | "integrated"
  integrationConfig?: {
    embedSupport: boolean
    apiEndpoint?: string
    authRequired: boolean
  }
}

export interface ToolUsageStats {
  [toolId: number]: number
}

export interface UserPreferences {
  favoriteTools: number[]
  recentlyUsed: number[]
  theme: "light" | "dark" | "system"
  autoLaunch: boolean
  showNotifications: boolean
}

export interface CategoryConfig {
  name: string
  color: string
  icon: LucideIcon
  count: number
}