import { STORAGE_KEYS } from '@/constants/storage'

const replaceUrl = (url, pathVariables) => {
  return Object.entries(pathVariables).reduce((val = '', [key, value]) => {
    if (!['string', 'number'].includes(typeof value))
      throw new Error(`Invalid Path Variable Value - ${key}: ${value}`)

    return val.replace(`{${key}}`, value)
  }, url)
}

const generateUrl = (fullUrl, params) => {
  const computedUrl = !params?.path ? fullUrl : replaceUrl(fullUrl, params.path)
  const queryString = new URLSearchParams(params?.query ?? {}).toString()

  return queryString ? `${computedUrl}?${queryString}` : computedUrl
}

const createHttp = ({ baseUrl, headers, fetch = globalThis.fetch }) => {
  const request = async (method = 'get', url, options) => {
    const body = method === 'get' ? undefined : options?.body

    // 동적 헤더 계산 (getter 함수 지원)
    const computedHeaders = {}
    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        if (typeof value === 'function') {
          const computedValue = value()
          if (computedValue !== undefined) {
            computedHeaders[key] = computedValue
          }
        } else if (value !== undefined) {
          computedHeaders[key] = value
        }
      }
    }

    const fullUrl = url.startsWith('http')
      ? url
      : `${baseUrl}/${url.replace(/^\//, '')}`

    const response = await fetch(generateUrl(fullUrl, options?.params), {
      method: method.toUpperCase(),
      ...options,
      headers: {
        ...computedHeaders,
        ...(body &&
        !(body instanceof FormData) &&
        !(body instanceof URLSearchParams)
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...options?.headers,
      },
      ...(body && {
        body:
          body instanceof FormData || body instanceof URLSearchParams
            ? body
            : typeof body === 'string'
              ? body
              : JSON.stringify(body),
      }),
    })

    return response
  }

  return {
    request,
    GET: async (url, options) => request('get', url, options),
    POST: async (url, options) => request('post', url, options),
    PUT: async (url, options) => request('put', url, options),
    PATCH: async (url, options) => request('patch', url, options),
    DELETE: async (url, options) => request('delete', url, options),
  }
}

// 기본 설정
const DEFAULT_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
}

// 기본 HTTP 클라이언트
export const http = createHttp(DEFAULT_CONFIG)

// 인증 헤더를 추가하는 함수
const getAuthHeaders = () => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// 인증이 필요한 요청을 위한 헬퍼 함수들
export const authHttp = {
  GET: async (url, options = {}) =>
    http.GET(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
    }),

  POST: async (url, options = {}) =>
    http.POST(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
    }),

  PUT: async (url, options = {}) =>
    http.PUT(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
    }),

  PATCH: async (url, options = {}) =>
    http.PATCH(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
    }),

  DELETE: async (url, options = {}) =>
    http.DELETE(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
    }),

  request: async (method, url, options = {}) =>
    http.request(method, url, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
    }),
}

// 다른 baseUrl 또는 설정이 필요한 경우를 위한 헬퍼
export const createApiClient = (config = {}) =>
  createHttp({ ...DEFAULT_CONFIG, ...config })
