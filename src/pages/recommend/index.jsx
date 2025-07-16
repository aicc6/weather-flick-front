import { useState, useMemo } from 'react'
import { useGetTravelCoursesQuery } from '@/store/api/travelCoursesApi'

export default function RecommendListPage() {
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isLoading, isError, error } = useGetTravelCoursesQuery({
    page,
    page_size: pageSize,
  })

  const courses = data?.courses || []
  const total = data?.total || 0
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize],
  )

  if (isLoading) return <div>로딩 중...</div>
  if (isError)
    return (
      <div>에러: {error?.data?.detail || '데이터를 불러올 수 없습니다.'}</div>
    )

  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="mb-6 text-2xl font-bold">여행지 리스트</h1>
      <ul className="mb-8 space-y-4">
        {courses.length === 0 ? (
          <li className="text-gray-500">데이터가 없습니다.</li>
        ) : (
          courses.map((course) => (
            <li key={course.id} className="rounded border p-4">
              <div className="font-semibold">{course.title}</div>
              <div className="text-sm text-gray-600">지역: {course.region}</div>
              <div className="text-xs text-gray-400">ID: {course.id}</div>
            </li>
          ))
        )}
      </ul>
      {/* 페이지네이션 */}
      <div className="flex items-center justify-center gap-2">
        <button
          className="rounded border bg-white px-3 py-1 text-gray-800 hover:bg-gray-100 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          이전
        </button>
        <span className="mx-2 text-sm">
          {page} / {totalPages}
        </span>
        <button
          className="rounded border bg-white px-3 py-1 text-gray-800 hover:bg-gray-100 disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          다음
        </button>
      </div>
    </div>
  )
}
