/**
 * API 키 모니터링 및 관리 유틸리티
 * 
 * 주요 기능:
 * - API 키 만료일 추적
 * - 사용량 모니터링  
 * - 자동 알림 시스템
 * - 키 상태 검증
 */

// API 키 정보 구조
const API_KEYS_INFO = {
  // 구글 서비스
  GOOGLE_MAPS: {
    name: 'Google Maps API',
    key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    provider: 'Google',
    services: ['Maps', 'Places', 'Directions', 'Geocoding'],
    dailyLimit: 28000, // 일 할당량
    monthlyLimit: 200000, // 월 할당량
    expiryDate: '2025-12-31', // 예시 만료일
    critical: true, // 핵심 서비스 여부
  },
  
  // 날씨 서비스
  WEATHER_API: {
    name: 'WeatherAPI.com',
    provider: 'WeatherAPI',
    services: ['Current Weather', 'Forecast', 'Historical'],
    dailyLimit: 1000,
    monthlyLimit: 10000,
    expiryDate: '2025-01-19', // 실제 만료일
    critical: true,
    warningDays: 7, // 만료 7일 전 경고
  },
  
  KMA_API: {
    name: '기상청 API',
    provider: '기상청',
    services: ['실황', '예보', '특보'],
    dailyLimit: 1000,
    monthlyLimit: 30000,
    expiryDate: '2025-12-31',
    critical: false,
  },
  
  // 교통 서비스
  TMAP_API: {
    name: 'TMAP API',
    provider: 'SK텔레콤',
    services: ['경로검색', '실시간교통'],
    dailyLimit: 500,
    monthlyLimit: 15000,
    expiryDate: '2025-06-30',
    critical: true,
  },
  
  ODSAY_API: {
    name: 'ODsay API',
    provider: '랩스',
    services: ['대중교통', '지하철', '버스'],
    dailyLimit: 1000,
    monthlyLimit: 30000,
    expiryDate: '2025-09-30',
    critical: true,
  },
  
  // 이미지 서비스
  PIXABAY_API: {
    name: 'Pixabay API',
    key: import.meta.env.VITE_PIXABAY_API_KEY,
    provider: 'Pixabay',
    services: ['이미지 검색'],
    dailyLimit: 5000,
    monthlyLimit: 150000,
    expiryDate: '2025-12-31',
    critical: false,
  }
}

// 로컬 스토리지 키
const STORAGE_KEYS = {
  API_USAGE: 'weather_flick_api_usage',
  API_ALERTS: 'weather_flick_api_alerts',
  LAST_CHECK: 'weather_flick_last_api_check'
}

/**
 * API 사용량 기록
 * @param {string} apiName - API 이름
 * @param {number} calls - 호출 횟수 (기본값: 1)
 * @param {string} endpoint - 호출된 엔드포인트
 */
export const recordApiUsage = (apiName, calls = 1, endpoint = 'unknown') => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const usage = getApiUsage()
    
    if (!usage[apiName]) {
      usage[apiName] = {}
    }
    
    if (!usage[apiName][today]) {
      usage[apiName][today] = {
        total: 0,
        endpoints: {}
      }
    }
    
    usage[apiName][today].total += calls
    usage[apiName][today].endpoints[endpoint] = 
      (usage[apiName][today].endpoints[endpoint] || 0) + calls
    
    localStorage.setItem(STORAGE_KEYS.API_USAGE, JSON.stringify(usage))
    
    // 임계치 체크
    checkUsageLimits(apiName, usage[apiName][today].total)
    
  } catch (error) {
    console.error('API 사용량 기록 실패:', error)
  }
}

/**
 * API 사용량 조회
 * @param {string} apiName - 특정 API 이름 (선택사항)
 * @param {string} date - 특정 날짜 (선택사항, YYYY-MM-DD 형식)
 * @returns {Object} 사용량 데이터
 */
export const getApiUsage = (apiName = null, date = null) => {
  try {
    const usage = JSON.parse(localStorage.getItem(STORAGE_KEYS.API_USAGE) || '{}')
    
    if (apiName && date) {
      return usage[apiName]?.[date] || { total: 0, endpoints: {} }
    }
    
    if (apiName) {
      return usage[apiName] || {}
    }
    
    return usage
  } catch (error) {
    console.error('API 사용량 조회 실패:', error)
    return {}
  }
}

