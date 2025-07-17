import { useState, useMemo } from 'react'
import { useGetTravelCoursesQuery } from '@/store/api/travelCoursesApi'
import { useGetGoogleReviewsQuery } from '@/store/api'
import { Star } from '@/components/icons'

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
  { code: '', label: '전체' },
  { code: 'seoul', label: '서울' },
  { code: 'busan', label: '부산' },
  { code: 'daegu', label: '대구' },
  { code: 'incheon', label: '인천' },
  { code: 'gwangju', label: '광주' },
  { code: 'daejeon', label: '대전' },
  { code: 'ulsan', label: '울산' },
  { code: 'sejong', label: '세종' },
  { code: 'gyeonggi', label: '경기' },
  { code: 'gangwon', label: '강원' },
  { code: 'chungbuk', label: '충북' },
  { code: 'chungnam', label: '충남' },
  { code: 'gyeongbuk', label: '경북' },
  { code: 'gyeongnam', label: '경남' },
  { code: 'jeonbuk', label: '전북' },
  { code: 'jeonnam', label: '전남' },
  { code: 'jeju', label: '제주' },
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

function RecommendCourseItem({ course }) {
  const {
    data: googleData,
    isLoading: isReviewLoading,
    isError: isReviewError,
    error: reviewError,
  } = useGetGoogleReviewsQuery(course.place_id, { skip: !course.place_id })
  const rating = googleData?.rating
  const reviews = googleData?.reviews || []
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const handleShowAllReviews = () => {
    setShowAllReviews(true)
  }

  const handleLike = (e) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  const handleBookmark = (e) => {
    e.stopPropagation()
    setIsBookmarked(!isBookmarked)
  }

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
      {/* 썸네일 */}
      <div className="aspect-video w-full overflow-hidden relative">
        {course.mainImage ? (
          <img
            src={course.mainImage}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
            <span className="text-gray-400 dark:text-gray-500">No Image</span>
          </div>
        )}
        
        
        {/* 별점 오버레이 */}
        {rating && (
          <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-md">
            <Star className="h-3 w-3 text-yellow-500" aria-label="별점" />
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{rating}</span>
          </div>
        )}

        {/* 호버 시 나타나는 액션 버튼들 */}
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleLike}
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
              isLiked
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
            }`}
            aria-label="좋아요"
          >
            <HeartIcon className="h-4 w-4" filled={isLiked} />
          </button>
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
              isBookmarked
                ? 'bg-amber-500 text-white shadow-lg'
                : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600'
            }`}
            aria-label="북마크"
          >
            <BookmarkIcon className="h-4 w-4" filled={isBookmarked} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-500 transition-all duration-200"
            aria-label="공유"
          >
            <ShareIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* 카드 내용 */}
      <div className="p-6">
        <div className="mb-4 text-xl font-bold line-clamp-2 text-gray-900 dark:text-white leading-tight">{course.title}</div>
        {/* 주소 표시 */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{course.address}</div>
        
        {/* 별점/리뷰 정보 */}
        {course.place_id ? (
          <div className="mb-6">
            {isReviewLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                <span className="text-sm text-gray-400 dark:text-gray-500">별점 불러오는 중...</span>
              </div>
            ) : isReviewError ? (
              <div className="flex items-center gap-3 text-red-400 dark:text-red-400">
                <div className="w-5 h-5 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                  <span className="text-sm">!</span>
                </div>
                <span className="text-sm">
                  {reviewError?.status === 503 
                    ? '구글 리뷰 서비스 일시 중단'
                    : reviewError?.status === 403 
                    ? '구글 리뷰 서비스 접근 권한 없음'
                    : '별점 정보를 불러올 수 없습니다'
                  }
                </span>
              </div>
            ) : rating ? (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <Star className="h-5 w-5" aria-label="별점" />
                    <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">{rating}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">/ 5</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium">
                    리뷰 {reviews.length}개
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
                <div className="w-5 h-5 bg-gray-100 dark:bg-gray-700 rounded"></div>
                <span className="text-sm">리뷰 정보 없음</span>
              </div>
            )}
            
            {/* 리뷰 미리보기/전체보기 */}
            {reviews.length > 0 && (
              <div className="space-y-4">
                {(showAllReviews ? reviews : reviews.slice(0, 1)).map(
                  (review, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300 border-l-4 border-blue-200 dark:border-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {review.author_name}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500 text-sm">
                          {review.relative_time_description}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-gray-600 dark:text-gray-400">{review.text}</p>
                    </div>
                  ),
                )}
                {!showAllReviews && reviews.length > 1 && (
                  <button
                    type="button"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-4 py-2 rounded-full transition-all duration-200 hover:shadow-sm"
                    aria-label={`리뷰 더보기 (${reviews.length}개)`}
                    onClick={handleShowAllReviews}
                  >
                    리뷰 더보기 ({reviews.length}개)
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500 mb-6">
            <div className="w-5 h-5 bg-gray-100 dark:bg-gray-700 rounded"></div>
            <span className="text-sm">리뷰 정보 없음</span>
          </div>
        )}
        
        {/* 카드 하단 액션 바 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all duration-200 ${
                isLiked
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
              }`}
            >
              <HeartIcon className="h-4 w-4" filled={isLiked} />
              좋아요
            </button>
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all duration-200 ${
                isBookmarked
                  ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              <BookmarkIcon className="h-4 w-4" filled={isBookmarked} />
              저장
            </button>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-sm text-gray-500 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200"
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
  const [page, setPage] = useState(1)
  // region 상태를 REGION_CODE_MAP의 value(영문)로 관리
  const [region, setRegion] = useState('')
  const pageSize = 10

  // 태그 클릭 시 code(영문)를 region에 저장
  const handleRegionClick = (code) => {
    setRegion(code) // code는 'busan', 'seoul' 등 영문 문자열
    setPage(1)
  }

  const { data, isLoading, isError, error } = useGetTravelCoursesQuery({
    page,
    page_size: pageSize,
    region_code: region || undefined, // region은 영문 문자열
  })

  const courses = data?.courses || []
  const total = data?.total || 0
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize],
  )

  // 여행지 리스트 정렬 (ㄱㄴㄷ 순으로 정렬하되 No Image 항목은 하단으로)
  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => {
      // 1. 이미지가 있는 것과 없는 것 분리 (No Image를 하단으로)
      const aHasImage = Boolean(a.mainImage)
      const bHasImage = Boolean(b.mainImage)
      
      if (aHasImage !== bHasImage) {
        return bHasImage - aHasImage // 이미지가 있는 것을 먼저
      }
      
      // 2. 같은 그룹 내에서 제목 기준 ㄱㄴㄷ 순 정렬
      return a.title.localeCompare(b.title, 'ko', { numeric: true })
    })
  }, [courses])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white text-center">여행지 리스트</h1>
      
      {/* 지역별 필터 태그 */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">지역별 필터</div>
        <div className="flex flex-wrap gap-3">
          {REGION_TAGS.map((tag) => (
            <button
              key={tag.code}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                region === tag.code
                  ? 'bg-blue-700 dark:bg-blue-600 text-white border-blue-700 dark:border-blue-600'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-900/30'
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
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">로딩 중...</div>
        ) : isError ? (
          <div className="text-red-500 dark:text-red-400 text-center py-8">
            에러: {error?.data?.detail || '데이터를 불러올 수 없습니다.'}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-8">데이터가 없습니다.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedCourses.map((course) => (
              <RecommendCourseItem key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-center gap-2">
        <button
          className="rounded border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          onClick={() => setPage(1)}
          disabled={page === 1}
          aria-label="맨 처음"
        >
          {'<<'}
        </button>
        <button
          className="rounded border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
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
          className="rounded border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          aria-label="다음"
        >
          {'>'}
        </button>
        <button
          className="rounded border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
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
