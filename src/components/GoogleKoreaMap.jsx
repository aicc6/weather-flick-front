import { useState, useEffect, useRef, useCallback } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { MapPin } from '@/components/icons'

const GoogleKoreaMap = ({ cities, selectedRegion, onRegionSelect }) => {
  const [map, setMap] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hoveredRegion, setHoveredRegion] = useState(null)
  const [error, setError] = useState(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])

  const addCityMarkers = useCallback(
    (google, mapInstance) => {
      console.log('마커 리셋', selectedRegion)
      // 기존 마커 제거 (수정된 로직)
      markersRef.current.forEach(({ marker }) => {
        if (marker) {
          // AdvancedMarkerElement는 remove()로 제거
          if (typeof marker.remove === 'function') {
            marker.remove()
          }
          // 레거시 Marker는 setMap(null)로 제거
          else if (typeof marker.setMap === 'function') {
            marker.setMap(null)
          }
        }
      })
      markersRef.current = [] // 마커 배열 비우기

      // 모든 도시 마커 생성, 선택된 도시만 파란색
      cities.forEach((city) => {
        if (!city.latitude || !city.longitude) return
        const isSelected = selectedRegion?.id === city.id
        const cityName = city.name

        // AdvancedMarkerElement용 HTML 마커 생성
        const createMarkerElement = (color, size = 'normal') => {
          // 도시 이름 축약 로직 개선
          let displayName = cityName
          if (typeof displayName !== 'string') displayName = ''
          if (typeof displayName === 'string' && displayName.includes('·')) {
            // 중점(·)이 있는 경우 첫 번째 부분만 사용
            displayName = displayName.split('·')[0]
          }
          let textSvg = ''
          if (displayName.length <= 4) {
            // 4글자까지는 한 줄 중앙
            textSvg = `<text x="16.65" y="16.65" text-anchor="middle"
              font-family="Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif"
              font-size="8" font-weight="600" fill="#333333" dominant-baseline="middle" alignment-baseline="middle">${displayName}</text>`
          } else {
            // 5글자 이상: 앞 2글자만 중앙에 표시
            const first = displayName.slice(0, 2)
            textSvg = `<text x="16.65" y="16.65" text-anchor="middle"
              font-family="Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif"
              font-size="8" font-weight="600" fill="#333333" dominant-baseline="middle" alignment-baseline="middle">${first}</text>`
          }

          // 마커 크기 2/3로 축소
          const width = size === 'large' ? 40 : size === 'medium' ? 36.7 : 33.3
          const height = size === 'large' ? 48 : size === 'medium' ? 44 : 40

          const markerElement = document.createElement('div')
          markerElement.className = 'custom-marker'
          markerElement.style.cssText = `
            position: relative;
            cursor: pointer;
            transform: translateY(-100%);
            transition: all 0.2s ease;
            ${isSelected ? 'animation: bounce 1s infinite;' : ''}
          `

          markerElement.innerHTML = `
            <svg width="${width}" height="${height}" viewBox="0 0 33.3 40" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="shadow-${city.id}" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="1.33" stdDeviation="1.33" flood-color="rgba(0,0,0,0.3)"/>
                </filter>
              </defs>
              <path d="M16.65 0C7.47 0 0 7.47 0 16.65c0 12.5 16.65 23.33 16.65 23.33s16.65-10.83 16.65-23.33C33.3 7.47 25.83 0 16.65 0z"
                    fill="${color}" filter="url(#shadow-${city.id})"/>
              <circle cx="16.65" cy="16.65" r="10.67" fill="#ffffff"/>
              <circle cx="16.65" cy="16.65" r="8.67" fill="#ffffff"/>
              ${textSvg}
            </svg>
          `

          // bounce 애니메이션 스타일 추가
          if (isSelected && !document.querySelector('#bounce-animation')) {
            const style = document.createElement('style')
            style.id = 'bounce-animation'
            style.textContent = `
              @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(-100%); }
                40% { transform: translateY(-110%); }
                60% { transform: translateY(-105%); }
              }
            `
            document.head.appendChild(style)
          }

          return markerElement
        }

        const markerElement = createMarkerElement(
          isSelected ? '#2563eb' : '#dc2626',
          isSelected ? 'large' : 'normal',
        )

        // Map ID에 따라 마커 타입 결정
        let marker
        if (mapInstance.get('mapId')) {
          marker = new google.maps.marker.AdvancedMarkerElement({
            position: { lat: city.latitude, lng: city.longitude },
            map: mapInstance,
            content: markerElement,
            title: cityName,
          })
        } else {
          const svgIcon = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerElement.innerHTML)}`
          marker = new google.maps.Marker({
            position: { lat: city.latitude, lng: city.longitude },
            map: mapInstance,
            icon: {
              url: svgIcon,
              scaledSize: new google.maps.Size(
                isSelected ? 60 : 50,
                isSelected ? 72 : 60,
              ),
              anchor: new google.maps.Point(
                isSelected ? 30 : 25,
                isSelected ? 72 : 60,
              ),
            },
            title: cityName,
          })
        }

        // 마커 클릭 이벤트
        marker.addListener('click', () => {
          onRegionSelect(city.id, city.name)
        })

        // 마커 호버 이벤트 (AdvancedMarkerElement용)
        markerElement.addEventListener('mouseenter', () => {
          setHoveredRegion(city.id)
          // 호버 시 마커 업데이트
          const hoverElement = createMarkerElement(
            isSelected ? '#2563eb' : '#3b82f6',
            isSelected ? 'large' : 'medium',
          )
          marker.content = hoverElement

          // 새로운 요소에도 이벤트 리스너 추가
          hoverElement.addEventListener('mouseleave', () => {
            setHoveredRegion(null)
            const normalElement = createMarkerElement(
              isSelected ? '#2563eb' : '#dc2626',
              isSelected ? 'large' : 'normal',
            )
            marker.content = normalElement
          })
        })

        markersRef.current.push({ marker })
      })
    },
    [cities, selectedRegion, onRegionSelect],
  )

  // 지도 초기화 (최초 한 번만 실행)
  useEffect(() => {
    const initMap = async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'
      if (
        !apiKey ||
        apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE' ||
        apiKey === 'YOUR_API_KEY_HERE'
      ) {
        const errorMsg =
          'Google Maps API 키가 설정되지 않았습니다. .env 파일에 VITE_GOOGLE_MAPS_API_KEY를 설정해주세요.'
        setError(errorMsg)
        return
      }
      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places', 'marker'],
      })
      try {
        const google = await loader.load()
        const mapConfig = {
          center: { lat: 36.5, lng: 127.5 },
          zoom: 7,
          restriction: {
            latLngBounds: {
              north: 38.9,
              south: 33.0,
              west: 124.5,
              east: 132.0,
            },
            strictBounds: false,
          },
          mapTypeId: 'roadmap',
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
        }
        if (mapId && mapId !== 'DEMO_MAP_ID') {
          mapConfig.mapId = mapId
        } else {
          mapConfig.styles = [
            {
              featureType: 'all',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#444444' }],
            },
            {
              featureType: 'landscape',
              elementType: 'all',
              stylers: [{ color: '#f2f2f2' }],
            },
            {
              featureType: 'poi',
              elementType: 'all',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'road',
              elementType: 'all',
              stylers: [{ saturation: -100 }, { lightness: 45 }],
            },
            {
              featureType: 'road.highway',
              elementType: 'all',
              stylers: [{ visibility: 'simplified' }],
            },
            {
              featureType: 'water',
              elementType: 'all',
              stylers: [{ color: '#46bcec' }, { visibility: 'on' }],
            },
          ]
        }
        const mapInstance = new google.maps.Map(mapRef.current, mapConfig)
        setMap(mapInstance)
        setIsLoaded(true)
        setError(null)
      } catch {
        setError('Google Maps를 로드할 수 없습니다.')
      }
    }
    initMap()
  }, [])

  // 마커 업데이트 (지도 로드 완료 및 선택 지역 변경 시 실행)
  useEffect(() => {
    if (map && isLoaded) {
      const google = window.google
      addCityMarkers(google, map)
    }
  }, [map, isLoaded, addCityMarkers])

  return (
    <div className="mx-auto w-full max-w-7xl p-4">
      <div className="relative overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
          <h3 className="text-center text-2xl font-bold text-gray-800 dark:text-white">
            대한민국 지도에서 도시를 선택하세요
          </h3>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
            지도를 움직이거나 확대/축소할 수 있습니다. 빨간 마커를 클릭해서
            도시를 선택하세요.
          </p>
        </div>

        <div className="relative">
          {/* Google Maps 컨테이너 */}
          <div
            ref={mapRef}
            className="h-[600px] w-full"
            style={{ minHeight: '600px' }}
          />

          {/* 에러 상태 */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20">
              <div className="max-w-md rounded-lg border border-red-200 bg-white p-6 text-center shadow-lg dark:border-red-700 dark:bg-gray-800">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                  <svg
                    className="h-6 w-6 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-200">
                  지도를 불러올 수 없습니다
                </h3>
                <p className="mb-4 text-sm text-red-600 dark:text-red-300">
                  {error}
                </p>
                <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    💡 <strong>해결 방법:</strong>
                    <br />
                    1. 프로젝트 루트에 <code>.env</code> 파일 생성
                    <br />
                    2. <code>VITE_GOOGLE_MAPS_API_KEY=발급받은_키</code> 추가
                    <br />
                    3. 자세한 설정은 <code>GOOGLE_MAPS_SETUP.md</code> 참고
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 로딩 상태 */}
          {!isLoaded && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  지도를 불러오는 중...
                </p>
              </div>
            </div>
          )}

          {/* 범례 - 지도가 로드된 경우에만 표시 */}
          {isLoaded && !error && (
            <div className="absolute bottom-4 left-4 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-600 dark:bg-gray-800">
              <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                도시 선택 안내
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <svg
                      width="25"
                      height="30"
                      viewBox="0 0 50 60"
                      className="text-red-600"
                    >
                      <path
                        d="M25 0C11.2 0 0 11.2 0 25c0 18.75 25 35 25 35s25-16.25 25-35C50 11.2 38.8 0 25 0z"
                        fill="#dc2626"
                      />
                      <circle cx="25" cy="25" r="16" fill="#ffffff" />
                      <circle cx="25" cy="25" r="13" fill="#ffffff" />
                      <text
                        x="25"
                        y="30"
                        textAnchor="middle"
                        fontFamily="Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif"
                        fontSize="12"
                        fontWeight="600"
                        fill="#333333"
                      >
                        도시
                      </text>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    선택 가능한 도시
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <svg
                      width="25"
                      height="30"
                      viewBox="0 0 50 60"
                      className="text-blue-600"
                    >
                      <path
                        d="M25 0C11.2 0 0 11.2 0 25c0 18.75 25 35 25 35s25-16.25 25-35C50 11.2 38.8 0 25 0z"
                        fill="#2563eb"
                      />
                      <circle cx="25" cy="25" r="16" fill="#ffffff" />
                      <circle cx="25" cy="25" r="13" fill="#ffffff" />
                      <text
                        x="25"
                        y="30"
                        textAnchor="middle"
                        fontFamily="Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif"
                        fontSize="12"
                        fontWeight="600"
                        fill="#333333"
                      >
                        선택
                      </text>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    선택된 도시
                  </span>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                💡 마커를 클릭하면 상세 정보를 볼 수 있습니다
              </p>
            </div>
          )}

          {/* 지도 컨트롤 안내 - 지도가 로드된 경우에만 표시 */}
          {isLoaded && !error && (
            <div className="absolute top-4 right-4 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-600 dark:bg-gray-800">
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <p>🖱️ 드래그: 지도 이동</p>
                <p>🔍 휠: 확대/축소</p>
                <p>📍 마커: 도시 선택</p>
              </div>
            </div>
          )}
        </div>

        {/* 호버된 도시 정보 - 지도가 로드된 경우에만 표시 */}
        {hoveredRegion && isLoaded && !error && (
          <div className="border-t border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-800 dark:text-blue-200">
                {cities.find((city) => city.id === hoveredRegion)?.name}
              </span>
            </div>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              {cities.find((city) => city.id === hoveredRegion)?.description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default GoogleKoreaMap
