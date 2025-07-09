import { useState, useRef, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { recommendedDestinations } from '@/data'
import { Chatbot } from '@/components/common/chatbot'
import { RecommendedDestCarousel } from './RecommendedDestCarousel'
import { useScrollFadeIn } from '@/hooks/useScrollFadeIn'

/**
 * URL: '/'
 */
export function MainPage() {
  // 검색 데이터(현재 미사용)
  const [_searchData, _setSearchData] = useState({
    departure: '',
    date: null,
    theme: '',
  })

  // 배경 위치 상태
  const [bgPos, setBgPos] = useState('center')
  const heroRef = useRef(null)
  const animationFrame = useRef(null)

  // 자연스러운 이동을 위한 상태
  const targetPercent = useRef(50) // 0~100
  const currentPercent = useRef(50)

  // 마우스 이동 시 목표값만 갱신
  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return
    const { left, width } = heroRef.current.getBoundingClientRect()
    const x = e.clientX - left
    const percent = Math.max(0, Math.min(1, x / width))
    targetPercent.current = percent * 90 // 0~90%
  }, [])

  // 부드럽게 따라가는 애니메이션 루프
  useEffect(() => {
    let running = true
    function animate() {
      if (!running) return
      const prev = currentPercent.current
      currentPercent.current +=
        (targetPercent.current - currentPercent.current) * 0.15 // 더 빠르고 부드럽게
      // 변화량이 충분히 클 때만 setState
      if (Math.abs(currentPercent.current - prev) > 0.1) {
        setBgPos(`${currentPercent.current}% center`)
      }
      animationFrame.current = requestAnimationFrame(animate)
    }
    animationFrame.current = requestAnimationFrame(animate)
    return () => {
      running = false
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current)
    }
  }, [])

  // 마우스 이벤트 연결 (삭제)

  const handleSearch = () => {
    // TODO: 검색 로직 구현
  }

  // 각 서비스별 설명 데이터
  const serviceSections = [
    {
      title: '🌤️ 여행지추천',
      desc: '실시간 날씨와 다양한 테마, 지역, 계절을 고려해 지금 가장 좋은 여행지를 추천해드립니다. 여행지별 날씨, 특징, 추천 이유를 한눈에 확인하세요.',
      img: '/recommend.png',
      bgClass: 'weather-sunny',
    },
    {
      title: '🎯 맞춤 일정',
      desc: '간단한 질문에 답하면 AI가 동행자, 기간, 취향, 스타일에 맞는 완벽한 여행 일정을 자동으로 설계해드립니다. 누구나 쉽고 빠르게 나만의 여행 계획을 받아보세요.',
      img: '/custom.png',
      bgClass: 'weather-rainy',
    },
    {
      title: '📋 여행 플래너',
      desc: '여행 일정, 장소, 날씨, 추천 코스까지 한 번에 관리! 여행 준비부터 일정 저장, 공유까지 스마트하게 경험하세요.',
      img: '/planner.png',
      bgClass: 'weather-sunset',
    },
  ]
  const serviceFadeIns = [
    useScrollFadeIn('up', 0.7, 0),
    useScrollFadeIn('up', 0.7, 0.4),
    useScrollFadeIn('up', 0.7, 0.6),
  ]

  // 이미지 영역 스타일 업데이트 - 날씨 테마
  const imageBoxClass =
    'flex-shrink-0 flex items-center justify-center w-44 h-44 md:w-52 md:h-52 weather-card shadow-lg overflow-hidden'

  // 각 서비스별 링크 경로
  const serviceLinks = ['/recommend', '/customized-schedule', '/planner']

  return (
    <div className="relative h-full">
      {/* Hero Section with Background Image - 날씨 테마 적용 */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative flex min-h-[80vh] flex-col justify-center pt-12 pb-8 text-center"
        style={{
          backgroundImage: 'url(/home-background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: bgPos,
          backgroundRepeat: 'no-repeat',
          transition: 'background-position 0.05s linear',
        }}
      >
        {/* Weather-themed overlay */}
        <div className="from-sky-blue/30 via-cloud-white/20 to-sunshine-yellow/30 dark:from-storm-gray-dark/60 dark:via-storm-gray/40 dark:to-sky-blue/20 absolute inset-0 bg-gradient-to-br"></div>

        {/* Content */}
        <div className="relative z-10">
          <h1 className="mb-5 text-5xl font-bold text-white drop-shadow-lg">
            &quot;날씨 기반 스마트 여행 플래너&quot;
          </h1>
          <p className="mb-8 text-lg text-white/95 drop-shadow-md">
            실시간 날씨 정보를 기반으로 최적의 여행지를 추천해드립니다
          </p>

          {/* Call to Action Button */}
          <div className="mt-8"></div>
        </div>
      </section>

      {/* Rest of the content with weather theme background */}
      <div className="bg-background">
        <section className="from-sky-blue-light/20 dark:from-sky-blue/10 bg-gradient-to-b to-transparent py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-foreground mb-8 text-center text-3xl font-bold">
              ☀️ 오늘의 추천 여행지
            </h2>
            <div className="flex justify-center">
              <div className="w-full max-w-5xl">
                <RecommendedDestCarousel
                  destinations={recommendedDestinations}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 서비스별 설명 섹션 - 날씨 테마 적용 */}
        <div className="container mx-auto mt-12 space-y-20 px-4 pb-20">
          <div className="mb-16 text-center">
            <h2 className="text-foreground mb-4 text-4xl font-bold">
              🌈 Weather Flick 서비스
            </h2>
            <p className="text-muted-foreground text-lg">
              날씨를 기반으로 한 완벽한 여행 경험을 제공합니다
            </p>
          </div>

          {serviceSections.map((sec, idx) => {
            const fadeProps = serviceFadeIns[idx]
            const link = serviceLinks[idx]
            const isEven = idx % 2 === 0

            return (
              <Link
                to={link}
                key={sec.title}
                ref={fadeProps.ref}
                style={fadeProps.style}
                className={`group weather-card focus:ring-sky-blue mx-auto flex max-w-6xl cursor-pointer flex-col items-center gap-10 rounded-2xl px-6 py-8 hover:shadow-xl focus:ring-2 focus:outline-none ${
                  isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
                tabIndex={0}
                aria-label={sec.title + ' 서비스로 이동'}
              >
                <div className={imageBoxClass}>
                  {sec.img ? (
                    <img
                      src={sec.img}
                      alt={sec.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="bg-sky-blue-light h-full w-full" />
                  )}
                </div>

                <div
                  className={`flex-1 text-center ${isEven ? 'md:pl-8 md:text-left' : 'md:pr-8 md:text-right'}`}
                >
                  <div
                    className={`mb-4 inline-block rounded-full px-4 py-2 text-sm font-semibold ${sec.bgClass}`}
                  >
                    서비스 {idx + 1}
                  </div>
                  <h3 className="text-foreground mb-4 text-3xl font-bold">
                    {sec.title}
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {sec.desc}
                  </p>

                  <div className="mt-6">
                    <span className="weather-button inline-flex items-center rounded-full px-6 py-2 text-sm font-medium text-white">
                      자세히 보기 →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Bottom CTA Section */}
        <section className="from-sky-blue-light/30 via-sunshine-yellow-light/20 to-sunset-orange-light/30 dark:from-sky-blue/10 dark:via-sunshine-yellow/5 dark:to-sunset-orange/10 bg-gradient-to-br py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="weather-card glass-effect mx-auto max-w-2xl p-8">
              <h2 className="text-foreground mb-4 text-3xl font-bold">
                🌟 지금 바로 시작하세요!
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                날씨를 고려한 완벽한 여행 계획을 세워보세요
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  to="/planner"
                  className="sunny-button rounded-full px-8 py-3 font-semibold"
                >
                  ✈️ 여행 계획 세우기
                </Link>
                <Link
                  to="/recommend"
                  className="weather-button rounded-full px-8 py-3 font-semibold text-white"
                >
                  🗺️ 여행지 둘러보기
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Chatbot />
    </div>
  )
}
