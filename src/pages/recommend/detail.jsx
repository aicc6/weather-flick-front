import { useState, useEffect, useCallback } from 'react'
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
  Camera,
  Navigation,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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
  const images =
    course?.images && course.images.length > 0
      ? course.images.filter(Boolean)
      : course?.mainImage
        ? [course.mainImage].filter(Boolean)
        : []

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

  const handleCommentSubmit = useCallback(() => {
    if (comment.trim()) {
      const displayName = user?.nickname || user?.email || '사용자'
      const newComment = {
        id: Date.now(),
        user: displayName,
        content: comment,
        date: new Date().toLocaleDateString(),
        rating: _rating, // 별점 상태 사용
        helpful: 0,
      }
      setComments((prev) => [newComment, ...prev])
      setComment('')
    }
  }, [comment, _rating, user])

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
          <Badge className="bg-blue-600 text-white">Easy코스</Badge>
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
          {images.length > 0 && (
            <Card className="mb-8 overflow-hidden dark:border-gray-700 dark:bg-gray-800">
              <div className="relative">
                <img
                  src={images[currentImageIndex]}
                  alt={course.title}
                  className="h-96 w-full object-cover"
                />
                {images.length > 1 && (
                  <>
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
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-2 w-2 rounded-full ${
                            index === currentImageIndex
                              ? 'bg-white'
                              : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
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
          )}

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
              {/* 별점 + 댓글 입력란 + 버튼을 하나의 div로 감쌈 */}
              <div className="space-y-3">
                {/* 별점 선택 UI */}
                <div className="mb-2 flex items-center gap-2">
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
                        if (e.key === 'Enter' || e.key === ' ') setRating(i + 1)
                      }}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {_rating}점
                  </span>
                </div>
                {/* 댓글 입력란 */}
                <Textarea
                  placeholder="이 여행 코스에 댓글을 남겨주세요..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="dark:border-gray-600 dark:bg-gray-700"
                />
                <Button onClick={handleCommentSubmit} size="sm">
                  댓글 등록
                </Button>
              </div>

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
