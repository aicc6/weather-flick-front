<<<<<<< HEAD
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
=======
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

import { Search } from '@/components/icons'
import { getMultipleRegionImages } from '@/services/imageService'
import {
  useGetTravelCoursesQuery,
  useSearchTravelCoursesQuery,
  useGetThemesQuery,
} from '@/store/api/travelCoursesApi'
import useDebounce from '@/hooks/useDebounce'

import RecommendCourseCard from './RecommendCourseCard'

// 안전한 key 생성 유틸리티 함수
const generateSafeKey = (item, prefix = '', index = 0) => {
  const safeId = item?.id || item?.course_id || item?.plan_id || index
  const safePrefix = prefix ? `${prefix}-` : ''
  return `${safePrefix}${safeId}`
}

const generateSafeKeyWithValue = (prefix, index, value) => {
  const safePrefix = prefix || 'item'
  const safeIndex = index ?? 0
  const safeValue =
    value
      ?.toString()
      ?.replace(/\s+/g, '-')
      ?.replace(/[^a-zA-Z0-9-_]/g, '') || 'empty'
  return `${safePrefix}-${safeIndex}-${safeValue}`
}
export default function TravelCoursePage() {
  // 기존 상태들
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedTheme, setSelectedTheme] = useState('all')
  const [, setImages] = useState({})
  const [imagesLoading, setImagesLoading] = useState(true)

  // 페이지네이션 관련 상태
  const [displayedCourses, setDisplayedCourses] = useState(5)
  const INITIAL_DISPLAY_COUNT = 5

  // API 관련 상태
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 50

  // API 데이터 로드
  const {
    data: themesData = [],
    isLoading: _themesLoading,
    error: _themesError,
  } = useGetThemesQuery()

  // 테마 데이터 처리
  const _themes = useMemo(() => {
    const defaultThemes = [
      { code: 'nature', name: '자연' },
      { code: 'culture', name: '문화' },
      { code: 'history', name: '역사' },
      { code: 'food', name: '맛집' },
      { code: 'shopping', name: '쇼핑' },
      { code: 'activity', name: '액티비티' },
      { code: 'healing', name: '힐링' },
      { code: 'family', name: '가족' },
      { code: 'couple', name: '커플' },
      { code: 'friend', name: '친구' },
      { code: 'beach', name: '바다' },
      { code: 'mountain', name: '산' },
      { code: 'festival', name: '축제' },
      { code: 'traditional', name: '전통' },
      { code: 'modern', name: '도시' },
    ]

    let finalThemes = defaultThemes

    if (Array.isArray(themesData) && themesData.length > 0) {
      const validApiThemes = themesData.filter((t) => {
        if (!t || !t.code || !t.name) return false
        const isAllOption =
          t.code === 'all' ||
          t.name === '전체' ||
          t.name === '전체 테마' ||
          t.name.startsWith('전체')
        return !isAllOption
      })

      if (validApiThemes.length > 0) {
        const apiCodes = new Set(validApiThemes.map((t) => t.code))
        const uniqueDefaultThemes = defaultThemes.filter(
          (t) => !apiCodes.has(t.code),
        )
        finalThemes = [...validApiThemes, ...uniqueDefaultThemes]
      }
>>>>>>> bbc4887f8a7191325de98e00fbe1b86758c2bdfb
    }
  }, [courses])

<<<<<<< HEAD
  const isLastPage = page === totalPages

  if (isLoading) return <div>로딩 중...</div>
  if (error) return <div>에러 발생: {error.message}</div>
