import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, Settings } from '@/components/icons'
import { getMultipleRegionImages } from '@/services/imageService'
import {
  useGetTravelCoursesQuery,
  useSearchTravelCoursesQuery,
  useGetRegionsQuery,
  useGetThemesQuery,
} from '@/store/api/travelCoursesApi'
import useDebounce from '@/hooks/useDebounce'

// 기존 고도 컴포넌트(고급 기능 사용 시 사용)
import QuickFilters from '@/components/recommend/QuickFilters'
import SmartSorting from '@/components/recommend/SmartSorting'

import RecommendCourseCard from './RecommendCourseCard'

// 244개 전체 지역 지원으로 확장
import { getMajorCitiesFlat, getCitiesByGroup, getPopularCities, getCityStats } from '@/data/majorCities'
import { getAllRegionsFlat, getRegionNameByCode } from '@/data/koreaRegions'

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
  // ===============================
  // 기존 태클- 모두 보존
  // ===============================
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedTheme, setSelectedTheme] = useState('all')

  // 개발 환경에서만 필터 상태 로깅
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('필터 상태 변경:', {
        selectedRegion,
        selectedMonth,
        selectedTheme,
      })
    }
  }, [selectedRegion, selectedMonth, selectedTheme])
  const [images, setImages] = useState({})
  const [imagesLoading, setImagesLoading] = useState(true)

  // ===============================
  // API 데이터 로드
  // ===============================
  const {
    data: regionsData = [],
    isLoading: regionsLoading,
    error: regionsError,
    isError: regionsIsError,
    refetch: regionsRefetch,
  } = useGetRegionsQuery()

  // 개발 환경에서만 Regions API 상태 로깅
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Regions API 상태:', {
        loading: regionsLoading,
        error: regionsIsError,
        dataLength: regionsData?.length
      })

      if (regionsError) {
        console.error('Regions API 에러:', regionsError)
      }
    }
  }, [regionsData, regionsLoading, regionsError, regionsIsError])

  // 244개 전체 지역 데이터 처리 - 완전한 전국 커버리지 제공
  const regions = useMemo(() => {
    const isDev = import.meta.env.DEV
    
    if (isDev) {
      console.log('전체 지역 데이터 처리 시작')
    }

    // 1. 전체 244개 지역 데이터 가져오기
    const allKoreaRegions = getAllRegionsFlat()
    const majorCities = getMajorCitiesFlat()
    const popularCities = getPopularCities()
    
    if (isDev) {
      console.log('전체 지역 통계:', {
        전체지역: allKoreaRegions.length,
        주요도시: majorCities.length,
        인기지역: popularCities.length
      })
    }

    // 2. 주요 도시를 우선으로 하되 모든 지역 지원
    let finalRegions = []
    
    // 2-1. 먼저 주요 여행 도시들 추가 (우선순위 높음)
    const majorCityCodeSet = new Set(majorCities.map(c => c.code))
    finalRegions = [...majorCities]
    
    // 2-2. 나머지 244개 지역 중 주요 도시에 포함되지 않은 지역들 추가
    const additionalRegions = allKoreaRegions
      .filter(region => !majorCityCodeSet.has(region.code) && region.type === 'city')
      .map(region => ({
        code: region.code,
        name: region.name,
        province: region.province,
        popular: false,
        groupName: region.fullName ? region.fullName.split(' ')[0] : '기타',
        displayName: region.fullName || region.name,
        level: region.level,
        isAdditional: true // 추가 지역 표시
      }))
    
    finalRegions = [...finalRegions, ...additionalRegions]
    
    // 3. API 데이터와 병합 (API 데이터가 있으면 우선 사용하되 전체 지역 유지)
    if (Array.isArray(regionsData) && regionsData.length > 0) {
      // API 데이터에서 유효한 지역만 필터링
      const validApiRegions = regionsData.filter((r) => {
        if (!r || !r.code || !r.name) return false
        
        const isAllOption =
          r.code === 'all' ||
          r.name === '전체' ||
          r.name === '전체 지역' ||
          r.name.startsWith('전체')
        
        return !isAllOption
      })
      
      if (validApiRegions.length > 0) {
        // API 데이터로 기존 지역 정보 업데이트 (전체 목록은 유지)
        const apiCodes = new Set(validApiRegions.map(r => r.code))
        
        // API 데이터가 있는 지역은 API 정보로 업데이트
        finalRegions = finalRegions.map(region => {
          const apiRegion = validApiRegions.find(ar => ar.code === region.code)
          return apiRegion ? { ...region, ...apiRegion } : region
        })
        
        // API에만 있고 기존 목록에 없는 지역 추가
        const existingCodes = new Set(finalRegions.map(r => r.code))
        const newApiRegions = validApiRegions.filter(ar => !existingCodes.has(ar.code))
        finalRegions = [...finalRegions, ...newApiRegions]
        
        if (isDev) {
          console.log('API 데이터 병합 완료:', {
            API데이터: validApiRegions.length,
            기존지역: finalRegions.length - newApiRegions.length,
            신규추가: newApiRegions.length,
            최종지역수: finalRegions.length
          })
        }
      }
    }

    // 4. 그룹별로 정렬 (인기도 > 주요도시 > 일반지역 > 한글순)
    const sortedRegions = finalRegions.sort((a, b) => {
      // 1순위: 인기도
      if (a.popular && !b.popular) return -1
      if (!a.popular && b.popular) return 1
      
      // 2순위: 주요 도시 여부 (추가 지역보다 우선)
      if (!a.isAdditional && b.isAdditional) return -1
      if (a.isAdditional && !b.isAdditional) return 1
      
      // 3순위: 그룹명으로 정렬
      const aGroup = a.groupName || ''
      const bGroup = b.groupName || ''
      if (aGroup !== bGroup) {
        return aGroup.localeCompare(bGroup, 'ko')
      }
      
      // 4순위: 도시명으로 정렬
      const aName = a.name || ''
      const bName = b.name || ''
      return aName.localeCompare(bName, 'ko', { sensitivity: 'base' })
    })

    if (isDev) {
      console.log('244개 전체 지역 목록 완성:', {
        총지역수: sortedRegions.length,
        인기지역: sortedRegions.filter(r => r.popular).length,
        주요도시: sortedRegions.filter(r => !r.isAdditional).length,
        추가지역: sortedRegions.filter(r => r.isAdditional).length,
        샘플: sortedRegions.slice(0, 5).map(r => `${r.name} (${r.groupName})`)
      })
    }

    return sortedRegions
  }, [regionsData])

  const {
    data: themesData = [],
    isLoading: themesLoading,
    error: themesError,
  } = useGetThemesQuery()

  // 동적 테마 데이터 처리 - 기본 테마 + API 데이터 병합
  const themes = useMemo(() => {
    const isDev = import.meta.env.DEV
    
    if (isDev) {
      console.log('Themes 데이터 처리:', themesData?.length || 0, '개')
    }

    // 기본 테마 목록 (여행 코스에 적합한 테마들)
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
      { code: 'modern', name: '도시' }
    ]

    let finalThemes = defaultThemes

    // API 데이터가 있으면 병합
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
        // API 데이터와 기본 데이터 병합 (중복 제거)
        const apiCodes = new Set(validApiThemes.map(t => t.code))
        const uniqueDefaultThemes = defaultThemes.filter(t => !apiCodes.has(t.code))
        finalThemes = [...validApiThemes, ...uniqueDefaultThemes]
        
        if (isDev) {
          console.log('테마 데이터 병합:', {
            API데이터: validApiThemes.length,
            기본데이터: uniqueDefaultThemes.length,
            최종: finalThemes.length
          })
        }
      }
    }

    // 한글 ㄱㄴㄷ 순으로 정렬
    const sortedThemes = finalThemes.sort((a, b) => {
      return a.name.localeCompare(b.name, 'ko', { sensitivity: 'base' })
    })

    if (isDev) {
      console.log('최종 테마 목록:', sortedThemes.length, '개')
    }

    return sortedThemes
  }, [themesData])

  // ===============================
  // 표시 및 페이지네이션 관련 상태
  // ===============================
  const [displayedCourses, setDisplayedCourses] = useState(5) // 한 번에 보여줄 코스 수
  const INITIAL_DISPLAY_COUNT = 5 // 초기 표시 개수
  const LOAD_MORE_COUNT = 5 // 더보기 시 추가로 로드할 개수

  // ===============================
  // 고도 태클- 고급 기능
  // ===============================
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false)
  const [quickFilters, setQuickFilters] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('recommended')

  // ===============================
  // RTK Query 사용 - 검색 디바운싱과 조건부 쿼리
  // ===============================
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 50 // API에서 가져올 전체 데이터 수

  // 검색 바 입력 시 검색 API 사용, 아니면 목록 API 사용
  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 300)

  // 검색 바 입력 시 검색 API 사용, 아니면 목록 API 사용
  const shouldUseSearch = debouncedSearchQuery.length >= 2

  // API 쿼리 파라미터 생성
  const listQueryParams = useMemo(() => {
    const params = {
      page: currentPage,
      page_size: PAGE_SIZE,
    }

    // selectedRegion이 'all'이 아닌 경우에만 region_code 추가
    if (selectedRegion !== 'all') {
      params.region_code = selectedRegion
    }

    if (import.meta.env.DEV) {
      console.log('API 쿼리 파라미터:', params)
    }
    return params
  }, [currentPage, selectedRegion])

  // 일반 여행 코스 목록 조회
  const {
    data: travelCoursesResponse,
    error: listError,
    isLoading: isListLoading,
    isError: isListError,
    refetch: refetchList,
  } = useGetTravelCoursesQuery(listQueryParams, {
    skip: shouldUseSearch, // 검색 중일 때는 쿼리 건너뛰기
  })

  // 검색 API 쿼리 파라미터 생성
  const searchQueryParams = useMemo(() => {
    const params = {
      searchQuery: debouncedSearchQuery,
      page: currentPage,
      page_size: PAGE_SIZE,
    }

    // selectedRegion이 'all'이 아닌 경우에만 region_code 추가
    if (selectedRegion !== 'all') {
      params.region_code = selectedRegion
    }

    if (import.meta.env.DEV) {
      console.log('검색 API 쿼리 파라미터:', params)
    }
    return params
  }, [debouncedSearchQuery, currentPage, selectedRegion])

  // 검색 API 사용
  const {
    data: searchResponse,
    error: searchError,
    isLoading: isSearchLoading,
    isError: isSearchError,
    refetch: refetchSearch,
  } = useSearchTravelCoursesQuery(searchQueryParams, {
    skip: !shouldUseSearch, // 검색 중일 때는 쿼리 건너뛰기
  })

  // 재 사용 여부 태그 결정
  const activeResponse = shouldUseSearch
    ? searchResponse
    : travelCoursesResponse
  const activeError = shouldUseSearch ? searchError : listError
  const isActiveLoading = shouldUseSearch ? isSearchLoading : isListLoading
  const isActiveError = shouldUseSearch ? isSearchError : isListError
  const activeRefetch = shouldUseSearch ? refetchSearch : refetchList

  // 응답 데이터에서 courses 추출 및 중복 제거 (프로덕션 최적화)
  const travelCourses = useMemo(() => {
    // 개발 환경에서만 디버깅 로그 출력
    const isDev = import.meta.env.DEV
    
    if (isDev) {
      console.log('API 응답 처리 시작:', {
        selectedRegion,
        apiType: shouldUseSearch ? 'SEARCH' : 'LIST',
        responseType: typeof activeResponse,
        isArray: Array.isArray(activeResponse),
        loading: isActiveLoading,
        response: activeResponse
      })
    }

    // 응답이 없는 경우 조기 반환
    if (!activeResponse) {
      return []
    }

    let rawCourses = []

    // API 응답 구조에 따른 데이터 추출
    if (Array.isArray(activeResponse)) {
      rawCourses = activeResponse.filter(Boolean)
    } else if (activeResponse.courses && Array.isArray(activeResponse.courses)) {
      rawCourses = activeResponse.courses.filter(Boolean)
    } else if (typeof activeResponse === 'object') {
      if (isDev) {
        console.warn('유효하지 않은 API 응답 구조:', {
          hasCourses: 'courses' in activeResponse,
          coursesType: typeof activeResponse.courses,
          totalCount: activeResponse.total,
          keys: Object.keys(activeResponse),
          fullResponse: activeResponse
        })
      }
      
      // 다양한 가능한 응답 구조 시도
      if (activeResponse.data && Array.isArray(activeResponse.data)) {
        rawCourses = activeResponse.data.filter(Boolean)
      } else if (activeResponse.results && Array.isArray(activeResponse.results)) {
        rawCourses = activeResponse.results.filter(Boolean)
      } else {
        // 빈 배열로 대체하는 대신 동적 생성 시도
        if (selectedRegion !== 'all' && !shouldUseSearch) {
          if (isDev) {
            console.log('API 응답이 없어서 빈 배열 반환, 동적 생성은 API에서 처리됨')
          }
        }
        return []
      }
    } else {
      return []
    }

    // 중복 제거 로직 (성능 최적화)
    if (rawCourses.length === 0) return []
    
    const uniqueCourses = []
    const seenIds = new Set()
    const seenTitles = new Set()
    
    for (const course of rawCourses) {
      if (!course) continue
      
      // ID 기반 중복 체크
      const courseId = course.id || course.course_id || course.content_id
      if (courseId && seenIds.has(courseId)) {
        if (isDev) console.log(`중복 제거 (ID): ${courseId}`)
        continue
      }
      
      // 제목 기반 중복 체크
      const courseTitle = course.title || course.course_name || course.name
      const trimmedTitle = courseTitle?.trim()
      if (trimmedTitle && seenTitles.has(trimmedTitle)) {
        if (isDev) console.log(`중복 제거 (제목): ${trimmedTitle}`)
        continue
      }
      
      // 고유 코스 추가
      if (courseId) seenIds.add(courseId)
      if (trimmedTitle) seenTitles.add(trimmedTitle)
      uniqueCourses.push(course)
    }
    
    if (isDev) {
      console.log(`데이터 처리 완료: ${rawCourses.length} → ${uniqueCourses.length} (${rawCourses.length - uniqueCourses.length}개 중복 제거)`)
    }
    
    return uniqueCourses
  }, [activeResponse, shouldUseSearch, isActiveLoading, selectedRegion])

  // 에러 처리 및 상태 관리
  const error = useMemo(() => {
    if (isActiveError && activeError) {
      const baseMessage = '여행 코스를 불러오는데 문제가 발생했습니다.'
      
      // 네트워크 에러인 경우
      if (activeError.status === 'FETCH_ERROR' || !navigator.onLine) {
        return '인터넷 연결을 확인해주세요.'
      }
      
      // 서버 에러인 경우
      if (activeError.status >= 500) {
        return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
      }
      
      // 기타 에러
      return baseMessage
    }
    return null
  }, [isActiveError, activeError])

  // 로딩 상태
  const isLoading = isActiveLoading

  // 이번에 불러오기 버튼 클릭 시 페이지 초기화
  useEffect(() => {
    if (currentPage > 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentPage])

  // 필터 변경 시 페이지 및 표시 개수 초기화
  useEffect(() => {
    setCurrentPage(1)
    setDisplayedCourses(INITIAL_DISPLAY_COUNT)
  }, [selectedRegion, selectedTheme, debouncedSearchQuery])

  // 지역 로드
  useEffect(() => {
    const loadImages = async () => {
      try {
        setImagesLoading(true)

        // region 필드 사용 - null/undefined 안전 처리
        const regionCodes = travelCourses
          .map((course) => course?.region)
          .filter((region) => region && region !== null && region !== undefined)
        const uniqueRegionCodes = [...new Set(regionCodes)]

        if (import.meta.env.DEV) {
          console.log('이미지 로딩 시작:', uniqueRegionCodes.length, '개 지역')
          console.log('지역 코드 목록:', uniqueRegionCodes)
        }

        const regionNamesForImages = uniqueRegionCodes
          .map((code) => {
            // 주요 도시 데이터에서 찾기
            if (Array.isArray(regions)) {
              const regionData = regions.find((region) => region?.code === code)
              if (regionData?.name) {
                return regionData.name
              }
            }
            
            if (import.meta.env.DEV) {
              console.warn(`알 수 없는 지역 코드: ${code}`)
            }
            
            // 주요 도시 전체 목록에서 찾기
            const allMajorCities = getMajorCitiesFlat()
            const fallbackData = allMajorCities.find((r) => r?.code === code)
            return fallbackData ? fallbackData.name : null
          })
          .filter(Boolean) // null/undefined 제거

        // 빈 배열 처리
        if (regionNamesForImages.length === 0) {
          if (import.meta.env.DEV) {
            console.warn('유효한 지역이 없어서 기본 이미지 사용')
          }
          setImages({})
          setImagesLoading(false)
          return
        }

        const startTime = performance.now()
        const images = await getMultipleRegionImages(regionNamesForImages)
        
        if (import.meta.env.DEV) {
          const endTime = performance.now()
          console.log('이미지 로딩 완료:', Object.keys(images).length, '개')
          console.log('로딩 시간:', (endTime - startTime).toFixed(2), 'ms')
          console.log('이미지 매핑 결과:', Object.keys(images))
        }

        setImages(images)

        // 개발 환경에서만 이미지 매핑 상태 확인
        if (import.meta.env.DEV) {
          const mappedCount = travelCourses.filter(course => {
            const courseRegion = course?.region
            if (!Array.isArray(regions) || !courseRegion) return false
            const regionData = regions.find(region => region?.code === courseRegion)
            const regionDisplayName = regionData?.name || courseRegion
            return images[regionDisplayName]
          }).length
          console.log(`이미지 매핑 완료: ${mappedCount}/${travelCourses.length}개 코스`)
        }
      } catch (error) {
        console.error('지역 로드 실패:', error)
        // fallback 로직 - API 데이터 기반 처리
        const fallbackImages = {}
        travelCourses.forEach((course) => {
          const courseRegion = course?.region
          if (courseRegion && Array.isArray(regions)) {
            const regionData = regions.find(
              (region) => region?.code === courseRegion,
            )
            const regionDisplayName = regionData?.name || courseRegion
            fallbackImages[regionDisplayName] =
              `https://picsum.photos/800/600?random=${course?.id || Math.random()}`
          }
        })
        setImages(fallbackImages)
      } finally {
        setImagesLoading(false)
      }
    }

    if (travelCourses.length > 0 && regions.length > 0) {
      loadImages()
    }
  }, [travelCourses, regions]) // travelCourses와 regions가 변경될 때마다 실행

  // 월 배열 - 정적 데이터는 유지 (변경 필요 없음)
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

  // API에서 받은 데이터를 변환하여 사용
  const regionNames = useMemo(() => {
    if (!regions || regions.length === 0) return { all: '전체' }

    const regionMap = {}
    regions.forEach((region) => {
      regionMap[region.code] = region.name
    })
    return regionMap
  }, [regions])

  const themeOptions = useMemo(() => {
    if (!themes || themes.length === 0)
      return [{ value: 'all', label: '전체 테마' }]

    return themes.map((theme) => ({
      value: theme.code,
      label: theme.name,
    }))
  }, [themes])

  // ===============================
  // 클라이언트 사이드 필터링 로직 (검색어는 API에서 처리되므로 제외)
  // ===============================
  const filteredCourses = useMemo(() => {
    const isDev = import.meta.env.DEV
    
    if (isDev) {
      console.log('필터링 시작:', {
        원본: travelCourses.length,
        필터: { selectedMonth, selectedTheme, selectedRegion },
        샘플코스: travelCourses.slice(0, 2).map(c => ({ title: c?.title, region: c?.region }))
      })
    }

    if (!Array.isArray(travelCourses)) {
      return []
    }
    
    // API 필터링이 제대로 작동하지 않는 경우를 대비한 로직
    if (selectedRegion !== 'all' && travelCourses.length === 0) {
      if (isDev) {
        console.warn('지역 필터링 후 코스가 없음. API 응답을 확인하세요.')
      }
    }

    const filtered = travelCourses.filter((course) => {
      if (!course) return false

      // 지역 필터링 개선 - 정확한 매칭과 로깅
      const courseRegion = course?.region || course?.region_code
      const matchesRegion = selectedRegion === 'all' || courseRegion === selectedRegion
      
      // 디버깅: 지역 필터링 상세 로그
      if (isDev && selectedRegion !== 'all') {
        console.log('지역 필터링 체크:', {
          courseTitle: course.title,
          courseRegion,
          selectedRegion,
          matches: matchesRegion
        })
      }

      // 월 필터링 - 안전한 처리
      const courseBestMonths = course?.bestMonths || course?.best_months || []
      const matchesMonth =
        selectedMonth === 'all' ||
        (Array.isArray(courseBestMonths) &&
          courseBestMonths.includes(parseInt(selectedMonth)))

      // 테마 필터링 - 안전한 처리 (코드 기반 매칭)
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

      // 고급 기능에 따른 빠른 필터 로직 - 안전한 처리
      if (showAdvancedFeatures) {
        const courseRating = course?.rating || 0
        const coursePriceValue = course?.priceValue || 0
        const coursePopularityScore = course?.popularityScore || 0
        const courseDuration = course?.duration || ''
        const courseAmenities = course?.amenities || []
        const courseRegion = course?.region

        if (quickFilters.includes('high-rating') && courseRating < 4.0)
          return false
        if (quickFilters.includes('budget') && coursePriceValue > 300000)
          return false
        if (quickFilters.includes('popular') && coursePopularityScore < 80)
          return false
        if (quickFilters.includes('nearby')) {
          // 근처 지역 필터
          const nearbyRegions = ['seoul', 'gyeonggi', 'incheon']
          if (!courseRegion || !nearbyRegions.includes(courseRegion))
            return false
        }
        if (quickFilters.includes('weekend')) {
          // 주말 추천
          if (!courseDuration.includes('23')) return false
        }
        if (quickFilters.includes('family')) {
          // 가족 여행 친화적인 것들
          const familyThemes = ['자연', '문화', '역사']
          const hasFamilyTheme =
            Array.isArray(courseThemes) &&
            courseThemes.some((theme) => theme && familyThemes.includes(theme))
          const hasAccessible =
            Array.isArray(courseAmenities) &&
            courseAmenities.includes('accessible')
          if (!hasFamilyTheme && !hasAccessible) return false
        }
      }

      return matchesRegion && matchesMonth && matchesTheme
    })

    if (isDev) {
      console.log(`필터링 완료: ${filtered.length}개 (원본: ${travelCourses.length}개)`)
    }
    return filtered
  }, [
    travelCourses,
    selectedRegion,
    selectedMonth,
    selectedTheme,
    showAdvancedFeatures,
    quickFilters,
  ])

  // ===============================
  // 정렬 로직
  // ===============================
  const sortedCourses = useMemo(() => {
    if (!showAdvancedFeatures || sortBy === 'recommended') {
      // 기본 모드: 기존 서버 데이터 사용
      return filteredCourses
    }

    return [...filteredCourses].sort((a, b) => {
      // 안전한 값 추출
      const aRating = a?.rating || 0
      const bRating = b?.rating || 0
      const aLikeCount = a?.likeCount || 0
      const bLikeCount = b?.likeCount || 0
      const aPriceValue = a?.priceValue || 0
      const bPriceValue = b?.priceValue || 0
      const aWeatherScore = a?.weatherScore || 0
      const bWeatherScore = b?.weatherScore || 0
      const aPopularityScore = a?.popularityScore || 0
      const bPopularityScore = b?.popularityScore || 0

      switch (sortBy) {
        case 'rating':
          return bRating - aRating
        case 'popularity':
          return bLikeCount - aLikeCount
        case 'price-low':
          return aPriceValue - bPriceValue
        case 'price-high':
          return bPriceValue - aPriceValue
        case 'smart': {
          // AI 스코어 계산 - 안전한 처리
          const scoreA =
            aRating * 0.3 + aWeatherScore * 0.2 + aPopularityScore * 0.5
          const scoreB =
            bRating * 0.3 + bWeatherScore * 0.2 + bPopularityScore * 0.5
          return scoreB - scoreA
        }
        default:
          return 0
      }
    })
  }, [filteredCourses, showAdvancedFeatures, sortBy])

  // ===============================
  // 고급 기능 토글 핸들러
  // ===============================
  const handleAdvancedToggle = useCallback(() => {
    setShowAdvancedFeatures(!showAdvancedFeatures)
    // 고급 기능 초기화
    if (showAdvancedFeatures) {
      setQuickFilters([])
      setSortBy('recommended')
    }
  }, [showAdvancedFeatures])

  const handleSortChange = useCallback((sortConfig) => {
    setSortBy(sortConfig.field)
  }, [])

  // 현재 표시할 코스들 계산 - 지역별 대표 코스 표시 로직 개선
  const currentDisplayedCourses = useMemo(() => {
    if (displayedCourses === INITIAL_DISPLAY_COUNT && selectedRegion === 'all') {
      // 전체 지역 보기 + 초기 5개 표시 시: 지역별 대표 코스 1개씩 선택
      const regionCoursesMap = new Map()
      
      // 모든 코스를 순회하면서 각 지역별로 첫 번째 코스만 선택
      for (const course of sortedCourses) {
        const courseRegion = course?.region
        if (courseRegion && !regionCoursesMap.has(courseRegion)) {
          regionCoursesMap.set(courseRegion, course)
        }
      }
      
      // 지역별 대표 코스들을 배열로 변환하고 최대 5개만 선택
      const representativeCourses = Array.from(regionCoursesMap.values()).slice(0, INITIAL_DISPLAY_COUNT)
      
      if (import.meta.env.DEV) {
        console.log('지역별 대표 코스 표시:', {
          전체코스수: sortedCourses.length,
          지역수: regionCoursesMap.size,
          표시코스수: representativeCourses.length,
          지역목록: Array.from(regionCoursesMap.keys())
        })
      }
      
      return representativeCourses
    } else if (selectedRegion !== 'all') {
      // 특정 지역 선택 시: 해당 지역의 모든 코스 표시
      return sortedCourses.slice(0, displayedCourses)
    } else {
      // 모든 코스 보기 또는 기타 경우: 표시 개수만큼 슬라이스
      return sortedCourses.slice(0, displayedCourses)
    }
  }, [sortedCourses, displayedCourses, selectedRegion])

  // 더보기 버튼 표시 여부
  const hasMoreToShow = useMemo(() => {
    if (selectedRegion === 'all') {
      // 전체 지역 보기: 초기 5개 표시 상태이고 더 많은 코스가 있는 경우
      return displayedCourses === INITIAL_DISPLAY_COUNT && sortedCourses.length > INITIAL_DISPLAY_COUNT
    } else {
      // 특정 지역 선택: 현재 표시된 것보다 더 많은 코스가 있는 경우
      return displayedCourses < sortedCourses.length
    }
  }, [displayedCourses, sortedCourses.length, selectedRegion])
  
  const hasMoreFromAPI =
    activeResponse && activeResponse.total > sortedCourses.length

  // 모든 코스 보기 버튼 클릭 핸들러
  const handleShowAllCourses = useCallback(() => {
    setDisplayedCourses(sortedCourses.length)
  }, [sortedCourses.length])

  // API에서 더 많은 데이터를 가져오는 핸들러
  const handleLoadMoreFromAPI = useCallback(() => {
    setCurrentPage((prev) => prev + 1)

    // 새로운 콘텐츠가 로드될 때 페이지 아래로 스크롤
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth',
      })
    }, 100)
  }, [])

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
          <div className="mt-3 flex gap-2">
            <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200"></div>
            <div className="h-6 w-12 animate-pulse rounded-full bg-gray-200"></div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="h-4 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200"></div>
          </div>
        </CardContent>
      </Card>
    ))
  }

  // 코스 카드 렌더링 (그리드 레이아웃용)
  const renderCourseCards = () => {
    return currentDisplayedCourses.map((course, index) => {
      // 더 고유한 키 생성 (course ID + index + 필터 상태)
      const uniqueKey = `course-${course?.id || index}-${selectedRegion}-${selectedMonth}-${selectedTheme}-${index}`

      return (
        <div key={uniqueKey} className="w-full">
          <RecommendCourseCard
            course={course}
            rating={course.rating} // 서버에서 제공하는 기본 평점 사용
            viewMode="grid"
          />
        </div>
      )
    })
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="page-destinations relative py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8">
            <h1 className="text-foreground mb-4 text-4xl font-bold">
              여행지 추천
              {showAdvancedFeatures && (
                <span className="ml-2 text-2xl">
                  {' '}
                  <Settings className="h-4 w-4" />
                </span>
              )}
            </h1>
            <p className="text-muted-foreground text-lg">
              {showAdvancedFeatures
                ? '고급 AI 추천 기능으로 맞춤형 여행 계획을 세우세요'
                : '국내 최고의 여행지를 가로 스크롤로 편리하게 탐색하세요'}
            </p>
          </div>

          {/* 고도 기능 버튼 */}
          <div className="mb-6 flex justify-center gap-4">
            <Button
              onClick={handleAdvancedToggle}
              variant={showAdvancedFeatures ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {showAdvancedFeatures ? '기본 모드' : '고급 기능'}
            </Button>
          </div>

          {/* Search and Filter Section */}
          <div className="weather-card glass-effect mx-auto max-w-4xl p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search Input */}
              <div className="relative">
                <Search
                  className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                  style={{ color: 'var(--primary-blue)' }}
                />
                <Input
                  placeholder="여행지 이름을 검색하세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-10"
                />
              </div>

              {/* Region Filter */}
              <Select
                value={selectedRegion}
                onValueChange={(value) => {
                  if (import.meta.env.DEV) console.log('지역 선택:', value)
                  setSelectedRegion(value)
                }}
              >
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="지역" />
                </SelectTrigger>
                <SelectContent className="weather-card">
                  {regionsLoading ? (
                    <SelectItem value="loading" disabled>
                      로딩 중...
                    </SelectItem>
                  ) : regionsError ? (
                    <SelectItem value="error" disabled>
                      오류 발생
                    </SelectItem>
                  ) : (
                    <>
                      {/* 항상 "전체" 옵션을 맨 위에 추가 */}
                      <SelectItem value="all">전체</SelectItem>
                      
                      {/* 244개 전체 지역을 체계적으로 표시 */}
                      {(() => {
                        const popularCities = regions.filter(r => r.popular)
                        const majorCities = regions.filter(r => !r.popular && !r.isAdditional)
                        const additionalRegions = regions.filter(r => r.isAdditional)
                        
                        // 광역시도별로 그룹화
                        const groupedRegions = {}
                        additionalRegions.forEach(region => {
                          const groupName = region.groupName || '기타'
                          if (!groupedRegions[groupName]) {
                            groupedRegions[groupName] = []
                          }
                          groupedRegions[groupName].push(region)
                        })
                        
                        return (
                          <>
                            {/* 1. 인기 여행지 섹션 */}
                            {popularCities.length > 0 && (
                              <>
                                <div className="px-2 py-1 text-xs font-semibold text-orange-600 bg-orange-50 border-b">
                                  ⭐ 인기 여행지 ({popularCities.length}개)
                                </div>
                                {popularCities.map((region) => (
                                  <SelectItem
                                    key={generateSafeKeyWithValue('popular', region.code, region.name)}
                                    value={region.code}
                                    className="font-medium text-orange-700"
                                  >
                                    ⭐ {region.name}
                                  </SelectItem>
                                ))}
                              </>
                            )}
                            
                            {/* 2. 주요 여행 도시 섹션 */}
                            {majorCities.length > 0 && (
                              <>
                                <div className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 border-t border-b">
                                  🏛️ 주요 여행 도시 ({majorCities.length}개)
                                </div>
                                {majorCities.map((region) => (
                                  <SelectItem
                                    key={generateSafeKeyWithValue('major', region.code, region.name)}
                                    value={region.code}
                                    className="text-blue-700"
                                  >
                                    🏛️ {region.name}
                                  </SelectItem>
                                ))}
                              </>
                            )}
                            
                            {/* 3. 전국 시군구 섹션 */}
                            {Object.keys(groupedRegions).length > 0 && (
                              <>
                                <div className="px-2 py-1 text-xs font-semibold text-green-600 bg-green-50 border-t border-b">
                                  🗺️ 전국 시·군·구 ({additionalRegions.length}개)
                                </div>
                                {Object.entries(groupedRegions)
                                  .sort(([a], [b]) => a.localeCompare(b, 'ko'))
                                  .map(([groupName, groupRegions]) => (
                                  <div key={groupName}>
                                    {/* 광역시도 헤더 */}
                                    <div className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100">
                                      📍 {groupName} ({groupRegions.length}개)
                                    </div>
                                    
                                    {/* 해당 광역시도의 시군구들 */}
                                    {groupRegions
                                      .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
                                      .map((region) => (
                                        <SelectItem
                                          key={generateSafeKeyWithValue('region', region.code, region.name)}
                                          value={region.code}
                                          className="pl-4 text-xs text-gray-600"
                                        >
                                          🏘️ {region.name}
                                        </SelectItem>
                                      ))}
                                  </div>
                                ))}
                              </>
                            )}
                          </>
                        )
                      })()}
                    </>
                  )}
                </SelectContent>
              </Select>

              {/* Month Filter */}
              <Select
                value={selectedMonth}
                onValueChange={(value) => {
                  console.log('월 선택 변경:', value)
                  setSelectedMonth(value)
                }}
              >
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="해당 월" />
                </SelectTrigger>
                <SelectContent className="weather-card">
                  {monthNames.map((month, index) => (
                    <SelectItem
                      key={generateSafeKeyWithValue('month', index, month)}
                      value={index === 0 ? 'all' : index.toString()}
                    >
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Theme Filter */}
              <Select
                value={selectedTheme}
                onValueChange={(value) => {
                  console.log('테마 선택 변경:', value)
                  setSelectedTheme(value)
                }}
              >
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="테마" />
                </SelectTrigger>
                <SelectContent className="weather-card">
                  {themesLoading ? (
                    <SelectItem value="loading" disabled>
                      로딩 중...
                    </SelectItem>
                  ) : themesError ? (
                    <SelectItem value="error" disabled>
                      오류 발생
                    </SelectItem>
                  ) : (
                    <>
                      {/* 항상 "전체" 옵션을 맨 위에 추가 */}
                      <SelectItem value="all">전체</SelectItem>
                      {themes.map((theme) => (
                        <SelectItem
                          key={generateSafeKeyWithValue(
                            'theme',
                            theme.code,
                            theme.name,
                          )}
                          value={theme.code}
                        >
                          {theme.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Summary */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {shouldUseSearch ? (
                    <>
                      <span className="inline-flex items-center gap-1">
                        <strong>&quot;{debouncedSearchQuery}&quot;</strong> 검색
                        결과:
                      </span>
                      {` ${sortedCourses.length}개`}
                    </>
                  ) : (
                    <>
                      {`${sortedCourses.length}개의 여행 코스를 찾았습니다`}
                      {(selectedRegion !== 'all' ||
                        selectedMonth !== 'all' ||
                        selectedTheme !== 'all') && (
                        <span className="ml-2 text-blue-600">
                          (필터 적용됨:
                          {selectedRegion !== 'all' && ` 지역`}
                          {selectedMonth !== 'all' && ` 월`}
                          {selectedTheme !== 'all' && ` 테마`})
                        </span>
                      )}
                    </>
                  )}
                </span>
                {isLoading && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {shouldUseSearch && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="text-xs"
                  >
                    검색 취소
                  </Button>
                )}
                {(selectedRegion !== 'all' ||
                  selectedMonth !== 'all' ||
                  selectedTheme !== 'all' ||
                  searchQuery ||
                  quickFilters.length > 0) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedRegion('all')
                      setSelectedMonth('all')
                      setSelectedTheme('all')
                      setQuickFilters([])
                      setCurrentPage(1)
                    }}
                    className="border-border hover:bg-muted"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    필터 초기화{' '}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 고도 기능(조건부 더보기) */}
      {showAdvancedFeatures && (
        <section className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            {/* 빠른 필터 */}
            <QuickFilters
              onFilterChange={setQuickFilters}
              activeFilters={quickFilters}
            />

            {/* 정렬 */}
            <SmartSorting
              currentSort={sortBy}
              onSortChange={handleSortChange}
              totalResults={sortedCourses.length}
            />
          </div>
        </section>
      )}

      {/* Courses Carousel */}
      <section className="container mx-auto px-4 py-12">
        {isLoading ? (
          // 로딩 중
          <div className="weather-card mx-auto max-w-md p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div
                className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--primary-blue-light)' }}
              >
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            </div>
            <h3 className="text-foreground mb-2 text-xl font-semibold">
              여행 코스를 불러오는 중입니다...
            </h3>
            <p className="text-muted-foreground mb-6">기다려주세요</p>
          </div>
        ) : error ? (
          // 에러 발생
          <div className="weather-card mx-auto max-w-md p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--accent-red-light)' }}
              >
                <span className="text-3xl">⚠️</span>
              </div>
            </div>
            <h3 className="text-foreground mb-2 text-xl font-semibold">
              여행 코스를 불러오는데 실패했습니다
            </h3>
            <p className="mb-6 text-sm text-red-500">{error}</p>
            <div className="space-y-2">
              <Button
                onClick={() => activeRefetch()}
                className="primary-button w-full font-semibold"
              >
                다시 불러오기
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRegion('all')
                  setSelectedTheme('all')
                  setSearchQuery('')
                }}
                className="w-full"
              >
                필터 초기화
              </Button>
            </div>
          </div>
        ) : sortedCourses.length === 0 ? (
          // 검색 결과 없음
          <div className="weather-card mx-auto max-w-md p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--primary-blue-light)' }}
              >
                <Search
                  className="h-10 w-10"
                  style={{ color: 'var(--primary-blue)' }}
                />
              </div>
            </div>
            <h3 className="text-foreground mb-2 text-xl font-semibold">
              {travelCourses.length === 0
                ? '여행 코스를 불러오는 중입니다'
                : '검색 결과가 없습니다'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {travelCourses.length === 0
                ? '잠시만 기다려주세요. 곧 멋진 여행 코스를 보여드릴게요!'
                : selectedRegion !== 'all' || selectedMonth !== 'all' || selectedTheme !== 'all'
                ? '선택하신 조건에 맞는 여행 코스가 없습니다. 다른 조건을 선택해보세요.'
                : '다른 검색어를 입력해보세요.'}
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedRegion('all')
                  setSelectedMonth('all')
                  setSelectedTheme('all')
                  setQuickFilters([])
                }}
                className="primary-button w-full font-semibold"
              >
                전체 코스 보기
              </Button>
              {/* 필터링된 상태에서 결과가 없을 때 인기 지역 추천 */}
              {sortedCourses.length === 0 && (selectedRegion !== 'all' || selectedMonth !== 'all' || selectedTheme !== 'all') && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">인기 여행지를 추천드려요:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => setSelectedRegion('jeju')}
                      variant="outline"
                      size="sm"
                    >
                      제주도
                    </Button>
                    <Button
                      onClick={() => setSelectedRegion('busan')}
                      variant="outline"
                      size="sm"
                    >
                      부산
                    </Button>
                    <Button
                      onClick={() => setSelectedRegion('gangneung')}
                      variant="outline"
                      size="sm"
                    >
                      강릉
                    </Button>
                    <Button
                      onClick={() => setSelectedRegion('jeonju')}
                      variant="outline"
                      size="sm"
                    >
                      전주
                    </Button>
                  </div>
                </div>
              )}
              {travelCourses.length === 0 && (
                <Button
                  onClick={() => activeRefetch()}
                  variant="outline"
                  className="w-full"
                >
                  다시 불러오기
                </Button>
              )}
            </div>
          </div>
        ) : (
          // 그리드 레이아웃 표시
          <>
            {/* 헤더 */}
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
                  selectedRegion === 'all' 
                    ? (displayedCourses === INITIAL_DISPLAY_COUNT 
                        ? `${sortedCourses.length}개 코스 중 지역별 대표 ${currentDisplayedCourses.length}개 표시`
                        : `총 ${sortedCourses.length}개 모든 코스 표시`)
                    : `${sortedCourses.length}개 코스 중 ${currentDisplayedCourses.length}개 표시`
                )}
              </p>
            </div>

            {/* 그리드 컨테이너 */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {imagesLoading ? renderSkeletonCards() : renderCourseCards()}
            </div>

            {/* 더보기 버튼들 */}
            <div className="flex flex-col items-center gap-4">
              {/* 모든 코스 보기 버튼 */}
              {hasMoreToShow && (
                <Button
                  onClick={handleShowAllCourses}
                  variant="outline"
                  size="lg"
                  className="px-8 py-3"
                >
                  {selectedRegion === 'all' 
                    ? `모든 코스 보기 (${sortedCourses.length}개)`
                    : `더 많은 코스 보기 (${sortedCourses.length - displayedCourses}개 더)`
                  }
                </Button>
              )}

              {/* API에서 더 많은 데이터를 가져올 수 있는 경우 */}
              {!hasMoreToShow && hasMoreFromAPI && (
                <Button
                  onClick={handleLoadMoreFromAPI}
                  variant="outline"
                  size="lg"
                  disabled={isLoading}
                  className="px-8 py-3"
                >
                  {isLoading ? '로딩 중...' : 'API에서 더 많은 코스 가져오기'}
                </Button>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
