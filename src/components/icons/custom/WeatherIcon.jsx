import { Cloud, CloudRain, CloudSnow, Sun } from 'lucide-react'

// 날씨 아이콘 컴포넌트
export const WeatherIcon = ({ weather, temperature }) => {
  const getWeatherIcon = (weather) => {
    switch (weather) {
      case '맑음':
        return <Sun className="h-4 w-4 text-yellow-500" />
      case '흐림':
        return <Cloud className="h-4 w-4 text-gray-500" />
      case '비':
        return <CloudRain className="h-4 w-4 text-blue-500" />
      case '눈':
        return <CloudSnow className="h-4 w-4 text-blue-300" />
      default:
        return <Sun className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      {getWeatherIcon(weather)}
      <span className="font-medium">{temperature}°C</span>
      <span className="text-gray-600">{weather}</span>
    </div>
  )
}
