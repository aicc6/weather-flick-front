// 추천 여행지 데이터
export const recommendedDestinations = [
  {
    id: 1,
    name: '제주도',
    weather: '맑음',
    temperature: 26,
    icon: '⛱',
    description: '한라산과 해변의 완벽한 조화',
  },
  {
    id: 2,
    name: '가평',
    weather: '흐림',
    temperature: 24,
    icon: '⛺',
    description: '자연 속 힐링 캠핑',
  },
  {
    id: 3,
    name: '해운대',
    weather: '맑음',
    temperature: 28,
    icon: '🌊',
    description: '아름다운 해변과 맛있는 해산물',
  },
  {
    id: 4,
    name: '남이섬',
    weather: '비',
    temperature: 22,
    icon: '🏕',
    description: '로맨틱한 섬 여행',
  },
  {
    id: 5,
    name: '부산',
    weather: '맑음',
    temperature: 27,
    icon: '🏖',
    description: '도시와 바다의 만남',
  },
]

// 추천 페이지 여행지 목록
export const mockDestinations = [
  {
    id: 1,
    name: '제주도',
    description: '아름다운 해변과 자연 경관',
    image: '/logo.jpg',
  },
  {
    id: 2,
    name: '부산',
    description: '활기찬 해운대와 맛집',
    image: '/logo.jpg',
  },
  {
    id: 3,
    name: '강릉',
    description: '커피와 바다, 힐링 여행지',
    image: '/logo.jpg',
  },
  {
    id: 4,
    name: '경주',
    description: '역사와 문화의 도시',
    image: '/logo.jpg',
  },
  {
    id: 5,
    name: '여수',
    description: '야경과 해산물의 천국',
    image: '/logo.jpg',
  },
]

// 여행 테마 옵션
export const travelThemes = [
  { value: '', label: '테마 선택' },
  { value: '휴양', label: '휴양' },
  { value: '캠핑', label: '캠핑' },
  { value: '문화', label: '문화' },
  { value: '맛집', label: '맛집' },
  { value: '액티비티', label: '액티비티' },
]
