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
  Clock,
  Heart,
  Camera,
  Navigation,
  Sparkles,
} from '@/components/icons'

export default function TravelCoursePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedTheme, setSelectedTheme] = useState('all')

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
      weather: '☀️ 맑음',
      temperature: '22°C',
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
      weather: '🌤️ 구름조금',
      temperature: '19°C',
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
      weather: '🌊 바람',
      temperature: '16°C',
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
      weather: '🌅 노을',
      temperature: '18°C',
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
            '야경투어',
          ],
        },
      ],
      tags: ['전통문화', '미식여행', '체험활동'],
      weather: '☁️ 흐림',
      temperature: '20°C',
    },
  ]

  // 지역 이름 매핑
  const regionNames = {
    all: '전체',
    seoul: '서울',
    busan: '부산',
    incheon: '인천',
    daegu: '대구',
    daejeon: '대전',
    gwangju: '광주',
    ulsan: '울산',
    sejong: '세종',
    gyeonggi: '경기',
    gangwon: '강원',
    chungbuk: '충북',
    chungnam: '충남',
    jeonbuk: '전북',
    jeonnam: '전남',
    gyeongbuk: '경북',
    gyeongnam: '경남',
    jeju: '제주',
    gangneung: '강릉',
    gyeongju: '경주',
    jeonju: '전주',
  }

  // 월 이름 배열
  const monthNames = [
    '전체',
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ]

  // 테마 옵션
  const themeOptions = [
    { value: 'all', label: '전체 테마' },
    { value: 'nature', label: '🌿 자연' },
    { value: 'city', label: '🏙️ 도시' },
    { value: 'beach', label: '🏖️ 바다' },
    { value: 'history', label: '🏛️ 역사' },
    { value: 'food', label: '🍜 맛집' },
    { value: 'healing', label: '😌 힐링' },
    { value: 'activity', label: '🏃 액티비티' },
  ]

  // 필터링 로직
  const filteredCourses = travelCourses.filter((course) => {
    const matchesSearch =
      searchQuery === '' ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.summary.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRegion =
      selectedRegion === 'all' || course.region === selectedRegion

    const matchesMonth =
      selectedMonth === 'all' ||
      course.bestMonths.includes(parseInt(selectedMonth))

    const matchesTheme =
      selectedTheme === 'all' ||
      course.theme.some((theme) =>
        theme.toLowerCase().includes(selectedTheme.toLowerCase()),
      )

    return matchesSearch && matchesRegion && matchesMonth && matchesTheme
  })

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="page-destinations relative py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8">
            <h1 className="text-foreground mb-4 text-4xl font-bold">
              🌤️ 날씨 맞춤 여행지 추천
            </h1>
            <p className="text-muted-foreground text-lg">
              실시간 날씨 정보를 기반으로 완벽한 여행지를 찾아보세요
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="weather-card glass-effect mx-auto max-w-4xl p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Search Input */}
              <div className="relative">
                <Search
                  className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                  style={{ color: 'var(--primary-blue)' }}
                />
                <Input
                  placeholder="여행지나 키워드 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-10"
                />
              </div>

              {/* Region Filter */}
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="지역 선택" />
                </SelectTrigger>
                <SelectContent className="weather-card">
                  <SelectItem value="all">전체 지역</SelectItem>
                  {Object.entries(regionNames)
                    .slice(1)
                    .map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Month Filter */}
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="여행 시기" />
                </SelectTrigger>
                <SelectContent className="weather-card">
                  {monthNames.map((month, index) => (
                    <SelectItem
                      key={index}
                      value={index === 0 ? 'all' : index.toString()}
                    >
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Theme Filter */}
              <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="여행 테마" />
                </SelectTrigger>
                <SelectContent className="weather-card">
                  {themeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Summary */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                총 {filteredCourses.length}개의 여행 코스를 찾았습니다
              </span>
              {(selectedRegion !== 'all' ||
                selectedMonth !== 'all' ||
                selectedTheme !== 'all' ||
                searchQuery) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedRegion('all')
                    setSelectedMonth('all')
                    setSelectedTheme('all')
                  }}
                  className="border-border hover:bg-muted"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  필터 초기화
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="container mx-auto px-4 py-12">
        {filteredCourses.length === 0 ? (
          <div className="weather-card mx-auto max-w-md p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--primary-blue-light)' }}
              >
                <Search
                  className="h-10 w-10"
                  style={{ color: 'var(--primary-blue)' }}
                />
              </div>
            </div>
            <h3 className="text-foreground mb-2 text-xl font-semibold">
              검색 결과가 없습니다
            </h3>
            <p className="text-muted-foreground mb-6">
              다른 검색어나 필터를 시도해보세요
            </p>
            <Button
              onClick={() => {
                setSearchQuery('')
                setSelectedRegion('all')
                setSelectedMonth('all')
                setSelectedTheme('all')
              }}
              className="primary-button font-semibold"
            >
              전체 코스 보기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="weather-card group cursor-pointer"
              >
                <Link to={`/recommend/${course.id}`} className="block">
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden rounded-t-xl">
                    <img
                      src={course.mainImage}
                      alt={course.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    {/* Weather overlay */}
                    <div className="status-primary absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold">
                      {course.weather}
                    </div>
                    {/* Temperature */}
                    <div
                      className="dark:bg-card/90 absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-sm font-bold"
                      style={{ color: 'var(--primary-blue-dark)' }}
                    >
                      {course.temperature}
                    </div>
                    {/* Like Button */}
                    <button className="dark:bg-card/90 dark:hover:bg-card absolute top-3 left-3 rounded-full bg-white/90 p-2 hover:bg-white">
                      <Heart
                        className="h-4 w-4"
                        style={{ color: 'var(--primary-blue-dark)' }}
                      />
                    </button>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-foreground line-clamp-1 text-lg font-bold">
                          {course.title}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">
                          {course.subtitle}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star
                          className="h-4 w-4 fill-current"
                          style={{ color: 'var(--accent-yellow)' }}
                        />
                        <span className="text-foreground text-sm font-medium">
                          {course.rating}
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {course.theme.slice(0, 3).map((tag, index) => (
                        <Badge key={index} className="status-soft text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                      {course.summary}
                    </p>

                    {/* Course Info */}
                    <div className="mb-4 space-y-2">
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Clock
                          className="h-4 w-4"
                          style={{ color: 'var(--primary-blue)' }}
                        />
                        <span>{course.duration}</span>
                      </div>
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Navigation
                          className="h-4 w-4"
                          style={{ color: 'var(--primary-blue)' }}
                        />
                        <span>
                          {regionNames[course.region] || course.region}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Info */}
                    <div
                      className="flex items-center justify-between border-t pt-3"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <div
                        className="text-lg font-bold"
                        style={{ color: 'var(--primary-blue-dark)' }}
                      >
                        {course.price}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {course.likeCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Camera className="h-3 w-3" />
                          {course.reviewCount}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA Section */}
      <section className="page-destinations py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="weather-card glass-effect mx-auto max-w-2xl p-8">
            <Sparkles
              className="mx-auto mb-4 h-16 w-16"
              style={{ color: 'var(--accent-cyan-bright)' }}
            />
            <h2 className="text-foreground mb-4 text-3xl font-bold">
              나만의 여행 계획을 세워보세요!
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              AI가 도와주는 맞춤형 여행 일정으로 완벽한 여행을 준비하세요
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/customized-schedule"
                className="primary-button rounded-full px-8 py-3 font-semibold"
              >
                🎯 맞춤 일정 만들기
              </Link>
              <Link
                to="/planner"
                className="accent-button rounded-full px-8 py-3 font-semibold"
              >
                📋 직접 계획하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