/**
 * 오늘의 API 사용량 조회
 * @param {string} apiName - API 이름
 * @returns {number} 오늘 사용량
 */
export const getTodayUsage = (apiName) => {
  const today = new Date().toISOString().split('T')[0]
  const todayUsage = getApiUsage(apiName, today)
  return todayUsage.total || 0
}

/**
 * 이번 달 API 사용량 조회
 * @param {string} apiName - API 이름
 * @returns {number} 이번 달 총 사용량
 */
export const getMonthlyUsage = (apiName) => {
  const usage = getApiUsage(apiName)
  const currentMonth = new Date().toISOString().substr(0, 7) // YYYY-MM
  
  let monthlyTotal = 0
  Object.keys(usage).forEach(date => {
    if (date.startsWith(currentMonth)) {
      monthlyTotal += usage[date].total || 0
    }
  })
  
  return monthlyTotal
}

/**
 * 사용량 임계치 체크
 * @param {string} apiName - API 이름
 * @param {number} todayUsage - 오늘 사용량
 */
const checkUsageLimits = (apiName, todayUsage) => {
  const apiInfo = API_KEYS_INFO[apiName]
  if (!apiInfo) return
  
  const monthlyUsage = getMonthlyUsage(apiName)
  
  // 일일 한도 체크 (80% 초과시 경고)
  if (todayUsage > apiInfo.dailyLimit * 0.8) {
    showUsageAlert(apiName, 'daily', todayUsage, apiInfo.dailyLimit)
  }
  
  // 월간 한도 체크 (80% 초과시 경고)
  if (monthlyUsage > apiInfo.monthlyLimit * 0.8) {
    showUsageAlert(apiName, 'monthly', monthlyUsage, apiInfo.monthlyLimit)
  }
}

/**
 * 만료 예정 API 키 체크
 * @returns {Array} 만료 예정 키 목록
 */
export const checkExpiringKeys = () => {
  const expiringKeys = []
  const now = new Date()
  
  Object.entries(API_KEYS_INFO).forEach(([key, info]) => {
    if (!info.expiryDate) return
    
    const expiryDate = new Date(info.expiryDate)
    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
    
    const warningDays = info.warningDays || 30
    
    if (daysUntilExpiry <= warningDays && daysUntilExpiry > 0) {
      expiringKeys.push({
        name: info.name,
        provider: info.provider,
        daysUntilExpiry,
        expiryDate: info.expiryDate,
        critical: info.critical,
        services: info.services
      })
    } else if (daysUntilExpiry <= 0) {
      expiringKeys.push({
        name: info.name,
        provider: info.provider,
        daysUntilExpiry,
        expiryDate: info.expiryDate,
        critical: info.critical,
        services: info.services,
        expired: true
      })
    }
  })
  
  return expiringKeys.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
}

/**
 * API 키 상태 종합 리포트
 * @returns {Object} 상태 리포트
 */
export const getApiStatusReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    totalKeys: Object.keys(API_KEYS_INFO).length,
    criticalKeys: 0,
    activeKeys: 0,
    expiringKeys: [],
    highUsageKeys: [],
    usageByService: {}
  }
  
  Object.entries(API_KEYS_INFO).forEach(([key, info]) => {
    if (info.critical) report.criticalKeys++
    
    // 만료 체크
    const expiringKeys = checkExpiringKeys()
    report.expiringKeys = expiringKeys
    
    // 사용량 체크
    const todayUsage = getTodayUsage(key)
    const monthlyUsage = getMonthlyUsage(key)
    
    if (todayUsage > info.dailyLimit * 0.7 || monthlyUsage > info.monthlyLimit * 0.7) {
      report.highUsageKeys.push({
        name: info.name,
        todayUsage,
        dailyLimit: info.dailyLimit,
        monthlyUsage,
        monthlyLimit: info.monthlyLimit,
        dailyPercentage: Math.round((todayUsage / info.dailyLimit) * 100),
        monthlyPercentage: Math.round((monthlyUsage / info.monthlyLimit) * 100)
      })
    }
    
    // 서비스별 사용량
    info.services.forEach(service => {
      if (!report.usageByService[service]) {
        report.usageByService[service] = 0
      }
      report.usageByService[service] += todayUsage
    })
  })
  
  return report
}

