import { useState, useEffect, useCallback, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Cloud,
  Sun,
  CloudRain,
  Snowflake,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Sparkles,
  RefreshCw,
} from 'lucide-react'

const WeatherRecommendation = memo(
  ({ currentLocation, onRecommendationSelect, className }) => {
    const [weatherData, setWeatherData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [recommendations, setRecommendations] = useState([])

    // 날씨 아이콘 매핑
    const getWeatherIcon = (condition) => {
      switch (condition) {
        case 'sunny':
          return <Sun className="h-5 w-5 text-yellow-500" />
        case 'cloudy':
          return <Cloud className="h-5 w-5 text-gray-500" />
        case 'rainy':
          return <CloudRain className="h-5 w-5 text-blue-500" />
        case 'snowy':
          return <Snowflake className="h-5 w-5 text-blue-300" />
        default:
          return <Sun className="h-5 w-5 text-yellow-500" />
      }
    }

    // 날씨별 추천 알고리즘
    const generateWeatherRecommendations = useCallback((weather) => {
      const { temperature, condition, humidity, windSpeed } = weather

      const recommendations = []

      // 맑은 날씨
      if (condition === 'sunny' && temperature > 20) {
        recommendations.push({
          id: 'outdoor-nature',
          title: '🌿 야외 자연 활동',
          description: '맑은 날씨로 야외 활동하기 좋은 날입니다',
          themes: ['자연', '야외활동', '등산'],
          priority: 'high',
          reason: `기온 ${temperature}°C, 맑음`,
        })
      }

      // 비오는 날씨
      if (condition === 'rainy') {
        recommendations.push({
          id: 'indoor-culture',
          title: '🏛️ 실내 문화 체험',
          description: '비오는 날에는 박물관, 미술관 방문이 좋습니다',
          themes: ['문화', '실내', '박물관'],
          priority: 'high',
          reason: '비 예보',
        })
      }

      // 더운 날씨
      if (temperature > 28) {
        recommendations.push({
          id: 'water-activity',
          title: '🏖️ 물놀이 & 해변',
          description: '더운 날씨에는 시원한 바다나 계곡이 최고입니다',
          themes: ['바다', '계곡', '물놀이'],
          priority: 'high',
          reason: `높은 기온 ${temperature}°C`,
        })
      }

      // 추운 날씨
      if (temperature < 5) {
        recommendations.push({
          id: 'hot-spring',
          title: '♨️ 온천 & 실내 활동',
          description: '추운 날씨에는 따뜻한 온천이나 실내 활동을 추천합니다',
          themes: ['온천', '실내', '힐링'],
          priority: 'high',
          reason: `낮은 기온 ${temperature}°C`,
        })
      }

      // 습도가 높은 날
      if (humidity > 80) {
        recommendations.push({
          id: 'dry-indoor',
          title: '🏢 쾌적한 실내 공간',
          description:
            '습도가 높은 날에는 에어컨이 잘 된 실내 공간을 추천합니다',
          themes: ['실내', '쇼핑', '카페'],
          priority: 'medium',
          reason: `높은 습도 ${humidity}%`,
        })
      }

      // 바람이 강한 날
      if (windSpeed > 15) {
        recommendations.push({
          id: 'sheltered-activity',
          title: '🏠 바람막이가 있는 곳',
          description: '바람이 강한 날에는 바람막이가 있는 관광지를 추천합니다',
          themes: ['실내', '지하', '보호구역'],
          priority: 'medium',
          reason: `강한 바람 ${windSpeed}m/s`,
        })
      }

      return recommendations
    }, [])

    // 현재 위치 날씨 정보 가져오기
    const fetchWeatherData = useCallback(async () => {
      if (!currentLocation) return

      try {
        setLoading(true)
        setError(null)

        // 실제 날씨 API 호출 (예: OpenWeatherMap)
        // 여기서는 모의 데이터 사용
        const mockWeatherData = {
          location: currentLocation,
          temperature: 22,
          condition: 'sunny',
          humidity: 65,
          windSpeed: 8,
          description: '맑음',
          feelsLike: 24,
          uvIndex: 6,
        }

        setWeatherData(mockWeatherData)

        // 날씨 기반 추천 생성
        const weatherRecommendations =
          generateWeatherRecommendations(mockWeatherData)
        setRecommendations(weatherRecommendations)
      } catch (err) {
        setError('날씨 정보를 가져오는데 실패했습니다')
        console.error('Weather fetch error:', err)
      } finally {
        setLoading(false)
      }
    }, [currentLocation, generateWeatherRecommendations])

    // 컴포넌트 마운트 시 날씨 정보 가져오기
    useEffect(() => {
      fetchWeatherData()
    }, [fetchWeatherData])

    // 추천 선택 핸들러
    const handleRecommendationClick = useCallback(
      (recommendation) => {
        onRecommendationSelect?.(recommendation)
      },
      [onRecommendationSelect],
    )

    if (loading) {
      return (
        <Card className={`weather-card ${className}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              날씨 정보 로딩 중...
            </CardTitle>
          </CardHeader>
        </Card>
      )
    }

    if (error) {
      return (
        <Alert className={className}>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" onClick={fetchWeatherData}>
              다시 시도
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    if (!weatherData) return null

    return (
      <Card className={`weather-card ${className}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            {getWeatherIcon(weatherData.condition)}
            현재 날씨 기반 추천
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 현재 날씨 정보 */}
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">{weatherData.location}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={fetchWeatherData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span>{weatherData.temperature}°C</span>
                <span className="text-muted-foreground">
                  (체감 {weatherData.feelsLike}°C)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span>습도 {weatherData.humidity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-gray-500" />
                <span>바람 {weatherData.windSpeed}m/s</span>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-yellow-500" />
                <span>자외선 {weatherData.uvIndex}</span>
              </div>
            </div>
          </div>

          {/* 날씨 기반 추천 */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-medium">
              <Sparkles className="h-4 w-4 text-purple-500" />
              오늘 날씨에 딱 맞는 여행
            </h4>

            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="cursor-pointer rounded-lg border p-3 transition-all hover:scale-[1.02] hover:shadow-md"
                onClick={() => handleRecommendationClick(rec)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium">{rec.title}</h5>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {rec.description}
                    </p>
                    <p className="mt-2 text-xs text-blue-600">
                      📊 추천 이유: {rec.reason}
                    </p>
                  </div>
                  <Badge
                    variant={rec.priority === 'high' ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {rec.priority === 'high' ? '강력 추천' : '추천'}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {rec.themes.map((theme) => (
                    <Badge key={theme} variant="outline" className="text-xs">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {recommendations.length === 0 && (
            <div className="text-muted-foreground py-6 text-center">
              현재 날씨에 특별한 추천사항이 없습니다.
              <br />
              모든 여행지가 방문하기 좋은 날씨입니다! 🌤️
            </div>
          )}
        </CardContent>
      </Card>
    )
  },
)

WeatherRecommendation.displayName = 'WeatherRecommendation'

export default WeatherRecommendation
