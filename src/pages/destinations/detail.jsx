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
      description: `제주도의 아름다운 자연을 만끽할 수 있는 완벽한 힐링 코스입니다.
      한라산의 웅장함부터 애월의 카페 거리, 그리고 에메랄드빛 바다까지
      제주도가 선사하는 모든 매력을 느껴보세요.

      특히 일출과 일몰 명소를 포함하여 인스타그램에 올릴 완벽한 사진도 건질 수 있습니다.
      현지인만 아는 숨은 맛집과 카페도 함께 소개해드립니다.`,
      highlights: ['한라산 어리목 탐방로', '애월 카페거리', '협재해변', '우도'],
      itinerary: [
        {
          day: 1,
          title: '제주 시내 & 동부',
          activities: [
            {
              time: '10:00',
              place: '제주공항',
              description: '제주공항 도착 및 렌터카 픽업',
            },
            {
              time: '11:30',
              place: '성산일출봉',
              description: '유네스코 세계자연유산 탐방',
            },
            {
              time: '14:00',
              place: '우도',
              description: '배를 타고 우도 관광',
            },
            {
              time: '18:00',
              place: '성산포항',
              description: '신선한 해산물 저녁 식사',
            },
          ],
        },
        {
          day: 2,
          title: '서부 해안 드라이브',
          activities: [
            {
              time: '09:00',
              place: '협재해변',
              description: '에메랄드빛 바다 감상',
            },
            {
              time: '11:00',
              place: '애월 카페거리',
              description: '바다 뷰 카페에서 브런치',
            },
            {
              time: '14:00',
              place: '한림공원',
              description: '야자수길과 협재굴 탐방',
            },
            {
              time: '17:00',
              place: '곽지해변',
              description: '제주도 일몰 명소',
            },
          ],
        },
        {
          day: 3,
          title: '중산간 자연 탐방',
          activities: [
            {
              time: '08:00',
              place: '한라산 어리목',
              description: '한라산 트레킹 (영실코스)',
            },
            {
              time: '12:00',
              place: '1100고지',
              description: '고지대에서 점심식사',
            },
            { time: '15:00', place: '천지연폭포', description: '폭포 트레킹' },
            {
              time: '17:00',
              place: '제주공항',
              description: '공항 이동 및 출발',
            },
          ],
        },
      ],
      tips: [
        '렌터카 예약은 최소 2주 전에 미리 해주세요',
        '한라산 트레킹 시 방한용품 필수',
        '우도 배편은 날씨에 따라 운항이 중단될 수 있습니다',
        '애월 카페거리는 주말에 매우 붐비니 평일 방문 추천',
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
    5: {
      id: 5,
      title: '전주 한옥마을 & 전통문화 당일 코스',
      subtitle: '천년 전통의 멋과 맛이 살아있는 전주',
      region: 'jeonju',
      duration: '당일',
      theme: ['전통문화', '한옥', '맛집', '체험'],
      mainImage: '/jeonju.jpeg',
      images: [
        '/jeonju.jpeg',
        '/jeonju-hanok.jpeg',
        '/jeonju-food.jpeg',
        '/jeonju-gyeonggijeon.jpeg',
      ],
      rating: 4.7,
      reviewCount: 312,
      likeCount: 425,
      viewCount: 1854,
      price: '120,000원',
      bestMonths: [3, 4, 5, 9, 10, 11],
      summary:
        '전주 한옥마을에서 경기전, 풍남문까지 전주의 전통과 문화를 체험하는 완벽한 당일 코스',
      description: `전주는 조선왕조의 뿌리가 시작된 곳으로, 전통 한옥과 궁중문화가 잘 보존된 도시입니다.

      전주 한옥마을에서 한복을 입고 거닐며 조선시대의 정취를 느끼고, 경기전에서 태조 이성계의 어진을 만나보세요. 전주전동성당의 아름다운 근대 건축과 풍남문의 웅장함도 놓칠 수 없는 볼거리입니다.

      전주 비빔밥과 한정식으로 유명한 맛의 고장에서 미식 여행도 함께 즐기실 수 있습니다. 전통 한지 체험과 한복 체험까지 더해 특별한 추억을 만들어보세요.`,
      highlights: [
        '전주 한옥마을',
        '경기전',
        '전주전동성당',
        '전주 풍남문',
        '덕진공원',
        '한벽당',
      ],
      itinerary: [
        {
          day: 1,
          title: '전주 전통문화 탐방',
          activities: [
            {
              time: '09:00',
              place: '전주 한옥마을',
              description: '전통 한옥 건축을 감상하며 한복 체험 및 거리 산책',
              address: '전북특별자치도 전주시 완산구 기린대로 99',
            },
            {
              time: '10:30',
              place: '경기전',
              description: '조선 태조 이성계의 어진이 모셔진 역사적 공간 탐방',
              address: '전북특별자치도 전주시 완산구 태조로 44 (풍남동3가)',
            },
            {
              time: '11:30',
              place: '전주전동성당',
              description: '아름다운 근대 건축양식의 성당 관람',
              address: '전북특별자치도 전주시 완산구 태조로 51',
            },
            {
              time: '12:30',
              place: '한옥마을 맛집 거리',
              description: '전주 비빔밥과 전통 한정식으로 점심 식사',
              address: '전북특별자치도 전주시 완산구 한옥마을 일대',
            },
            {
              time: '14:00',
              place: '전주전통한지원',
              description: '전통 한지 제작 과정 견학 및 체험',
              address: '전북특별자치도 전주시 완산구 한지길 100-10',
            },
            {
              time: '15:30',
              place: '전주 풍남문',
              description: '전주를 대표하는 조선시대 성문',
              address: '전북특별자치도 전주시 완산구 풍남문3길 1',
            },
            {
              time: '16:30',
              place: '한벽당',
              description: '전주천을 내려다보는 아름다운 전통 정자',
              address: '전북특별자치도 전주시 완산구 기린대로 2',
            },
            {
              time: '17:30',
              place: '오목대와 이목대',
              description: '전주 시내를 한눈에 볼 수 있는 전망 명소',
              address: '전북특별자치도 전주시 완산구 기린대로 55',
            },
            {
              time: '18:30',
              place: '덕진공원',
              description: '연꽃으로 유명한 아름다운 공원에서 저녁 산책',
              address: '전북특별자치도 전주시 덕진구 권삼득로 390',
            },
          ],
        },
      ],
      tips: [
        '한복 체험은 한옥마을 입구에서 대여 가능하며, 3-4시간 기준 2-3만원',
        '경기전과 전동성당은 도보로 5분 거리에 있어 연계 관람 추천',
        '전주 비빔밥은 한옥마을 내 전통 한정식집에서 맛보세요',
        '덕진공원은 연꽃이 피는 7-8월이 가장 아름답습니다',
        '주차는 한옥마을 공영주차장 이용 (2시간 3,000원)',
        '전주전통한지원에서는 한지 부채 만들기 체험이 인기입니다',
      ],
      includes: [
        '주요 관광지 입장료',
        '한복 체험비',
        '한지 체험비',
        '가이드북',
      ],
      excludes: ['교통비', '식사비', '개인 경비', '주차비'],
      tags: ['전통문화', '한복체험', '역사탐방', '인스타감성', '맛집투어'],
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
