import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, MapPin, List } from '@/components/icons'
import GoogleKoreaMap from '@/components/GoogleKoreaMap'
import {
  getMultipleRegionImages,
  getFallbackImages,
} from '@/services/pixabayApi'
import { useGetActiveRegionsQuery } from '@/store/api'
import { setRegion } from '@/store/slices/customizedScheduleSlice'

// 지역별 설명 데이터
const REGION_DESCRIPTIONS = {
  11: '역사와 현대가 공존하는 대한민국의 수도', // 서울
  26: '해운대와 광안리가 있는 해양관광도시', // 부산
  27: '근대문화와 섬유패션의 도시', // 대구
  28: '송도와 월미도가 있는 국제도시', // 인천
  29: '첨단과학과 전통이 어우러진 도시', // 광주
  30: '행정수도이자 미래형 계획도시', // 대전
  31: '자연과 문화가 조화로운 수도권의 중심', // 울산
  36: '세종대왕의 발자취가 남아있는 도시', // 세종
  41: '수려한 자연경관과 휴양지의 천국', // 경기
  43: '바다와 산이 어우러진 충청의 보고', // 충북
  44: '백제문화와 서해안의 아름다움', // 충남
  46: '남도의 멋과 맛이 살아있는 도시', // 전남
  47: '영남알프스와 공업이 발달한 도시', // 경북
  48: '한라산과 푸른 바다의 관광천국', // 경남
  50: '제주의 아름다운 자연과 문화', // 제주
  51: '태백산맥과 동해안이 만나는 관광지', // 강원
  52: '전통문화와 맛있는 음식의 고장', // 전북
}

// 도시 좌표 데이터
const CITY_COORDINATES = {
  36: {
    // 세종
    latitude: 36.4800984,
    longitude: 127.2890354,
  },
}