=======
    return finalThemes.sort((a, b) =>
      a.name.localeCompare(b.name, 'ko', { sensitivity: 'base' }),
    )
  }, [themesData])

  // 검색 관련
  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 300)
  const shouldUseSearch = debouncedSearchQuery.length >= 2

  // API 쿼리 파라미터
  const listQueryParams = useMemo(() => {
    const params = {
      page: currentPage,
      page_size: PAGE_SIZE,
    }
    return params
  }, [currentPage])

  const searchQueryParams = useMemo(() => {
    const params = {
      searchQuery: debouncedSearchQuery,
      page: currentPage,
      page_size: PAGE_SIZE,
    }
    return params
  }, [debouncedSearchQuery, currentPage])

  // API 호출
  const {
    data: travelCoursesResponse,
    error: listError,
    isLoading: isListLoading,
    isError: isListError,
    refetch: refetchList,
  } = useGetTravelCoursesQuery(listQueryParams, {
    skip: shouldUseSearch,
  })

  const {
    data: searchResponse,
    error: searchError,
    isLoading: isSearchLoading,
    isError: isSearchError,
    refetch: refetchSearch,
  } = useSearchTravelCoursesQuery(searchQueryParams, {
    skip: !shouldUseSearch,
  })

  // 활성 응답 결정
  const activeResponse = shouldUseSearch
    ? searchResponse
    : travelCoursesResponse
  const activeError = shouldUseSearch ? searchError : listError
  const isActiveLoading = shouldUseSearch ? isSearchLoading : isListLoading
  const isActiveError = shouldUseSearch ? isSearchError : isListError
  const activeRefetch = shouldUseSearch ? refetchSearch : refetchList

  // 여행 코스 데이터 추출
  const travelCourses = useMemo(() => {
    if (!activeResponse) return []

    let rawCourses = []

    try {
      if (Array.isArray(activeResponse)) {
        rawCourses = activeResponse.filter(Boolean)
      } else if (
        activeResponse.courses &&
        Array.isArray(activeResponse.courses)
      ) {
        rawCourses = activeResponse.courses.filter(Boolean)
      } else if (activeResponse.data && Array.isArray(activeResponse.data)) {
        rawCourses = activeResponse.data.filter(Boolean)
      } else if (
        activeResponse.results &&
        Array.isArray(activeResponse.results)
      ) {
        rawCourses = activeResponse.results.filter(Boolean)
      } else {
        if (import.meta.env.DEV) {
          console.log('활성 응답 구조:', activeResponse)
        }
        return []
      }

      // 중복 제거 (ID 기반으로만, 제목 중복 제거는 완화)
      if (rawCourses.length === 0) return []

      const uniqueCourses = []
      const seenIds = new Set()

      for (const course of rawCourses) {
        if (!course) continue

        const courseId = course.id || course.course_id || course.content_id
        if (courseId && seenIds.has(courseId)) {
          if (import.meta.env.DEV) {
            console.log('중복 ID 발견:', courseId)
          }
          continue
        }

        if (courseId) seenIds.add(courseId)
        uniqueCourses.push(course)
      }

      if (import.meta.env.DEV) {
        console.log('코스 데이터 처리 완료:', {
          raw: rawCourses.length,
          unique: uniqueCourses.length,
          regions: uniqueCourses.map((c) => c.region),
        })
      }

      return uniqueCourses
    } catch (error) {
      console.error('코스 데이터 처리 중 오류:', error)
      return []
    }
  }, [activeResponse])

  // 에러 처리
  const error = useMemo(() => {
    if (isActiveError && activeError) {
      if (activeError.status === 'FETCH_ERROR' || !navigator.onLine) {
        return '인터넷 연결을 확인해주세요.'
      }
      if (activeError.status >= 500) {
        return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
      }
      return '여행 코스를 불러오는데 문제가 발생했습니다.'
    }
    return null
  }, [isActiveError, activeError])

  // 로딩 상태
  const isLoading = isActiveLoading

  // 필터 변경 시 초기화
  useEffect(() => {
    setCurrentPage(1)
    setDisplayedCourses(INITIAL_DISPLAY_COUNT)
  }, [selectedTheme, debouncedSearchQuery])

  // 클라이언트 사이드 필터링
  const filteredCourses = useMemo(() => {
    if (!Array.isArray(travelCourses)) return []

    return travelCourses.filter((course) => {
      if (!course) return false

      // 월 필터링
      const courseBestMonths = course?.bestMonths || course?.best_months || []
      const matchesMonth =
        selectedMonth === 'all' ||
        (Array.isArray(courseBestMonths) &&
          courseBestMonths.includes(parseInt(selectedMonth)))

      // 테마 필터링
      const courseThemes = course?.theme || course?.themes || []
      const matchesTheme =
        selectedTheme === 'all' ||
        (Array.isArray(courseThemes) &&
          courseThemes.some(
            (theme) =>
              theme &&
              (theme === selectedTheme ||
                theme.toLowerCase().includes(selectedTheme.toLowerCase())),
          ))

      return matchesMonth && matchesTheme
    })
  }, [travelCourses, selectedMonth, selectedTheme])

  // 정렬 로직 (기본 정렬만 사용)
  const sortedCourses = useMemo(() => {
    return filteredCourses
  }, [filteredCourses])

  // 현재 표시할 코스들 계산 (단순하게 순서대로 표시)
  const currentDisplayedCourses = useMemo(() => {
    return sortedCourses.slice(0, displayedCourses)
  }, [sortedCourses, displayedCourses])

  // 더보기 버튼 표시 여부
  const hasMoreToShow = useMemo(() => {
    return displayedCourses < sortedCourses.length
  }, [displayedCourses, sortedCourses.length])

  // 모든 코스 보기 핸들러
  const handleShowAllCourses = useCallback(() => {
    setDisplayedCourses(sortedCourses.length)
  }, [sortedCourses.length])

  // 이미지 로딩
  useEffect(() => {
    const loadImages = async () => {
      try {
        setImagesLoading(true)

        const regionCodes = travelCourses
          .map((course) => course?.region)
          .filter((region) => region && region !== null && region !== undefined)
        const uniqueRegionCodes = [...new Set(regionCodes)]

        // 지역 코드를 이름으로 변환하는 간단한 매핑
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
        }

        const regionNamesForImages = uniqueRegionCodes
          .map((code) => regionMapping[code] || code)
          .filter(Boolean)

        if (regionNamesForImages.length === 0) {
          setImages({})
          setImagesLoading(false)
          return
        }

        const images = await getMultipleRegionImages(regionNamesForImages)
        setImages(images)
      } catch (error) {
        console.error('지역 이미지 로드 실패:', error)
        setImages({})
      } finally {
        setImagesLoading(false)
      }
    }

    if (travelCourses.length > 0) {
      loadImages()
    }
  }, [travelCourses])

  // 월 배열
  const monthNames = [
    '전체',
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ]

  // 스켈레톤 카드 렌더링
  const renderSkeletonCards = () => {
    return Array.from({ length: INITIAL_DISPLAY_COUNT }).map((_, index) => (
      <Card key={`skeleton-${index}`} className="weather-card">
        <div className="relative h-48 animate-pulse overflow-hidden rounded-t-xl bg-gray-200"></div>
        <CardHeader className="pb-3">
          <div className="space-y-2">
            <div className="h-5 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="h-4 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
          </div>
        </CardContent>
      </Card>
    ))
  }

  // 코스 카드 렌더링
  const renderCourseCards = () => {
    return currentDisplayedCourses.map((course, index) => {
      const uniqueKey = `course-${course?.id || index}-${selectedMonth}-${selectedTheme}-${index}`

      return (
        <div key={uniqueKey} className="w-full">
          <RecommendCourseCard
            course={course}
            rating={course.rating}
            viewMode="grid"
          />
        </div>
      )
    })
  }
