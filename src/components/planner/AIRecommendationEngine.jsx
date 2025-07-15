import { memo, useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Brain, MapPin, Clock, Star } from '@/components/icons'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * AI 기반 스마트 추천 엔진 컴포넌트
 * 사용자의 취향, 과거 여행 이력, 날씨 조건을 분석하여 개인화된 추천 제공
 */
const AIRecommendationEngine = memo(
  ({
    userPreferences = {},
    weatherData = {},
    travelDates = [],
    onRecommendationSelect,
    className,
  }) => {
    const [isGenerating, setIsGenerating] = useState(false)
    const [recommendations, setRecommendations] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('all')

    // AI 추천 카테고리
    const categories = useMemo(
      () => [
        { id: 'all', label: '전체', icon: Sparkles },
        { id: 'weather-optimal', label: '날씨 최적', icon: '☀️' },
        { id: 'personalized', label: '맞춤형', icon: Brain },
        { id: 'trending', label: '트렌딩', icon: Star },
        { id: 'hidden-gems', label: '숨은 명소', icon: MapPin },
      ],
      [],
    )

    // AI 추천 생성 함수
    const generateAIRecommendations = useCallback(async () => {
      setIsGenerating(true)

      try {
        // AI 분석 요소들
        const _analysisFactors = {
          userProfile: {
            age: userPreferences.age,
            interests: userPreferences.interests || [],
            travelStyle: userPreferences.travelStyle || 'balanced',
            budget: userPreferences.budget || 'medium',
            activityLevel: userPreferences.activityLevel || 'moderate',
          },
          weatherContext: {
            conditions: weatherData.conditions || [],
            temperature: weatherData.temperature,
            precipitation: weatherData.precipitation,
            windSpeed: weatherData.windSpeed,
          },
          temporalFactors: {
            season: travelDates[0] ? new Date(travelDates[0]).getMonth() : 0,
            duration: travelDates.length,
            timeOfYear: 'peak', // peak, shoulder, off-season
          },
          contextualData: {
            crowdLevel: 'medium',
            localEvents: [],
            specialOffers: [],
          },
        }

        // 모의 AI 추천 결과 생성 (실제로는 백엔드 AI 서비스 호출)
        const mockRecommendations = [
          {
            id: 1,
            category: 'weather-optimal',
            title: '한라산 성판악 코스 트레킹',
            description:
              '현재 날씨 조건에 최적화된 트레킹 코스입니다. 맑은 날씨와 적당한 바람으로 등반하기 좋은 조건입니다.',
            location: '제주 한라산국립공원',
            aiScore: 95,
            reasons: [
              '현재 날씨 조건 최적 (맑음, 15-20도)',
              '사용자 활동 선호도 일치 (야외활동)',
              '계절별 추천 명소 (가을 단풍)',
            ],
            estimatedTime: '6-8시간',
            difficulty: 'moderate',
            tags: ['자연', '트레킹', '야외활동', '경치'],
            weatherMatch: 98,
            personalityMatch: 87,
            image:
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
          },
          {
            id: 2,
            category: 'personalized',
            title: '제주 감성 카페 투어',
            description:
              '사용자의 과거 여행 패턴을 분석한 결과, 카페 문화와 여유로운 여행을 선호하시는 것으로 분석됩니다.',
            location: '제주시 구도심',
            aiScore: 92,
            reasons: [
              '과거 여행 이력 분석 결과 일치',
              '선호하는 여행 스타일 (힐링, 문화)',
              '현재 날씨에 적합한 실내외 활동',
            ],
            estimatedTime: '4-5시간',
            difficulty: 'easy',
            tags: ['카페', '문화', '힐링', '사진'],
            weatherMatch: 85,
            personalityMatch: 96,
            image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
          },
          {
            id: 3,
            category: 'hidden-gems',
            title: '비자림 숲길 산책',
            description:
              'AI가 발견한 숨은 명소입니다. 관광객이 적고 자연 그대로의 아름다움을 즐길 수 있습니다.',
            location: '제주 구좌읍',
            aiScore: 88,
            reasons: [
              '크라우드 데이터 분석 (관광객 적음)',
              '자연 선호도 높은 사용자에게 추천',
              '사진 명소로 SNS 반응 좋음',
            ],
            estimatedTime: '2-3시간',
            difficulty: 'easy',
            tags: ['자연', '숲', '산책', '힐링'],
            weatherMatch: 90,
            personalityMatch: 85,
            image:
              'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
          },
        ]

        // 카테고리별 필터링
        const filteredRecommendations =
          selectedCategory === 'all'
            ? mockRecommendations
            : mockRecommendations.filter(
                (rec) => rec.category === selectedCategory,
              )

        setRecommendations(filteredRecommendations)
      } catch (error) {
        console.error('AI 추천 생성 실패:', error)
      } finally {
        setIsGenerating(false)
      }
    }, [userPreferences, weatherData, travelDates, selectedCategory])

    // 추천 선택 핸들러
    const handleRecommendationSelect = useCallback(
      (recommendation) => {
        onRecommendationSelect?.(recommendation)
      },
      [onRecommendationSelect],
    )

    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>AI 스마트 추천</span>
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="mr-1 h-3 w-3" />
              Beta
            </Badge>
          </CardTitle>

          {/* 카테고리 필터 */}
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-1"
              >
                {typeof category.icon === 'string' ? (
                  <span className="text-sm">{category.icon}</span>
                ) : (
                  <category.icon className="h-3 w-3" />
                )}
                <span>{category.label}</span>
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {/* AI 추천 생성 버튼 */}
          <div className="mb-6">
            <Button
              onClick={generateAIRecommendations}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                  AI가 분석 중입니다...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  AI 맞춤 추천 생성
                </>
              )}
            </Button>
          </div>

          {/* 추천 결과 */}
          <AnimatePresence>
            {recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {recommendations.map((recommendation) => (
                  <motion.div
                    key={recommendation.id}
                    layout
                    className="cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md"
                    onClick={() => handleRecommendationSelect(recommendation)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold">
                          {recommendation.title}
                        </h4>
                        <div className="mt-1 flex items-center text-sm text-gray-600">
                          <MapPin className="mr-1 h-3 w-3" />
                          {recommendation.location}
                          <Clock className="mr-1 ml-3 h-3 w-3" />
                          {recommendation.estimatedTime}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center font-bold text-purple-600">
                          <Brain className="mr-1 h-4 w-4" />
                          {recommendation.aiScore}
                        </div>
                        <div className="text-xs text-gray-500">AI 점수</div>
                      </div>
                    </div>

                    <p className="mb-3 text-gray-700">
                      {recommendation.description}
                    </p>

                    {/* AI 추천 이유 */}
                    <div className="mb-3">
                      <h5 className="mb-2 text-sm font-medium text-gray-800">
                        🤖 AI 추천 이유:
                      </h5>
                      <ul className="space-y-1 text-xs text-gray-600">
                        {recommendation.reasons.map((reason, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-1 text-green-500">✓</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 매치 점수 */}
                    <div className="mb-3 grid grid-cols-2 gap-4">
                      <div className="rounded bg-blue-50 p-2 text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {recommendation.weatherMatch}%
                        </div>
                        <div className="text-xs text-gray-600">날씨 매치</div>
                      </div>
                      <div className="rounded bg-purple-50 p-2 text-center">
                        <div className="text-lg font-bold text-purple-600">
                          {recommendation.personalityMatch}%
                        </div>
                        <div className="text-xs text-gray-600">취향 매치</div>
                      </div>
                    </div>

                    {/* 태그 */}
                    <div className="flex flex-wrap gap-1">
                      {recommendation.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 빈 상태 */}
          {recommendations.length === 0 && !isGenerating && (
            <div className="py-8 text-center text-gray-500">
              <Brain className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p>AI 추천을 생성하려면 위 버튼을 클릭하세요</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  },
)

AIRecommendationEngine.displayName = 'AIRecommendationEngine'

export default AIRecommendationEngine