export default function CustomizedScheduleRegionPage() {
  const navigate = useNavigate()
  const [_searchParams] = useSearchParams()
  const dispatch = useDispatch()
  const { regionCode, regionName } = useSelector(
    (state) => state.customizedSchedule,
  )
  const selectedRegion = regionCode
    ? { id: regionCode, name: regionName }
    : null
  const [viewMode, setViewMode] = useState('google-map') // 'google-map', 'list'
  const [regionImages, setRegionImages] = useState({})
  const [imagesLoading, setImagesLoading] = useState(true)

  // RTK Query를 사용한 지역 데이터 조회
  const {
    data: cities = [],
    isLoading: loading,
    error: regionsError,
  } = useGetActiveRegionsQuery()

  // 에러 메시지 처리
  const error = regionsError ? '지역 목록을 불러오지 못했습니다' : null

  const handleRegionSelect = (code, name) => {
    if (regionCode === code) {
      dispatch(setRegion({ code: null, name: null })) // 이미 선택된 도시를 다시 클릭하면 해제
    } else {
      dispatch(setRegion({ code: code, name: name }))
    }
  }

  // Pixabay API를 사용해 지역별 이미지 로드
  useEffect(() => {
    if (!cities.length) return
    const loadRegionImages = async () => {
      setImagesLoading(true)
      try {
        const regionIds = cities.map((city) => city.region_code)
        const images = await getMultipleRegionImages(regionIds, 3)
        const completeImages = {}
        regionIds.forEach((regionId) => {
          if (images[regionId] && images[regionId].length > 0) {
            completeImages[regionId] = images[regionId]
          } else {
            completeImages[regionId] = getFallbackImages(regionId, 3)
          }
        })
        setRegionImages(completeImages)
      } catch (error) {
        console.error('이미지 로드 실패:', error)
        const fallbackImages = {}
        cities.forEach((city) => {
          fallbackImages[city.region_code] = getFallbackImages(
            city.region_code,
            3,
          )
        })
        setRegionImages(fallbackImages)
      } finally {
        setImagesLoading(false)
      }
    }
    loadRegionImages()
  }, [cities])

  const _getSelectedCityData = () => {
    if (!regionCode) return null
    const cityData = cities.find((city) => city.region_code === regionCode)
    if (cityData) {
      return {
        ...cityData,
        images: regionImages[regionCode] || getFallbackImages(regionCode, 3),
      }
    }
    return null
  }

  const getCityImages = (code) => {
    return regionImages[code] || getFallbackImages(code, 3)
  }

  const handleNext = () => {
    if (regionCode) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      navigate(`/customized-schedule/period?region=${regionCode}`)
    }
  }

  const handleBack = () => {
    navigate('/customized-schedule')
  }

  const cycleViewMode = () => {
    if (viewMode === 'google-map') {
      setViewMode('list')
    } else {
      setViewMode('google-map')
    }
  }

  const getViewModeLabel = () => {
    switch (viewMode) {
      case 'google-map':
        return '실제 지도'
      case 'list':
        return '목록 보기'
      default:
        return '실제 지도'
    }
  }

  const getNextViewModeLabel = () => {
    switch (viewMode) {
      case 'google-map':
        return '목록 보기'
      case 'list':
        return '실제 지도'
      default:
        return '목록 보기'
    }
  }

  // '다음' 버튼을 참조할 ref
  const nextButtonRef = useRef(null)
  // regionCode가 바뀔 때마다 버튼으로 스크롤
  useEffect(() => {
    if (regionCode && nextButtonRef.current) {
      nextButtonRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [regionCode])

  if (loading) return <div>로딩 중...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              1/5
            </span>
          </div>
          {/* 보기 모드 전환 버튼 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              현재: {getViewModeLabel()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={cycleViewMode}
              className="flex items-center gap-2"
            >
              {viewMode === 'google-map' && <MapPin className="h-4 w-4" />}
              {viewMode === 'list' && <List className="h-4 w-4" />}
              {getNextViewModeLabel()}
            </Button>
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          떠나고 싶은 도시는?
        </h1>
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          도시 1곳을 선택해주세요.
        </p>

        {/* regionCode가 있을 때만 상단 중앙에 '다음' 버튼 노출 */}
        {regionCode && <div className="mt-6 flex justify-center"></div>}
      </div>

      {/* 뷰 모드별 컨텐츠 */}
      {viewMode === 'google-map' ? (
        <>
          <GoogleKoreaMap
            cities={cities
              .map((city) => ({
                id: city.region_code,
                name: city.region_name,
                name_full: city.region_name_full,
                name_en: city.region_name_en,
                latitude:
                  Number(city.center_latitude) ||
                  CITY_COORDINATES[city.region_code]?.latitude,
                longitude:
                  Number(city.center_longitude) ||
                  CITY_COORDINATES[city.region_code]?.longitude,
                administrative_code: city.administrative_code,
                is_active: city.is_active,
              }))
              .filter((city) => city.latitude && city.longitude)}
            selectedRegion={selectedRegion}
            onRegionSelect={(id, name) => handleRegionSelect(id, name)}
          />
          {/* '다음' 버튼을 항상 지도/목록 아래에 노출, regionCode 없으면 비활성화 */}
          <div className="mt-6 flex justify-center" ref={nextButtonRef}>
            <Button
              onClick={handleNext}
              className="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700"
              size="lg"
              disabled={!regionCode}
              aria-disabled={!regionCode}
            >
              다음
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-8">
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                <MapPin className="h-5 w-5" />
                대한민국
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cities.map((city) => (
                  <Card
                    key={city.region_code}
                    className={`cursor-pointer overflow-hidden transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 ${
                      regionCode === city.region_code
                        ? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/20 dark:ring-blue-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() =>
                      handleRegionSelect(city.region_code, city.region_name)
                    }
                  >
                    {/* 대표 이미지 */}
                    <div className="relative h-32 overflow-hidden">
                      {imagesLoading ? (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                        </div>
                      ) : (
                        <img
                          src={
                            getCityImages(city.region_code)[0]?.url ||
                            'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop'
                          }
                          alt={`${city.region_name} 대표사진`}
                          className="h-full w-full object-cover transition-transform hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop'
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    <CardContent className="p-4">
                      <div className="mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {city.region_name}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          {REGION_DESCRIPTIONS[city.administrative_code] ||
                            '아름다운 대한민국의 도시'}
                        </p>
                      </div>
                      {regionCode === city.region_code && (
                        <Badge
                          variant="secondary"
                          className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:ring-blue-400"
                        >
                          선택됨
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          {/* '다음' 버튼을 항상 목록 아래에 노출, regionCode 없으면 비활성화 */}
          <div className="mt-6 flex justify-center" ref={nextButtonRef}>
            <Button
              onClick={handleNext}
              className="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700"
              size="lg"
              disabled={!regionCode}
              aria-disabled={!regionCode}
            >
              다음
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