/**
 * 사용량 경고 표시
 * @param {string} apiName - API 이름
 * @param {string} type - 'daily' 또는 'monthly'
 * @param {number} usage - 현재 사용량
 * @param {number} limit - 한도
 */
const showUsageAlert = (apiName, type, usage, limit) => {
  const percentage = Math.round((usage / limit) * 100)
  const alertKey = `${apiName}_${type}_${new Date().toISOString().split('T')[0]}`
  
  // 같은 날 같은 API에 대해 이미 알림을 보낸 경우 스킵
  const alerts = JSON.parse(localStorage.getItem(STORAGE_KEYS.API_ALERTS) || '[]')
  if (alerts.includes(alertKey)) return
  
  console.warn(`⚠️ API 사용량 경고: ${API_KEYS_INFO[apiName]?.name}`)
  console.warn(`${type === 'daily' ? '일일' : '월간'} 사용량: ${usage}/${limit} (${percentage}%)`)
  
  // 알림 기록
  alerts.push(alertKey)
  localStorage.setItem(STORAGE_KEYS.API_ALERTS, JSON.stringify(alerts))
  
  // 브라우저 알림 (권한이 있는 경우)
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(`API 사용량 경고`, {
      body: `${API_KEYS_INFO[apiName]?.name} ${type === 'daily' ? '일일' : '월간'} 사용량 ${percentage}% 도달`,
      icon: '/favicon.ico'
    })
  }
}

/**
 * API 키 모니터링 초기화
 * 앱 시작시 한 번 실행하여 만료 예정 키 체크
 */
export const initializeApiMonitoring = () => {
  try {
    const lastCheck = localStorage.getItem(STORAGE_KEYS.LAST_CHECK)
    const today = new Date().toISOString().split('T')[0]
    
    // 하루에 한 번만 체크
    if (lastCheck === today) return
    
    const expiringKeys = checkExpiringKeys()
    
    if (expiringKeys.length > 0) {
      console.warn('⚠️ 만료 예정 API 키가 있습니다:')
      expiringKeys.forEach(key => {
        if (key.expired) {
          console.error(`❌ ${key.name}: 이미 만료됨 (${key.expiryDate})`)
        } else {
          console.warn(`🕐 ${key.name}: ${key.daysUntilExpiry}일 후 만료 (${key.expiryDate})`)
        }
      })
      
      // 크리티컬 키가 만료 예정인 경우 별도 경고
      const criticalExpiring = expiringKeys.filter(key => key.critical)
      if (criticalExpiring.length > 0) {
        console.error('🚨 핵심 서비스 API 키 만료 예정!')
        criticalExpiring.forEach(key => {
          console.error(`  - ${key.name} (${key.services.join(', ')})`)
        })
      }
    }
    
    localStorage.setItem(STORAGE_KEYS.LAST_CHECK, today)
    
  } catch (error) {
    console.error('API 모니터링 초기화 실패:', error)
  }
}

/**
 * 사용량 데이터 내보내기 (CSV 형식)
 * @param {string} apiName - API 이름 (선택사항)
 * @returns {string} CSV 데이터
 */
export const exportUsageData = (apiName = null) => {
  const usage = getApiUsage(apiName)
  let csvData = 'Date,API,Total Calls,Endpoints\n'
  
  if (apiName) {
    Object.entries(usage).forEach(([date, data]) => {
      const endpoints = Object.entries(data.endpoints)
        .map(([endpoint, calls]) => `${endpoint}:${calls}`)
        .join('|')
      csvData += `${date},${apiName},${data.total},"${endpoints}"\n`
    })
  } else {
    Object.entries(usage).forEach(([api, apiData]) => {
      Object.entries(apiData).forEach(([date, data]) => {
        const endpoints = Object.entries(data.endpoints)
          .map(([endpoint, calls]) => `${endpoint}:${calls}`)
          .join('|')
        csvData += `${date},${api},${data.total},"${endpoints}"\n`
      })
    })
  }
  
  return csvData
}

// 개발 모드에서 API 키 정보 확인 (운영환경에서는 제거 필요)
if (import.meta.env.DEV) {
  console.log('🔑 API 키 모니터링 시스템 활성화')
  console.log('등록된 API 키:', Object.keys(API_KEYS_INFO).length, '개')
}