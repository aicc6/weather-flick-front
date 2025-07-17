import { useState, useMemo } from 'react'
import { useGetTravelCoursesQuery } from '@/store/api/travelCoursesApi'
import { useGetGoogleReviewsQuery } from '@/store/api'
import { Star } from '@/components/icons'

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
  } = useGetGoogleReviewsQuery(course.place_id, { skip: !course.place_id })
  const rating = googleData?.rating
  const reviews = googleData?.reviews || []

  return (
    <li className="flex gap-6 border-b pb-6">
      {/* 썸네일 */}
      <div className="flex h-32 w-48 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100">
        {course.mainImage ? (
          <img
            src={course.mainImage}
            alt={course.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-gray-400">No Image</span>
        )}
      </div>
      {/* 정보 */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-xl font-bold">{course.title}</div>
        {/* 주소 표시 */}
        <div className="mb-1 text-sm text-gray-600">{course.address}</div>
        {/* 별점/리뷰 표시 */}
        {course.place_id ? (
          <div className="mb-1">
            {isReviewLoading ? (
              <span className="text-xs text-gray-400">별점 불러오는 중...</span>
            ) : isReviewError ? (
              <span className="text-xs text-red-400">
                별점 정보를 불러올 수 없습니다
              </span>
            ) : rating ? (
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4" aria-label="별점" />
                <span className="font-semibold">{rating}</span>
                <span className="text-xs text-gray-500">/ 5</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({reviews.length}개 리뷰)
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">정보가없습니다</span>
            )}
            {/* 리뷰 미리보기 */}
            {reviews.length > 0 && (
              <ul className="mt-1 space-y-1">
                {reviews.slice(0, 2).map((review, idx) => (
                  <li key={idx} className="text-xs text-gray-700">
                    <span className="font-semibold">{review.author_name}:</span>{' '}
                    {review.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400">정보가없습니다</span>
        )}
        {/* 해시태그 */}
        <div className="flex flex-wrap gap-2">
          {(course.theme || []).map((tag) => (
            <span
              key={tag}
              className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </li>
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

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-3">
      {/* 왼쪽: 여행지 리스트 */}
      <div className="md:col-span-2">
        <h1 className="mb-6 text-2xl font-bold">여행지 리스트</h1>
        <ul className="mb-8 space-y-8">
          {isLoading ? (
            <li>로딩 중...</li>
          ) : isError ? (
            <li className="text-red-500">
              에러: {error?.data?.detail || '데이터를 불러올 수 없습니다.'}
            </li>
          ) : courses.length === 0 ? (
            <li className="text-gray-500">데이터가 없습니다.</li>
          ) : (
            courses.map((course) => (
              <RecommendCourseItem key={course.id} course={course} />
            ))
          )}
        </ul>
        {/* 페이지네이션 */}
        <div className="flex items-center justify-center gap-2">
          <button
            className="rounded border bg-white px-3 py-1 text-gray-800 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => setPage(1)}
            disabled={page === 1}
            aria-label="맨 처음"
          >
            {'<<'}
          </button>
          <button
            className="rounded border bg-white px-3 py-1 text-gray-800 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="이전"
          >
            {'<'}
          </button>
          <span className="mx-2 text-sm">
            {page} / {totalPages}
          </span>
          <button
            className="rounded border bg-white px-3 py-1 text-gray-800 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="다음"
          >
            {'>'}
          </button>
          <button
            className="rounded border bg-white px-3 py-1 text-gray-800 hover:bg-gray-100 disabled:opacity-50"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            aria-label="맨 끝"
          >
            {'>>'}
          </button>
        </div>
      </div>
      {/* 오른쪽: 지역별 태그 */}
      <aside className="md:col-span-1">
        <div className="mb-4 text-lg font-semibold">지역별</div>
        <div className="flex flex-wrap gap-2">
          {REGION_TAGS.map((tag) => (
            <button
              key={tag.code}
              className={`rounded-full border px-3 py-1 text-sm font-medium ${
                region === tag.code
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
              }`}
              onClick={() => handleRegionClick(tag.code)}
            >
              #{tag.label}
            </button>
          ))}
        </div>
      </aside>
    </div>
  )
}
