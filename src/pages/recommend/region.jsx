import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, MapPin } from '@/components/icons'

export default function RecommendRegionPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [selectedRegion, setSelectedRegion] = useState(null)

  const regions = {
    domestic: {
      title: '🇰🇷 대한민국',
      cities: [
        {
          id: 'seoul',
          name: '서울',
          description: '한국의 수도, 궁궐과 현대적 명소',
        },
        { id: 'busan', name: '부산', description: '해변과 항구의 도시' },
        { id: 'jeju', name: '제주', description: '아름다운 섬, 자연과 휴양' },
        {
          id: 'gangneung',
          name: '강릉·속초',
          description: '동해안의 바다와 산',
        },
        { id: 'gyeongju', name: '경주', description: '천년 고도, 역사와 문화' },
        { id: 'jeonju', name: '전주', description: '한옥마을과 전통 음식' },
        { id: 'yeosu', name: '여수', description: '아름다운 밤바다와 섬' },
        { id: 'incheon', name: '인천', description: '국제공항과 차이나타운' },
        { id: 'taean', name: '태안', description: '서해안의 해변과 낙조' },
        { id: 'pohang', name: '포항·안동', description: '전통문화와 자연경관' },
        {
          id: 'gapyeong',
          name: '가평·양평',
          description: '수도권 근교 휴양지',
        },
        {
          id: 'tongyeong',
          name: '통영·거제·남해',
          description: '남해안의 아름다운 섬들',
        },
      ],
    },
    japan: {
      title: '🇯🇵 일본',
      cities: [
        {
          id: 'tokyo',
          name: '도쿄',
          description: '일본의 수도, 현대와 전통의 조화',
        },
        { id: 'osaka', name: '오사카', description: '음식의 도시, 우사카죠' },
        {
          id: 'fukuoka',
          name: '후쿠오카',
          description: '한국과 가까운 규슈의 중심',
        },
        { id: 'okinawa', name: '오키나와', description: '열대의 파라다이스' },
        { id: 'shizuoka', name: '시즈오카', description: '후지산과 온천' },
        { id: 'nagoya', name: '나고야', description: '중부지방의 중심도시' },
        {
          id: 'sapporo',
          name: '삿포로',
          description: '홋카이도의 중심, 눈과 맥주',
        },
      ],
    },
    china: {
      title: '🇨🇳 중화/중국',
      cities: [
        {
          id: 'beijing',
          name: '베이징',
          description: '중국의 수도, 자금성과 만리장성',
        },
        { id: 'shanghai', name: '상하이', description: '중국 최대의 상업도시' },
        {
          id: 'hongkong',
          name: '홍콩',
          description: '동서양이 만나는 국제도시',
        },
        {
          id: 'taipei',
          name: '타이베이',
          description: '대만의 수도, 야시장과 온천',
        },
        {
          id: 'qingdao',
          name: '칭다오',
          description: '독일풍 건축과 맥주의 도시',
        },
        {
          id: 'kaohsiung',
          name: '가오슝',
          description: '대만 남부의 항구도시',
        },
      ],
    },
    europe: {
      title: '🇪🇺 유럽',
      cities: [
        {
          id: 'paris',
          name: '파리',
          description: '사랑의 도시, 에펠탑과 루브르',
        },
        { id: 'london', name: '런던', description: '영국의 수도, 역사와 전통' },
        { id: 'rome', name: '로마', description: '영원한 도시, 콜로세움' },
        {
          id: 'barcelona',
          name: '바르셀로나',
          description: '가우디의 도시, 사그라다 파밀리아',
        },
        { id: 'prague', name: '프라하', description: '동유럽의 보석' },
        { id: 'vienna', name: '빈', description: '음악의 도시, 오스트리아' },
        {
          id: 'amsterdam',
          name: '암스테르담',
          description: '운하의 도시, 네덜란드',
        },
        { id: 'zurich', name: '취리히', description: '스위스의 금융중심지' },
      ],
    },
    asia: {
      title: '🌏 동남아시아',
      cities: [
        {
          id: 'bangkok',
          name: '방콕',
          description: '태국의 수도, 왓 포와 왕궁',
        },
        {
          id: 'singapore',
          name: '싱가포르',
          description: '동남아의 허브, 가든시티',
        },
        { id: 'bali', name: '발리', description: '인도네시아의 힐링 아일랜드' },
        { id: 'phuket', name: '푸켓', description: '태국 남부의 해변 리조트' },
        { id: 'danang', name: '다낭', description: '베트남 중부의 해변도시' },
        {
          id: 'hanoi',
          name: '하노이',
          description: '베트남의 수도, 역사와 문화',
        },
        { id: 'cebu', name: '세부', description: '필리핀의 리조트 섬' },
        {
          id: 'boracay',
          name: '보라카이',
          description: '필리핀의 화이트 비치',
        },
      ],
    },
  }

  const handleRegionSelect = (regionId, regionName) => {
    setSelectedRegion({ id: regionId, name: regionName })
  }

  const handleNext = () => {
    if (selectedRegion) {
      navigate(`/recommend/period?region=${selectedRegion.id}`)
    }
  }

  const handleBack = () => {
    navigate('/recommend')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-gray-500">1/5</span>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          떠나고 싶은 도시는?
        </h1>
        <p className="text-gray-600">도시 1곳을 선택해주세요.</p>
      </div>

      {/* 지역 선택 */}
      <div className="space-y-8">
        {Object.entries(regions).map(([categoryKey, category]) => (
          <div key={categoryKey}>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
              <MapPin className="h-5 w-5" />
              {category.title}
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {category.cities.map((city) => (
                <Card
                  key={city.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedRegion?.id === city.id
                      ? 'bg-blue-50 ring-2 ring-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleRegionSelect(city.id, city.name)}
                >
                  <CardContent className="p-4">
                    <h3 className="mb-1 font-semibold text-gray-900">
                      {city.name}
                    </h3>
                    <p className="text-sm leading-tight text-gray-600">
                      {city.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 선택된 지역 표시 */}
      {selectedRegion && (
        <div className="mt-8 rounded-lg bg-blue-50 p-4">
          <p className="mb-2 text-sm text-blue-600">선택된 여행지</p>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {selectedRegion.name}
          </Badge>
        </div>
      )}

      {/* 다음 버튼 */}
      <div className="mt-12 flex justify-center">
        <Button
          onClick={handleNext}
          disabled={!selectedRegion}
          className="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 disabled:bg-gray-300"
          size="lg"
        >
          다음
        </Button>
      </div>
    </div>
  )
}
