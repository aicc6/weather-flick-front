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
        { id: 'daegu', name: '대구', description: '약령시와 근대골목' },
        { id: 'gwangju', name: '광주', description: '예술과 문화의 도시' },
        { id: 'daejeon', name: '대전', description: '과학기술의 중심지' },
        { id: 'ulsan', name: '울산', description: '고래와 산업의 도시' },
        { id: 'chuncheon', name: '춘천', description: '호수와 닭갈비의 도시' },
        { id: 'mokpo', name: '목포', description: '서남해안의 항구도시' },
        { id: 'sokcho', name: '속초', description: '설악산과 동해의 만남' },
        { id: 'andong', name: '안동', description: '전통문화와 한옥마을' },
      ],
    },
  }

  const handleRegionSelect = (regionId, regionName) => {
    setSelectedRegion({ id: regionId, name: regionName })
  }

  const handleNext = () => {
    if (selectedRegion) {
      navigate(`/customized-schedule/period?region=${selectedRegion.id}`)
    }
  }

  const handleBack = () => {
    navigate('/customized-schedule')
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
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            1/5
          </span>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          떠나고 싶은 도시는?
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          도시 1곳을 선택해주세요.
        </p>
      </div>

      {/* 지역 선택 */}
      <div className="space-y-8">
        {Object.entries(regions).map(([categoryKey, category]) => (
          <div key={categoryKey}>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
              <MapPin className="h-5 w-5" />
              {category.title}
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {category.cities.map((city) => (
                <Card
                  key={city.id}
                  className={`cursor-pointer transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
                    selectedRegion?.id === city.id
                      ? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/20 dark:ring-blue-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => handleRegionSelect(city.id, city.name)}
                >
                  <CardContent className="p-4">
                    <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                      {city.name}
                    </h3>
                    <p className="text-sm leading-tight text-gray-600 dark:text-gray-300">
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
        <div className="mt-8 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="mb-2 text-sm text-blue-600 dark:text-blue-400">
            선택된 여행지
          </p>
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
          >
            {selectedRegion.name}
          </Badge>
        </div>
      )}

      {/* 다음 버튼 */}
      <div className="mt-12 flex justify-center">
        <Button
          onClick={handleNext}
          disabled={!selectedRegion}
          className="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600"
          size="lg"
        >
          다음
        </Button>
      </div>
    </div>
  )
}
