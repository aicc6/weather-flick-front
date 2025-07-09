// 추천 여행지 데이터
export const recommendedDestinations = [
  {
    id: 1,
    name: '제주도 감귤 힐링 코스',
    weather: '맑음',
    temperature: 26,
    icon: '🍊',
    image:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    description: '자연과 함께하는 제주 여행',
    tags: ['자연', '힐링'],
    distance: '2박 3일',
    budget: '280,000원',
    rating: 4.8,
  },
  {
    id: 2,
    name: '서울 전통과 현대의 만남',
    weather: '구름많음',
    temperature: 24,
    icon: '🏰',
    image:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
    description: '경복궁부터 강남까지, 서울의 과거와 현재를 체험하세요',
    tags: ['문화', '역사'],
    distance: '2박 3일',
    budget: '300,000원',
    rating: 4.6,
  },
  {
    id: 3,
    name: '부산 바다 & 도심 투어',
    weather: '맑음',
    temperature: 28,
    icon: '🌊',
    image:
      'https://images.unsplash.com/photo-1561022470-509098e4dd5e?w=800&h=600&fit=crop',
    description: '활기찬 항구도시의 매력',
    tags: ['도시', '바다'],
    distance: '1박 2일',
    budget: '180,000원',
    rating: 4.6,
  },
  {
    id: 4,
    name: '경주 역사문화 기행',
    weather: '흐림',
    temperature: 22,
    icon: '🏛️',
    image:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    description: '천년 고도의 수려한 역사',
    tags: ['역사', '문화'],
    distance: '2박 3일',
    budget: '200,000원',
    rating: 4.4,
  },
  {
    id: 5,
    name: '강릉 바다 & 커피 여행',
    weather: '맑음',
    temperature: 25,
    icon: '☕',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
    description: '동해안의 여름로운 휴양',
    tags: ['바다', '커피'],
    distance: '1박 2일',
    budget: '150,000원',
    rating: 4.5,
  },
  {
    id: 6,
    name: '여수 밤바다와 섬 여행',
    weather: '맑음',
    temperature: 27,
    icon: '🌃',
    image:
      'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&h=600&fit=crop',
    description: '아름다운 밤바다와 신비로운 섬들이 어우러진 여수',
    tags: ['해양', '야경'],
    distance: '2박 3일',
    budget: '450,000원',
    rating: 5.0,
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
