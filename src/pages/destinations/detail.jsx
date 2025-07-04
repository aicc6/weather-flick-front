import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Star,
  Heart,
  Share2,
  Calendar,
  Clock,
  MapPin,
  Camera,
  Navigation,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  User,
  Eye,
  MessageSquare,
  Sparkles,
} from '@/components/icons'

export default function TravelCourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])

  // 여행 코스 데이터 (실제로는 API에서 가져올 데이터)
  const courseData = {
    1: {
      id: 1,
      title: '제주도 감성 힐링 코스',
      subtitle: '자연과 함께하는 제주 여행',
      region: 'jeju',
      duration: '2박 3일',
      theme: ['자연', '힐링', '드라이브'],
      mainImage: '/jeju.jpg',
      images: ['/jeju.jpg', '/jeju.jpg', '/jeju.jpg', '/jeju.jpg'],
      rating: 4.8,
      reviewCount: 156,
      likeCount: 234,
      viewCount: 1247,
      price: '280,000원',
      bestMonths: [3, 4, 5, 9, 10, 11],
      summary:
        '한라산 트레킹부터 해변 카페까지, 제주도의 자연을 만끽하는 힐링 코스',
      description: `제주도의 대표 관광지들을 모두 경험할 수 있는 완벽한 3일 코스입니다.

      첫째 날에는 제주 동부의 성산일출봉과 섭지코지에서 웅장한 자연 경관을 감상하고,
      우도와 월정리해변에서 에메랄드빛 바다의 매력을 만끽합니다.

      둘째 날에는 제주 서부의 협재해수욕장과 비양도에서 힐링 시간을 가지고,
      애월해안도로를 따라 드라이브하며 주상절리대의 자연 조각품을 감상합니다.

      마지막 날에는 한라산 트레킹으로 제주의 진면목을 체험하고,
      천지연폭포와 정방폭포에서 제주만의 특별한 폭포 경관을 만나보세요.

      모든 코스는 제주공항에서 시작해서 끝나므로 교통이 편리하며,
      각 관광지의 최고 포토스팟과 현지인 추천 맛집 정보까지 포함되어 있습니다.`,
      highlights: [
        '성산일출봉',
        '섭지코지',
        '우도',
        '협재해수욕장',
        '한라산',
        '천지연폭포',
        '주상절리대',
      ],
      itinerary: [
        {
          day: 1,
          title: '제주 시내 & 동부 탐방',
          activities: [
            {
              time: '10:00',
              place: '제주공항',
              description: '제주공항 도착 및 렌터카 픽업',
            },
            {
              time: '11:30',
              place: '성산일출봉 [유네스코 세계자연유산]',
              description: '제주 대표 명소, 일출 명소로 유명한 화산 봉우리',
            },
            {
              time: '13:30',
              place: '섭지코지',
              description: '넓은 유채꽃밭과 아름다운 해안 절경 감상',
            },
            {
              time: '15:00',
              place: '우도(해양도립공원)',
              description: '배를 타고 가는 작은 섬, 산호해변과 등대 관광',
            },
            {
              time: '17:30',
              place: '월정리해변(월정리해수욕장)',
              description: '에메랄드빛 바다와 하얀 모래사장으로 유명한 해변',
            },
            {
              time: '19:00',
              place: '제주 성산항',
              description: '신선한 해산물과 성산일출봉 야경 감상',
            },
          ],
        },
        {
          day: 2,
          title: '서부 해안 & 중문 관광',
          activities: [
            {
              time: '09:00',
              place: '협재해수욕장',
              description: '제주 서부의 대표 해수욕장, 투명한 바다와 백사장',
            },
            {
              time: '10:30',
              place: '비양도',
              description: '협재해변 앞 작은 섬, 산책과 힐링 장소',
            },
            {
              time: '12:00',
              place: '애월해안도로',
              description: '바다 뷰 카페에서 브런치와 드라이브 코스',
            },
            {
              time: '14:30',
              place: '한담해변',
              description: '애월의 숨은 명소, 현무암과 에메랄드 바다',
            },
            {
              time: '16:00',
              place: '중문관광단지',
              description: '쇼핑과 엔터테인먼트가 결합된 관광 단지',
            },
            {
              time: '17:30',
              place: '주상절리대(대포동지삿개)',
              description: '자연이 만든 기하학적 바위 절벽과 파도 소리',
            },
            {
              time: '19:00',
              place: '중문색달해수욕장',
              description: '검은 모래사장과 일몰이 아름다운 해변',
            },
          ],
        },
        {
          day: 3,
          title: '한라산 & 남부 폭포 탐방',
          activities: [
            {
              time: '08:00',
              place: '한라산',
              description: '제주의 영봉, 한라산 어리목 또는 성판악 코스 트레킹',
            },
            {
              time: '10:30',
              place: '한라생태숲',
              description: '한라산 주변 생태계 체험과 산림욕',
            },
            {
              time: '12:30',
              place: '서귀포자연휴양림',
              description: '한라산 기슭에서 점심과 휴식',
            },
            {
              time: '14:00',
              place: '천지연폭포',
              description: '제주 3대 폭포 중 하나, 22m 높이의 웅장한 폭포',
            },
            {
              time: '15:30',
              place: '정방폭포',
              description: '바다로 직접 떨어지는 특이한 폭포',
            },
            {
              time: '16:30',
              place: '서귀포항',
              description: '제주 남부 대표 항구에서 마지막 쇼핑',
            },
            {
              time: '18:00',
              place: '제주공항',
              description: '공항 이동 및 출발 준비',
            },
          ],
        },
      ],
      tips: [
        '성산일출봉은 이른 아침 일출 시간(오전 6-7시)에 방문하면 최고의 경험을 할 수 있습니다',
        '우도 배편은 날씨에 따라 운항이 중단될 수 있으니 미리 확인하세요',
        '한라산 트레킹 시 방한용품과 충분한 물 준비는 필수입니다',
        '협재해수욕장과 월정리해변은 여름철 매우 붐비니 이른 시간 방문 추천',
        '천지연폭포는 야간 조명이 있어 저녁에도 아름답습니다',
        '렌터카 예약은 최소 2주 전에 미리 해주세요',
      ],
      includes: ['숙박 2박', '렌터카', '주요 관광지 입장료', '가이드북'],
      excludes: ['항공료', '식사비', '개인 경비', '여행자 보험'],
      tags: ['인스타감성', '자연치유', '드라이브'],
    },
    // 다른 코스들은 간단히 추가
    2: {
      id: 2,
      title: '부산 바다 & 도심 투어',
      subtitle: '활기찬 항구도시의 매력',
      region: 'busan',
      duration: '1박 2일',
      theme: ['도시', '바다', '맛집'],
      mainImage: '/busan.jpeg',
      images: ['/busan.jpeg', '/busan.jpeg', '/busan.jpeg'],
      rating: 4.6,
      reviewCount: 203,
      likeCount: 189,
      viewCount: 892,
      price: '180,000원',
      bestMonths: [4, 5, 6, 9, 10, 11],
      summary: '해운대부터 감천문화마을까지, 부산의 대표 명소를 둘러보는 코스',
      description: '부산의 바다와 도심을 모두 즐길 수 있는 완벽한 투어입니다.',
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
          activities: [
            {
              time: '10:00',
              place: '해운대해수욕장',
              description: '부산 대표 해변에서 산책',
            },
            {
              time: '12:00',
              place: '동백섬',
              description: '누리마루와 해안 산책로',
            },
            {
              time: '15:00',
              place: '센텀시티',
              description: '쇼핑과 영화감상',
            },
            {
              time: '19:00',
              place: '광안리해변',
              description: '광안대교 야경 감상',
            },
          ],
        },
      ],
      tips: ['해운대는 여름철 매우 붐비니 이른 시간 방문 추천'],
      includes: ['숙박 1박', '시티투어버스', '주요 관광지 입장료'],
      excludes: ['교통비', '식사비', '개인 경비'],
      tags: ['도시여행', '야경감상', '맛집투어'],
    },
  }

  const course = courseData[id] || courseData[1] // 기본값으로 첫 번째 코스

  useEffect(() => {
    // 페이지 방문 시 조회수 증가 (실제로는 API 호출)
    console.log('조회수 증가:', course.title)
  }, [id])

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? course.images.length - 1 : prev - 1,
    )
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === course.images.length - 1 ? 0 : prev + 1,
    )
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course.title,
        text: course.summary,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('링크가 복사되었습니다!')
    }
  }

  const handleAddToMyTrip = () => {
    alert('내 여행 코스에 추가되었습니다!')
  }

  const handleRatingSubmit = (value) => {
    setRating(value)
    alert(`${value}점으로 평가해주셔서 감사합니다!`)
  }

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      const newComment = {
        id: Date.now(),
        user: '사용자',
        content: comment,
        date: new Date().toLocaleDateString(),
        rating: 5,
        helpful: 0,
      }
      setComments([newComment, ...comments])
      setComment('')
      alert('후기가 등록되었습니다!')
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 뒤로가기 버튼 */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        목록으로 돌아가기
      </Button>

      {/* 코스 제목 및 액션 */}
      <div className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge className="bg-blue-600 text-white">Easy코스</Badge>
          <Badge variant="outline">인기</Badge>
          {course.theme.map((theme, index) => (
            <Badge key={index} variant="secondary">
              {theme}
            </Badge>
          ))}
        </div>

        <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
          {course.title}
        </h1>
        <p className="mb-4 text-xl text-gray-600 dark:text-gray-300">
          {course.subtitle}
        </p>

        {/* 평점 및 통계 */}
        <div className="mb-6 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="text-lg font-semibold">{course.rating}</span>
            <span className="text-gray-500">({course.reviewCount}명 평가)</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-400" />
            <span className="text-gray-600">좋아요 {course.likeCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600">조회수 {course.viewCount}</span>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant={isLiked ? 'default' : 'outline'}
            onClick={() => setIsLiked(!isLiked)}
            className={isLiked ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            <Heart className="mr-2 h-4 w-4" />
            좋아요
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            공유하기
          </Button>
          <Button
            variant={isBookmarked ? 'default' : 'outline'}
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            <Navigation className="mr-2 h-4 w-4" />
            코스 담기
          </Button>
          <Button
            onClick={handleAddToMyTrip}
            className="bg-blue-600 hover:bg-blue-700"
          >
            내 여행에 추가
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-2">
          {/* 이미지 갤러리 */}
          <Card className="mb-8 overflow-hidden dark:border-gray-700 dark:bg-gray-800">
            <div className="relative">
              <img
                src={course.images[currentImageIndex]}
                alt={course.title}
                className="h-96 w-full object-cover"
              />
              <button
                onClick={handlePrevImage}
                className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {course.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 w-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-4 bottom-4"
              >
                <Camera className="mr-2 h-4 w-4" />
                크게보기
              </Button>
            </div>
          </Card>

          {/* 코스 설명 */}
          <Card className="mb-8 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">코스 소개</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
                {course.summary}
              </p>
              <div className="whitespace-pre-line text-gray-600 dark:text-gray-400">
                {course.description}
              </div>
            </CardContent>
          </Card>

          {/* 상세 일정 */}
          <Card className="mb-8 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">📅 상세 일정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {course.itinerary.map((day, dayIndex) => (
                <div key={dayIndex} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Day {day.day}: {day.title}
                  </h3>
                  <div className="space-y-3">
                    {day.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex gap-4">
                        <div className="flex-shrink-0 rounded bg-blue-100 px-2 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {activity.time}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {activity.place}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 여행 팁 */}
          <Card className="mb-8 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">💡 여행 팁</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {course.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 평가하기 */}
          <Card className="mb-8 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">
                해당 코스가 마음에 드시나요?
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                평가를 해주시면 개인화 추천 시 활용하여 최적의 여행지를 추천해
                드리겠습니다.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  onClick={() => handleRatingSubmit(5)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  👍 좋아요!
                </Button>
                <Button variant="outline" onClick={() => handleRatingSubmit(2)}>
                  👎 별로예요
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 댓글 섹션 */}
          <Card className="dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <MessageSquare className="h-5 w-5" />
                댓글 ({comments.length}건)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 댓글 작성 */}
              <div className="space-y-3">
                <Textarea
                  placeholder="이 여행 코스에 대한 후기를 남겨주세요..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="dark:border-gray-600 dark:bg-gray-700"
                />
                <Button onClick={handleCommentSubmit} size="sm">
                  댓글 등록
                </Button>
              </div>

              {/* AI 요약 */}
              {comments.length > 0 && (
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-800 dark:text-blue-200">
                    <Sparkles className="h-4 w-4" />
                    AI가 빠르게 요약해주는 사용자 후기!
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    대부분의 사용자들이 자연 경관과 힐링 요소에 만족하고 있으며,
                    특히 한라산 트레킹과 애월 카페거리를 추천하고 있습니다.
                  </p>
                </div>
              )}

              {/* 댓글 목록 */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-b pb-4 dark:border-gray-700"
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="font-medium dark:text-white">
                        {comment.user}
                      </span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < comment.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {comment.date}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {comment.content}
                    </p>
                    <div className="mt-2 flex items-center gap-4">
                      <Button variant="ghost" size="sm">
                        👍 도움이 돼요 ({comment.helpful})
                      </Button>
                      <Button variant="ghost" size="sm">
                        답글
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 예약 정보 */}
          <Card className="sticky top-4 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">여행 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  1인 기준
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {course.price}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="dark:text-gray-300">{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="dark:text-gray-300">연중 추천</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="dark:text-gray-300">{course.region}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium dark:text-white">포함사항</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {course.includes.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-green-500"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium dark:text-white">불포함사항</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {course.excludes.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-red-500"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Link to={`/customized-schedule?region=${course.region}`}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  맞춤 일정 만들기
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 주요 명소 */}
          <Card className="dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">🎯 주요 명소</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {course.highlights.map((highlight, index) => (
                  <Badge key={index} variant="outline" className="mr-2">
                    {highlight}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 태그 */}
          <Card className="dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">🏷️ 태그</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
