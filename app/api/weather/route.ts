import { NextRequest, NextResponse } from 'next/server'

const AMAP_KEY = "634a7d92f531b9d9f0791b8c82b90fee"
const YICHANG_ADCODE = "420500"

export async function GET(request: NextRequest) {
  try {
    // 从查询参数获取城市编码，默认为宜昌
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city') || YICHANG_ADCODE
    const extensions = searchParams.get('extensions') || 'base'

    // 调用高德天气API
    const response = await fetch(
      `https://restapi.amap.com/v3/weather/weatherInfo?city=${city}&key=${AMAP_KEY}&extensions=${extensions}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`高德API请求失败: ${response.status}`)
    }

    const data = await response.json()

    // 检查API返回状态
    if (data.status !== '1') {
      throw new Error(data.info || '获取天气数据失败')
    }

    // 返回天气数据
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=1800', // 缓存30分钟
      },
    })

  } catch (error) {
    console.error('天气API错误:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '获取天气数据失败',
        status: '0'
      },
      { status: 500 }
    )
  }
}
