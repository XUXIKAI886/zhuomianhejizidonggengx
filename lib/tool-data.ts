import {
  MessageSquare,
  BookOpen,
  Workflow,
  BarChart3,
  TrendingUp,
  Bot,
  MessageCircle,
  Target,
  Database,
  Sparkles,
  ImageIcon,
  Edit,
  ShoppingCart,
  FileText,
  Calculator,
  Calendar,
  UserCheck,
  PieChart,
  Search,
} from "lucide-react"
import { Tool } from "@/types/tools"

export const toolsData: Tool[] = [
  {
    id: 1,
    name: "商家回复解答手册",
    description: "提供标准化的客户反馈处理模板和沟通技巧",
    category: "运营工具",
    url: "https://xuxikai886.github.io/shangjiahuizong/",
    icon: MessageSquare,
    rating: 4.8,
    downloads: "2.1k",
    tags: ["回复模板", "沟通技巧", "客户反馈"],
    color: "from-blue-300 to-blue-400",
    featured: true,
    lastUpdated: "2天前",
    toolType: "web"
  },
  {
    id: 2,
    name: "美团运营知识学习系统",
    description: "系统化的运营知识学习和考试平台",
    category: "运营工具",
    url: "https://xuxikai886.github.io/kaoshixitong/index.html",
    icon: BookOpen,
    rating: 4.7,
    downloads: "1.8k",
    tags: ["知识库", "在线考试", "学习追踪"],
    color: "from-blue-300 to-blue-400",
    featured: false,
    lastUpdated: "3天前",
    toolType: "web"
  },
  {
    id: 3,
    name: "外卖店铺完整运营流程",
    description: "详细的店铺运营流程指南和操作手册",
    category: "运营工具",
    url: "https://xuxikai886.github.io/meituanyunyingliucheng/",
    icon: Workflow,
    rating: 4.9,
    downloads: "2.5k",
    tags: ["流程可视化", "操作手册", "最佳实践"],
    color: "from-blue-300 to-blue-400",
    featured: true,
    lastUpdated: "1天前",
    toolType: "web"
  },
  {
    id: 4,
    name: "美团外卖运营知识SVG图表集合",
    description: "运营知识的可视化图表展示",
    category: "运营工具",
    url: "https://xuxikai886.github.io/meituan-svg-guide-new/",
    icon: BarChart3,
    rating: 4.6,
    downloads: "1.3k",
    tags: ["SVG图表", "交互展示", "知识关联"],
    color: "from-blue-300 to-blue-400",
    featured: false,
    lastUpdated: "4天前",
    toolType: "web"
  },
  {
    id: 5,
    name: "美团店铺运营数据可视化动画演示系统",
    description: "动态展示店铺运营数据和趋势分析",
    category: "运营工具",
    url: "https://xuxikai886.github.io/meituanshujuyanshi/",
    icon: TrendingUp,
    rating: 4.8,
    downloads: "2.2k",
    tags: ["数据可视化", "趋势分析", "动画演示"],
    color: "from-blue-300 to-blue-400",
    featured: true,
    lastUpdated: "2天前",
    toolType: "web"
  },
  {
    id: 6,
    name: "域锦科技AI系统",
    description: "基于AI技术的智能助手平台",
    category: "运营工具",
    url: "https://www.yujinkeji.me",
    icon: Bot,
    rating: 4.9,
    downloads: "3.1k",
    tags: ["AI助手", "智能问答", "思维导图"],
    color: "from-blue-300 to-blue-400",
    featured: true,
    lastUpdated: "1天前",
    toolType: "web"
  },
  {
    id: 7,
    name: "微信群发助手",
    description: "批量发送微信消息的桌面应用",
    category: "运营工具",
    url: "https://xuxikai886.github.io/weixin/",
    icon: MessageCircle,
    rating: 4.5,
    downloads: "1.9k",
    tags: ["批量发送", "安全可靠", "模拟操作"],
    color: "from-blue-300 to-blue-400",
    featured: false,
    lastUpdated: "5天前",
    toolType: "desktop"
  },
  {
    id: 8,
    name: "运营人员每日抽点店铺数统计分析",
    description: "运营人员工作量统计和绩效分析",
    category: "运营工具",
    url: "https://xuxikai886.github.io/yunyingshujutongji/",
    icon: Target,
    rating: 4.7,
    downloads: "1.6k",
    tags: ["工作量追踪", "趋势对比", "绩效评估"],
    color: "from-blue-300 to-blue-400",
    featured: false,
    lastUpdated: "3天前",
    toolType: "web"
  },
  {
    id: 9,
    name: "呈尚策划运营数据系统",
    description: "综合运营数据管理和分析系统",
    category: "运营工具",
    url: "https://xuxikai886.github.io/feishudianputongji/",
    icon: Database,
    rating: 4.8,
    downloads: "2.4k",
    tags: ["数据统计", "解约查询", "运营分析"],
    color: "from-blue-300 to-blue-400",
    featured: true,
    lastUpdated: "2天前",
    toolType: "web"
  },
  {
    id: 10,
    name: "外卖店铺四件套方案生成系统",
    description: "基于AI的店铺运营方案自动生成",
    category: "运营工具",
    url: "https://xuxikai886.github.io/sijiantaofanganshengcheng/",
    icon: Sparkles,
    rating: 4.9,
    downloads: "2.8k",
    tags: ["AI智能分析", "品牌定位", "商圈调研"],
    color: "from-blue-300 to-blue-400",
    featured: true,
    lastUpdated: "1天前",
    toolType: "web"
  },
  // 美工工具
  {
    id: 11,
    name: "美团闪购产品信息图片采集软件",
    description: "自动采集产品信息和图片资源",
    category: "美工工具",
    url: "https://xuxikai886.github.io/shangou-caiji/",
    icon: ImageIcon,
    rating: 4.6,
    downloads: "1.4k",
    tags: ["批量采集", "图片处理", "数据导出"],
    color: "from-purple-300 to-purple-400",
    featured: false,
    lastUpdated: "4天前",
    toolType: "web"
  },
  {
    id: 12,
    name: "美团店铺数据处理工具",
    description: "店铺图片和产品数据的批量处理",
    category: "美工工具",
    url: "https://xuxikai886.github.io/meituanshangpingtupianxiazai/",
    icon: Edit,
    rating: 4.7,
    downloads: "1.7k",
    tags: ["数据提取", "图片优化", "Fluent设计"],
    color: "from-purple-300 to-purple-400",
    featured: false,
    lastUpdated: "3天前",
    toolType: "web"
  },
  // 销售工具
  {
    id: 13,
    name: "呈尚策划销售部数据统计系统",
    description: "销售数据实时统计和分析",
    category: "销售工具",
    url: "https://www.chengshangcehua.top/",
    icon: ShoppingCart,
    rating: 4.8,
    downloads: "2.3k",
    tags: ["实时数据", "目标追踪", "绩效分析"],
    color: "from-emerald-300 to-emerald-400",
    featured: true,
    lastUpdated: "1天前",
    toolType: "web"
  },
  {
    id: 14,
    name: "销售数据报告生成系统",
    description: "20秒快速生成专业销售报告",
    category: "销售工具",
    url: "https://xuxikai886.github.io/xiaoshoushujubaogao/",
    icon: FileText,
    rating: 4.9,
    downloads: "2.6k",
    tags: ["一键生成", "专业模板", "快速导出"],
    color: "from-emerald-300 to-emerald-400",
    featured: true,
    lastUpdated: "2天前",
    toolType: "web"
  },
  // 人事工具
  {
    id: 15,
    name: "呈尚策划财务记账系统",
    description: "企业财务收支记录和统计",
    category: "人事工具",
    url: "https://www.yujinkeji.net/login",
    icon: Calculator,
    rating: 4.7,
    downloads: "1.8k",
    tags: ["收支记录", "凭证管理", "财务报表"],
    color: "from-amber-300 to-amber-400",
    featured: false,
    lastUpdated: "3天前",
    toolType: "web"
  },
  {
    id: 16,
    name: "运营部智能排班系统+销售部大扫除安排表系统",
    description: "智能排班和任务分配系统",
    category: "人事工具",
    url: "https://xuxikai886.github.io/cschpaibanxitong/index.html",
    icon: Calendar,
    rating: 4.6,
    downloads: "1.5k",
    tags: ["随机排班", "公平分配", "任务管理"],
    color: "from-amber-300 to-amber-400",
    featured: false,
    lastUpdated: "4天前",
    toolType: "web"
  },
  {
    id: 17,
    name: "呈尚策划人事面试顾问系统",
    description: "简历分析和面试指南生成",
    category: "人事工具",
    url: "https://xuxikai886.github.io/renshimianshixitong/",
    icon: UserCheck,
    rating: 4.8,
    downloads: "2.1k",
    tags: ["简历解析", "面试题库", "评估报告"],
    color: "from-amber-300 to-amber-400",
    featured: true,
    lastUpdated: "2天前",
    toolType: "web"
  },
  {
    id: 18,
    name: "呈尚策划数据统计系统",
    description: "企业综合数据统计和分析",
    category: "人事工具",
    url: "https://xuxikai886.github.io/chengshangcehshujutongji/",
    icon: PieChart,
    rating: 4.7,
    downloads: "1.9k",
    tags: ["多维度统计", "趋势分析", "报表生成"],
    color: "from-amber-300 to-amber-400",
    featured: false,
    lastUpdated: "3天前",
    toolType: "web"
  },
  // 客服工具
  {
    id: 19,
    name: "美团店铺信息采集系统",
    description: "批量采集美团店铺基础信息",
    category: "客服工具",
    url: "https://xuxikai886.github.io/meituandianpuxinxicaiji/",
    icon: Search,
    rating: 4.9,
    downloads: "3.2k",
    tags: ["自动解析", "批量处理", "Excel导出"],
    color: "from-rose-300 to-rose-400",
    featured: true,
    lastUpdated: "1天前",
    toolType: "web"
  }
]

// 工具分类统计
export const getCategoryStats = () => {
  const stats = toolsData.reduce((acc, tool) => {
    acc[tool.category] = (acc[tool.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    total: toolsData.length,
    categories: stats,
    featured: toolsData.filter(tool => tool.featured).length
  }
}

// 获取特定分类的工具
export const getToolsByCategory = (category: string) => {
  if (category === "全部工具") return toolsData
  return toolsData.filter(tool => tool.category === category)
}

// 获取推荐工具
export const getFeaturedTools = () => {
  return toolsData.filter(tool => tool.featured)
}

// 搜索工具
export const searchTools = (query: string) => {
  const lowercaseQuery = query.toLowerCase()
  return toolsData.filter(tool => 
    tool.name.toLowerCase().includes(lowercaseQuery) ||
    tool.description.toLowerCase().includes(lowercaseQuery) ||
    tool.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}