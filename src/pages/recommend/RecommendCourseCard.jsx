import React, { useCallback, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  Star,
  Clock,
  Navigation,
  MessageSquare,
} from '@/components/icons'
import {
  useGetCourseLikeQuery,
  useLikeCourseMutation,
  useUnlikeCourseMutation,
  useCreateTravelCourseLikeMutation,
} from '@/store/api'
import { useGetReviewsByCourseQuery } from '@/store/api/recommendReviewsApi'
import { useAuth } from '@/contexts/AuthContextRTK'

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
  yeosu: '여수',
}

// 이미지 확장자별로 존재하는 첫 번째 이미지를 반환하는 커스텀 훅
function useCourseImage(courseId) {
  const [imageUrl, setImageUrl] = useState(null)
  useEffect(() => {
    let found = false
    const exts = ['jpg', 'jpeg', 'png']
    exts.forEach((ext) => {
      const img = new window.Image()
      img.src = `/course-images/${courseId}.${ext}`
      img.onload = () => {
        if (!found) {
          setImageUrl(img.src)
          found = true
        }
      }
    })
    // fallback: 1초 후에도 못 찾으면 랜덤 이미지
    const timer = setTimeout(() => {
      if (!found) {
        setImageUrl(`https://picsum.photos/800/600?random=${courseId}`)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [courseId])
  return imageUrl
}

// 안전한 key 생성 함수 추가
const generateSafeKey = (courseId, type, index, tag) => {
  // 모든 값을 안전하게 문자열로 변환
  const safeId = courseId || 'unknown'
  const safeType = type || 'default'
  const safeIndex = index ?? 0
  const safeTag =
    tag
      ?.toString()
      ?.replace(/\s+/g, '-')
      ?.replace(/[^a-zA-Z0-9-_]/g, '') || 'empty'

  return `${safeId}-${safeType}-${safeIndex}-${safeTag}`
}

const RecommendCourseCard = React.memo(function RecommendCourseCard({
  course,
  rating,
  viewMode = 'grid', // 기본값 추가
}) {
  const imageUrl = useCourseImage(course.id)
  const { user } = useAuth() // 사용자 인증 상태 확인

  // 로그인된 사용자만 좋아요 API 호출
  const { data: likeData, isLoading: likeLoading } = useGetCourseLikeQuery(
    course.id,
    {
      skip: !course?.id || isNaN(Number(course.id)) || !user, // 로그인하지 않으면 스킵
    },
  )
  const [likeCourse] = useLikeCourseMutation()
  const [unlikeCourse] = useUnlikeCourseMutation()
  const [createTravelCourseLike] = useCreateTravelCourseLikeMutation()
  const {
    data: reviews = [],
    isLoading: reviewsLoading,
    isError: reviewsError,
  } = useGetReviewsByCourseQuery(course.id, {
    skip: !course?.id || isNaN(Number(course.id)), // course.id가 없거나 숫자가 아닐 때 스킵
  })

  const handleLikeClick = useCallback(
    async (e) => {
      e.preventDefault()
      e.stopPropagation()

      // 로그인하지 않은 사용자 처리
      if (!user) {
        alert('로그인이 필요한 기능입니다.')
        return
      }

      if (likeData?.liked) {
        await unlikeCourse(course.id)
      } else {
        await likeCourse(course.id)
        // 제주도 코스라면 travel_course_likes 테이블에 코스 정보 저장
        if (course.region === 'jeju') {
          // activities가 문자열 배열이면 객체 배열로 변환
          function normalizeItinerary(itinerary) {
            return (itinerary || []).map((dayItem, dayIdx) => {
              // activities가 문자열 배열이면 객체 배열로 변환
              let activities = dayItem.activities
              if (
                Array.isArray(activities) &&
                typeof activities[0] === 'string'
              ) {
                activities = activities.map((place, idx) => ({
                  time: `${9 + idx}:00`,
                  type:
                    idx === 0
                      ? 'transport'
                      : idx === activities.length - 1
                        ? 'cafe'
                        : 'attraction',
                  place,
                  description: `${place} 방문`,
                  address: '',
                }))
              }
              return {
                ...dayItem,
                day:
                  typeof dayItem.day === 'string'
                    ? parseInt(dayItem.day, 10)
                    : dayItem.day,
                activities,
              }
            })
          }
          const rawItinerary = Array.isArray(course.itinerary)
            ? course.itinerary
            : JSON.parse(course.itinerary)
          const normalizedItinerary = normalizeItinerary(rawItinerary)
          const payload = {
            title: course.title,
            subtitle: course.subtitle,
            summary: course.summary,
            description: course.description ?? null,
            region: course.region,
            itinerary: normalizedItinerary,
          }
          console.log('travel_course_likes POST payload', payload)
          try {
            await createTravelCourseLike(payload).unwrap()
          } catch (err) {
            // 에러 무시(중복 저장 등)
          }
        }
      }
    },
    [likeData, course, likeCourse, unlikeCourse, createTravelCourseLike, user],
  )

  // 리스트 모드인 경우 다른 레이아웃 적용
  if (viewMode === 'list') {
    return (
      <Card className="weather-card group cursor-pointer overflow-hidden p-0">
        <Link to={`/recommend/detail/${course.id}`} className="block">
          <div className="flex">
            {/* 리스트 모드: 가로 이미지 */}
            <div className="relative h-32 w-48 flex-shrink-0 overflow-hidden">
              <img
                src={
                  imageUrl ||
                  `https://picsum.photos/800/600?random=${course.id}`
                }
                alt={course.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              {/* 좋아요 버튼 */}
              <button
                type="button"
                className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 shadow-md transition-all duration-200 hover:scale-110 hover:bg-white"
                onClick={handleLikeClick}
                aria-label={likeData?.liked ? '좋아요 취소' : '좋아요'}
                disabled={likeLoading}
              >
                <Heart
                  className="h-3 w-3 transition-colors"
                  style={{
                    color: likeData?.liked ? '#ef4444' : '#4b5563',
                    fill: likeData?.liked ? '#ef4444' : 'none',
                  }}
                />
              </button>
            </div>

            {/* 리스트 모드: 컨텐츠 영역 */}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-foreground line-clamp-1 text-lg font-bold">
                    {course.title}
                  </h3>
                  <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">
                    {course.subtitle}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-1">
                  <Star
                    className="h-4 w-4 fill-current"
                    style={{ color: 'var(--accent-yellow)' }}
                  />
                  <span className="text-foreground text-sm font-medium">
                    {rating ?? course.rating}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-2 flex flex-wrap gap-1">
                {(course.theme || []).slice(0, 3).map((tag, index) => (
                  <Badge
                    key={generateSafeKey(course.id, 'list-tag', index, tag)}
                    className="status-soft text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                {course.summary}
              </p>

              {/* Bottom Info */}
              <div className="mt-3 flex items-center justify-between">
                <div
                  className="text-lg font-bold"
                  style={{ color: 'var(--primary-blue-dark)' }}
                >
                  {course.price}
                </div>
                <div className="text-muted-foreground flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    {regionNames[course.region] || course.region}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {likeLoading ? '-' : (likeData?.total ?? 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {reviewsLoading ? '-' : reviewsError ? '!' : reviews.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </Card>
    )
  }

  // 기존 grid 모드 (기본값)
  return (
    <Card className="weather-card group cursor-pointer overflow-hidden p-0">
      <Link to={`/recommend/detail/${course.id}`} className="block">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              // fallback 이미지 처리 (이미 useCourseImage에서 처리됨)
            }}
          />
          {/* 좋아요 버튼 */}
          <button
            type="button"
            className="absolute top-3 right-3 rounded-full bg-white/90 p-2 shadow-md transition-all duration-200 hover:scale-110 hover:bg-white"
            onClick={handleLikeClick}
            aria-label={likeData?.liked ? '좋아요 취소' : '좋아요'}
            disabled={likeLoading}
          >
            <Heart
              className="h-4 w-4 transition-colors"
              style={{
                color: likeData?.liked ? '#ef4444' : '#4b5563',
                fill: likeData?.liked ? '#ef4444' : 'none',
              }}
            />
          </button>
        </div>
        <CardHeader className="p-4 pb-3">
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
                {rating ?? course.rating}
              </span>
            </div>
          </div>
          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            {(course.theme || []).slice(0, 3).map((tag, index) => (
              <Badge
                key={generateSafeKey(course.id, 'grid-tag', index, tag)}
                className="status-soft text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-4 pt-0 pb-4">
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
              <span>{regionNames[course.region] || course.region}</span>
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
                {likeLoading ? '-' : (likeData?.total ?? 0)}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {reviewsLoading ? '-' : reviewsError ? '!' : reviews.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
})

RecommendCourseCard.displayName = 'RecommendCourseCard'
export default RecommendCourseCard
