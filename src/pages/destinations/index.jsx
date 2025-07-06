import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Star,
  Search,
  Filter,
  Calendar,
  Clock,
  Heart,
  Camera,
  Navigation,
  Sparkles,
} from '@/components/icons'
import { useGetActiveRegionsQuery } from '@/store/api'

export default function TravelCoursePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedTheme, setSelectedTheme] = useState('all')
  
  // RTK Query를 사용한 지역 데이터 조회
  const {
    data: cities = [],
    isLoading: regionsLoading,
    error: regionsError,
  } = useGetActiveRegionsQuery()

  // 여행 코스 더미 데이터
  const travelCourses = [
    {
      id: 1,
      title: '제주도 감성 힐링 코스',
      subtitle: '자연과 함께하는 제주 여행',
      region: 'jeju',
      duration: '2박 3일',
      theme: ['자연', '힐링', '드라이브'],
      mainImage: '/jeju.jpg',
      rating: 4.8,
      reviewCount: 156,
      likeCount: 234,
      price: '280,000원',
      bestMonths: [3, 4, 5, 9, 10, 11],
      summary:
        '한라산 트레킹부터 해변 카페까지, 제주도의 자연을 만끽하는 힐링 코스',
      highlights: ['한라산 어리목 탐방로', '애월 카페거리', '협재해변', '우도'],
      itinerary: [
        {
          day: 1,
          title: '제주 시내 & 동부',
          activities: [
            '제주공항 도착',
            '성산일출봉',
            '우도',
            '성산포항 해산물',
          ],
        },
        {
          day: 2,
          title: '서부 해안 드라이브',
          activities: ['협재해변', '애월 카페거리', '한림공원', '곽지해변'],
        },
        {
          day: 3,
          title: '중산간 자연 탐방',
          activities: ['한라산 어리목', '1100고지', '천지연폭포', '제주공항'],
        },
      ],
      tags: ['인스타감성', '자연치유', '드라이브'],
    },
    {
      id: 2,
      title: '부산 바다 & 도심 투어',
      subtitle: '활기찬 항구도시의 매력',
      region: 'busan',
      duration: '1박 2일',
      theme: ['도시', '바다', '맛집'],
      mainImage: '/busan.jpeg',
      rating: 4.6,
      reviewCount: 203,
      likeCount: 189,
      price: '180,000원',
      bestMonths: [4, 5, 6, 9, 10, 11],
      summary: '해운대부터 감천문화마을까지, 부산의 대표 명소를 둘러보는 코스',
      highlights: [
        '해운대해수욕장',
        '감천문화마을',
        '자갈치시장',
        '광안리해변',
      ],
      itinerary: [
        {
          day: 1,
          title: '해운대 & 동부산',
          activities: ['해운대해수욕장', '동백섬', '센텀시티', '광안리 야경'],
        },
        {
          day: 2,
          title: '서부산 문화탐방',
          activities: ['감천문화마을', '자갈치시장', '용두산공원', '국제시장'],
        },
      ],
      tags: ['도시여행', '야경감상', '맛집투어'],
    },
    {
      id: 3,
      title: '강릉 바다 & 커피 여행',
      subtitle: '동해안의 여유로운 휴양',
      region: 'gangneung',
      duration: '1박 2일',
      theme: ['바다', '커피', '힐링'],
      mainImage: '/gangneung.png',
      rating: 4.5,
      reviewCount: 98,
      likeCount: 156,
      price: '150,000원',
      bestMonths: [6, 7, 8, 9, 10],
      summary: '경포해변의 일출과 안목해변 커피거리를 즐기는 강릉 여행',
      highlights: ['경포해변', '안목해변 커피거리', '오죽헌', '강문해변'],
      itinerary: [
        {
          day: 1,
          title: '강릉 시내 & 해변',
          activities: [
            '경포해변',
            '오죽헌',
            '강릉중앙시장',
            '안목해변 커피거리',
          ],
        },
        {
          day: 2,
          title: '동해안 드라이브',
          activities: ['강문해변', '사천해변', '정동진', '강릉역'],
        },
      ],
      tags: ['커피여행', '일출명소', '해변산책'],
    },
    {
      id: 4,
      title: '경주 역사문화 기행',
      subtitle: '천년 고도의 숨은 이야기',
      region: 'gyeongju',
      duration: '1박 2일',
      theme: ['역사', '문화', '전통'],
      mainImage: '/gyeongju.jpeg',
      rating: 4.4,
      reviewCount: 142,
      likeCount: 178,
      price: '120,000원',
      bestMonths: [4, 5, 9, 10, 11],
      summary: '불국사와 석굴암을 중심으로 한 신라 천년 역사 탐방 코스',
      highlights: ['불국사', '석굴암', '첨성대', '대릉원'],
      itinerary: [
        {
          day: 1,
          title: '동쪽 문화재 탐방',
          activities: ['불국사', '석굴암', '토함산', '경주월드'],
        },
        {
          day: 2,
          title: '시내 역사 유적',
          activities: ['대릉원', '첨성대', '안압지', '경주박물관'],
        },
      ],
      tags: ['문화재탐방', '역사교육', '전통체험'],
    },
    {
      id: 5,
      title: '전주 한옥마을 & 맛집 투어',
      subtitle: '전통과 미식의 만남',
      region: 'jeonju',
      duration: '당일',
      theme: ['전통', '맛집', '체험'],
      mainImage: '/jeonju.jpg',
      rating: 4.3,
      reviewCount: 187,
      likeCount: 203,
      price: '80,000원',
      bestMonths: [4, 5, 9, 10, 11],
      summary: '한옥마을에서 전통문화 체험과 전주 대표 음식을 맛보는 당일 코스',
      highlights: ['전주한옥마을', '경기전', '전주비빔밥', '한지공예체험'],
      itinerary: [
        {
          day: 1,
          title: '전주 한옥마을 완전정복',
          activities: [
            '한옥마을 입구',
            '경기전',
            '전주비빔밥',
            '한지공예체험',
            '오목대',
          ],
        },
      ],
      tags: ['한옥체험', '전통음식', '문화체험'],
    },
    {
      id: 6,
      title: '여수 밤바다 낭만 여행',
      subtitle: '아름다운 남해안의 보석',
      region: 'yeosu',
      duration: '1박 2일',
      theme: ['야경', '바다', '섬'],
      mainImage: '/yeosu.jpg',
      rating: 4.7,
      reviewCount: 124,
      likeCount: 167,
      price: '200,000원',
      bestMonths: [4, 5, 6, 9, 10],
      summary: '여수 밤바다의 환상적인 야경과 오동도의 자연을 만끽하는 코스',
      highlights: ['여수 밤바다', '오동도', '향일암', '돌산대교'],
      itinerary: [
        {
          day: 1,
          title: '여수 시내 & 야경',
          activities: [
            '오동도',
            '여수해상케이블카',
            '돌산대교 야경',
            '여수밤바다',
          ],
        },
        {
          day: 2,
          title: '향일암 & 해안 드라이브',
          activities: ['향일암', '금오도', '여수수산시장', '여수역'],
        },
      ],
      tags: ['야경명소', '케이블카', '섬여행'],
    },
  ]

  const regions = [
    { value: 'all', label: '전체 지역' },
    { value: 'jeju', label: '제주도' },
    { value: 'busan', label: '부산' },
    { value: 'gangneung', label: '강릉' },
    { value: 'gyeongju', label: '경주' },
    { value: 'jeonju', label: '전주' },
    { value: 'yeosu', label: '여수' },
  ]

  const months = [
    { value: 'all', label: '전체 월' },
    { value: '1', label: '1월' },
    { value: '2', label: '2월' },
    { value: '3', label: '3월' },
    { value: '4', label: '4월' },
    { value: '5', label: '5월' },
    { value: '6', label: '6월' },
    { value: '7', label: '7월' },
    { value: '8', label: '8월' },
    { value: '9', label: '9월' },
    { value: '10', label: '10월' },
    { value: '11', label: '11월' },
    { value: '12', label: '12월' },
  ]

  const themes = [
    { value: 'all', label: '전체 테마' },
    { value: '자연', label: '자연/힐링' },
    { value: '도시', label: '도시 여행' },
    { value: '역사', label: '역사/문화' },
    { value: '바다', label: '바다/해변' },
    { value: '맛집', label: '맛집 투어' },
    { value: '야경', label: '야경/풍경' },
    { value: '전통', label: '전통 체험' },
  ]

  // 필터링된 여행 코스
  const filteredCourses = travelCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.highlights.some((highlight) =>
        highlight.toLowerCase().includes(searchQuery.toLowerCase()),
      )

    const matchesRegion =
      selectedRegion === 'all' || 
      course.region === selectedRegion ||
      // region_code로도 매칭 (서버에서 가져온 지역 코드)
      cities.some(city => city.region_code === selectedRegion && 
        (city.region_name.includes(regions.find(r => r.value === course.region)?.label) ||
         regions.find(r => r.value === course.region)?.label.includes(city.region_name)))

    const matchesMonth =
      selectedMonth === 'all' ||
      course.bestMonths.includes(parseInt(selectedMonth))

    const matchesTheme =
      selectedTheme === 'all' || course.theme.includes(selectedTheme)

    return matchesSearch && matchesRegion && matchesMonth && matchesTheme
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
          🗺️ 여행 코스 추천
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          전국의 검증된 여행 코스로 완벽한 여행을 계획해보세요
        </p>
      </div>

      {/* AI 플래너 배너 */}
      <div className="mb-8 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-600 p-3">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                AI 맞춤 플래너
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                빅데이터 기반으로 나만의 맞춤형 여행 코스를 추천받아보세요
              </p>
            </div>
          </div>
          <Link to="/customized-schedule">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              AI 추천받기
            </Button>
          </Link>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-8 space-y-4 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
        {/* 검색바 */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="여행 코스명이나 지역, 키워드로 검색해보세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 text-lg dark:border-gray-600 dark:bg-gray-700"
          />
        </div>

        {/* 필터 */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              필터:
            </span>
          </div>

          <Select
            value={selectedRegion}
            onValueChange={setSelectedRegion}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="지역 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 지역</SelectItem>
              {regionsLoading ? (
                <SelectItem value="loading" disabled>
                  로딩 중...
                </SelectItem>
              ) : regionsError ? (
                <SelectItem value="error" disabled>
                  지역 목록 로드 실패
                </SelectItem>
              ) : (
                [...cities]
                  .sort((a, b) => a.region_name.localeCompare(b.region_name, 'ko'))
                  .map((city) => (
                    <SelectItem key={city.region_code} value={city.region_code}>
                      {city.region_name}
                    </SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-md border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="rounded-md border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {themes.map((theme) => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 검색 결과 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            총{' '}
            <span className="font-bold text-blue-600">
              {filteredCourses.length}
            </span>
            개의 여행 코스
          </p>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ※ 인기순은 최근 3개월 조회수 기준입니다
          </span>
        </div>
      </div>

      {/* 여행 코스 카드 그리드 */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {filteredCourses.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden transition-all hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
          >
            {/* 메인 이미지 */}
            <div className="relative">
              <img
                src={course.mainImage}
                alt={course.title}
                className="h-64 w-full object-cover"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <Badge
                  variant="secondary"
                  className="bg-white/90 text-gray-800"
                >
                  {course.duration}
                </Badge>
                <Badge variant="secondary" className="bg-blue-600 text-white">
                  인기
                </Badge>
              </div>
              <button className="absolute top-3 left-3 rounded-full bg-white/80 p-2 transition-colors hover:bg-white">
                <Heart className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="mb-2 text-xl dark:text-white">
                    {course.title}
                  </CardTitle>
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                    {course.subtitle}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {course.rating}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({course.reviewCount})
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-gray-500">
                        {course.likeCount}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    1인 기준
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    {course.price}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* 코스 요약 */}
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {course.summary}
              </p>

              {/* 테마 및 태그 */}
              <div className="flex flex-wrap gap-2">
                {course.theme.map((theme, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {theme}
                  </Badge>
                ))}
                {course.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    className="bg-blue-100 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>

              {/* 주요 하이라이트 */}
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  🎯 주요 명소
                </h4>
                <div className="flex flex-wrap gap-1">
                  {course.highlights.map((highlight, index) => (
                    <span
                      key={index}
                      className="text-xs text-blue-600 dark:text-blue-400"
                    >
                      {highlight}
                      {index < course.highlights.length - 1 && ' • '}
                    </span>
                  ))}
                </div>
              </div>

              {/* 일정 미리보기 */}
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  📅 일정 미리보기
                </h4>
                <div className="space-y-2">
                  {course.itinerary.slice(0, 2).map((day, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        {day.day}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {day.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {day.activities.slice(0, 3).join(' → ')}
                          {day.activities.length > 3 && ' ...'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {course.itinerary.length > 2 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      외 {course.itinerary.length - 2}일 더...
                    </p>
                  )}
                </div>
              </div>

              {/* 여행 정보 */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {course.duration}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    연중 추천
                  </span>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-3 pt-2">
                <Link to={`/recommend/${course.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Navigation className="mr-2 h-4 w-4" />
                    상세보기
                  </Button>
                </Link>
                <Link
                  to={`/customized-schedule?region=${course.region}`}
                  className="flex-1"
                >
                  <Button
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    맞춤 일정
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 검색 결과가 없을 때 */}
      {filteredCourses.length === 0 && (
        <div className="py-16 text-center">
          <div className="mb-6 text-8xl">🔍</div>
          <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            검색 결과가 없습니다
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            다른 키워드나 필터로 다시 검색해보세요
          </p>
          <Button
            onClick={() => {
              setSearchQuery('')
              setSelectedRegion('all')
              setSelectedMonth('all')
              setSelectedTheme('all')
            }}
            variant="outline"
          >
            필터 초기화
          </Button>
        </div>
      )}

      {/* 하단 CTA */}
      <div className="mt-16 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
        <h3 className="mb-4 text-3xl font-bold">
          아직 마음에 드는 코스를 찾지 못하셨나요?
        </h3>
        <p className="mb-6 text-lg opacity-90">
          AI가 당신의 취향과 일정에 맞는 완벽한 여행 코스를 만들어드립니다
        </p>
        <Link to="/customized-schedule">
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            AI 맞춤 여행 코스 만들기
          </Button>
        </Link>
      </div>
    </div>
  )
}
