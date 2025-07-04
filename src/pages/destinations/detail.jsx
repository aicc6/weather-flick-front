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
  X,
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
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)

  // 여행 코스 데이터 (실제로는 API에서 가져올 데이터)
  const courseData = {
    1: {
      id: 1,
      title: '제주도 감성 힐링 코스',
      subtitle: '자연과 함께하는 제주 여행',
      region: 'jeju',
      duration: '2박 3일',
      theme: ['자연', '힐링', '드라이브'],
      mainImage:
        'http://tong.visitkorea.or.kr/cms/resource/82/2944282_image2_1.bmp',
      images: [
        'http://tong.visitkorea.or.kr/cms/resource/82/2944282_image2_1.bmp', // 성산일출봉 - UNESCO 세계자연유산, 제주 대표 일출 명소
        'http://tong.visitkorea.or.kr/cms/resource/98/2870098_image2_1.jpg', // 한라산 - 제주도 최고봉, 한국 최고봉
        'http://tong.visitkorea.or.kr/cms/resource/68/3011868_image2_1.jpg', // 용두암 - 제주의 대표적인 바위 명소
        'http://tong.visitkorea.or.kr/cms/resource/55/3354155_image2_1.jpg', // 만장굴 - 제주도 대표 용암동굴, 국가지질공원
      ],
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
      mainImage:
        'http://tong.visitkorea.or.kr/cms/resource/34/3090534_image2_1.JPG',
      images: [
        'http://tong.visitkorea.or.kr/cms/resource/34/3090534_image2_1.JPG', // 해운대해수욕장 - 부산의 대표적인 해변
        'http://tong.visitkorea.or.kr/cms/resource/45/3311245_image2_1.jpg', // 광안리해수욕장 - 광안대교 야경으로 유명한 해변
        'http://tong.visitkorea.or.kr/cms/resource/91/3365491_image2_1.jpg', // 부산 감천문화마을 - 알록달록한 계단식 마을
        'http://tong.visitkorea.or.kr/cms/resource/63/2918063_image2_1.jpg', // 태종대 - 부산의 대표적인 자연 관광지
      ],
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
    // 여수 1박 2일 코스
    6: {
      id: 6,
      title: '여수 낭만 바다 여행',
      subtitle: '이순신의 발자취와 함께하는 밤바다 낭만',
      region: 'yeosu',
      duration: '1박 2일',
      theme: ['바다', '야경', '역사'],
      mainImage: '/yeosu.jpeg',
      images: ['/yeosu.jpeg', '/yeosu.jpeg', '/yeosu.jpeg'],
      rating: 4.7,
      reviewCount: 312,
      likeCount: 428,
      viewCount: 1856,
      price: '220,000원',
      bestMonths: [4, 5, 6, 9, 10, 11],
      summary:
        '이순신광장부터 향일암까지, 여수의 바다와 역사가 어우러진 낭만적인 코스',
      description: `여수는 아름다운 밤바다와 역사적 의미가 깊은 곳들이 어우러진 특별한 여행지입니다.
      이순신 장군의 흔적을 따라가며 거북선의 역사를 배우고,
      돌산대교와 이순신대교의 환상적인 야경을 감상할 수 있습니다.

      특히 향일암에서 바라보는 일출과 낭만포차거리에서 즐기는 신선한 해산물은
      여수 여행의 백미입니다. 고소동 천사벽화마을의 아기자기한 골목길과
      오동도의 자연경관까지 더해져 완벽한 여수 여행을 만들어드립니다.`,
      highlights: [
        '이순신광장',
        '돌산대교',
        '향일암',
        '낭만포차거리',
        '오동도',
      ],
      itinerary: [
        {
          day: 1,
          title: '여수 시내 & 역사 탐방',
          activities: [
            {
              time: '10:00',
              place: '이순신광장',
              description: '여수 여행의 시작점, 이순신 동상과 거북선 관람',
            },
            {
              time: '11:30',
              place: '거북선공원',
              description: '실물 크기 거북선 모형과 역사관 견학',
            },
            {
              time: '13:00',
              place: '여수구항',
              description: '항구 풍경과 점심식사 (해산물 백반)',
            },
            {
              time: '15:00',
              place: '고소동 천사벽화마을',
              description: '아기자기한 벽화 골목길 산책과 사진 촬영',
            },
            {
              time: '17:00',
              place: '돌산공원',
              description: '돌산대교 전망과 여수 시내 조망',
            },
            {
              time: '19:00',
              place: '낭만포차거리',
              description: '여수 밤바다를 보며 포차 음식과 소주 한잔',
            },
            {
              time: '21:00',
              place: '이순신대교',
              description: '화려한 야간 조명과 함께하는 야경 감상',
            },
          ],
        },
        {
          day: 2,
          title: '자연과 바다 만끽',
          activities: [
            {
              time: '06:00',
              place: '향일암',
              description: '일출 명소에서 바라보는 장엄한 해돋이',
            },
            {
              time: '08:30',
              place: '방죽포해변',
              description: '향일암 근처 해변에서 산책과 브런치',
            },
            {
              time: '10:30',
              place: '무슬목해변',
              description: '돌산도의 아름다운 해변에서 여유로운 시간',
            },
            {
              time: '12:30',
              place: '돌산대교',
              description: '여수의 랜드마크 다리 건너며 점심식사',
            },
            {
              time: '14:30',
              place: '오동도',
              description: '동백나무 숲길과 끝등 전망대에서 바다 조망',
            },
            {
              time: '16:30',
              place: '여수해양공원',
              description: '해양생물 관찰과 체험 프로그램',
            },
            {
              time: '18:00',
              place: '여수신항',
              description: '여행 마무리 및 기념품 구입',
            },
          ],
        },
      ],
      tips: [
        '향일암 일출은 날씨에 따라 달라지니 일기예보를 확인해주세요',
        '낭만포차거리는 주말 저녁에 매우 붐비니 평일 방문을 추천합니다',
        '돌산대교는 도보로도 건널 수 있어 산책하며 야경을 즐길 수 있습니다',
        '여수는 바람이 많이 부니 가벼운 바람막이나 겉옷을 준비하세요',
        '해산물 알레르기가 있으신 분은 미리 확인해주세요',
        '이순신대교 야경은 밤 10시 이후가 가장 아름답습니다',
      ],
      includes: ['숙박 1박', '관광지 입장료', '가이드북', '교통패스'],
      excludes: ['교통비', '식사비', '개인 경비', '체험 프로그램비'],
      tags: ['바다여행', '역사탐방', '야경감상', '일출명소'],
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

  const handleModalPrevImage = () => {
    setModalImageIndex((prev) =>
      prev === 0 ? course.images.length - 1 : prev - 1,
    )
  }

  const handleModalNextImage = () => {
    setModalImageIndex((prev) =>
      prev === course.images.length - 1 ? 0 : prev + 1,
    )
  }

  const openImageModal = () => {
    setModalImageIndex(currentImageIndex)
    setIsImageModalOpen(true)
    // 모달이 열렸을 때 스크롤 방지
    document.body.style.overflow = 'hidden'
  }

  const closeImageModal = () => {
    setIsImageModalOpen(false)
    // 모달이 닫혔을 때 스크롤 복원
    document.body.style.overflow = 'unset'
  }

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isImageModalOpen) {
        closeImageModal()
      }
      if (isImageModalOpen) {
        if (event.key === 'ArrowLeft') {
          handleModalPrevImage()
        }
        if (event.key === 'ArrowRight') {
          handleModalNextImage()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      // 컴포넌트 언마운트 시 스크롤 복원
      document.body.style.overflow = 'unset'
    }
  }, [isImageModalOpen])

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
                onClick={openImageModal}
              >
                <Camera className="mr-2 h-4 w-4" />
                크게보기
              </Button>
            </div>
          </Card>

          {/* 이미지 모달 */}
          {isImageModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
              {/* 모달 배경 클릭으로 닫기 */}
              <div className="absolute inset-0" onClick={closeImageModal} />

              {/* 모달 콘텐츠 */}
              <div className="relative z-10 max-h-[90vh] max-w-[90vw]">
                {/* 닫기 버튼 */}
                <button
                  onClick={closeImageModal}
                  className="absolute top-4 right-4 z-20 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                >
                  <X className="h-6 w-6" />
                </button>

                {/* 이미지 */}
                <img
                  src={course.images[modalImageIndex]}
                  alt={`${course.title} - 이미지 ${modalImageIndex + 1}`}
                  className="max-h-[90vh] max-w-[90vw] object-contain"
                />

                {/* 이전/다음 버튼 */}
                {course.images.length > 1 && (
                  <>
                    <button
                      onClick={handleModalPrevImage}
                      className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={handleModalNextImage}
                      className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* 이미지 인디케이터 */}
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  {course.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setModalImageIndex(index)}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        index === modalImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>

                {/* 이미지 정보 */}
                <div className="absolute bottom-12 left-4 rounded bg-black/50 px-3 py-2 text-white">
                  <span className="text-sm">
                    {modalImageIndex + 1} / {course.images.length}
                  </span>
                </div>
              </div>
            </div>
          )}

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
