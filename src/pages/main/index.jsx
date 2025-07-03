import { useState } from 'react'

import { MapPin, CalendarIcon, Sun } from '@/components/icons'
import { recommendedDestinations, travelThemes } from '@/data'
import { Chatbot } from '@/components/common/chatbot'
import { Button } from '@/components/ui/button'
import { RecommendedDestCarousel } from './RecommendedDestCarousel'

/**
 * URL: '/'
 */
export function MainPage() {
  const [searchData, setSearchData] = useState({
    departure: '',
    date: null,
    theme: '',
  })

  const handleSearch = () => {
    // TODO: 검색 로직 구현
    console.log('검색 데이터:', searchData)
  }

  return (
    <div className="relative min-h-screen">
      {/* Hero Section with Background Image - 다크모드 영향받지 않음 */}
      <section
        className="relative flex min-h-[80vh] flex-col justify-center pt-12 pb-8 text-center"
        style={{
          // Uncomment the line below and comment out gradient after uploading actual image file
          backgroundImage: 'url(/home-background.jpg)',
          // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Content */}
        <div className="relative z-10">
          <h1 className="mb-2 text-4xl font-bold text-white drop-shadow-lg">
            &quot;날씨 기반 스마트 여행 플래너&quot;
          </h1>
          <p className="mb-8 text-lg text-white/90 drop-shadow-md">
            실시간 날씨 정보를 기반으로 최적의 여행지를 추천해드립니다
          </p>
          <div className="mx-auto mb-10 max-w-2xl rounded-2xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm dark:bg-gray-900/95">
            <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-foreground flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4" />
                  출발지
                </label>
                <input
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                  placeholder="서울, 부산, 대구..."
                  value={searchData.departure}
                  onChange={(e) =>
                    setSearchData((prev) => ({
                      ...prev,
                      departure: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-foreground flex items-center gap-2 text-sm font-medium">
                  <CalendarIcon className="h-4 w-4" />
                  날짜
                </label>
                <input
                  type="date"
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                  value={searchData.date ? searchData.date : ''}
                  onChange={(e) =>
                    setSearchData((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-foreground flex items-center gap-2 text-sm font-medium">
                  <CalendarIcon className="h-4 w-4" />
                  테마
                </label>
                <select
                  className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                  value={searchData.theme}
                  onChange={(e) =>
                    setSearchData((prev) => ({
                      ...prev,
                      theme: e.target.value,
                    }))
                  }
                >
                  {travelThemes.map((theme) => (
                    <option key={theme.value} value={theme.value}>
                      {theme.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                className="mt-6 h-10 w-full font-semibold"
                variant="outline"
                onClick={handleSearch}
              >
                여행지 찾기
              </Button>
            </div>
            <div className="mt-4 text-center">
              <p className="text-muted-foreground text-sm">
                &quot;날씨 기반으로 딱 맞는 여행 추천 받기&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the content with responsive background - 다크모드 적용 */}
      <div className="bg-white transition-colors duration-300 dark:bg-gray-900">
        <section className="mb-12 py-8">
          <h2 className="text-foreground mb-4 text-center text-2xl font-bold">
            추천 여행지
          </h2>
          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <RecommendedDestCarousel destinations={recommendedDestinations} />
            </div>
          </div>
        </section>

        <section className="mx-auto mb-16 grid max-w-5xl grid-cols-1 gap-6 px-4 md:grid-cols-3">
          <div className="bg-card border-border rounded-xl border p-8 text-center shadow-md transition-shadow duration-300 hover:shadow-lg">
            <Sun className="mx-auto mb-2 h-8 w-8 text-blue-400 dark:text-blue-300" />
            <h3 className="text-foreground text-lg font-semibold">
              실시간 날씨
            </h3>
            <p className="text-muted-foreground">
              최신 날씨 정보로 정확한 여행 계획을 세워보세요
            </p>
          </div>
          <div className="bg-card border-border rounded-xl border p-8 text-center shadow-md transition-shadow duration-300 hover:shadow-lg">
            <MapPin className="mx-auto mb-2 h-8 w-8 text-green-400 dark:text-green-300" />
            <h3 className="text-foreground text-lg font-semibold">맞춤 추천</h3>
            <p className="text-muted-foreground">
              개인 취향과 날씨를 고려한 맞춤형 여행지 추천
            </p>
          </div>
          <div className="bg-card border-border rounded-xl border p-8 text-center shadow-md transition-shadow duration-300 hover:shadow-lg">
            <CalendarIcon className="mx-auto mb-2 h-8 w-8 text-purple-400 dark:text-purple-300" />
            <h3 className="text-foreground text-lg font-semibold">여행 계획</h3>
            <p className="text-muted-foreground">
              체계적인 여행 계획과 일정 관리
            </p>
          </div>
        </section>
      </div>

      <Chatbot />
    </div>
  )
}
