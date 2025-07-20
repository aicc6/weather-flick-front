/**
 * 교통 정보 캐싱 및 배치 처리 유틸리티
 */

// 캐시 저장소
const routeCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5분

// 배치 요청 큐
let batchQueue = []
let batchTimer = null
const BATCH_DELAY = 300 // 300ms 디바운싱
const BATCH_SIZE = 10

// 캐시 키 생성
export const generateCacheKey = (departure_lat, departure_lng, destination_lat, destination_lng) => {
  return `${departure_lat},${departure_lng}-${destination_lat},${destination_lng}`
}

// 캐시 확인
export const getCachedRoute = (departure_lat, departure_lng, destination_lat, destination_lng) => {
  const key = generateCacheKey(departure_lat, departure_lng, destination_lat, destination_lng)
  const cached = routeCache.get(key)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  
  // 만료된 캐시 제거
  if (cached) {
    routeCache.delete(key)
  }
  
  return null
}

// 캐시 저장
export const setCachedRoute = (departure_lat, departure_lng, destination_lat, destination_lng, data) => {
  const key = generateCacheKey(departure_lat, departure_lng, destination_lat, destination_lng)
  routeCache.set(key, {
    data,
    timestamp: Date.now()
  })
}

// 배치 요청 처리 함수
const processBatchRequests = async () => {
  if (batchQueue.length === 0) return
  
  // 현재 큐의 요청들을 복사하고 큐 초기화
  const currentBatch = [...batchQueue]
  batchQueue = []
  
  // 중복 제거 (동일한 경로 요청)
  const uniqueRequests = new Map()
  const callbackMap = new Map()
  
  currentBatch.forEach(({ request, resolve, reject, token }) => {
    const key = generateCacheKey(
      request.departure_lat,
      request.departure_lng,
      request.destination_lat,
      request.destination_lng
    )
    
    if (!uniqueRequests.has(key)) {
      uniqueRequests.set(key, { request, token })
      callbackMap.set(key, [])
    }
    
    callbackMap.get(key).push({ resolve, reject })
  })
  
  // 배치 크기별로 나누어 처리
  const requestsArray = Array.from(uniqueRequests.values())
  const batches = []
  
  for (let i = 0; i < requestsArray.length; i += BATCH_SIZE) {
    batches.push(requestsArray.slice(i, i + BATCH_SIZE))
  }
  
  // 각 배치 처리
  for (const batch of batches) {
    try {
      const response = await fetch('http://localhost:8000/api/routes/enhanced-multi-route/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${batch[0].token}`,
        },
        body: JSON.stringify({
          routes: batch.map(item => item.request),
          include_timemachine: true,
          departure_time: null,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success && result.results) {
        // 각 결과를 해당하는 콜백에 전달
        result.results.forEach((routeResult) => {
          if (routeResult.success) {
            const key = generateCacheKey(
              routeResult.route_request.departure_lat,
              routeResult.route_request.departure_lng,
              routeResult.route_request.destination_lat,
              routeResult.route_request.destination_lng
            )
            
            // 캐시에 저장
            setCachedRoute(
              routeResult.route_request.departure_lat,
              routeResult.route_request.departure_lng,
              routeResult.route_request.destination_lat,
              routeResult.route_request.destination_lng,
              routeResult
            )
            
            // 콜백 실행
            const callbacks = callbackMap.get(key)
            if (callbacks) {
              callbacks.forEach(({ resolve }) => resolve(routeResult))
            }
          } else {
            // 실패한 경우
            const key = generateCacheKey(
              routeResult.route_request.departure_lat,
              routeResult.route_request.departure_lng,
              routeResult.route_request.destination_lat,
              routeResult.route_request.destination_lng
            )
            
            const callbacks = callbackMap.get(key)
            if (callbacks) {
              callbacks.forEach(({ reject }) => reject(new Error(routeResult.error || '경로 계산 실패')))
            }
          }
        })
      } else {
        // 전체 배치 실패
        batch.forEach(item => {
          const key = generateCacheKey(
            item.request.departure_lat,
            item.request.departure_lng,
            item.request.destination_lat,
            item.request.destination_lng
          )
          
          const callbacks = callbackMap.get(key)
          if (callbacks) {
            callbacks.forEach(({ reject }) => reject(new Error('배치 처리 실패')))
          }
        })
      }
    } catch (error) {
      // 네트워크 오류 등
      batch.forEach(item => {
        const key = generateCacheKey(
          item.request.departure_lat,
          item.request.departure_lng,
          item.request.destination_lat,
          item.request.destination_lng
        )
        
        const callbacks = callbackMap.get(key)
        if (callbacks) {
          callbacks.forEach(({ reject }) => reject(error))
        }
      })
    }
  }
}

// 배치 요청에 추가
export const addToBatchQueue = (request, token) => {
  return new Promise((resolve, reject) => {
    // 먼저 캐시 확인
    const cached = getCachedRoute(
      request.departure_lat,
      request.departure_lng,
      request.destination_lat,
      request.destination_lng
    )
    
    if (cached) {
      resolve(cached)
      return
    }
    
    // 배치 큐에 추가
    batchQueue.push({ request, resolve, reject, token })
    
    // 타이머 재설정
    if (batchTimer) {
      clearTimeout(batchTimer)
    }
    
    // 일정 시간 후 배치 처리 실행
    batchTimer = setTimeout(() => {
      processBatchRequests()
    }, BATCH_DELAY)
  })
}

// 캐시 클리어 (필요시 사용)
export const clearTransportCache = () => {
  routeCache.clear()
}

// 캐시 통계 (디버깅용)
export const getCacheStats = () => {
  return {
    size: routeCache.size,
    entries: Array.from(routeCache.entries()).map(([key, value]) => ({
      key,
      age: Date.now() - value.timestamp,
      expired: Date.now() - value.timestamp > CACHE_DURATION
    }))
  }
}