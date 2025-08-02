// 高德天气API相关类型定义

export interface WeatherData {
  province: string      // 省份名
  city: string         // 城市名
  adcode: string       // 区域编码
  weather: string      // 天气现象（汉字描述）
  temperature: string  // 实时气温，单位：摄氏度
  winddirection: string // 风向描述
  windpower: string    // 风力级别，单位：级
  humidity: string     // 空气湿度
  reporttime: string   // 数据发布的时间
}

export interface WeatherResponse {
  status: string       // 返回状态，值为0或1，1：成功；0：失败
  count: string        // 返回结果总数目
  info: string         // 返回的状态信息
  infocode: string     // 返回状态说明,10000代表正确
  lives: WeatherData[] // 实况天气数据信息
}

export interface ForecastData {
  date: string         // 日期
  week: string         // 星期几
  dayweather: string   // 白天天气现象
  nightweather: string // 晚上天气现象
  daytemp: string      // 白天温度
  nighttemp: string    // 晚上温度
  daywind: string      // 白天风向
  nightwind: string    // 晚上风向
  daypower: string     // 白天风力
  nightpower: string   // 晚上风力
}

export interface ForecastResponse {
  status: string       // 返回状态
  count: string        // 返回结果总数目
  info: string         // 返回的状态信息
  infocode: string     // 返回状态说明
  forecasts: {
    city: string       // 城市名称
    adcode: string     // 城市编码
    province: string   // 省份名称
    reporttime: string // 预报发布时间
    casts: ForecastData[] // 预报数据列表
  }[]
}

// 城市编码常量
export const CITY_CODES = {
  YICHANG: "420500",  // 宜昌市
  BEIJING: "110100",  // 北京市
  SHANGHAI: "310100", // 上海市
  GUANGZHOU: "440100", // 广州市
  SHENZHEN: "440300"  // 深圳市
} as const

// 天气图标类型
export type WeatherIconType = 'sun' | 'cloud' | 'rain' | 'snow' | 'wind'

// 天气状态映射
export const WEATHER_ICONS: Record<string, WeatherIconType> = {
  '晴': 'sun',
  '多云': 'cloud',
  '阴': 'cloud',
  '雨': 'rain',
  '雪': 'snow',
  '风': 'wind'
}
