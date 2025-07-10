import { memo, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MapPin,
  Star,
  Heart,
  Phone,
  Clock,
  Navigation,
} from '@/components/icons'
import { motion, AnimatePresence } from 'framer-motion'

// Mock 데이터
const mockRestaurants = {
  제주도: [
    {
      id: 1,
      name: '제주 흑돼지 맛집',
      category: '한식',
      rating: 4.8,
      distance: '0.8km',
      address: '제주시 한림읍',
      image:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
      specialties: ['흑돼지구이', '제주 전복죽'],
      price: '20,000~30,000원',
      isOpen: true,
    },
    {
      id: 2,
      name: '오션뷰 카페',
      category: '카페',
      rating: 4.6,
      distance: '1.2km',
      address: '제주시 애월읍',
      image:
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80',
      specialties: ['아메리카노', '제주 녹차라떼'],
      price: '5,000~10,000원',
      isOpen: true,
    },
    {
      id: 3,
      name: '제주 해산물 전문점',
      category: '해산물',
      rating: 4.7,
      distance: '2.1km',
      address: '제주시 조천읍',
      image:
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=400&q=80',
      specialties: ['회덮밥', '성게국'],
      price: '15,000~25,000원',
      isOpen: false,
    },
  ],
  서울: [
    {
      id: 4,
      name: '한강뷰 레스토랑',
      category: '양식',
      rating: 4.5,
      distance: '0.5km',
      address: '서울시 여의도',
      image:
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=400&q=80',
      specialties: ['스테이크', '파스타'],
      price: '30,000~50,000원',
      isOpen: true,
    },
  ],
}

const mockCourses = {
  제주도: [
    {
      id: 1,
      name: '제주 동부 해안도로 드라이브',
      duration: '4시간',
      distance: '45km',
      difficulty: '쉬움',
      type: '드라이브',
      highlights: ['성산일출봉', '우도', '섭지코지'],
      description:
        '제주의 아름다운 동부 해안선을 따라 드라이브하며 주요 관광지를 둘러보는 코스',
      image:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 2,
      name: '한라산 등반 코스',
      duration: '6시간',
      distance: '8.7km',
      difficulty: '어려움',
      type: '등산',
      highlights: ['백록담', '윗세오름', '진달래밭'],
      description: '제주의 상징 한라산 정상까지 오르는 본격적인 등반 코스',
      image:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 3,
      name: '제주 서부 카페투어',
      duration: '3시간',
      distance: '25km',
      difficulty: '쉬움',
      type: '관광',
      highlights: ['애월카페거리', '한림공원', '협재해수욕장'],
      description:
        '제주 서부의 아름다운 카페들과 해변을 둘러보는 여유로운 코스',
      image:
        'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    },
  ],
}

const TmapRecommendations = memo(({ destination = '제주도' }) => {
  const [favorites, setFavorites] = useState(new Set())
  const [selectedCategory, setSelectedCategory] = useState('전체')

  const restaurants = useMemo(() => {
    return mockRestaurants[destination] || []
  }, [destination])

  const courses = useMemo(() => {
    return mockCourses[destination] || []
  }, [destination])

  const categories = useMemo(() => {
    const cats = ['전체', ...new Set(restaurants.map((r) => r.category))]
    return cats
  }, [restaurants])

  const filteredRestaurants = useMemo(() => {
    if (selectedCategory === '전체') return restaurants
    return restaurants.filter((r) => r.category === selectedCategory)
  }, [restaurants, selectedCategory])

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(id)) {
        newFavorites.delete(id)
      } else {
        newFavorites.add(id)
      }
      return newFavorites
    })
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case '쉬움':
        return 'bg-green-100 text-green-800'
      case '보통':
        return 'bg-yellow-100 text-yellow-800'
      case '어려움':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!restaurants.length && !courses.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>🍽️ T맵 맛집 & 코스 추천</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="text-gray-500">
              선택하신 지역의 추천 정보가 아직 준비되지 않았습니다.
            </p>
            <p className="mt-2 text-sm text-gray-400">
              곧 업데이트 예정입니다!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <span>🍽️ T맵 맛집 & 코스 추천</span>
          <Badge variant="secondary">{destination}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="restaurants" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="restaurants">🍽️ 맛집 추천</TabsTrigger>
            <TabsTrigger value="courses">🗺️ 코스 추천</TabsTrigger>
          </TabsList>

          <TabsContent value="restaurants" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs"
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence>
                {filteredRestaurants.map((restaurant, index) => (
                  <motion.div
                    key={restaurant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="transition-shadow hover:shadow-md">
                      <div className="relative">
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="h-32 w-full rounded-t-lg object-cover"
                          loading="lazy"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(restaurant.id)}
                          className="absolute top-2 right-2 h-8 w-8 bg-white/80 p-0 hover:bg-white"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              favorites.has(restaurant.id)
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-600'
                            }`}
                          />
                        </Button>
                        <Badge
                          variant={restaurant.isOpen ? 'default' : 'secondary'}
                          className="absolute top-2 left-2 text-xs"
                        >
                          {restaurant.isOpen ? '영업중' : '영업종료'}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-semibold">
                              {restaurant.name}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {restaurant.category}
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{restaurant.rating}</span>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span>{restaurant.distance}</span>
                          </div>

                          <p className="text-xs text-gray-500">
                            {restaurant.address}
                          </p>

                          <div className="flex flex-wrap gap-1">
                            {restaurant.specialties
                              .slice(0, 2)
                              .map((specialty) => (
                                <Badge
                                  key={specialty}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {specialty}
                                </Badge>
                              ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-blue-600">
                              {restaurant.price}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 p-1"
                            >
                              <Phone className="mr-1 h-3 w-3" />
                              <span className="text-xs">전화</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            {courses.length > 0 ? (
              <div className="grid gap-4">
                {courses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="transition-shadow hover:shadow-md">
                      <div className="md:flex">
                        <div className="md:w-1/3">
                          <img
                            src={course.image}
                            alt={course.name}
                            className="h-32 w-full rounded-t-lg object-cover md:h-full md:rounded-t-none md:rounded-l-lg"
                            loading="lazy"
                          />
                        </div>
                        <CardContent className="p-4 md:w-2/3">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold">{course.name}</h4>
                              <Badge variant="outline">{course.type}</Badge>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{course.duration}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Navigation className="h-4 w-4" />
                                <span>{course.distance}</span>
                              </div>
                              <Badge
                                className={getDifficultyColor(
                                  course.difficulty,
                                )}
                              >
                                {course.difficulty}
                              </Badge>
                            </div>

                            <p className="text-sm text-gray-600">
                              {course.description}
                            </p>

                            <div className="space-y-2">
                              <span className="text-sm font-medium text-gray-700">
                                주요 명소:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {course.highlights.map((highlight) => (
                                  <Badge
                                    key={highlight}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {highlight}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-end">
                              <Button size="sm" variant="outline">
                                코스 상세보기
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">코스 추천 기능을 준비 중입니다.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center space-x-2 text-sm text-blue-800">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">T맵 연동 서비스</span>
          </div>
          <p className="mt-1 text-xs text-blue-600">
            실시간 위치 기반 맛집 정보 및 최적 경로 안내가 제공됩니다.
          </p>
        </div>
      </CardContent>
    </Card>
  )
})

TmapRecommendations.displayName = 'TmapRecommendations'

export default TmapRecommendations
