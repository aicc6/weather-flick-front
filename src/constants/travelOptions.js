/**
 * 맞춤 일정 기능에서 사용되는 여행 옵션 상수들
 * 여러 컴포넌트에서 공통으로 사용되는 데이터를 중앙화하여 관리
 */

// 동행자 타입 정의
export const COMPANIONS = [
  {
    id: 'solo',
    label: '혼자',
    description: '나만의 시간, 자유로운 여행',
    icon: '🧘‍♀️',
    characteristics: ['자유로운 일정', '개인적 휴식', '새로운 경험'],
    recommendations: '카페, 박물관, 산책로, 관광명소',
  },
  {
    id: 'couple',
    label: '연인',
    description: '둘만의 로맨틱한 시간',
    icon: '💕',
    characteristics: ['로맨틱한 분위기', '커플 액티비티', '추억 만들기'],
    recommendations: '카페, 전망대, 해변, 야경 명소',
  },
  {
    id: 'family',
    label: '가족',
    description: '온 가족이 함께하는 즐거운 여행',
    icon: '👨‍👩‍👧‍👦',
    characteristics: ['안전한 코스', '다양한 연령대', '교육적 요소'],
    recommendations: '놀이공원, 공원, 체험관, 가족 레스토랑',
  },
  {
    id: 'friends',
    label: '친구들',
    description: '친구들과의 신나는 모험',
    icon: '👫',
    characteristics: ['액티비티 중심', '사진 스팟', '맛집 탐방'],
    recommendations: '액티비티, SNS 핫플, 맛집, 쇼핑몰',
  },
  {
    id: 'colleagues',
    label: '동료/회사',
    description: '동료들과의 워크샵이나 회식',
    icon: '👔',
    characteristics: ['팀빌딩', '네트워킹', '편의시설'],
    recommendations: '리조트, 컨벤션 센터, 단체 식당',
  },
  {
    id: 'group',
    label: '단체',
    description: '대규모 그룹 여행',
    icon: '👥',
    characteristics: ['단체 할인', '버스 이용', '단체 식사'],
    recommendations: '관광지, 단체 체험, 대형 식당',
  },
]

// 여행 기간 옵션 정의
export const TRAVEL_PERIODS = [
  {
    id: 'day',
    label: '당일치기',
    days: 1,
    description: '하루 만에 즐기는 알찬 여행',
    icon: '⚡',
  },
  {
    id: 'short1',
    label: '1박 2일',
    days: 2,
    description: '주말을 활용한 짧은 휴식',
    icon: '🌅',
  },
  {
    id: 'short2',
    label: '2박 3일',
    days: 3,
    description: '가장 인기 있는 여행 기간',
    icon: '⭐',
  },
  {
    id: 'medium1',
    label: '3박 4일',
    days: 4,
    description: '여유로운 일정으로 충분한 휴식',
    icon: '🏖️',
  },
  {
    id: 'medium2',
    label: '4박 5일',
    days: 5,
    description: '깊이 있는 여행과 다양한 체험',
    icon: '🎒',
  },
  {
    id: 'long',
    label: '5박 6일',
    days: 6,
    description: '여행지를 완전히 만끽하는 시간',
    icon: '🌟',
  },
  {
    id: 'extended',
    label: '일주일 이상',
    days: 7,
    description: '장기 여행과 특별한 경험',
    icon: '🌍',
  },
]

