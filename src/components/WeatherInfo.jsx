import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CloudRain,
  Sun,
  Cloud,
  CloudSnow,
  Wind,
  Thermometer,
  Droplets,
  AlertTriangle,
} from '@/components/icons'

// 날씨 상태에 따른 아이콘 매핑
const getWeatherIcon = (condition) => {
  const iconMap = {
    '맑음': Sun,
    '구름조금': Cloud,
    '구름많음': Cloud,
    '흐림': Cloud,
    '비': CloudRain,
    '눈': CloudSnow,
    '바람': Wind,
  }
  
  const IconComponent = iconMap[condition] || Sun
  return <IconComponent className="h-6 w-6" />
}

// 날씨 상태에 따른 색상 매핑
const getWeatherColor = (condition) => {
  const colorMap = {
    '맑음': 'text-yellow-500',
    '구름조금': 'text-blue-400',
    '구름많음': 'text-gray-500',
    '흐림': 'text-gray-600',
    '비': 'text-blue-600',
    '눈': 'text-blue-200',
    '바람': 'text-gray-400',
  }
  
  return colorMap[condition] || 'text-gray-500'
}

// 날짜 포맷팅
const formatWeatherDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  })
}

// 개별 날씨 예보 카드
const WeatherForecastCard = ({ forecast }) => {
  const IconComponent = getWeatherIcon(forecast.condition)
  const colorClass = getWeatherColor(forecast.condition)
  
  return (
    <div className="flex flex-col items-center p-3 border rounded-lg bg-gray-50">
      <div className="text-sm font-medium text-gray-600 mb-1">
        {formatWeatherDate(forecast.date)}
      </div>
      <div className={`mb-2 ${colorClass}`}>
        {IconComponent}
      </div>
      <div className="text-xs text-gray-500 mb-1">
        {forecast.condition}
      </div>
      <div className="text-sm font-semibold text-gray-800">
        {forecast.temperature?.min}° - {forecast.temperature?.max}°
      </div>
      {forecast.precipitation > 0 && (
        <div className="flex items-center mt-1 text-xs text-blue-600">
          <Droplets className="h-3 w-3 mr-1" />
          {forecast.precipitation}%
        </div>
      )}
    </div>
  )
}

// 날씨 경고 컴포넌트
const WeatherAlert = ({ alert }) => (
  <Alert className="border-orange-200 bg-orange-50">
    <AlertTriangle className="h-4 w-4 text-orange-600" />
    <AlertDescription className="text-orange-800">
      {alert.message || alert}
    </AlertDescription>
  </Alert>
)

// 메인 날씨 정보 컴포넌트
const WeatherInfo = ({ weatherInfo, isLoading, isError }) => {
  // 개발용 디버깅 로그 (필요시 주석 해제)
  // console.log('WeatherInfo received data:', weatherInfo)
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sun className="mr-2 h-5 w-5" />
            날씨 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center">날씨 정보를 불러오는 중...</p>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sun className="mr-2 h-5 w-5" />
            날씨 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              현재 날씨 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }
  
  if (!weatherInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sun className="mr-2 h-5 w-5" />
            날씨 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sun className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">날씨 정보 서비스 준비중</p>
            <p className="text-sm text-gray-400">
              곧 여행지의 날씨 정보를 제공할 예정입니다.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { forecast = [], alerts = [], recommendation } = weatherInfo

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Thermometer className="mr-2 h-5 w-5" />
          날씨 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 날씨 예보 */}
        {forecast.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 text-gray-700">날씨 예보</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {forecast.map((day, index) => (
                <WeatherForecastCard key={index} forecast={day} />
              ))}
            </div>
          </div>
        )}

        {/* 날씨 경고 */}
        {alerts.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 text-gray-700">날씨 경고</h4>
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <WeatherAlert key={index} alert={alert} />
              ))}
            </div>
          </div>
        )}

        {/* 여행 추천 */}
        {recommendation && (
          <div>
            <h4 className="font-medium mb-2 text-gray-700">여행 추천</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-sm">{recommendation}</p>
            </div>
          </div>
        )}

        {/* 날씨 정보가 비어있을 때 */}
        {forecast.length === 0 && alerts.length === 0 && !recommendation && (
          <p className="text-gray-500 text-center">상세 날씨 정보가 없습니다.</p>
        )}
      </CardContent>
    </Card>
  )
}

export default WeatherInfo