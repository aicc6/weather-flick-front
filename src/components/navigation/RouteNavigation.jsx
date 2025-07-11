import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import NavigationButton from './NavigationButton'
import { Route, MapPin, Clock, Navigation, Zap } from '@/components/icons'

/**
 * 일정별 경로 내비게이션 컴포넌트
 * 전체 경로를 순서대로 연결하는 기능 제공
 */
export function RouteNavigation({ itinerary, startLocation = null, className = '' }) {
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false)

  if (!itinerary || Object.keys(itinerary).length === 0) {
    return null
  }

  // 다양한 위치 정보 필드명을 처리하는 헬퍼 함수
  const getLocationFromPlace = (place) => {
    // 가능한 위치 정보 필드들을 확인
    const lat = place.lat || place.latitude || place.y || place.coords?.lat || place.location?.lat || place.geometry?.location?.lat
    const lng = place.lng || place.longitude || place.x || place.coords?.lng || place.location?.lng || place.geometry?.location?.lng
    
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      return { lat: Number(lat), lng: Number(lng) }
    }
    
    return null
  }

  // 전체 경로 내비게이션 URL 생성
  const generateMultiStopRoute = (destinations, service = 'google') => {
    if (!destinations || destinations.length < 2) return null

    try {
      if (service === 'google') {
        // Google Maps - 다중 경유지 지원
        const start = destinations[0]
        const end = destinations[destinations.length - 1]
        const waypoints = destinations.slice(1, -1)
        
        let url = `https://www.google.com/maps/dir/?api=1`
        url += `&origin=${start.lat},${start.lng}`
        url += `&destination=${end.lat},${end.lng}`
        
        if (waypoints.length > 0) {
          const waypointStr = waypoints.map(wp => `${wp.lat},${wp.lng}`).join('|')
          url += `&waypoints=${waypointStr}`
        }
        
        return url
      } else if (service === 'kakao') {
        // 카카오맵 - 첫 번째 목적지로만 이동 (다중 경유지 미지원)
        const firstDest = destinations[0]
        return `https://map.kakao.com/link/to/${encodeURIComponent(firstDest.description || firstDest.name)},${firstDest.lat},${firstDest.lng}`
      }
    } catch (error) {
      console.error('다중 경로 URL 생성 실패:', error)
      return null
    }
    
    return null
  }

  // 일차별 경로 생성
  const openDayRoute = async (dayPlaces) => {
    setIsGeneratingRoute(true)
    
    try {
      // 유효한 좌표를 가진 장소만 필터링
      const validPlaces = dayPlaces.map(place => {
        const location = getLocationFromPlace(place)
        return location ? { ...place, ...location } : null
      }).filter(Boolean)
      
      if (validPlaces.length === 0) {
        // 좌표는 없지만 place_id나 description이 있는 장소들을 확인
        const searchablePlaces = dayPlaces.filter(place => place.place_id || place.description)
        
        if (searchablePlaces.length > 0) {
          // place_id나 description으로 길찾기 실행
          const firstPlace = searchablePlaces[0]
          const searchQuery = encodeURIComponent(firstPlace.description || firstPlace.name || '')
          const navigationUrl = firstPlace.place_id 
            ? `https://www.google.com/maps/dir/?api=1&destination_place_id=${firstPlace.place_id}`
            : `https://www.google.com/maps/dir/?api=1&destination=${searchQuery}`
          
          window.open(navigationUrl, '_blank', 'noopener,noreferrer')
          return
        }
        
        alert('해당 일차에는 길찾기 가능한 장소가 없습니다.')
        return
      }
      
      if (validPlaces.length === 1) {
        // 단일 목적지인 경우 개별 길찾기
        const place = validPlaces[0]
        const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`
        window.open(url, '_blank', 'noopener,noreferrer')
        return
      }
      
      // 다중 경유지 경로 생성
      const routeUrl = generateMultiStopRoute(validPlaces, 'google')
      
      if (routeUrl) {
        window.open(routeUrl, '_blank', 'noopener,noreferrer')
      } else {
        // 실패 시 첫 번째 장소로 이동
        const firstPlace = validPlaces[0]
        const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${firstPlace.lat},${firstPlace.lng}`
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer')
      }
      
    } catch (error) {
      console.error('경로 생성 실패:', error)
      alert('경로 생성에 실패했습니다. 개별 장소의 길찾기를 이용해 주세요.')
    } finally {
      setIsGeneratingRoute(false)
    }
  }

  // 전체 여행 경로 생성 (모든 일차 통합)
  const openFullTripRoute = async () => {
    setIsGeneratingRoute(true)
    
    try {
      // 모든 일차의 장소를 순서대로 수집
      const allPlaces = []
      const days = Object.keys(itinerary).sort()
      
      days.forEach(day => {
        const dayPlaces = itinerary[day] || []
        dayPlaces.forEach(place => {
          const location = getLocationFromPlace(place)
          if (location) {
            allPlaces.push({
              ...place,
              ...location,
              day: day
            })
          }
        })
      })
      
      if (allPlaces.length === 0) {
        // 좌표는 없지만 place_id나 description이 있는 장소들을 확인
        const allSearchablePlaces = []
        days.forEach(day => {
          const dayPlaces = itinerary[day] || []
          dayPlaces.forEach(place => {
            if (place.place_id || place.description) {
              allSearchablePlaces.push(place)
            }
          })
        })
        
        if (allSearchablePlaces.length > 0) {
          // place_id나 description으로 길찾기 실행
          const firstPlace = allSearchablePlaces[0]
          const searchQuery = encodeURIComponent(firstPlace.description || firstPlace.name || '')
          const navigationUrl = firstPlace.place_id 
            ? `https://www.google.com/maps/dir/?api=1&destination_place_id=${firstPlace.place_id}`
            : `https://www.google.com/maps/dir/?api=1&destination=${searchQuery}`
          
          window.open(navigationUrl, '_blank', 'noopener,noreferrer')
          return
        }
        
        alert('길찾기 가능한 장소가 없습니다.')
        return
      }
      
      if (allPlaces.length === 1) {
        const place = allPlaces[0]
        const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`
        window.open(url, '_blank', 'noopener,noreferrer')
        return
      }
      
      // Google Maps는 최대 9개의 경유지만 지원하므로 주요 장소만 선택
      const selectedPlaces = allPlaces.length > 10 
        ? allPlaces.filter((_, index) => index % Math.ceil(allPlaces.length / 10) === 0).slice(0, 10)
        : allPlaces
      
      const routeUrl = generateMultiStopRoute(selectedPlaces, 'google')
      
      if (routeUrl) {
        window.open(routeUrl, '_blank', 'noopener,noreferrer')
      } else {
        // 실패 시 첫 번째 장소로 이동
        const firstPlace = allPlaces[0]
        const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${firstPlace.lat},${firstPlace.lng}`
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer')
      }
      
    } catch (error) {
      console.error('전체 경로 생성 실패:', error)
      alert('전체 경로 생성에 실패했습니다. 일차별 경로를 이용해 주세요.')
    } finally {
      setIsGeneratingRoute(false)
    }
  }

  const days = Object.keys(itinerary).sort()

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5 text-blue-600" />
            경로별 내비게이션
          </CardTitle>
          
          {/* 전체 여행 경로 버튼 */}
          <Button
            onClick={openFullTripRoute}
            disabled={isGeneratingRoute}
            variant="outline"
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700"
          >
            {isGeneratingRoute ? (
              <>
                <Zap className="mr-1 h-3 w-3 animate-spin" />
                생성중...
              </>
            ) : (
              <>
                <Navigation className="mr-1 h-3 w-3" />
                전체 경로
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-800">
            💡 <strong>사용 가이드</strong>
          </div>
          <ul className="text-xs text-blue-700 mt-1 space-y-1">
            <li>• <strong>개별 길찾기</strong>: 각 장소별로 최적 경로 제공</li>
            <li>• <strong>일차별 경로</strong>: 해당 일차의 모든 장소를 순서대로 연결</li>
            <li>• <strong>전체 경로</strong>: 전 일정을 하나의 경로로 생성 (최대 10곳)</li>
          </ul>
        </div>
        
        {/* 일차별 경로 정보 */}
        {days.map((day) => {
          const dayPlaces = itinerary[day] || []
          const validPlaces = dayPlaces.map(place => {
            const location = getLocationFromPlace(place)
            return location ? { ...place, ...location } : null
          }).filter(Boolean)
          const dayNumber = parseInt(day.replace(/\D/g, ''))
          
          return (
            <div key={day} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  {dayNumber}일차
                  <Badge variant="secondary" className="text-xs">
                    {validPlaces.length}개 장소
                  </Badge>
                </h3>
                
                {/* 일차별 전체 경로 버튼 */}
                {validPlaces.length > 1 && (
                  <Button
                    onClick={() => openDayRoute(validPlaces)}
                    disabled={isGeneratingRoute}
                    variant="outline"
                    size="sm"
                    className="bg-green-500 text-white border-0 hover:bg-green-600"
                  >
                    <Route className="mr-1 h-3 w-3" />
                    일차 전체 경로
                  </Button>
                )}
              </div>
              
              {/* 장소 목록 */}
              <div className="space-y-2">
                {dayPlaces.map((place, index) => (
                  <div key={index} className="flex items-center justify-between bg-white rounded p-3 border">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {place.description || place.name || '이름 없음'}
                        </div>
                        {place.address && (
                          <div className="text-sm text-gray-500 truncate">
                            {place.address}
                          </div>
                        )}
                        {!getLocationFromPlace(place) && (
                          <div className="text-xs text-red-500 mt-1">
                            ⚠️ 위치 정보 없음
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 개별 장소 길찾기 버튼 */}
                    <div className="ml-3">
                      {(() => {
                        const location = getLocationFromPlace(place)
                        if (location) {
                          return (
                            <NavigationButton
                              destination={{
                                name: place.description || place.name,
                                lat: location.lat,
                                lng: location.lng,
                                address: place.address
                              }}
                              showTransportOptions={false}
                              className="text-xs"
                            />
                          )
                        } else if (place.place_id || place.description) {
                          // place_id나 description이 있는 경우 실제 길찾기로 연결
                          const searchQuery = encodeURIComponent(place.description || place.name || '')
                          const navigationUrl = place.place_id 
                            ? `https://www.google.com/maps/dir/?api=1&origin=current+location&destination_place_id=${place.place_id}`
                            : `https://www.google.com/maps/dir/?api=1&origin=current+location&destination=${searchQuery}`
                          
                          return (
                            <button
                              onClick={() => window.open(navigationUrl, '_blank', 'noopener,noreferrer')}
                              className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded transition-colors"
                            >
                              🧭 길찾기
                            </button>
                          )
                        } else {
                          return (
                            <Badge variant="outline" className="text-xs text-gray-400">
                              위치 정보 없음
                            </Badge>
                          )
                        }
                      })()}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 일차별 요약 정보 */}
              {validPlaces.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>총 {validPlaces.length}개 장소</span>
                    {validPlaces.length > 1 && (
                      <span className="text-blue-600">
                        ➡️ 순서대로 연결된 경로 제공
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        
        {/* 하단 추가 정보 */}
        <div className="bg-gray-50 border rounded-lg p-3">
          <div className="text-sm text-gray-700">
            <div className="font-medium mb-1">📋 경로 생성 정보</div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Google Maps를 통한 최적 경로 계산</li>
              <li>• 실시간 교통정보 반영</li>
              <li>• 최대 10개 경유지까지 지원</li>
              <li>• 모바일에서는 Google Maps 앱 자동 실행</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RouteNavigation