import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetTravelCoursesQuery } from '@/store/api/travelCoursesApi'
import { useToggleTravelCourseLikeMutation } from '@/store/api/travelCourseLikesApi'
import {
  useAddDestinationSaveMutation,
  useRemoveDestinationSaveMutation,
  useSearchDestinationByNameQuery,
} from '@/store/api/destinationLikesSavesApi'
import {
  useCreateTravelCourseSaveMutation,
  useDeleteTravelCourseSaveMutation,
} from '@/store/api/travelCourseSavesApi'
import { useAuth } from '@/contexts/AuthContextRTK'

// 아이콘 컴포넌트들
const HeartIcon = ({ className, filled = false }) => (
  <svg
    className={className}
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
)

const BookmarkIcon = ({ className, filled = false }) => (
  <svg
    className={className}
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
    />
  </svg>
)

const ShareIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
    />
  </svg>
)

// region_code <-> 태그 code 매핑
const REGION_CODE_MAP = {
  1: 'seoul',
  6: 'busan',
  4: 'daegu',
  2: 'incheon',
  5: 'gwangju',
  3: 'daejeon',
  7: 'ulsan',
  8: 'sejong',
  31: 'gyeonggi',
  32: 'gangwon',
  33: 'chungbuk',
  34: 'chungnam',
  37: 'jeonbuk',
  38: 'jeonnam',
  35: 'gyeongbuk',
  36: 'gyeongnam',
  39: 'jeju',
}

const REGION_TAGS = [
  { code: null, label: '전체' },
  { code: 1, label: '서울' },
  { code: 6, label: '부산' },
  { code: 4, label: '대구' },
  { code: 2, label: '인천' },
  { code: 5, label: '광주' },
  { code: 3, label: '대전' },
  { code: 7, label: '울산' },
  { code: 8, label: '세종' },
  { code: 31, label: '경기' },
  { code: 32, label: '강원' },
  { code: 33, label: '충북' },
  { code: 34, label: '충남' },
  { code: 35, label: '경북' },
  { code: 36, label: '경남' },
  { code: 37, label: '전북' },
  { code: 38, label: '전남' },
  { code: 39, label: '제주' },
]

// region_code로 지역명 반환
const getRegionName = (region_code) => {
  const code = REGION_CODE_MAP[Number(region_code)] || region_code
  const tag = REGION_TAGS.find((t) => t.code === code)
  return tag ? tag.label : code
}

// 태그 code -> region_code(숫자) 변환
const getRegionCodeParam = (code) => {
  if (!code) return undefined
  // code가 숫자(문자열 포함)면 그대로 반환
  if (!isNaN(Number(code))) return Number(code)
  // 태그 code -> region_code(숫자) 역매핑
  const entry = Object.entries(REGION_CODE_MAP).find(([, v]) => v === code)
  return entry ? Number(entry[0]) : code
}

