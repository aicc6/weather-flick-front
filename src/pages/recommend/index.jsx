// src/pages/recommend/index.jsx
import { memo, useState, useCallback } from 'react'
import { useGetTravelCoursesQuery } from '@/store/api/travelCoursesApi'
import { PROVINCES } from '@/data/koreaRegions'

const LIMIT = 10
const RecommendPage = memo(() => {
  const [page, setPage] = useState(1)
  const [regionCode, setRegionCode] = useState(null)
  const {
    data = {},
    isLoading,
    error,
  } = useGetTravelCoursesQuery({ page, limit: LIMIT, regionCode })
  const courses = data.courses || []
  const totalCount = data.totalCount || 0
  const totalPages = totalCount ? Math.max(1, Math.ceil(totalCount / LIMIT)) : 1

  // 지역 필터 핸들러
  const handleRegionSelect = useCallback((code) => {
    setRegionCode(code)
    setPage(1)
  }, [])

  const handlePrev = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1))
  }, [])
  const handleNext = useCallback(() => {
    // 마지막 페이지 여부는 알 수 없으므로, 데이터 개수가 LIMIT보다 작으면 마지막 페이지로 간주
    if (courses.length === LIMIT) {
      setPage((prev) => prev + 1)
    }
  }, [courses])

  const isLastPage = page === totalPages

  if (isLoading) return <div>로딩 중...</div>
  if (error) return <div>에러 발생: {error.message}</div>

  return (
    <div className="flex w-full justify-center py-8">
      <div className="flex w-full max-w-5xl flex-col gap-8 md:flex-row">
        {/* 왼쪽: 여행지 리스트 */}
        <div className="min-w-0 flex-1">
          <h1 className="mb-6 text-2xl font-bold">추천 여행지</h1>
          <div className="divide-y">
            {courses.map((course) => (
              <div
                key={course.content_id + course.course_name}
                className="flex flex-col items-start gap-6 py-6 sm:flex-row"
              >
                {/* 썸네일 */}
                <img
                  src={course.first_image}
                  alt={course.course_name}
                  className="mb-4 h-32 w-full flex-shrink-0 rounded bg-gray-100 object-cover sm:mb-0 sm:w-48"
                  loading="lazy"
                />
                {/* 정보 */}
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-xl font-semibold">
                    {course.course_name}
                  </h2>
                  <div className="mt-1 truncate text-gray-600">
                    {course.address}
                  </div>
                  <div className="mt-2 line-clamp-2 text-gray-700">
                    {course.overview}
                  </div>
                  {/* 해시태그 */}
                  {course.tags && (
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                      {course.tags
                        .replace(/[#\s,]+/g, ' ')
                        .trim()
                        .split(' ')
                        .filter(Boolean)
                        .map((tag) => (
                          <span key={tag} className="truncate">
                            #{tag}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* 페이지네이션 컨트롤 */}
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="rounded bg-gray-200 px-3 py-2 text-gray-700 disabled:opacity-50"
              aria-label="첫 페이지"
            >
              {'<<'}
            </button>
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="rounded bg-gray-200 px-3 py-2 text-gray-700 disabled:opacity-50"
              aria-label="이전 페이지"
            >
              {'<'}
            </button>
            <span className="px-4 py-2 font-semibold">
              ({page}/{totalPages})
            </span>
            <button
              onClick={handleNext}
              disabled={isLastPage}
              className="rounded bg-gray-200 px-3 py-2 text-gray-700 disabled:opacity-50"
              aria-label="다음 페이지"
            >
              {'>'}
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={isLastPage}
              className="rounded bg-gray-200 px-3 py-2 text-gray-700 disabled:opacity-50"
              aria-label="마지막 페이지"
            >
              {'>>'}
            </button>
          </div>
        </div>
        {/* 오른쪽: 지역 필터 */}
        <aside className="w-full flex-shrink-0 md:w-64">
          <div className="sticky top-24 rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-bold">지역별</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleRegionSelect(null)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${regionCode === null ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
              >
                #전체
              </button>
              {PROVINCES.map((prov) => (
                <button
                  key={prov.code}
                  onClick={() => handleRegionSelect(prov.code)}
                  className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${regionCode === prov.code ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                >
                  #{prov.shortName}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
})

RecommendPage.displayName = 'RecommendPage'
export default RecommendPage
