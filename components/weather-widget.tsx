"use client"

import { useState, useEffect } from "react"
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WeatherData, WeatherResponse, CITY_CODES } from "@/types/weather"

// 高德地图API密钥
const AMAP_KEY = "634a7d92f531b9d9f0791b8c82b90fee"

// 天气图标映射
const getWeatherIcon = (weather: string) => {
  if (weather.includes('晴')) return <Sun className="w-5 h-5 text-yellow-500" />
  if (weather.includes('雨')) return <CloudRain className="w-5 h-5 text-blue-500" />
  if (weather.includes('雪')) return <CloudSnow className="w-5 h-5 text-gray-400" />
  if (weather.includes('云') || weather.includes('阴')) return <Cloud className="w-5 h-5 text-gray-500" />
  return <Cloud className="w-5 h-5 text-gray-500" />
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchWeather = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('开始获取天气数据...')

      // 使用JSONP方式调用高德API避免跨域问题
      const callbackName = `weatherCallback_${Date.now()}`
      const apiUrl = `https://restapi.amap.com/v3/weather/weatherInfo?city=${CITY_CODES.YICHANG}&key=${AMAP_KEY}&extensions=base&callback=${callbackName}`

      console.log('调用高德API:', apiUrl)

      // 创建Promise来处理JSONP回调
      const data: WeatherResponse = await new Promise((resolve, reject) => {
        // 设置超时
        const timeout = setTimeout(() => {
          cleanup()
          reject(new Error('请求超时'))
        }, 10000)

        // 定义全局回调函数
        ;(window as any)[callbackName] = (response: WeatherResponse) => {
          cleanup()
          resolve(response)
        }

        // 创建script标签
        const script = document.createElement('script')
        script.src = apiUrl
        script.onerror = () => {
          cleanup()
          reject(new Error('网络请求失败'))
        }

        // 清理函数
        const cleanup = () => {
          clearTimeout(timeout)
          if ((window as any)[callbackName]) {
            delete (window as any)[callbackName]
          }
          if (script.parentNode) {
            script.parentNode.removeChild(script)
          }
        }

        // 添加到页面
        document.head.appendChild(script)
      })

      console.log('收到天气数据:', data)

      if (data.status === '1' && data.lives && data.lives.length > 0) {
        setWeather(data.lives[0])
        setLastUpdate(new Date())
        setError(null)
        console.log('天气数据更新成功:', data.lives[0])
      } else {
        throw new Error(data.info || '获取天气数据失败')
      }
    } catch (err) {
      console.error('获取天气失败:', err)
      const errorMessage = err instanceof Error ? err.message : '网络连接失败'
      setError(errorMessage)
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  // 组件挂载时获取天气数据
  useEffect(() => {
    fetchWeather()
    
    // 每30分钟自动刷新一次
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  // 格式化更新时间
  const formatUpdateTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading && !weather) {
    return (
      <div className="flex items-center justify-center py-4">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">加载中...</span>
      </div>
    )
  }

  if (error && !weather) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-red-500 dark:text-red-400">
          {error}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchWeather}
          disabled={loading}
          className="w-full text-xs h-7"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
          重试
        </Button>
      </div>
    )
  }

  if (!weather) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        暂无天气数据
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 主要天气信息 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getWeatherIcon(weather.weather)}
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {weather.weather}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {weather.city}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {weather.temperature}°C
          </div>
        </div>
      </div>

      {/* 详细信息 */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center space-x-1">
          <Wind className="w-3 h-3 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-300">
            {weather.winddirection} {weather.windpower}级
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Droplets className="w-3 h-3 text-blue-400" />
          <span className="text-gray-600 dark:text-gray-300">
            湿度 {weather.humidity}%
          </span>
        </div>
      </div>

      {/* 更新时间和刷新按钮 */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {lastUpdate ? `更新于 ${formatUpdateTime(lastUpdate)}` : ''}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchWeather}
          disabled={loading}
          className="h-6 px-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  )
}
