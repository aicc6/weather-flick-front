// 공통 상수들
export const AUTOPLAY_INTERVAL = 3000 // 3초

// 페이지네이션 설정
export const PAGINATION_CONFIG = {
  itemsPerPage: 10,
  maxPagesToShow: 5,
}

// 애니메이션 설정
export const ANIMATION_CONFIG = {
  transitionDuration: 300,
  slideDistance: 100,
}

// 이미지 설정
export const IMAGE_CONFIG = {
  placeholder: '/logo.jpg',
  quality: 80,
  sizes: {
    thumbnail: 200,
    small: 400,
    medium: 800,
    large: 1200,
  },
}

// API 설정
export const API_CONFIG = {
  timeout: 10000, // 10초
  retryAttempts: 3,
}
