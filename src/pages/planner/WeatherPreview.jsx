export default function WeatherPreview({ weatherData }) {
  if (!weatherData) return null
  return (
    <div className="mb-4 flex flex-col items-center gap-4 rounded-lg bg-blue-50 p-4 sm:flex-row dark:bg-zinc-800">
      <div className="text-2xl">{weatherData.icon}</div>
      <div>
        <div className="font-bold">{weatherData.summary}</div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {weatherData.temp}°C, 강수확률 {weatherData.rain}%, 바람{' '}
          {weatherData.wind}m/s, 자외선 {weatherData.uv}
        </div>
      </div>
    </div>
  )
}
