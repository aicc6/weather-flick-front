import { useState } from 'react'
import { Link } from 'react-router-dom'

import { recommendedDestinations } from '@/data'
import { Chatbot } from '@/components/common/chatbot'
import { RecommendedDestCarousel } from './RecommendedDestCarousel'
import { useScrollFadeIn } from '@/hooks/useScrollFadeIn'

/**
 * URL: '/'
 */
export function MainPage() {
  const [_searchData, _setSearchData] = useState({
    departure: '',
    date: null,
    theme: '',
  })

  const _handleSearch = () => {
    // TODO: 검색 로직 구현
    console.log('검색 데이터:', _searchData)
  }

  // 각 서비스별 설명 데이터
  const serviceSections = [
    {
      title: '여행지추천',
      desc: '실시간 날씨와 다양한 테마, 지역, 계절을 고려해 지금 가장 좋은 여행지를 추천해드립니다. 여행지별 날씨, 특징, 추천 이유를 한눈에 확인하세요.',
      img: '/recommend.png',
    },
    {
      title: '맞춤 일정',
      desc: '간단한 질문에 답하면 AI가 동행자, 기간, 취향, 스타일에 맞는 완벽한 여행 일정을 자동으로 설계해드립니다. 누구나 쉽고 빠르게 나만의 여행 계획을 받아보세요.',
      img: '/custom.png',
    },
    {
      title: '여행 플래너',
      desc: '여행 일정, 장소, 날씨, 추천 코스까지 한 번에 관리! 여행 준비부터 일정 저장, 공유까지 스마트하게 경험하세요.',
      img: '/planner.png',
    },
  ]
  const serviceFadeIns = [
    useScrollFadeIn('up', 0.7, 0),
    useScrollFadeIn('up', 0.7, 0.4),
    useScrollFadeIn('up', 0.7, 0.6),
  ]

  // 이미지 영역 스타일 통일
  const imageBoxClass =
    'flex-shrink-0 flex items-center justify-center w-44 h-44 md:w-52 md:h-52 bg-white rounded-2xl shadow-lg overflow-hidden'

  // 각 서비스별 링크 경로
  const serviceLinks = ['/recommend', '/customized-schedule', '/planner']

  return (
    <div className="relative h-full">
      {/* Hero Section with Background Image - 다크모드 영향받지 않음 */}
      <section
        className="relative flex min-h-[80vh] flex-col justify-center pt-12 pb-8 text-center"
        style={{
          backgroundImage: 'url(/home-background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 dark:bg-gray-900/60"></div>

        {/* Content */}
        <div className="relative z-10">
          <h1 className="mb-5 text-5xl font-bold text-white drop-shadow-lg">
            &quot;날씨 기반 스마트 여행 플래너&quot;
          </h1>
          <p className="mb-8 text-lg text-white/90 drop-shadow-md">
            실시간 날씨 정보를 기반으로 최적의 여행지를 추천해드립니다
          </p>
        </div>
      </section>

      {/* Rest of the content with responsive background - 다크모드 적용 */}
      <div className="bg-white transition-colors duration-300 dark:bg-gray-900">
        <section className="mb-12 py-8">
          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <RecommendedDestCarousel destinations={recommendedDestinations} />
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 pb-16 md:grid-cols-3"></section>

        {/* 서비스별 설명 섹션 (메인 하단, 스크롤 시 fade-in) */}
        <div className="mt-32 space-y-32 pb-32">
          {serviceSections.map((sec, idx) => {
            const fadeProps = serviceFadeIns[idx]
            const link = serviceLinks[idx]
            return (
              <Link
                to={link}
                key={sec.title}
                ref={fadeProps.ref}
                style={fadeProps.style}
                className="group mx-auto flex max-w-4xl cursor-pointer flex-col items-center gap-10 px-4 focus:ring-2 focus:ring-blue-400 focus:outline-none md:flex-row"
                tabIndex={0}
                aria-label={sec.title + ' 서비스로 이동'}
              >
                <div
                  className={
                    imageBoxClass +
                    ' transition-transform duration-200 group-hover:scale-105'
                  }
                >
                  {sec.img ? (
                    <img
                      src={sec.img}
                      alt={sec.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="h-full w-full bg-blue-100" />
                  )}
                </div>
                <div className="flex-1 text-left md:pl-6">
                  <h2 className="mb-3 text-3xl font-bold transition-colors duration-200 group-hover:text-blue-600">
                    {sec.title}
                  </h2>
                  <p className="text-lg leading-relaxed text-gray-600">
                    {sec.desc}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <Chatbot />
    </div>
  )
}