>>>>>>> bbc4887f8a7191325de98e00fbe1b86758c2bdfb

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
<<<<<<< HEAD
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
=======
      </section>

      {/* Courses Section */}
      <section className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="weather-card mx-auto max-w-md p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
            <h3 className="text-foreground mb-2 text-xl font-semibold">
              여행 코스를 불러오는 중입니다...
            </h3>
            <p className="text-muted-foreground mb-6">기다려주세요</p>
          </div>
        ) : error ? (
          <div className="weather-card mx-auto max-w-md p-8 text-center">
            <div className="mb-6 flex justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-foreground mb-2 text-xl font-semibold">
              여행 코스를 불러오는데 실패했습니다
            </h3>
            <p className="mb-6 text-sm text-red-500">{error}</p>
            <Button
              onClick={() => activeRefetch()}
              className="primary-button w-full font-semibold"
            >
              다시 불러오기
            </Button>
          </div>
        ) : sortedCourses.length === 0 ? (
          <div className="weather-card mx-auto max-w-md p-8 text-center">
            <div className="mb-6 flex justify-center">
              <Search
                className="h-10 w-10"
                style={{ color: 'var(--primary-blue)' }}
              />
            </div>
            <h3 className="text-foreground mb-2 text-xl font-semibold">
              검색 결과가 없습니다
            </h3>
            <p className="text-muted-foreground mb-6">
              다른 검색 조건을 선택해보세요.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('')
                setSelectedMonth('all')
                setSelectedTheme('all')
              }}
              className="primary-button w-full font-semibold"
            >
              전체 코스 보기
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-foreground mb-2 text-2xl font-bold">
                추천 여행 코스
              </h2>
              <p className="text-muted-foreground">
                {shouldUseSearch ? (
                  <>
                    <span className="font-medium">
                      &quot;{debouncedSearchQuery}&quot;
                    </span>{' '}
                    검색 결과: {sortedCourses.length}개 중 {displayedCourses}개
                    표시
                  </>
                ) : (
                  `총 ${sortedCourses.length}개 코스`
                )}
              </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {imagesLoading ? renderSkeletonCards() : renderCourseCards()}
            </div>

            <div className="flex flex-col items-center gap-4">
              {hasMoreToShow && (
                <Button
                  onClick={handleShowAllCourses}
                  variant="outline"
                  size="lg"
                  className="px-8 py-3"
>>>>>>> bbc4887f8a7191325de98e00fbe1b86758c2bdfb
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
<<<<<<< HEAD
})

RecommendPage.displayName = 'RecommendPage'
export default RecommendPage
=======
}
>>>>>>> bbc4887f8a7191325de98e00fbe1b86758c2bdfb
