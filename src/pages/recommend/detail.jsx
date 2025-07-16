import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useGetTravelCourseDetailQuery } from '@/store/api'
import { useAuth } from '@/contexts/AuthContextRTK'
import {
  Star,
  Heart,
  Share2,
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  MessageSquare,
  X,
} from '@/components/icons'
import ReviewTree from '@/components/common/ReviewTree'
import {
  useGetReviewsTreeByCourseQuery,
  useCreateReviewMutation,
} from '@/store/api/recommendReviewsApi'
import {
  useGetCourseLikeQuery,
  useLikeCourseMutation,
  useUnlikeCourseMutation,
} from '@/store/api'

// 지역 코드를 한글 지역명으로 변환하는 함수
const getRegionDisplayName = (regionCode) => {
  const regionMapping = {
    jeju: '제주',
    busan: '부산',
    seoul: '서울',
    gangneung: '강릉',
    jeonju: '전주',
    gyeongju: '경주',
    yeosu: '여수',
    sokcho: '속초',
    tongyeong: '통영',
    andong: '안동',
    gapyeong: '가평',
    damyang: '담양',
    boseong: '보성',
    samcheok: '삼척',
    pyeongchang: '평창',
    chuncheon: '춘천',
    pohang: '포항',
    mokpo: '목포',
    suncheon: '순천',
    jinju: '진주',
    geoje: '거제',
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
  }

  return regionMapping[regionCode] || regionCode
}

