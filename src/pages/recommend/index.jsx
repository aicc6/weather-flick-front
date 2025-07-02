import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Star,
  Calendar,
  Heart,
  Sparkles,
  ArrowRight,
  Check,
} from '@/components/icons'
import { mockDestinations } from '@/data'

export default function RecommendPage() {
  const navigate = useNavigate()
  const [selectedTheme, setSelectedTheme] = useState('')

  const handleGetRecommendation = () => {
    navigate('/plans')
  }

  const handleQuickRecommendation = (theme) => {
    setSelectedTheme(theme)
    // 해당 테마의 빠른 추천 로직 실행
    console.log(`빠른 추천: ${theme}`)
  }

  const popularDestinations = mockDestinations.slice(0, 3)
  const quickThemes = [
    {
      id: 'healing',
      name: '힐링',
      icon: '🧘‍♀️',
      color: 'bg-green-50 text-green-700 border-green-200',
    },
    {
      id: 'activity',
      name: '액티비티',
      icon: '🏃‍♂️',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'culture',
      name: '문화체험',
      icon: '🏛️',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      id: 'food',
      name: '맛집투어',
      icon: '🍜',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
    },
  ]

  const features = [
    {
      icon: <Sparkles className="h-6 w-6 text-blue-600" />,
      title: 'AI 맞춤 추천',
      description: '당신의 취향과 날씨를 분석하여 최적의 여행지를 추천해드려요',
    },
    {
      icon: <Calendar className="h-6 w-6 text-green-600" />,
      title: '실시간 날씨 정보',
      description: '여행 날짜의 정확한 날씨 예보를 기반으로 한 추천',
    },
    {
      icon: <Heart className="h-6 w-6 text-red-600" />,
      title: '개인화 서비스',
      description: '이전 여행 기록과 선호도를 학습하여 더 정확한 추천',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium">
              <Sparkles className="mr-2 h-4 w-4" />
              AI 기반 개인 맞춤 추천
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
              취향에 맞게 일정을
              <br />
              <span className="text-yellow-300">추천해 드려요!</span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
              날씨 정보와 AI 분석을 통해 당신만을 위한 완벽한 여행 계획을
              세워보세요.
              <br />
              <span className="font-semibold text-yellow-300">
                순식간에 여행 준비 끝!
              </span>
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="bg-yellow-400 px-8 py-4 text-lg font-semibold text-gray-900 hover:bg-yellow-300"
                onClick={handleGetRecommendation}
              >
                🎯 바로 추천받기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-white px-8 py-4 text-lg text-white hover:bg-white hover:text-gray-900"
                onClick={() => navigate('/plans')}
              >
                직접 계획하기
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              왜 WeatherFlick을 선택해야 할까요?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              단순한 여행지 추천을 넘어서, 당신만을 위한 특별한 여행 경험을
              제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 text-center shadow-lg transition-shadow hover:shadow-xl"
              >
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Theme Selection */}
      <div className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              어떤 여행을 원하시나요?
            </h2>
            <p className="text-lg text-gray-600">
              테마를 선택하면 맞춤형 여행지를 바로 추천해드려요
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {quickThemes.map((theme) => (
              <Card
                key={theme.id}
                className={`cursor-pointer border-2 transition-all hover:scale-105 ${
                  selectedTheme === theme.id
                    ? theme.color
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleQuickRecommendation(theme.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-3 text-4xl">{theme.icon}</div>
                  <h3 className="text-lg font-semibold">{theme.name}</h3>
                  {selectedTheme === theme.id && (
                    <div className="mt-2">
                      <Check className="mx-auto h-5 w-5 text-current" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              인기 여행지 미리보기
            </h2>
            <p className="text-lg text-gray-600">
              다른 여행자들이 가장 많이 선택한 여행지들을 확인해보세요
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {popularDestinations.map((destination) => (
              <Card
                key={destination.id}
                className="overflow-hidden border-0 shadow-lg transition-shadow hover:shadow-xl"
              >
                <div className="relative">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="h-48 w-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-gray-900">
                      <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                      인기
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="mb-2 flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                    <h3 className="text-xl font-semibold">
                      {destination.name}
                    </h3>
                  </div>
                  <p className="mb-4 text-gray-600">
                    {destination.description}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleQuickRecommendation(destination.name)}
                  >
                    자세히 보기
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold">
            지금 바로 당신만의 여행을 시작하세요!
          </h2>
          <p className="mb-8 text-xl text-blue-100">
            몇 번의 클릭만으로 완벽한 여행 계획이 완성됩니다
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="bg-yellow-400 px-8 py-4 text-lg font-semibold text-gray-900 hover:bg-yellow-300"
              onClick={handleGetRecommendation}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              맞춤 여행 추천받기
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white px-8 py-4 text-lg text-white hover:bg-white hover:text-gray-900"
              onClick={() => navigate('/reviews')}
            >
              여행 후기 보기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
