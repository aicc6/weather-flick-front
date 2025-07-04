import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { MapPin } from '@/components/icons'

const GoogleKoreaMap = ({ cities, selectedRegion, onRegionSelect }) => {
  const [map, setMap] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hoveredRegion, setHoveredRegion] = useState(null)
  const [error, setError] = useState(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])

  // 각 도시의 정확한 좌표 (위도, 경도)
  const cityCoordinates = useMemo(
    () => ({
      seoul: { lat: 37.5665, lng: 126.978, name: '서울' },
      busan: { lat: 35.1796, lng: 129.0756, name: '부산' },
      jeju: { lat: 33.4996, lng: 126.5312, name: '제주' },
      gangneung: { lat: 37.7519, lng: 128.8761, name: '강릉·속초' },
      gyeongju: { lat: 35.8562, lng: 129.2247, name: '경주' },
      jeonju: { lat: 35.8242, lng: 127.1479, name: '전주' },
      yeosu: { lat: 34.7604, lng: 127.6622, name: '여수' },
      incheon: { lat: 37.4563, lng: 126.7052, name: '인천' },
      taean: { lat: 36.7455, lng: 126.2983, name: '태안' },
      pohang: { lat: 36.019, lng: 129.3435, name: '포항·안동' },
      gapyeong: { lat: 37.8314, lng: 127.5109, name: '가평·양평' },
      tongyeong: { lat: 34.8543, lng: 128.4331, name: '통영·거제·남해' },
      daegu: { lat: 35.8714, lng: 128.6014, name: '대구' },
      gwangju: { lat: 35.1595, lng: 126.8526, name: '광주' },
      daejeon: { lat: 36.3504, lng: 127.3845, name: '대전' },
      ulsan: { lat: 35.5384, lng: 129.3114, name: '울산' },
      chuncheon: { lat: 37.8813, lng: 127.7298, name: '춘천' },
      mokpo: { lat: 34.8118, lng: 126.3922, name: '목포' },
      sokcho: { lat: 38.207, lng: 128.5918, name: '속초' },
      andong: { lat: 36.5684, lng: 128.7294, name: '안동' },
    }),
    [],
  )

  useEffect(() => {
    const initMap = async () => {
      // API 키 확인
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

      if (
        !apiKey ||
        apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE' ||
        apiKey === 'YOUR_API_KEY_HERE'
      ) {
        const errorMsg =
          'Google Maps API 키가 설정되지 않았습니다. .env 파일에 VITE_GOOGLE_MAPS_API_KEY를 설정해주세요.'
        console.error(errorMsg)
        console.log('설정 방법:')
        console.log('1. 프로젝트 루트에 .env 파일 생성')
        console.log('2. VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here 추가')
        console.log(
          '3. Google Cloud Console에서 Maps JavaScript API 활성화 및 API 키 발급',
        )
        console.log(
          '4. 자세한 설정 방법은 GOOGLE_MAPS_SETUP.md 파일을 참고하세요.',
        )
        setError(errorMsg)
        return
      }

      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places'],
      })

      try {
        const google = await loader.load()

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 36.5, lng: 127.5 }, // 한국 중심부
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
          styles: [
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
          ],
        })

        setMap(mapInstance)
        setIsLoaded(true)
        setError(null)

        // 도시 마커 추가
        addCityMarkers(google, mapInstance)
      } catch (error) {
        console.error('Google Maps 로딩 실패:', error)
        let errorMessage = 'Google Maps를 로드할 수 없습니다.'

        if (error.message.includes('InvalidKey')) {
          errorMessage =
            'Google Maps API 키가 유효하지 않습니다. API 키를 확인해주세요.'
        } else if (error.message.includes('RefererNotAllowedMapError')) {
          errorMessage =
            'API 키의 도메인 제한 설정을 확인해주세요. localhost:5173이 허용되어야 합니다.'
        }

        setError(errorMessage)
      }
    }

    initMap()
  }, [addCityMarkers])

  const addCityMarkers = useCallback(
    (google, mapInstance) => {
      // 기존 마커 제거
      markersRef.current.forEach(({ marker }) => {
        if (marker && marker.setMap) {
          marker.setMap(null)
        }
      })
      markersRef.current = []

      cities.forEach((city) => {
        const coords = cityCoordinates[city.id]
        if (!coords) return

        const isSelected = selectedRegion?.id === city.id
        const cityName = coords.name

        // 지도 핀 모양의 SVG 마커 생성
        const createPinIcon = (color, _textColor = '#ffffff') => {
          // 도시 이름 축약 로직 개선
          let displayName = cityName
          if (cityName.includes('·')) {
            // 중점(·)이 있는 경우 첫 번째 부분만 사용
            displayName = cityName.split('·')[0]
          }
          if (displayName.length > 3) {
            displayName = displayName.substring(0, 3)
          }

          const svg = `
          <svg width="50" height="60" viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
              </filter>
            </defs>
            <!-- 핀 모양 -->
            <path d="M25 0C11.2 0 0 11.2 0 25c0 18.75 25 35 25 35s25-16.25 25-35C50 11.2 38.8 0 25 0z" fill="${color}" filter="url(#shadow)"/>
            <!-- 내부 원 -->
            <circle cx="25" cy="25" r="16" fill="#ffffff"/>
            <!-- 텍스트 배경 -->
            <circle cx="25" cy="25" r="13" fill="#ffffff"/>
            <!-- 텍스트 -->
            <text x="25" y="30" text-anchor="middle" font-family="Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif" font-size="12" font-weight="600" fill="#333333">
              ${displayName}
            </text>
          </svg>
        `
          return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)
        }

        // 마커 아이콘 설정
        const markerIcon = {
          url: createPinIcon(isSelected ? '#2563eb' : '#dc2626', '#ffffff'),
          scaledSize: new google.maps.Size(
            isSelected ? 60 : 50,
            isSelected ? 72 : 60,
          ),
          anchor: new google.maps.Point(
            isSelected ? 30 : 25,
            isSelected ? 72 : 60,
          ),
        }

        const marker = new google.maps.Marker({
          position: { lat: coords.lat, lng: coords.lng },
          map: mapInstance,
          icon: markerIcon,
          title: coords.name,
          animation: isSelected ? google.maps.Animation.BOUNCE : null,
        })

        // 마커 클릭 이벤트
        marker.addListener('click', () => {
          onRegionSelect(city.id, coords.name)
        })

        // 마커 호버 이벤트
        marker.addListener('mouseover', () => {
          setHoveredRegion(city.id)
          const hoverIcon = {
            url: createPinIcon(isSelected ? '#2563eb' : '#3b82f6', '#ffffff'),
            scaledSize: new google.maps.Size(
              isSelected ? 60 : 55,
              isSelected ? 72 : 66,
            ),
            anchor: new google.maps.Point(
              isSelected ? 30 : 27.5,
              isSelected ? 72 : 66,
            ),
          }
          marker.setIcon(hoverIcon)
        })

        marker.addListener('mouseout', () => {
          setHoveredRegion(null)
          marker.setIcon(markerIcon)
        })

        // InfoWindow 생성
        const infoWindow = new google.maps.InfoWindow({
          content: `
          <div style="padding: 8px; font-family: 'Pretendard', sans-serif;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1f2937;">${coords.name}</h3>
            <p style="margin: 0; font-size: 12px; color: #6b7280;">${city.description}</p>
          </div>
        `,
        })

        // 마커 클릭시 InfoWindow 표시
        marker.addListener('click', () => {
          // 다른 InfoWindow 닫기
          markersRef.current.forEach(({ infoWindow: iw }) => {
            if (iw && iw.close) {
              iw.close()
            }
          })
          infoWindow.open(mapInstance, marker)
        })

        markersRef.current.push({ marker, infoWindow })
      })
    },
    [cities, selectedRegion, onRegionSelect, cityCoordinates],
  )

  // 선택된 지역이 변경될 때 마커 업데이트
  useEffect(() => {
    if (map && isLoaded) {
      const google = window.google
      addCityMarkers(google, map)
    }
  }, [selectedRegion, cities, map, isLoaded, addCityMarkers])

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