function RecommendCourseItem({ course, onLikeChange }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  // 백엔드에서 받아온 저장 정보 사용 (API에서 받은 is_saved 값으로 초기화)
  const [isBookmarked, setIsBookmarked] = useState(course.is_saved || false)

  // 백엔드에서 받아온 좋아요 정보 사용 (개별 API 호출 제거)
  const isLiked = course.is_liked || false
  const totalLikes = course.total_likes || 0

  // course.is_saved 값이 변경될 때마다 local state 동기화
  useEffect(() => {
    setIsBookmarked(course.is_saved || false)
  }, [course.is_saved])

  // 좋아요 상태 변경을 위한 API
  const [toggleTravelCourseLike] = useToggleTravelCourseLikeMutation()

  // 여행지 저장을 위한 API (destinations용 - 기존 호환성)
  const [addDestinationSave] = useAddDestinationSaveMutation()
  const [removeDestinationSave] = useRemoveDestinationSaveMutation()

  // 여행 코스 저장을 위한 API (새로운 기능)
  const [createTravelCourseSave] = useCreateTravelCourseSaveMutation()
  const [deleteTravelCourseSave] = useDeleteTravelCourseSaveMutation()

  const handleLike = useCallback(
    async (e) => {
      e.stopPropagation()

      // 비로그인 사용자 처리
      if (!user) {
        const shouldLogin = window.confirm(
          '해당 기능은 로그인해야 가능합니다.\n로그인 페이지로 이동하시겠습니까?',
        )
        if (shouldLogin) {
          navigate('/login')
        }
        return
      }

      try {
        // 새로운 통합 API를 사용하여 좋아요 토글
        const courseData = {
          content_id: course.content_id || course.id,
          title: course.course_name || course.title || '',
          subtitle: course.subtitle || '',
          summary: course.summary || '',
          description: course.overview || course.description || '',
          region: course.region || '',
          itinerary: course.itinerary || [],
        }

        const result = await toggleTravelCourseLike({
          courseId: course.content_id || course.id,
          courseData: courseData,
        }).unwrap()

        console.log('좋아요 처리 결과:', result)

        // 상위 컴포넌트에 좋아요 변경 알림
        if (onLikeChange) {
          onLikeChange()
        }
      } catch (error) {
        console.error('좋아요 처리 실패:', error)
        alert('좋아요 처리에 실패했습니다. 다시 시도해주세요.')
      }
    },
    [course, toggleTravelCourseLike, user, navigate],
  )

  const handleBookmark = useCallback(
    async (e) => {
      e.stopPropagation()

      // 비로그인 사용자 처리
      if (!user) {
        const shouldLogin = window.confirm(
          '해당 기능은 로그인해야 가능합니다.\n로그인 페이지로 이동하시겠습니까?',
        )
        if (shouldLogin) {
          navigate('/login')
        }
        return
      }

      try {
        const contentId = course.content_id || course.id
        if (!contentId) {
          throw new Error('여행 코스 ID를 찾을 수 없습니다.')
        }

        if (isBookmarked) {
          // 여행 코스 저장 취소
          console.log('🗑️ 여행 코스 저장 취소 시도:', contentId)
          await deleteTravelCourseSave(contentId).unwrap()
          setIsBookmarked(false)
          console.log(
            '✅ 여행 코스 저장 취소 성공:',
            course.course_name || course.title,
          )
        } else {
          // 여행 코스 저장 추가
          console.log('💾 여행 코스 저장 추가 시도:', contentId)
          await createTravelCourseSave({
            content_id: contentId,
            note: null, // 메모는 선택사항
          }).unwrap()
          setIsBookmarked(true)
          console.log(
            '✅ 여행 코스 저장 성공:',
            course.course_name || course.title,
          )
        }

        // 상위 컴포넌트에 변경 사항 알림 (데이터 새로고침 요청)
        if (onLikeChange) {
          onLikeChange()
        }
      } catch (error) {
        console.error('❌ 저장 처리 실패:', error)
        const errorMessage =
          error.message ||
          error.data?.detail ||
          error.error ||
          '알 수 없는 오류가 발생했습니다.'
        console.log('🔍 에러 상세:', {
          message: error.message,
          data: error.data,
          status: error.status,
          error: error.error,
        })

        if (errorMessage.includes('Already saved')) {
          alert('이미 저장된 여행 코스입니다.')
        } else if (errorMessage.includes('not found')) {
          alert('여행 코스를 찾을 수 없습니다.')
        } else {
          alert('저장 처리에 실패했습니다. 다시 시도해주세요.')
        }
      }
    },
    [
      isBookmarked,
      createTravelCourseSave,
      deleteTravelCourseSave,
      course,
      user,
      navigate,
    ],
  )

  const handleShare = (e) => {
    e.stopPropagation()
    // 공유 기능 구현
    if (navigator.share) {
      navigator.share({
        title: course.title,
        text: `${course.title} - ${course.address}`,
        url: window.location.href,
      })
    } else {
      // 폴백: 클립보드에 복사
      navigator.clipboard.writeText(window.location.href)
      alert('링크가 클립보드에 복사되었습니다!')
    }
  }

  // 지역 태그 정보 가져오기
  const regionName = getRegionName(course.region_code)

  return (
    <div className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800">
      {/* 썸네일 */}
      <div className="relative aspect-video w-full overflow-hidden">
        {course.first_image || course.mainImage ? (
          <img
            src={course.first_image || course.mainImage}
            alt={course.course_name || course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 transition-colors group-hover:bg-gray-200 dark:bg-gray-700 dark:group-hover:bg-gray-600">
            <span className="text-gray-400 dark:text-gray-500">No Image</span>
          </div>
        )}

        {/* 호버 시 나타나는 액션 버튼들 */}
        <div className="absolute right-2 bottom-2 flex gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={handleLike}
            className={`rounded-full p-2 backdrop-blur-sm transition-all duration-200 ${
              isLiked
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white/90 text-gray-700 hover:bg-red-50 hover:text-red-500 dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-red-900/20'
            }`}
            aria-label={isLiked ? '좋아요 취소' : '좋아요'}
          >
            <HeartIcon className="h-4 w-4" filled={isLiked} />
          </button>
          <button
            onClick={handleBookmark}
            className={`rounded-full p-2 backdrop-blur-sm transition-all duration-200 ${
              isBookmarked
                ? 'bg-amber-500 text-white shadow-lg'
                : 'bg-white/90 text-gray-700 hover:bg-amber-50 hover:text-amber-600 dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-amber-900/20'
            }`}
            aria-label="북마크"
          >
            <BookmarkIcon className="h-4 w-4" filled={isBookmarked} />
          </button>
          <button
            onClick={handleShare}
            className="rounded-full bg-white/90 p-2 text-gray-700 backdrop-blur-sm transition-all duration-200 hover:bg-green-50 hover:text-green-500 dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-green-900/20"
            aria-label="공유"
          >
            <ShareIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 카드 내용 */}
      <div className="p-6">
        <div className="mb-4 line-clamp-2 text-xl leading-tight font-bold text-gray-900 dark:text-white">
          {course.course_name || course.title}
        </div>
        {/* 주소 표시 */}
        <div className="mb-4 line-clamp-1 text-sm text-gray-600 dark:text-gray-400">
          {course.address || '주소 정보 없음'}
        </div>

        {/* 카드 하단 액션 바 */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-all duration-200 ${
                isLiked
                  ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : 'text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400'
              }`}
            >
              <HeartIcon className="h-4 w-4" filled={isLiked} />
              <span>좋아요</span>
              {totalLikes !== null && (
                <span className="text-xs">({totalLikes})</span>
              )}
            </button>
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-all duration-200 ${
                isBookmarked
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'text-gray-500 hover:bg-amber-50 hover:text-amber-600 dark:text-gray-400 dark:hover:bg-amber-900/20 dark:hover:text-amber-400'
              }`}
            >
              <BookmarkIcon className="h-4 w-4" filled={isBookmarked} />
              저장
            </button>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-gray-500 transition-all duration-200 hover:bg-green-50 hover:text-green-600 dark:text-gray-400 dark:hover:bg-green-900/20 dark:hover:text-green-400"
          >
            <ShareIcon className="h-4 w-4" />
            공유
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RecommendListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  // region 상태를 DB ID(숫자)로 관리
  const [region, setRegion] = useState(null)
  // 좋아요 필터 상태
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const pageSize = 10

  // 통합된 여행 코스 데이터 조회 (좋아요 필터 포함)
  const { data, isLoading, isError, error, refetch } = useGetTravelCoursesQuery(
    {
      page,
      page_size: pageSize,
      region_code: region, // region은 숫자 ID
      liked_only: showFavoritesOnly, // 좋아요 필터 조건
    },
  )

  // 태그 클릭 시 숫자 ID를 region에 저장
  const handleRegionClick = (code) => {
    setRegion(code) // code는 1, 6 등 숫자 ID (또는 전체일 때 null)
    setPage(1)
  }

  // 좋아요 필터 토글
  const handleFavoritesToggle = () => {
    if (!user) {
      const shouldLogin = window.confirm(
        '해당 기능은 로그인해야 가능합니다.\n로그인 페이지로 이동하시겠습니까?',
      )
      if (shouldLogin) {
        navigate('/login')
      }
      return
    }
    setShowFavoritesOnly(!showFavoritesOnly)
    setPage(1)
  }

  // 좋아요 상태 변경 시 데이터 다시 로드
  const handleLikeChange = useCallback(() => {
    console.log('좋아요 상태 변경, 데이터 재조회 시작')
    refetch()
  }, [refetch])

  const courses = data?.courses || []
  const total = data?.total || 0

  // 페이지네이션 계산
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / pageSize))
  }, [total, pageSize])

  // 여행지 리스트 정렬 (ㄱㄴㄷ 순으로 정렬하되 No Image 항목은 하단으로)
  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => {
      // 1. 이미지가 있는 것과 없는 것 분리 (No Image를 하단으로)
      const aHasImage = Boolean(a.mainImage || a.first_image)
      const bHasImage = Boolean(b.mainImage || b.first_image)

      if (aHasImage !== bHasImage) {
        return bHasImage - aHasImage // 이미지가 있는 것을 먼저
      }

      // 2. 같은 그룹 내에서 제목 기준 ㄱㄴㄷ 순 정렬
      const titleA = a.title || a.course_name || ''
      const titleB = b.title || b.course_name || ''
      return titleA.localeCompare(titleB, 'ko', { numeric: true })
    })
  }, [courses])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
        여행지 리스트
      </h1>

      {/* 필터 섹션 */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            지역별 필터
          </div>
          {/* 좋아요 필터 버튼 */}
          <button
            onClick={handleFavoritesToggle}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
              showFavoritesOnly
                ? 'border-red-500 bg-red-500 text-white shadow-lg'
                : 'border-gray-300 bg-gray-100 text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-red-900/20 dark:hover:text-red-400'
            }`}
            aria-label={
              showFavoritesOnly ? '모든 코스 보기' : '좋아요한 코스만 보기'
            }
          >
            <HeartIcon className="h-4 w-4" filled={showFavoritesOnly} />
            <span>{showFavoritesOnly ? '좋아요만 보기' : '좋아요 필터'}</span>
            {showFavoritesOnly && total > 0 && (
              <span className="text-xs">({total})</span>
            )}
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {REGION_TAGS.map((tag) => (
            <button
              key={tag.code}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                region === tag.code
                  ? 'border-blue-700 bg-blue-700 text-white dark:border-blue-600 dark:bg-blue-600'
                  : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-blue-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-blue-900/30'
              }`}
              onClick={() => handleRegionClick(tag.code)}
            >
              #{tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* 여행지 리스트 */}
      <div className="mb-8">
        {isLoading ? (
          <div className="py-8 text-center text-gray-600 dark:text-gray-400">
            로딩 중...
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-red-500 dark:text-red-400">
            에러: {error?.data?.detail || '데이터를 불러올 수 없습니다.'}
          </div>
        ) : showFavoritesOnly && sortedCourses.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            <div className="flex flex-col items-center gap-4">
              <HeartIcon className="h-12 w-12 text-gray-300" />
              <div>
                <p className="text-lg font-medium">
                  좋아요한 여행 코스가 없습니다
                </p>
                <p className="text-sm">
                  마음에 드는 코스에 좋아요를 눌러보세요!
                </p>
              </div>
              <button
                onClick={() => setShowFavoritesOnly(false)}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
              >
                모든 코스 보기
              </button>
            </div>
          </div>
        ) : sortedCourses.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            해당 지역에는 여행 코스가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sortedCourses.map((course) => (
              <RecommendCourseItem
                key={course.content_id || course.id}
                course={course}
                onLikeChange={handleLikeChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-center gap-2">
        <button
          className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-800 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          onClick={() => setPage(1)}
          disabled={page === 1}
          aria-label="맨 처음"
        >
          {'<<'}
        </button>
        <button
          className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-800 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          aria-label="이전"
        >
          {'<'}
        </button>
        <span className="mx-4 text-sm text-gray-600 dark:text-gray-400">
          {page} / {totalPages}
        </span>
        <button
          className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-800 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          aria-label="다음"
        >
          {'>'}
        </button>
        <button
          className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-800 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
          aria-label="맨 끝"
        >
          {'>>'}
        </button>
      </div>
    </div>
  )
}
