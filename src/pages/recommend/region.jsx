import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, MapPin, List } from '@/components/icons'
import GoogleKoreaMap from '@/components/GoogleKoreaMap'
import {
  getMultipleRegionImages,
  getFallbackImages,
} from '@/services/pixabayApi'

export default function RecommendRegionPage() {
  const navigate = useNavigate()
  const [_searchParams] = useSearchParams()
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [viewMode, setViewMode] = useState('google-map') // 'google-map', 'list'
  const [regionImages, setRegionImages] = useState({})
  const [imagesLoading, setImagesLoading] = useState(true)
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 백엔드에서 지역 목록 불러오기
  useEffect(() => {
    setLoading(true)
    fetch('/api/local/resions_point')
      .then((res) => res.json())
      .then((data) => {
        setCities(data.regions || [])
        setLoading(false)
      })
      .catch((err) => {
        setError('지역 목록을 불러오지 못했습니다')
        setLoading(false)
      })
  }, [])

  const handleRegionSelect = (regionCode, regionName) => {
    setSelectedRegion({ id: regionCode, name: regionName })
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

  const getSelectedCityData = () => {
    if (!selectedRegion) return null
    const cityData = cities.find(
      (city) => city.region_code === selectedRegion.id,
    )
    if (cityData) {
      return {
        ...cityData,
        images:
          regionImages[selectedRegion.id] ||
          getFallbackImages(selectedRegion.id, 3),
      }
    }
    return null
  }

  const getCityImages = (regionCode) => {
    return regionImages[regionCode] || getFallbackImages(regionCode, 3)
  }

  const handleNext = () => {
    if (selectedRegion) {
      navigate(`/customized-schedule/period?region=${selectedRegion.id}`)
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
        <p className="text-gray-600 dark:text-gray-300">
          도시 1곳을 선택해주세요.
        </p>
      </div>

      {/* 뷰 모드별 컨텐츠 */}
      {viewMode === 'google-map' ? (
        <GoogleKoreaMap
          cities={cities.map((city) => ({
            id: city.region_code,
            name: city.region_name,
            description: city.parent_region_code || '',
            latitude: city.latitude,
            longitude: city.longitude,
          }))}
          selectedRegion={selectedRegion}
          onRegionSelect={(id, name) => handleRegionSelect(id, name)}
        />
      ) : (
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
                    selectedRegion?.id === city.region_code
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
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {city.region_name}
                      </h3>
                      {selectedRegion?.id === city.region_code && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                          <span className="text-xs text-white">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-tight text-gray-600 dark:text-gray-300">
                      {city.parent_region_code || ''}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 선택된 지역 표시 및 이미지 갤러리 */}
      {selectedRegion && (
        <div className="mt-8 space-y-6">
          {/* 선택된 지역 정보 */}
          <div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="mb-2 text-sm text-blue-600 dark:text-blue-400">
                  선택된 여행지
                </p>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                  >
                    {selectedRegion.name}
                  </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {getSelectedCityData()?.parent_region_code || ''}
                  </p>
                </div>
              </div>
              <MapPin className="h-6 w-6 text-blue-500" />
            </div>

            {/* 이미지 갤러리 */}
            {getSelectedCityData()?.images && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  🖼️ {selectedRegion.name} 대표 사진
                </h3>
                {imagesLoading ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((_, index) => (
                      <div
                        key={index}
                        className="flex h-48 w-full items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700"
                      >
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {getSelectedCityData().images.map((image, index) => (
                      <div
                        key={image.id || index}
                        className="group relative overflow-hidden rounded-lg shadow-md transition-transform hover:scale-105"
                      >
                        <img
                          src={image.url || image}
                          alt={`${selectedRegion.name} 대표사진 ${index + 1}`}
                          className="h-48 w-full object-cover transition-transform group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="absolute bottom-2 left-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-800">
                            {image.tags
                              ? `#${image.tags.split(',')[0]}`
                              : `사진 ${index + 1}`}
                          </span>
                        </div>
                        {image.user && (
                          <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <span className="rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                              📷 {image.user}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  💡 이미지는 Pixabay API를 통해 실시간으로 제공됩니다
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 다음 버튼 */}
      <div className="mt-12 flex justify-center">
        <Button
          onClick={handleNext}
          disabled={!selectedRegion}
          className="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600"
          size="lg"
        >
          다음
        </Button>
      </div>
    </div>
  )
}
