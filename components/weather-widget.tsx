"use client"

import { useState, useEffect } from "react"
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WeatherData, WeatherResponse, CITY_CODES } from "@/types/weather"

// 高德地图API密钥
const AMAP_KEY = "634a7d92f531b9d9f0791b8c82b90fee"

// 检测是否在Tauri环境中
const isTauri = typeof window !== 'undefined' && (window as any).__TAURI__

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

      const apiUrl = `https://restapi.amap.com/v3/weather/weatherInfo?city=${CITY_CODES.YICHANG}&key=${AMAP_KEY}&extensions=base`
      console.log('调用高德API:', apiUrl)

      let data: WeatherResponse

      if (isTauri) {
        // 在Tauri环境中使用HTTP插件
        console.log('使用Tauri HTTP客户端')
        const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http')

        const response = await tauriFetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        data = await response.json()
      } else {
        // 在开发环境中使用JSONP方式
        console.log('使用JSONP方式')
        const callbackName = `weatherCallback_${Date.now()}`
        const jsonpUrl = `${apiUrl}&callback=${callbackName}`

        data = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            cleanup()
            reject(new Error('请求超时'))
          }, 10000)

          ;(window as any)[callbackName] = (response: WeatherResponse) => {
            cleanup()
            resolve(response)
          }

          const script = document.createElement('script')
          script.src = jsonpUrl
          script.onerror = () => {
            cleanup()
            reject(new Error('网络请求失败'))
          }

          const cleanup = () => {
            clearTimeout(timeout)
            if ((window as any)[callbackName]) {
              delete (window as any)[callbackName]
            }
            if (script.parentNode) {
              script.parentNode.removeChild(script)
            }
          }

          document.head.appendChild(script)
        })
      }

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

    // 每1小时自动刷新一次
    const interval = setInterval(fetchWeather, 60 * 60 * 1000)

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
      <div className="flex items-center justify-center py-6">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">加载中...</span>
      </div>
    )
  }

  if (error && !weather) {
    return (
      <div className="text-center py-4">
        <div className="text-sm text-red-500 dark:text-red-400 mb-2">
          {error}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchWeather}
          disabled={loading}
          className="text-xs h-7 px-3"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
          重试
        </Button>
      </div>
    )
  }

  if (!weather) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
        暂无天气数据
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 主要天气信息 - 重新设计布局 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {getWeatherIcon(weather.weather)}
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              {weather.weather}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {weather.city}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {weather.temperature}°C
          </div>
        </div>
      </div>

      {/* 详细信息 - 改为垂直布局 */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Wind className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {weather.winddirection}风 {weather.windpower}级
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Droplets className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            湿度 {weather.humidity}%
          </span>
        </div>
      </div>

      {/* 更新时间 - 移除刷新按钮 */}
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {lastUpdate ? `更新于 ${formatUpdateTime(lastUpdate)}` : ''}
        </div>
      </div>
    </div>
  )
}