// 여행 스타일 정의
export const TRAVEL_STYLES = [
  {
    id: 'activity',
    label: '체험·액티비티',
    description: '다양한 체험과 액티비티를 즐기고 싶어요',
    icon: '🎯',
    examples: '서핑, 패러글라이딩, 쿠킹클래스, 워터파크',
  },
  {
    id: 'hotplace',
    label: 'SNS 핫플레이스',
    description: '인스타 감성과 사진 찍기 좋은 곳을 찾아요',
    icon: '📸',
    examples: '카페, 전망대, 포토존, 감성 스팟',
  },
  {
    id: 'nature',
    label: '자연과 함께',
    description: '자연 속에서 힐링하고 여유를 만끽해요',
    icon: '🌿',
    examples: '산책로, 공원, 해변, 숲길',
  },
  {
    id: 'landmark',
    label: '유명 관광지는 필수',
    description: '대표 명소와 관광지는 꼭 가보고 싶어요',
    icon: '🏛️',
    examples: '랜드마크, 박물관, 궁궐, 유명 관광지',
  },
  {
    id: 'healing',
    label: '여유롭게 힐링',
    description: '바쁜 일상을 벗어나 편안하게 쉬고 싶어요',
    icon: '🧘‍♀️',
    examples: '스파, 온천, 조용한 카페, 휴양지',
  },
  {
    id: 'culture',
    label: '문화·예술·역사',
    description: '지역의 문화와 역사를 깊이 알고 싶어요',
    icon: '🎨',
    examples: '박물관, 미술관, 전통 마을, 문화재',
  },
  {
    id: 'local',
    label: '여행지 느낌 물씬',
    description: '현지인처럼 그 지역만의 매력을 느끼고 싶어요',
    icon: '🏘️',
    examples: '로컬 카페, 전통 시장, 골목길, 현지 맛집',
  },
  {
    id: 'shopping',
    label: '쇼핑은 열정적으로',
    description: '쇼핑과 구매하는 재미를 만끽하고 싶어요',
    icon: '🛍️',
    examples: '백화점, 아울렛, 전통 시장, 쇼핑몰',
  },
  {
    id: 'food',
    label: '관광보다 먹방',
    description: '맛집 탐방과 음식이 여행의 주목적이에요',
    icon: '🍽️',
    examples: '맛집, 로컬 푸드, 시장 음식, 특산물',
  },
  {
    id: 'pet',
    label: '애완동물과 함께',
    description: '반려동물과 함께 여행하고 싶어요',
    icon: '🐾',
    examples: '애견동반 숙소, 펫카페, 반려견 놀이터, 펫프렌들리 여행지',
  },
]

// 일정 스타일 정의
export const SCHEDULE_TYPES = [
  {
    id: 'busy',
    label: '빼곡한 일정 선호',
    description: '많은 곳을 보고 다양한 경험을 하고 싶어요',
    icon: '⚡',
    characteristics: [
      '하루에 3-4개 이상의 장소 방문',
      '이동 시간을 최소화한 효율적 일정',
      '다양한 액티비티와 체험',
      '시간 단위로 세밀한 계획',
    ],
    pros: [
      '많은 곳을 경험할 수 있음',
      '알찬 여행이 가능',
      '시간 활용도가 높음',
    ],
    cons: [
      '피로할 수 있음',
      '여유시간이 적음',
      '예상치 못한 상황에 대응이 어려움',
    ],
  },
  {
    id: 'relaxed',
    label: '널널한 일정 선호',
    description: '여유롭게 즐기며 휴식도 충분히 취하고 싶어요',
    icon: '🏖️',
    characteristics: [
      '하루에 1-2개 정도의 주요 장소 방문',
      '충분한 휴식 시간과 여유',
      '현지에서의 자유로운 시간',
      '예상치 못한 발견을 위한 여백',
    ],
    pros: ['스트레스 없는 여행', '깊이 있는 경험 가능', '유연한 일정 조정'],
    cons: [
      '상대적으로 적은 장소 방문',
      '계획성이 부족할 수 있음',
      '시간이 남을 수 있음',
    ],
  },
]

// 헬퍼 함수들
export const getCompanionById = (id) => {
  return COMPANIONS.find((companion) => companion.id === id)
}

export const getTravelPeriodById = (id) => {
  return TRAVEL_PERIODS.find((period) => period.id === id)
}

export const getTravelStyleById = (id) => {
  return TRAVEL_STYLES.find((style) => style.id === id)
}

export const getScheduleTypeById = (id) => {
  return SCHEDULE_TYPES.find((type) => type.id === id)
}

export const getTravelStylesByIds = (ids) => {
  if (!ids || !Array.isArray(ids)) return []
  return ids.map((id) => getTravelStyleById(id)).filter(Boolean)
}