export default function TravelCourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // API 호출로 여행 코스 데이터 조회
  const {
    data: course,
    isLoading,
    isError,
    error,
  } = useGetTravelCourseDetailQuery(id, {
    skip: !id, // id가 없으면 요청 건너뛰기
  })

  // 모든 useState Hook들을 early return 이전으로 이동
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [_rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)

  // 각 일차별 열림/닫힘 상태 관리
  const [expandedDays, setExpandedDays] = useState(() => {
    // 기본적으로 모든 일차를 열린 상태로 초기화
    const initialState = {}
    for (let i = 1; i <= 6; i++) {
      initialState[i] = true
    }
    return initialState
  })

  // 이미지 처리 - course가 있을 때만 계산
  const images = useMemo(() => {
    if (import.meta.env.DEV) {
      console.log('🖼️ 이미지 처리:', {
        courseImages: course?.images,
        mainImage: course?.mainImage,
        courseId: course?.id,
      })
    }

    if (course?.images && course.images.length > 0) {
      const filteredImages = course.images.filter(Boolean)
      if (import.meta.env.DEV) {
        console.log('✅ 이미지 배열 사용:', filteredImages)
      }
      return filteredImages
    }
    if (course?.mainImage) {
      const mainImageArray = [course.mainImage].filter(Boolean)
      if (import.meta.env.DEV) {
        console.log('✅ 메인 이미지 사용:', mainImageArray)
      }
      return mainImageArray
    }
    // 기본 이미지 제공
    const fallbackImages = course?.id
      ? [`https://picsum.photos/800/600?random=${course.id}`]
      : [`https://picsum.photos/800/600?random=default`]

    if (import.meta.env.DEV) {
      console.log('🔄 기본 이미지 사용:', fallbackImages)
    }
    return fallbackImages
  }, [course?.images, course?.mainImage, course?.id])

  // 모든 useCallback과 함수들을 early return 이전으로 이동
  const toggleDay = useCallback((dayNumber) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNumber]: !prev[dayNumber],
    }))
  }, [])

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  const handleModalPrevImage = useCallback(() => {
    setModalImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const handleModalNextImage = useCallback(() => {
    setModalImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  const openImageModal = useCallback(() => {
    setModalImageIndex(currentImageIndex)
    setIsImageModalOpen(true)
    document.body.style.overflow = 'hidden'
  }, [currentImageIndex])

  const closeImageModal = useCallback(() => {
    setIsImageModalOpen(false)
    document.body.style.overflow = 'unset'
  }, [])

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: course?.title || '여행 코스',
        text: course?.summary || '',
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('링크가 복사되었습니다!')
    }
  }, [course?.title, course?.summary])

  const handleAddToMyTrip = useCallback(() => {
    alert('내 여행 코스에 추가되었습니다!')
  }, [])

  const handleRatingSubmit = useCallback((value) => {
    setRating(value)
    alert(`${value}점으로 평가해주셔서 감사합니다!`)
  }, [])

  const { user } = useAuth()

  // 트리형 댓글 데이터
  const {
    data: reviewTree = [],
    isLoading: isReviewsLoading,
    isError: isReviewsError,
    refetch: refetchReviews,
  } = useGetReviewsTreeByCourseQuery(id, {
    skip: !id || isNaN(Number(id)), // id가 없거나 숫자가 아닐 때 스킵
  })
  const [createReview, { isLoading: isPosting }] = useCreateReviewMutation()

  // 댓글/답글 등록 핸들러
  const handleReviewSubmit = useCallback(
    async (parentId, content, rating) => {
      await createReview({
        course_id: Number(id),
        rating: rating || 5,
        content,
        nickname: user?.nickname || user?.email || '사용자',
        parent_id: parentId || null,
      }).unwrap()
      // invalidatesTags로 자동 갱신됨
    },
    [id, user, createReview],
  )

  // 좋아요 상태/카운트 RTK Query
  const { data: likeData, isLoading: likeLoading } = useGetCourseLikeQuery(
    Number(id),
    {
      skip: !id || isNaN(Number(id)), // id가 없거나 숫자가 아닐 때 스킵
    },
  )
  const [likeCourse] = useLikeCourseMutation()
  const [unlikeCourse] = useUnlikeCourseMutation()

  const handleLikeClick = async () => {
    if (likeData?.liked) {
      await unlikeCourse(Number(id))
    } else {
      await likeCourse(Number(id))
    }
  }

  // 리뷰 별점 평균/인원 계산 함수
  function getAvgRatingAndCount(reviews) {
    const topLevel = reviews.filter((r) => !r.parent_id)
    const totalRating = topLevel.reduce((sum, r) => sum + (r.rating || 0), 0)
    const avgRating = topLevel.length > 0 ? totalRating / topLevel.length : 0
    const peopleCount = topLevel.length
    return { avgRating, peopleCount }
  }

  // 별점 평균/인원 계산 (reviewTree fetch 이후)
  const { avgRating, peopleCount } = getAvgRatingAndCount(reviewTree)

  // 모든 useEffect들을 early return 이전으로 이동
  useEffect(() => {
    // 페이지 방문 시 조회수 증가 (실제로는 API 호출)
    if (course?.id) {
      console.log('Course visited:', course.id)
    }
  }, [course?.id])

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
      document.body.style.overflow = 'unset'
    }
  }, [
    isImageModalOpen,
    handleModalNextImage,
    handleModalPrevImage,
    closeImageModal,
  ])

  // 이제 조건부 렌더링 (early return)
  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600 dark:text-gray-300">
              여행 코스 정보를 불러오는 중...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 에러 상태 처리
  if (isError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-red-600">
              오류가 발생했습니다
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {error?.data?.message || '여행 코스 정보를 불러올 수 없습니다.'}
            </p>
            <div className="space-x-4">
              <Button onClick={() => navigate(-1)} variant="outline">
                뒤로가기
              </Button>
              <Button onClick={() => window.location.reload()}>
                다시 시도
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 데이터가 없는 경우
  if (!course) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-600 dark:text-gray-300">
              여행 코스를 찾을 수 없습니다
            </h2>
            <p className="mb-6 text-gray-500 dark:text-gray-400">
              요청하신 여행 코스가 존재하지 않거나 삭제되었습니다.
            </p>
            <Button onClick={() => navigate(-1)} variant="outline">
              뒤로가기
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 디버깅: course 데이터 확인
  if (import.meta.env.DEV) {
    console.log('📍 상세페이지 course 데이터:', {
      id: course?.id,
      title: course?.title,
      region: course?.region,
      fullCourse: course,
    })
  }

  // 안전한 배열 접근을 위한 헬퍼 함수
  const safeItinerary = course.itinerary || []

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
          <Badge className="bg-blue-600 text-white">쉬운코스</Badge>
          <Badge variant="outline">인기</Badge>
          {course.theme &&
            course.theme.map((theme, index) => (
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
          {/* 별점 평균/인원 표시 */}
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-zinc-500'}`}
              />
            ))}
            <span className="text-lg font-semibold">
              {typeof avgRating === 'number' ? avgRating.toFixed(1) : '4.5'}
            </span>
            <span className="text-gray-500">
              ({typeof peopleCount === 'number' ? peopleCount : 0}명 평가)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Heart
              className={`h-5 w-5 ${likeData?.liked ? 'text-red-500' : 'text-gray-400'}`}
            />
            <span className="text-gray-600">
              좋아요 {likeLoading ? '-' : (likeData?.total ?? 0)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600">리뷰 {reviewTree.length}건</span>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant={likeData?.liked ? 'default' : 'outline'}
            onClick={handleLikeClick}
            className={likeData?.liked ? 'bg-red-500 hover:bg-red-600' : ''}
            disabled={likeLoading}
          >
            <Heart className="mr-2 h-4 w-4" />
            {likeData?.liked ? '좋아요 취소' : '좋아요'}
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            공유하기
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
              <div className="flex h-96 w-full items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                <div className="text-center text-white">
                  <h3 className="mb-2 text-2xl font-bold">{course.title}</h3>
                  <p className="text-lg opacity-90">
                    {getRegionDisplayName(course.region)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* 이미지 모달 */}
          {isImageModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
              <div className="absolute inset-0" onClick={closeImageModal} />
              <div className="relative z-10 max-h-[90vh] max-w-[90vw]">
                <button
                  onClick={closeImageModal}
                  className="absolute top-4 right-4 z-20 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                >
                  <X className="h-6 w-6" />
                </button>
                <img
                  src={images[modalImageIndex]}
                  alt={`${course.title} - 이미지 ${modalImageIndex + 1}`}
                  className="max-h-[90vh] max-w-[90vw] object-contain"
                />
                {images.length > 1 && (
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
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setModalImageIndex(index)}
                          className={`h-2 w-2 rounded-full transition-colors ${
                            index === modalImageIndex
                              ? 'bg-white'
                              : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="absolute bottom-12 left-4 rounded bg-black/50 px-3 py-2 text-white">
                      <span className="text-sm">
                        {modalImageIndex + 1} / {images.length}
                      </span>
                    </div>
                  </>
                )}
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
              {safeItinerary.map((day, dayIndex) => (
                <div key={dayIndex}>
                  <div>
                    <button
                      onClick={() => toggleDay(day.day)}
                      className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Day {day.day}: {day.title}
                      </h3>
                      {expandedDays[day.day] ? (
                        <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>

                    {expandedDays[day.day] && (
                      <div className="mt-4 space-y-4 pl-3">
                        {day.activities?.map((activity, actIndex) => {
                          const getActivityIcon = (type) => {
                            switch (type) {
                              case 'transport':
                                return '✈️'
                              case 'attraction':
                                return '🏛️'
                              case 'restaurant':
                                return '🍽️'
                              case 'cafe':
                                return '☕'
                              case 'accommodation':
                                return '🏨'
                              default:
                                return '📍'
                            }
                          }

                          return (
                            <div
                              key={actIndex}
                              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-600 dark:bg-gray-700"
                            >
                              <div className="flex gap-4">
                                <div className="flex w-16 flex-shrink-0 items-center justify-center text-base font-semibold text-gray-700 dark:text-gray-300">
                                  {activity.time}
                                </div>
                                <div className="flex-1">
                                  <div className="mb-2 flex items-center gap-2">
                                    <span className="text-lg">
                                      {getActivityIcon(activity.type)}
                                    </span>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                      {activity.place}
                                    </h4>
                                    {activity.duration && (
                                      <Badge
                                        variant="outline"
                                        className="ml-auto"
                                      >
                                        <Clock className="mr-1 h-3 w-3" />
                                        {activity.duration >= 60
                                          ? `${Math.floor(activity.duration / 60)}시간`
                                          : `${activity.duration}분`}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                    {activity.description}
                                  </p>
                                  {activity.address && (
                                    <div className="mb-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                      <MapPin className="h-3 w-3" />
                                      <span>{activity.address}</span>
                                    </div>
                                  )}
                                  {activity.phone && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                      <span>📞</span>
                                      <span>{activity.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 여행 팁 */}
          {course.tips && course.tips.length > 0 && (
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
          )}

          {/* 댓글 섹션 */}
          <Card className="dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <MessageSquare className="h-5 w-5" />
                댓글 ({reviewTree.length}건)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 댓글 작성 폼 */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleReviewSubmit(null, comment, _rating)
                  setComment('')
                  setRating(0)
                }}
                className="mb-5"
              >
                <div className="space-y-2 rounded-lg border border-gray-300 bg-white p-3 dark:border-zinc-600 dark:bg-zinc-800">
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="댓글을 입력하세요"
                    required
                    className="w-full border-none bg-transparent shadow-none focus:border-none focus:ring-0 dark:text-zinc-100"
                  />
                  <div className="flex items-center gap-2">
                    {/* 별점 선택 UI */}
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 cursor-pointer ${
                          i < _rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        onClick={() => setRating(i + 1)}
                        aria-label={`${i + 1}점`}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ')
                            setRating(i + 1)
                        }}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {_rating > 0 ? `${_rating}점` : '별점을 선택하세요'}
                    </span>
                    <div className="flex flex-1 justify-end">
                      <Button
                        type="submit"
                        variant="outline"
                        className="hover:bg-gray-100 dark:hover:bg-zinc-700"
                        disabled={isPosting || !comment.trim()}
                      >
                        {isPosting ? '등록 중...' : '댓글 등록'}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>

              {/* 트리형 댓글 UI */}
              <ReviewTree reviews={reviewTree} onReply={handleReviewSubmit} />
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 */}
        <div className="sticky top-4 space-y-6">
          <Card className="dark:border-gray-700 dark:bg-gray-800">
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

              {course.includes && course.includes.length > 0 && (
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
              )}

              {course.excludes && course.excludes.length > 0 && (
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
              )}

              <Link to={`/customized-schedule?region=${course.region}`}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  맞춤 일정 만들기
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 주요 명소 */}
          {course.highlights && course.highlights.length > 0 && (
            <Card className="dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">🏆 주요 명소</CardTitle>
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
          )}

          {/* 태그 */}
          {course.tags && course.tags.length > 0 && (
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
          )}
        </div>
      </div>
    </div>
  )
}
