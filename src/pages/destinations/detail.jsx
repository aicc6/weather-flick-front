import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Star,
  Heart,
  Share2,
  Calendar,
  Clock,
  MapPin,
  Camera,
  Navigation,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  User,
  Eye,
  MessageSquare,
  Sparkles,
  X,
} from '@/components/icons'

export default function TravelCourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [_rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)

  // 여행 코스 데이터 (실제로는 API에서 가져올 데이터)
  const courseData = {
    1: {
      id: 1,
      title: '제주도 완벽 여행',
      subtitle: '관광지, 맛집, 숙소가 모두 포함된 제주 여행',
      region: 'jeju',
      duration: '2박 3일',
      theme: ['자연', '맛집', '힐링'],
      mainImage:
        'http://tong.visitkorea.or.kr/cms/resource/35/3403535_image2_1.jpg',
      images: [
        'http://tong.visitkorea.or.kr/cms/resource/35/3403535_image2_1.jpg', // 관덕정
        'http://tong.visitkorea.or.kr/cms/resource/30/3053130_image2_1.jpg', // 곽지해수욕장
        'http://tong.visitkorea.or.kr/cms/resource/99/3053499_image2_1.jpg', // 사라봉
        'http://tong.visitkorea.or.kr/cms/resource/63/3056163_image2_1.jpg', // 관곶
      ],
      rating: 4.9,
      reviewCount: 324,
      likeCount: 567,
      viewCount: 2847,
      price: '350,000원',
      bestMonths: [3, 4, 5, 9, 10, 11],
      summary:
        '제주공항에서 시작해 관광지, 전통 맛집, 카페, 숙소까지 완벽하게 구성된 제주 여행',
      description: `제주도의 아름다운 자연과 맛있는 음식, 편안한 숙소를 모두 경험할 수 있는 완벽한 여행 코스입니다.
      한국관광공사 데이터를 기반으로 한 실제 관광지와 맛집, 숙소 정보로 구성되어 있어 더욱 신뢰할 수 있습니다.

      제주 서부의 곽지해수욕장부터 제주시 중심가의 역사적 명소,
      그리고 동부의 백약이오름까지 제주도 전체를 둘러보는 알찬 일정입니다.

      특히 제주 흑돼지, 해장국 등 제주 대표 음식과 감성 카페들도 포함되어 있어
      미각과 시각을 모두 만족시키는 여행이 될 것입니다.`,
      highlights: [
        '관음사',
        '곽지해수욕장',
        '구시물 일몰',
        '사라봉',
        '관덕정',
        '감수굴 밭담길',
        '백약이오름',
      ],
      itinerary: [
        {
          day: 1,
          title: '제주 서부 자연 & 맛집 투어',
          activities: [
            {
              time: '09:00',
              place: '제주공항',
              description: '제주공항 도착 및 렌터카 픽업',
              type: 'transport',
              address: '제주특별자치도 제주시 공항로 2',
              duration: 60,
            },
            {
              time: '10:30',
              place: '관음사(제주)',
              description:
                '제주도 대표 사찰, 한라산 중턱의 고즈넉한 분위기를 만끽하며 여행의 시작을 알리는 명소',
              type: 'attraction',
              address: '제주특별자치도 제주시 산록북로 660',
              duration: 120,
            },
            {
              time: '12:30',
              place: '흑돈가 제주',
              description:
                '제주 흑돼지 전문점에서 점심식사. 제주의 대표 먹거리인 흑돼지를 맛볼 수 있는 곳',
              type: 'restaurant',
              address: '제주특별자치도 제주시 한라대학로 11',
              phone: '064-747-0088',
              duration: 60,
            },
            {
              time: '14:00',
              place: '곽지해수욕장',
              description:
                '에메랄드빛 바다와 하얀 모래사장이 아름다운 제주 서부 대표 해수욕장',
              type: 'attraction',
              address: '제주특별자치도 제주시 애월읍 곽지리 1565',
              duration: 120,
            },
            {
              time: '16:30',
              place: 'salon de lavant',
              description:
                '애월 근처의 감성 카페에서 바다를 바라보며 여유로운 커피 타임',
              type: 'cafe',
              address: '제주특별자치도 제주시 하가로 146-9',
              duration: 60,
            },
            {
              time: '18:00',
              place: '구시물',
              description:
                '제주 서해안의 아름다운 일몰 명소. 제주도에서 가장 로맨틱한 일몰을 감상할 수 있는 곳',
              type: 'attraction',
              address: '제주특별자치도 제주시 애월읍 상귀리',
              duration: 120,
            },
            {
              time: '20:30',
              place: '회춘 애월점',
              description:
                '애월 지역 맛집에서 제주 바다의 신선한 해산물로 저녁식사',
              type: 'restaurant',
              address: '제주특별자치도 제주시 가문동길 80',
              duration: 60,
            },
            {
              time: '22:00',
              place: '그랜드 하얏트 제주',
              description:
                '제주시 중심가의 프리미엄 호텔에서 숙박. 최고급 시설과 서비스를 제공하는 5성급 호텔',
              type: 'accommodation',
              address: '제주특별자치도 제주시 노연로 12 (노형동)',
              duration: 600,
            },
          ],
        },
        {
          day: 2,
          title: '제주 시내 문화 & 역사 탐방',
          activities: [
            {
              time: '08:00',
              place: '88로스터즈',
              description:
                '아침 커피와 가벼운 브런치로 하루를 시작하는 로컬 카페',
              type: 'cafe',
              address: '제주특별자치도 제주시 금산5길 35-1',
              duration: 60,
            },
            {
              time: '09:30',
              place: '사라봉',
              description:
                '제주시내를 한눈에 조망할 수 있는 오름. 제주항과 제주시 전경이 한눈에 보이는 전망 명소',
              type: 'attraction',
              address: '제주특별자치도 제주시 사라봉동길 61',
              duration: 120,
            },
            {
              time: '12:00',
              place: '24시제주해장국',
              description:
                '제주 전통 해장국으로 점심식사. 제주도만의 특별한 해장국 맛을 경험할 수 있는 곳',
              type: 'restaurant',
              address: '제주특별자치도 제주시 삼무로 45',
              phone: '064-711-8687',
              duration: 60,
            },
            {
              time: '14:00',
              place: '관덕정(제주)',
              description:
                '조선시대 제주목 관아의 중심 건물. 제주의 역사와 문화를 느낄 수 있는 중요한 문화재',
              type: 'attraction',
              address: '제주특별자치도 제주시 관덕로 19',
              duration: 120,
            },
            {
              time: '16:30',
              place: 'ABC 에이팩토리베이커리카페',
              description:
                '제주시내 중심가의 베이커리 카페에서 달콤한 디저트와 커피를 즐기는 시간',
              type: 'cafe',
              address: '제주특별자치도 제주시 관덕로7길 39',
              duration: 60,
            },
            {
              time: '18:00',
              place: '감수굴 밭담길',
              description:
                '제주 전통 밭담과 자연경관을 감상할 수 있는 걷기 좋은 길',
              type: 'attraction',
              address: '제주특별자치도 제주시 구좌읍 평대7길 34',
              duration: 120,
            },
            {
              time: '20:30',
              place: '라마다 프라자 제주 호텔',
              description:
                '제주시 중심가의 편리한 위치에 있는 호텔에서 숙박. 주요 관광지와 가까운 접근성이 좋은 호텔',
              type: 'accommodation',
              address: '제주특별자치도 제주시 탑동로 66',
              duration: 600,
            },
          ],
        },
        {
          day: 3,
          title: '제주 동부 자연 & 마무리',
          activities: [
            {
              time: '08:30',
              place: '5L2F',
              description:
                '조용한 마을의 아침 카페에서 여행 마지막 날을 시작하는 여유로운 시간',
              type: 'cafe',
              address: '제주특별자치도 제주시 와흘상길 30',
              duration: 60,
            },
            {
              time: '10:00',
              place: '백약이오름',
              description:
                '제주 동부의 아름다운 오름. 제주도의 화산 지형과 자연을 체험할 수 있는 트레킹 코스',
              type: 'attraction',
              address: '제주특별자치도 서귀포시 표선면 성읍리 산1',
              duration: 120,
            },
            {
              time: '12:30',
              place: '흑본오겹 함덕점',
              description:
                '제주 흑돼지 전문점에서 마지막 점심식사. 여행의 마무리를 제주 특산품으로',
              type: 'restaurant',
              address: '제주특별자치도 제주시 신북로 454',
              duration: 60,
            },
            {
              time: '14:00',
              place: '함덕해수욕장 주변',
              description:
                '백사장과 에메랄드빛 바다를 배경으로 제주 여행의 마지막 추억 만들기',
              type: 'attraction',
              address: '제주특별자치도 제주시 조천읍 함덕리',
              duration: 120,
            },
            {
              time: '16:30',
              place: '제주공항',
              description: '렌터카 반납 및 체크인. 제주 여행의 아쉬운 마무리',
              type: 'transport',
              address: '제주특별자치도 제주시 공항로 2',
              duration: 60,
            },
            {
              time: '18:00',
              place: '제주공항 출발',
              description: '제주도 여행 완료 및 본토 복귀',
              type: 'transport',
              address: '제주특별자치도 제주시 공항로 2',
              duration: 0,
            },
          ],
        },
      ],
      tips: [
        '렌터카 예약은 최소 2주 전에 미리 해주세요 (제주도는 렌터카 수요가 매우 높음)',
        '제주 흑돼지는 현지에서만 맛볼 수 있는 특별한 맛이니 꼭 드셔보세요',
        '일몰 시간을 미리 확인하고 구시물에서 제주도 최고의 일몰을 감상하세요',
        '오름 트레킹 시 편한 신발과 물을 준비해주세요',
        '제주도 날씨는 변화가 심하니 겉옷을 챙겨주세요',
        '카페들은 주말에 매우 붐비니 평일 방문을 추천합니다',
      ],
      includes: [
        '숙박 2박 (그랜드 하얏트 제주)',
        '렌터카 3일',
        '주요 관광지 입장료',
        '여행 가이드북',
      ],
      excludes: [
        '항공료',
        '식사비 (맛집 정보 제공)',
        '개인 경비',
        '여행자 보험',
      ],
      tags: ['실제데이터', '완벽일정', '제주맛집', '자연힐링'],
    },
    2: {
      id: 2,
      title: '부산 바다 & 도심 투어',
      subtitle: '활기찬 항구도시의 매력',
      region: 'busan',
      duration: '1박 2일',
      theme: ['도시', '바다', '맛집'],
      mainImage:
        'http://tong.visitkorea.or.kr/cms/resource/34/3090534_image2_1.JPG',
      images: [
        'http://tong.visitkorea.or.kr/cms/resource/34/3090534_image2_1.JPG', // 해운대해수욕장 - 부산의 대표적인 해변
        'http://tong.visitkorea.or.kr/cms/resource/45/3311245_image2_1.jpg', // 광안리해수욕장 - 광안대교 야경으로 유명한 해변
        'http://tong.visitkorea.or.kr/cms/resource/91/3365491_image2_1.jpg', // 부산 감천문화마을 - 알록달록한 계단식 마을
        'http://tong.visitkorea.or.kr/cms/resource/63/2918063_image2_1.jpg', // 태종대 - 부산의 대표적인 자연 관광지
      ],
      rating: 4.6,
      reviewCount: 203,
      likeCount: 189,
      viewCount: 892,
      price: '180,000원',
      bestMonths: [4, 5, 6, 9, 10, 11],
      summary: '해운대부터 감천문화마을까지, 부산의 대표 명소를 둘러보는 코스',
      description: `부산의 바다와 도심을 모두 즐길 수 있는 완벽한 투어입니다.
      해운대 해수욕장의 시원한 바다부터 감천문화마을의 알록달록한 골목길,
      그리고 태종대의 절경까지 부산의 모든 매력을 1박 2일에 담았습니다.

      특히 광안대교 야경과 자갈치시장의 신선한 해산물,
      범어사의 고즈넉한 분위기까지 다양한 부산의 모습을 경험하실 수 있습니다.`,
      highlights: [
        '해운대해수욕장',
        '감천문화마을',
        '태종대 전망대',
        '광안리해수욕장',
        '자갈치시장',
        '범어사',
        '해운대 동백섬',
      ],
      itinerary: [
        {
          day: 1,
          title: '해운대 & 동부산 코스',
          activities: [
            {
              time: '09:00',
              place: '해운대해수욕장',
              description: '부산 대표 해변에서 아침 산책과 해변 감상',
            },
            {
              time: '10:30',
              place: '해운대 동백섬',
              description: '누리마루 APEC하우스와 동백나무 숲길 산책',
            },
            {
              time: '12:00',
              place: '해운대 달맞이길',
              description: '카페거리에서 바다뷰 브런치',
            },
            {
              time: '14:00',
              place: '해운대 블루라인파크',
              description: '해변열차와 스카이캡슐로 청사포까지 이동',
            },
            {
              time: '16:00',
              place: '태종대 전망대',
              description: '영도 태종대에서 절벽 절경 감상',
            },
            {
              time: '17:30',
              place: '태종대 다누비열차',
              description: '다누비열차로 태종대 일주',
            },
            {
              time: '19:00',
              place: '광안리해수욕장',
              description: '광안대교 야경과 함께 저녁식사',
            },
          ],
        },
        {
          day: 2,
          title: '문화마을 & 전통시장 코스',
          activities: [
            {
              time: '09:00',
              place: '감천문화마을',
              description: '부산의 마추픽추, 알록달록한 골목길 탐방',
            },
            {
              time: '11:30',
              place: '자갈치시장',
              description: '부산 대표 전통시장에서 신선한 해산물 구매',
            },
            {
              time: '13:00',
              place: '영도대교',
              description: '부산 최초 도개교에서 부산항 전경 감상',
            },
            {
              time: '14:30',
              place: '범어사',
              description: '금정산 자락의 고즈넉한 전통사찰 참배',
            },
            {
              time: '16:30',
              place: '범어사 성보박물관',
              description: '불교문화유산 관람 및 역사 체험',
            },
            {
              time: '18:00',
              place: '부산역',
              description: '부산역에서 KTX 탑승 및 출발',
            },
          ],
        },
      ],
      tips: [
        '해운대는 여름철 매우 붐비니 이른 시간 방문 추천',
        '감천문화마을은 경사가 심하니 편한 신발 필수',
        '태종대 다누비열차는 날씨에 따라 운행 중단될 수 있음',
        '자갈치시장에서 횟감 구매 후 2층에서 조리 가능',
        '범어사는 입장료가 있으니 미리 확인 필요',
        '광안대교 야경은 저녁 8시경이 가장 아름다움',
      ],
      includes: [
        '숙박 1박',
        '시티투어버스',
        '주요 관광지 입장료',
        '해운대 블루라인파크',
      ],
      excludes: ['교통비', '식사비', '개인 경비', '쇼핑비'],
      tags: ['바다뷰', '문화체험', '야경맛집'],
    },
    3: {
      id: 3,
      title: '강릉 바다 & 커피 여행',
      subtitle: '동해의 아름다운 해안과 커피의 도시',
      region: 'gangneung',
      duration: '1박 2일',
      theme: ['바다', '커피', '일출'],
      mainImage:
        'http://tong.visitkorea.or.kr/cms/resource/58/2938658_image2_1.bmp',
      images: [
        'http://tong.visitkorea.or.kr/cms/resource/58/2938658_image2_1.bmp', // 경포해수욕장 - 강릉의 대표적인 해수욕장
        'http://tong.visitkorea.or.kr/cms/resource/69/2688069_image2_1.jpg', // 강릉 오죽헌 - 신사임당과 율곡 이이의 생가
        'http://tong.visitkorea.or.kr/cms/resource/43/3378343_image2_1.JPG', // 초당순두부마을 - 강릉의 대표 음식문화 체험지
        'http://tong.visitkorea.or.kr/cms/resource/55/2921955_image2_1.jpg', // 안목해변 - 강릉 커피거리로 유명한 해변
      ],
      rating: 4.7,
      reviewCount: 178,
      likeCount: 256,
      viewCount: 1034,
      price: '220,000원',
      bestMonths: [4, 5, 6, 9, 10, 11],
      summary:
        '경포해수욕장부터 정동진까지, 강릉의 바다와 커피를 만끽하는 코스',
      description: `강릉의 아름다운 동해바다와 유명한 커피문화를 함께 즐길 수 있는 완벽한 여행입니다.
      경포해수욕장의 넓은 백사장부터 정동진의 일출, 안목해변의 커피거리까지
      강릉만의 특별한 매력을 느껴보세요.

      특히 정동진 일출은 한국에서 가장 아름다운 일출 중 하나로 유명하며,
      안목해변 커피거리에서는 바다를 보며 마시는 특별한 커피를 즐길 수 있습니다.`,
      highlights: [
        '경포해수욕장',
        '안목해변 커피거리',
        '정동진해변',
        '헌화로 드라이브',
      ],
      itinerary: [
        {
          day: 1,
          title: '경포 & 안목 커피 투어',
          activities: [
            {
              time: '10:00',
              place: '경포해수욕장',
              description: '강릉 대표 해수욕장에서 산책 및 해변 체험',
            },
            {
              time: '12:00',
              place: '초당순두부마을',
              description: '강릉 명물 초당순두부로 점심식사',
            },
            {
              time: '14:30',
              place: '안목해변 커피거리',
              description: '바다를 보며 즐기는 강릉 커피 체험',
            },
            {
              time: '16:30',
              place: '경포호수광장',
              description: '경포호 주변 산책 및 자전거 타기',
            },
            {
              time: '18:30',
              place: '정동진해변',
              description: '정동진역과 모래시계공원 관람, 일몰 감상',
            },
          ],
        },
        {
          day: 2,
          title: '정동진 일출 & 해안 드라이브',
          activities: [
            {
              time: '06:00',
              place: '정동진해변',
              description: '한국 최고의 일출 명소에서 일출 감상',
            },
            {
              time: '08:00',
              place: '정동진조각공원',
              description: '바다를 배경으로 한 조각 작품 감상',
            },
            {
              time: '10:00',
              place: '헌화로',
              description: '동해안 최고의 해안 드라이브 코스',
            },
            {
              time: '12:00',
              place: '주문진해변',
              description: '주문진 해변과 항구에서 신선한 해산물 점심',
            },
            {
              time: '15:00',
              place: '소돌해수욕장',
              description: '아담하고 조용한 해변에서 휴식',
            },
            {
              time: '17:00',
              place: '강릉역',
              description: 'KTX로 서울 복귀 또는 자유시간',
            },
          ],
        },
      ],
      tips: [
        '정동진 일출 관람을 위해 첫날 정동진 근처 숙소 예약 추천',
        '안목해변 커피거리는 주말에 매우 붐비니 평일 방문이 좋습니다',
        '헌화로 드라이브 시 안전운전 필수 (해안 절벽 도로)',
        '주문진항에서 신선한 오징어와 게를 맛보세요',
        '겨울철에는 방한용품 필수 (바닷바람이 매우 춥습니다)',
      ],
      includes: ['숙박 1박', '렌터카', '커피 체험', '주요 관광지 입장료'],
      excludes: ['교통비', '식사비', '개인 경비', '연료비'],
      tags: ['일출명소', '커피투어', '해안드라이브', '포토존'],
    },
    4: {
      id: 4,
      title: '경주 천년 고도 문화유산 투어',
      subtitle: '신라 천년의 역사와 문화를 만나다',
      region: 'gyeongju',
      duration: '1박 2일',
      theme: ['역사', '문화', '유네스코'],
      mainImage:
        'http://tong.visitkorea.or.kr/cms/resource/03/2678603_image2_1.jpg',
      images: [
        'http://tong.visitkorea.or.kr/cms/resource/03/2678603_image2_1.jpg', // 경주 불국사 [유네스코 세계유산] - 신라 불교 예술의 걸작
        'http://tong.visitkorea.or.kr/cms/resource/62/2612562_image2_1.jpg', // 경주 동궁과 월지 - 신라 왕궁터의 아름다운 연못
        'http://tong.visitkorea.or.kr/cms/resource/01/2656601_image2_1.jpg', // 경주 첨성대 - 동양 최고(最古)의 천문대
        'http://tong.visitkorea.or.kr/cms/resource/75/3029075_image2_1.jpg', // 경주 대릉원 일원 - 신라 왕릉군과 천마총
      ],
      rating: 4.9,
      reviewCount: 412,
      likeCount: 567,
      viewCount: 2134,
      price: '190,000원',
      bestMonths: [3, 4, 5, 9, 10, 11],
      summary: '유네스코 세계유산과 신라 문화재를 둘러보는 역사 탐방 코스',
      description: `천년 고도 경주에서 신라의 찬란한 문화유산을 만나보세요.
      유네스코 세계유산인 불국사와 석굴암부터 첨성대, 동궁과 월지까지
      신라 천년의 역사가 살아 숨쉬는 특별한 여행입니다.

      경주는 야외 박물관이라 불릴 만큼 곳곳에 문화재가 산재해 있어
      걸어서도 충분히 즐길 수 있는 도보 여행의 묘미가 있습니다.
      특히 밤에 조명이 켜진 동궁과 월지의 아름다움은 잊지 못할 추억이 될 것입니다.`,
      highlights: [
        '불국사 (유네스코)',
        '석굴암 (유네스코)',
        '첨성대',
        '동궁과 월지',
        '대릉원',
      ],
      itinerary: [
        {
          day: 1,
          title: '토함산 불교문화권 & 신라왕경',
          activities: [
            {
              time: '09:00',
              place: '경주 불국사 [유네스코 세계유산]',
              description: '신라 불교 예술의 걸작, 다보탑과 석가탑 관람',
            },
            {
              time: '11:30',
              place: '경주 석굴암 [유네스코 세계유산]',
              description: '동양 조각 예술의 최고봉, 석굴암 본존불 참배',
            },
            {
              time: '14:00',
              place: '토함산',
              description: '점심식사 후 토함산 자연휴양림에서 휴식',
            },
            {
              time: '16:00',
              place: '대릉원 (천마총)',
              description: '신라 왕릉군과 천마총 내부 견학',
            },
            {
              time: '17:30',
              place: '경주 첨성대',
              description: '동양 최고(最古)의 천문대, 석양과 함께 감상',
            },
            {
              time: '19:00',
              place: '황성공원',
              description: '경주 시내 전망과 저녁식사',
            },
          ],
        },
        {
          day: 2,
          title: '월성 일대 & 보문관광단지',
          activities: [
            {
              time: '09:00',
              place: '경주 동궁과 월지',
              description: '신라 궁궐터, 아침 햇살에 빛나는 연못의 아름다움',
            },
            {
              time: '10:30',
              place: '분황사',
              description: '신라 최초의 사찰, 분황사 모전석탑 관람',
            },
            {
              time: '12:00',
              place: '경주 시내',
              description: '전통 한정식으로 점심식사',
            },
            {
              time: '14:00',
              place: '보문호',
              description: '보문관광단지 산책과 호수 둘레길',
            },
            {
              time: '15:30',
              place: '기림사',
              description: '신라 불교의 전통이 살아있는 고찰',
            },
            {
              time: '17:00',
              place: '감포항',
              description: '동해바다 전망과 함께 여행 마무리',
            },
          ],
        },
      ],
      tips: [
        '문화재 관람시 플래시 촬영은 금지되어 있습니다',
        '불국사와 석굴암은 입장료가 별도이니 미리 준비하세요',
        '경주는 도보 여행지이므로 편한 신발 착용 필수',
        '동궁과 월지는 야간 조명이 아름다우니 저녁 시간 방문 추천',
        '주차장이 협소하니 대중교통 이용을 권합니다',
      ],
      includes: [
        '숙박 1박',
        '문화재 관람료',
        '전문 문화해설사',
        '여행 가이드북',
      ],
      excludes: ['교통비', '식사비', '개인 경비', '기념품비'],
      tags: ['역사탐방', '문화유산', '유네스코', '사진명소', '도보여행'],
    },
    5: {
      id: 5,
      title: '전주 한옥마을 & 전통문화 당일 코스',
      subtitle: '천년 전통의 멋과 맛이 살아있는 전주',
      region: 'jeonju',
      duration: '당일',
      theme: ['전통문화', '한옥', '맛집', '체험'],
      mainImage:
        'http://tong.visitkorea.or.kr/cms/resource/50/3479250_image2_1.jpg',
      images: [
        'http://tong.visitkorea.or.kr/cms/resource/50/3479250_image2_1.jpg', // 전북 전주 한옥마을 [슬로시티] - 전주의 대표적인 전통문화 관광지
        'http://tong.visitkorea.or.kr/cms/resource/74/3422574_image2_1.jpg', // 경기전 - 조선 태조 이성계의 어진이 모셔진 곳
        'http://tong.visitkorea.or.kr/cms/resource/89/2641989_image2_1.jpg', // 전주전동성당 - 아름다운 근대 건축양식의 성당
        'http://tong.visitkorea.or.kr/cms/resource/17/2653617_image2_1.jpg', // 전주 풍남문 - 전주를 대표하는 조선시대 성문
      ],
      rating: 4.7,
      reviewCount: 312,
      likeCount: 425,
      viewCount: 1854,
      price: '120,000원',
      bestMonths: [3, 4, 5, 9, 10, 11],
      summary:
        '전주 한옥마을에서 경기전, 풍남문까지 전주의 전통과 문화를 체험하는 완벽한 당일 코스',
      description: `전주는 조선왕조의 뿌리가 시작된 곳으로, 전통 한옥과 궁중문화가 잘 보존된 도시입니다.

      전주 한옥마을에서 한복을 입고 거닐며 조선시대의 정취를 느끼고, 경기전에서 태조 이성계의 어진을 만나보세요. 전주전동성당의 아름다운 근대 건축과 풍남문의 웅장함도 놓칠 수 없는 볼거리입니다.

      전주 비빔밥과 한정식으로 유명한 맛의 고장에서 미식 여행도 함께 즐기실 수 있습니다. 전통 한지 체험과 한복 체험까지 더해 특별한 추억을 만들어보세요.`,
      highlights: [
        '전주 한옥마을',
        '경기전',
        '전주전동성당',
        '전주 풍남문',
        '덕진공원',
        '한벽당',
      ],
      itinerary: [
        {
          day: 1,
          title: '전주 전통문화 탐방',
          activities: [
            {
              time: '09:00',
              place: '전주 한옥마을',
              description: '전통 한옥 건축을 감상하며 한복 체험 및 거리 산책',
              address: '전북특별자치도 전주시 완산구 기린대로 99',
            },
            {
              time: '10:30',
              place: '경기전',
              description: '조선 태조 이성계의 어진이 모셔진 역사적 공간 탐방',
              address: '전북특별자치도 전주시 완산구 태조로 44 (풍남동3가)',
            },
            {
              time: '11:30',
              place: '전주전동성당',
              description: '아름다운 근대 건축양식의 성당 관람',
              address: '전북특별자치도 전주시 완산구 태조로 51',
            },
            {
              time: '12:30',
              place: '한옥마을 맛집 거리',
              description: '전주 비빔밥과 전통 한정식으로 점심 식사',
              address: '전북특별자치도 전주시 완산구 한옥마을 일대',
            },
            {
              time: '14:00',
              place: '전주전통한지원',
              description: '전통 한지 제작 과정 견학 및 체험',
              address: '전북특별자치도 전주시 완산구 한지길 100-10',
            },
            {
              time: '15:30',
              place: '전주 풍남문',
              description: '전주를 대표하는 조선시대 성문',
              address: '전북특별자치도 전주시 완산구 풍남문3길 1',
            },
            {
              time: '16:30',
              place: '한벽당',
              description: '전주천을 내려다보는 아름다운 전통 정자',
              address: '전북특별자치도 전주시 완산구 기린대로 2',
            },
            {
              time: '17:30',
              place: '오목대와 이목대',
              description: '전주 시내를 한눈에 볼 수 있는 전망 명소',
              address: '전북특별자치도 전주시 완산구 기린대로 55',
            },
            {
              time: '18:30',
              place: '덕진공원',
              description: '연꽃으로 유명한 아름다운 공원에서 저녁 산책',
              address: '전북특별자치도 전주시 덕진구 권삼득로 390',
            },
          ],
        },
      ],
      tips: [
        '한복 체험은 한옥마을 입구에서 대여 가능하며, 3-4시간 기준 2-3만원',
        '경기전과 전동성당은 도보로 5분 거리에 있어 연계 관람 추천',
        '전주 비빔밥은 한옥마을 내 전통 한정식집에서 맛보세요',
        '덕진공원은 연꽃이 피는 7-8월이 가장 아름답습니다',
        '주차는 한옥마을 공영주차장 이용 (2시간 3,000원)',
        '전주전통한지원에서는 한지 부채 만들기 체험이 인기입니다',
      ],
      includes: [
        '주요 관광지 입장료',
        '한복 체험비',
        '한지 체험비',
        '가이드북',
      ],
      excludes: ['교통비', '식사비', '개인 경비', '주차비'],
      tags: ['전통문화', '한복체험', '역사탐방', '인스타감성', '맛집투어'],
    },
    // 여수 1박 2일 코스
    6: {
      id: 6,
      title: '여수 낭만 바다 여행',
      subtitle: '이순신의 발자취와 함께하는 밤바다 낭만',
      region: 'yeosu',
      duration: '1박 2일',
      theme: ['바다', '야경', '역사'],
      mainImage:
        'http://tong.visitkorea.or.kr/cms/resource/07/3351107_image2_1.jpg',
      images: [
        'http://tong.visitkorea.or.kr/cms/resource/07/3351107_image2_1.jpg', // 이순신광장 - 여수의 대표적인 관광 명소
        'http://tong.visitkorea.or.kr/cms/resource/13/3499913_image2_1.jpg', // 한려해상국립공원 (오동도) - 여수의 상징적인 섬
        'http://tong.visitkorea.or.kr/cms/resource/93/3499893_image2_1.JPG', // 향일암(여수) - 여수의 대표적인 일출 명소
        'http://tong.visitkorea.or.kr/cms/resource/47/3422947_image2_1.png', // 낭만포차거리 - 여수의 유명한 먹거리 거리
      ],
      rating: 4.7,
      reviewCount: 312,
      likeCount: 428,
      viewCount: 1856,
      price: '220,000원',
      bestMonths: [4, 5, 6, 9, 10, 11],
      summary:
        '이순신광장부터 향일암까지, 여수의 바다와 역사가 어우러진 낭만적인 코스',
      description: `여수는 아름다운 밤바다와 역사적 의미가 깊은 곳들이 어우러진 특별한 여행지입니다.
      이순신 장군의 흔적을 따라가며 거북선의 역사를 배우고,
      돌산대교와 이순신대교의 환상적인 야경을 감상할 수 있습니다.

      특히 향일암에서 바라보는 일출과 낭만포차거리에서 즐기는 신선한 해산물은
      여수 여행의 백미입니다. 고소동 천사벽화마을의 아기자기한 골목길과
      오동도의 자연경관까지 더해져 완벽한 여수 여행을 만들어드립니다.`,
      highlights: [
        '이순신광장',
        '돌산대교',
        '향일암',
        '낭만포차거리',
        '오동도',
      ],
      itinerary: [
        {
          day: 1,
          title: '여수 시내 & 역사 탐방',
          activities: [
            {
              time: '10:00',
              place: '이순신광장',
              description: '여수 여행의 시작점, 이순신 동상과 거북선 관람',
            },
            {
              time: '11:30',
              place: '거북선공원',
              description: '실물 크기 거북선 모형과 역사관 견학',
            },
            {
              time: '13:00',
              place: '여수구항',
              description: '항구 풍경과 점심식사 (해산물 백반)',
            },
            {
              time: '15:00',
              place: '고소동 천사벽화마을',
              description: '아기자기한 벽화 골목길 산책과 사진 촬영',
            },
            {
              time: '17:00',
              place: '돌산공원',
              description: '돌산대교 전망과 여수 시내 조망',
            },
            {
              time: '19:00',
              place: '낭만포차거리',
              description: '여수 밤바다를 보며 포차 음식과 소주 한잔',
            },
            {
              time: '21:00',
              place: '이순신대교',
              description: '화려한 야간 조명과 함께하는 야경 감상',
            },
          ],
        },
        {
          day: 2,
          title: '자연과 바다 만끽',
          activities: [
            {
              time: '06:00',
              place: '향일암',
              description: '일출 명소에서 바라보는 장엄한 해돋이',
            },
            {
              time: '08:30',
              place: '방죽포해변',
              description: '향일암 근처 해변에서 산책과 브런치',
            },
            {
              time: '10:30',
              place: '무슬목해변',
              description: '돌산도의 아름다운 해변에서 여유로운 시간',
            },
            {
              time: '12:30',
              place: '돌산대교',
              description: '여수의 랜드마크 다리 건너며 점심식사',
            },
            {
              time: '14:30',
              place: '오동도',
              description: '동백나무 숲길과 끝등 전망대에서 바다 조망',
            },
            {
              time: '16:30',
              place: '여수해양공원',
              description: '해양생물 관찰과 체험 프로그램',
            },
            {
              time: '18:00',
              place: '여수신항',
              description: '여행 마무리 및 기념품 구입',
            },
          ],
        },
      ],
      tips: [
        '향일암 일출은 날씨에 따라 달라지니 일기예보를 확인해주세요',
        '낭만포차거리는 주말 저녁에 매우 붐비니 평일 방문을 추천합니다',
        '돌산대교는 도보로도 건널 수 있어 산책하며 야경을 즐길 수 있습니다',
        '여수는 바람이 많이 부니 가벼운 바람막이나 겉옷을 준비하세요',
        '해산물 알레르기가 있으신 분은 미리 확인해주세요',
        '이순신대교 야경은 밤 10시 이후가 가장 아름답습니다',
      ],
      includes: ['숙박 1박', '관광지 입장료', '가이드북', '교통패스'],
      excludes: ['교통비', '식사비', '개인 경비', '체험 프로그램비'],
      tags: ['바다여행', '역사탐방', '야경감상', '일출명소'],
    },
  }

  const course = courseData[id] || courseData[1] // 기본값으로 첫 번째 코스

  useEffect(() => {
    // 페이지 방문 시 조회수 증가 (실제로는 API 호출)
  }, [id, course.title])

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? course.images.length - 1 : prev - 1,
    )
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === course.images.length - 1 ? 0 : prev + 1,
    )
  }

  const handleModalPrevImage = useCallback(() => {
    setModalImageIndex((prev) =>
      prev === 0 ? course.images.length - 1 : prev - 1,
    )
  }, [course.images.length])

  const handleModalNextImage = useCallback(() => {
    setModalImageIndex((prev) =>
      prev === course.images.length - 1 ? 0 : prev + 1,
    )
  }, [course.images.length])

  const openImageModal = () => {
    setModalImageIndex(currentImageIndex)
    setIsImageModalOpen(true)
    // 모달이 열렸을 때 스크롤 방지
    document.body.style.overflow = 'hidden'
  }

  const closeImageModal = () => {
    setIsImageModalOpen(false)
    // 모달이 닫혔을 때 스크롤 복원
    document.body.style.overflow = 'unset'
  }

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isImageModalOpen) {
        closeImageModal()
      }
      if (isImageModalOpen) {
        if (event.key === 'ArrowLeft') {
          handleModalPrevImage()
        }
        if (event.key === 'ArrowRight') {
          handleModalNextImage()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      // 컴포넌트 언마운트 시 스크롤 복원
      document.body.style.overflow = 'unset'
    }
  }, [isImageModalOpen, handleModalNextImage, handleModalPrevImage])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course.title,
        text: course.summary,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('링크가 복사되었습니다!')
    }
  }

  const handleAddToMyTrip = () => {
    alert('내 여행 코스에 추가되었습니다!')
  }

  const handleRatingSubmit = (value) => {
    setRating(value)
    alert(`${value}점으로 평가해주셔서 감사합니다!`)
  }

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      const newComment = {
        id: Date.now(),
        user: '사용자',
        content: comment,
        date: new Date().toLocaleDateString(),
        rating: 5,
        helpful: 0,
      }
      setComments([newComment, ...comments])
      setComment('')
      alert('후기가 등록되었습니다!')
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 뒤로가기 버튼 */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        목록으로 돌아가기
      </Button>

      {/* 코스 제목 및 액션 */}
      <div className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge className="bg-blue-600 text-white">Easy코스</Badge>
          <Badge variant="outline">인기</Badge>
          {course.theme.map((theme, index) => (
            <Badge key={index} variant="secondary">
              {theme}
            </Badge>
          ))}
        </div>

        <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
          {course.title}
        </h1>
        <p className="mb-4 text-xl text-gray-600 dark:text-gray-300">
          {course.subtitle}
        </p>

        {/* 평점 및 통계 */}
        <div className="mb-6 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="text-lg font-semibold">{course.rating}</span>
            <span className="text-gray-500">({course.reviewCount}명 평가)</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-400" />
            <span className="text-gray-600">좋아요 {course.likeCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600">조회수 {course.viewCount}</span>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant={isLiked ? 'default' : 'outline'}
            onClick={() => setIsLiked(!isLiked)}
            className={isLiked ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            <Heart className="mr-2 h-4 w-4" />
            좋아요
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            공유하기
          </Button>
          <Button
            variant={isBookmarked ? 'default' : 'outline'}
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            <Navigation className="mr-2 h-4 w-4" />
            코스 담기
          </Button>
          <Button
            onClick={handleAddToMyTrip}
            className="bg-blue-600 hover:bg-blue-700"
          >
            내 여행에 추가
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-2">
          {/* 이미지 갤러리 */}
          <Card className="mb-8 overflow-hidden dark:border-gray-700 dark:bg-gray-800">
            <div className="relative">
              <img
                src={course.images[currentImageIndex]}
                alt={course.title}
                className="h-96 w-full object-cover"
              />
              <button
                onClick={handlePrevImage}
                className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {course.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 w-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-4 bottom-4"
                onClick={openImageModal}
              >
                <Camera className="mr-2 h-4 w-4" />
                크게보기
              </Button>
            </div>
          </Card>

          {/* 이미지 모달 */}
          {isImageModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
              {/* 모달 배경 클릭으로 닫기 */}
              <div className="absolute inset-0" onClick={closeImageModal} />

              {/* 모달 콘텐츠 */}
              <div className="relative z-10 max-h-[90vh] max-w-[90vw]">
                {/* 닫기 버튼 */}
                <button
                  onClick={closeImageModal}
                  className="absolute top-4 right-4 z-20 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                >
                  <X className="h-6 w-6" />
                </button>

                {/* 이미지 */}
                <img
                  src={course.images[modalImageIndex]}
                  alt={`${course.title} - 이미지 ${modalImageIndex + 1}`}
                  className="max-h-[90vh] max-w-[90vw] object-contain"
                />

                {/* 이전/다음 버튼 */}
                {course.images.length > 1 && (
                  <>
                    <button
                      onClick={handleModalPrevImage}
                      className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={handleModalNextImage}
                      className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* 이미지 인디케이터 */}
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  {course.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setModalImageIndex(index)}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        index === modalImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>

                {/* 이미지 정보 */}
                <div className="absolute bottom-12 left-4 rounded bg-black/50 px-3 py-2 text-white">
                  <span className="text-sm">
                    {modalImageIndex + 1} / {course.images.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 코스 설명 */}
          <Card className="mb-8 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">코스 소개</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
                {course.summary}
              </p>
              <div className="whitespace-pre-line text-gray-600 dark:text-gray-400">
                {course.description}
              </div>
            </CardContent>
          </Card>

          {/* 상세 일정 */}
          <Card className="mb-8 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">📅 상세 일정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {course.itinerary.map((day, dayIndex) => (
                <div key={dayIndex} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Day {day.day}: {day.title}
                  </h3>
                  <div className="space-y-4">
                    {day.activities.map((activity, actIndex) => {
                      // 활동 타입에 따른 아이콘과 색상 설정
                      const getActivityIcon = (type) => {
                        switch (type) {
                          case 'transport':
                            return '✈️'
                          case 'attraction':
                            return '🏛️'
                          case 'restaurant':
                            return '🍽️'
                          case 'cafe':
                            return '☕'
                          case 'accommodation':
                            return '🏨'
                          default:
                            return '📍'
                        }
                      }

                      const getActivityColor = (type) => {
                        switch (type) {
                          case 'transport':
                            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          case 'attraction':
                            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          case 'restaurant':
                            return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          case 'cafe':
                            return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                          case 'accommodation':
                            return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          default:
                            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }
                      }

                      return (
                        <div
                          key={actIndex}
                          className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-600 dark:bg-gray-700"
                        >
                          <div className="flex gap-4">
                            <div
                              className={`flex-shrink-0 rounded px-3 py-1 text-sm font-medium ${getActivityColor(activity.type)}`}
                            >
                              {activity.time}
                            </div>
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-2">
                                <span className="text-lg">
                                  {getActivityIcon(activity.type)}
                                </span>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {activity.place}
                                </h4>
                                {activity.duration && (
                                  <Badge variant="outline" className="ml-auto">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {activity.duration >= 60
                                      ? `${Math.floor(activity.duration / 60)}시간`
                                      : `${activity.duration}분`}
                                  </Badge>
                                )}
                              </div>
                              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                {activity.description}
                              </p>
                              {activity.address && (
                                <div className="mb-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <MapPin className="h-3 w-3" />
                                  <span>{activity.address}</span>
                                </div>
                              )}
                              {activity.phone && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <span>📞</span>
                                  <span>{activity.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 여행 팁 */}
          <Card className="mb-8 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">💡 여행 팁</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {course.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 평가하기 */}
          <Card className="mb-8 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">
                해당 코스가 마음에 드시나요?
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                평가를 해주시면 개인화 추천 시 활용하여 최적의 여행지를 추천해
                드리겠습니다.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  onClick={() => handleRatingSubmit(5)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  👍 좋아요!
                </Button>
                <Button variant="outline" onClick={() => handleRatingSubmit(2)}>
                  👎 별로예요
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 댓글 섹션 */}
          <Card className="dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <MessageSquare className="h-5 w-5" />
                댓글 ({comments.length}건)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 댓글 작성 */}
              <div className="space-y-3">
                <Textarea
                  placeholder="이 여행 코스에 댓글을 남겨주세요..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="dark:border-gray-600 dark:bg-gray-700"
                />
                <Button onClick={handleCommentSubmit} size="sm">
                  댓글 등록
                </Button>
              </div>

              {/* AI 요약 */}
              {comments.length > 0 && (
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-800 dark:text-blue-200">
                    <Sparkles className="h-4 w-4" />
                    AI가 빠르게 요약해주는 사용자 후기!
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    대부분의 사용자들이 자연 경관과 힐링 요소에 만족하고 있으며,
                    특히 한라산 트레킹과 애월 카페거리를 추천하고 있습니다.
                  </p>
                </div>
              )}

              {/* 댓글 목록 */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-b pb-4 dark:border-gray-700"
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="font-medium dark:text-white">
                        {comment.user}
                      </span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < comment.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {comment.date}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {comment.content}
                    </p>
                    <div className="mt-2 flex items-center gap-4">
                      <Button variant="ghost" size="sm">
                        👍 도움이 돼요 ({comment.helpful})
                      </Button>
                      <Button variant="ghost" size="sm">
                        답글
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 예약 정보 */}
          <Card className="sticky top-4 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">여행 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  1인 기준
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {course.price}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="dark:text-gray-300">{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="dark:text-gray-300">연중 추천</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="dark:text-gray-300">{course.region}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium dark:text-white">포함사항</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {course.includes.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-green-500"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium dark:text-white">불포함사항</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {course.excludes.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-red-500"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Link to={`/customized-schedule?region=${course.region}`}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  맞춤 일정 만들기
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 주요 명소 */}
          <Card className="dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">🎯 주요 명소</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {course.highlights.map((highlight, index) => (
                  <Badge key={index} variant="outline" className="mr-2">
                    {highlight}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 태그 */}
          <Card className="dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">🏷️ 태그</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
