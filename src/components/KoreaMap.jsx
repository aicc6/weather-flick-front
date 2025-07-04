import { useState } from 'react'
import { MapPin } from '@/components/icons'

const KoreaMap = ({ cities, selectedRegion, onRegionSelect }) => {
  const [hoveredRegion, setHoveredRegion] = useState(null)

  // 더 정확한 행정구역별 SVG 패스
  const provinces = {
    // 서울특별시
    seoul: {
      path: 'M 345 185 L 355 180 L 365 185 L 360 195 L 350 195 L 340 190 Z',
      name: '서울특별시',
    },
    // 인천광역시
    incheon: {
      path: 'M 285 175 L 295 170 L 305 175 L 310 185 L 300 190 L 290 185 L 280 180 Z',
      name: '인천광역시',
    },
    // 경기도
    gyeonggi: {
      path: 'M 280 120 L 320 115 L 360 120 L 400 125 L 430 140 L 450 160 L 460 180 L 465 200 L 460 220 L 450 240 L 440 260 L 420 275 L 400 285 L 380 290 L 360 285 L 340 280 L 320 275 L 300 270 L 280 265 L 260 260 L 240 250 L 225 235 L 215 220 L 210 200 L 215 180 L 225 160 L 240 145 L 255 135 L 270 125 Z',
      name: '경기도',
    },
    // 강원도
    gangwon: {
      path: 'M 465 70 L 500 65 L 535 70 L 570 80 L 595 100 L 610 125 L 620 150 L 625 175 L 620 200 L 615 225 L 605 250 L 590 275 L 575 295 L 555 310 L 535 320 L 515 325 L 495 320 L 475 315 L 460 305 L 450 290 L 445 275 L 450 260 L 460 245 L 470 230 L 475 215 L 470 200 L 465 185 L 470 170 L 475 155 L 480 140 L 485 125 L 480 110 L 475 95 L 470 80 Z',
      name: '강원도',
    },
    // 충청북도
    chungbuk: {
      path: 'M 340 280 L 380 285 L 420 290 L 460 305 L 485 320 L 500 340 L 510 360 L 505 380 L 495 400 L 480 415 L 460 425 L 440 430 L 420 425 L 400 420 L 380 415 L 360 410 L 340 405 L 325 395 L 315 380 L 310 365 L 315 350 L 325 335 L 335 320 L 340 305 Z',
      name: '충청북도',
    },
    // 충청남도
    chungnam: {
      path: 'M 180 260 L 220 255 L 260 260 L 300 270 L 340 280 L 360 300 L 375 320 L 380 340 L 375 360 L 365 380 L 350 395 L 330 405 L 310 410 L 290 405 L 270 400 L 250 395 L 230 390 L 210 385 L 190 380 L 170 375 L 155 370 L 145 355 L 140 340 L 145 325 L 155 310 L 170 295 L 180 280 Z',
      name: '충청남도',
    },
    // 대전광역시
    daejeon: {
      path: 'M 315 335 L 325 330 L 335 335 L 330 345 L 320 345 L 310 340 Z',
      name: '대전광역시',
    },
    // 세종특별자치시
    sejong: {
      path: 'M 305 325 L 315 320 L 325 325 L 320 335 L 310 335 L 300 330 Z',
      name: '세종특별자치시',
    },
    // 전라북도
    jeonbuk: {
      path: 'M 200 380 L 240 375 L 280 380 L 320 390 L 360 405 L 385 425 L 400 445 L 405 465 L 400 485 L 390 505 L 375 520 L 355 530 L 335 535 L 315 530 L 295 525 L 275 520 L 255 515 L 235 510 L 215 505 L 195 500 L 175 495 L 160 485 L 150 470 L 145 455 L 150 440 L 160 425 L 175 410 L 190 400 Z',
      name: '전라북도',
    },
    // 전라남도
    jeonnam: {
      path: 'M 145 470 L 175 465 L 205 470 L 235 480 L 265 495 L 295 510 L 325 525 L 355 540 L 380 555 L 395 575 L 400 595 L 395 615 L 385 635 L 370 650 L 350 660 L 330 665 L 310 670 L 290 665 L 270 660 L 250 655 L 230 650 L 210 645 L 190 640 L 170 635 L 150 630 L 130 625 L 115 615 L 105 600 L 100 585 L 105 570 L 115 555 L 130 540 L 145 525 L 155 510 L 150 495 L 145 480 Z',
      name: '전라남도',
    },
    // 광주광역시
    gwangju: {
      path: 'M 235 515 L 245 510 L 255 515 L 250 525 L 240 525 L 230 520 Z',
      name: '광주광역시',
    },
    // 경상북도
    gyeongbuk: {
      path: 'M 460 290 L 500 285 L 540 290 L 580 305 L 615 325 L 640 350 L 655 375 L 665 400 L 670 425 L 665 450 L 655 475 L 640 495 L 620 510 L 600 520 L 580 525 L 560 520 L 540 515 L 520 510 L 500 505 L 480 500 L 465 490 L 455 475 L 450 460 L 455 445 L 465 430 L 475 415 L 485 400 L 490 385 L 485 370 L 480 355 L 475 340 L 470 325 L 465 310 Z',
      name: '경상북도',
    },
    // 대구광역시
    daegu: {
      path: 'M 535 395 L 545 390 L 555 395 L 550 405 L 540 405 L 530 400 Z',
      name: '대구광역시',
    },
    // 경상남도
    gyeongnam: {
      path: 'M 405 485 L 445 480 L 485 485 L 525 495 L 565 510 L 595 530 L 615 550 L 625 570 L 620 590 L 610 610 L 595 625 L 575 635 L 555 640 L 535 635 L 515 630 L 495 625 L 475 620 L 455 615 L 435 610 L 415 605 L 400 595 L 390 580 L 385 565 L 390 550 L 400 535 L 410 520 L 415 505 Z',
      name: '경상남도',
    },
    // 부산광역시
    busan: {
      path: 'M 565 555 L 575 550 L 585 555 L 580 565 L 570 565 L 560 560 Z',
      name: '부산광역시',
    },
    // 울산광역시
    ulsan: {
      path: 'M 585 475 L 595 470 L 605 475 L 600 485 L 590 485 L 580 480 Z',
      name: '울산광역시',
    },
    // 제주특별자치도
    jeju: {
      path: 'M 250 720 L 300 715 L 350 720 L 400 730 L 420 745 L 425 760 L 415 775 L 400 785 L 380 790 L 360 795 L 340 790 L 320 785 L 300 780 L 280 775 L 260 770 L 245 760 L 235 745 L 240 730 Z',
      name: '제주특별자치도',
    },
  }

  // 각 도시의 정확한 위치
  const cityPositions = {
    seoul: { x: 350, y: 190 },
    busan: { x: 575, y: 560 },
    jeju: { x: 330, y: 755 },
    gangneung: { x: 580, y: 160 },
    gyeongju: { x: 610, y: 430 },
    jeonju: { x: 280, y: 450 },
    yeosu: { x: 340, y: 620 },
    incheon: { x: 295, y: 180 },
    taean: { x: 200, y: 340 },
    pohang: { x: 630, y: 370 },
    gapyeong: { x: 400, y: 160 },
    tongyeong: { x: 520, y: 610 },
    daegu: { x: 545, y: 400 },
    gwangju: { x: 245, y: 520 },
    daejeon: { x: 325, y: 340 },
    ulsan: { x: 595, y: 480 },
    chuncheon: { x: 460, y: 130 },
    mokpo: { x: 160, y: 600 },
    sokcho: { x: 600, y: 100 },
    andong: { x: 520, y: 350 },
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-4">
      <div className="relative rounded-lg bg-gradient-to-br from-gray-50 to-blue-50 p-6 shadow-xl dark:from-gray-900 dark:to-gray-800">
        <h3 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
          대한민국 지도에서 도시를 선택하세요
        </h3>

        <div className="relative flex h-[700px] w-full items-center justify-center">
          <svg
            width="800"
            height="850"
            viewBox="0 0 800 850"
            className="h-full w-full max-w-4xl"
            style={{ backgroundColor: '#f8fafc' }}
          >
            {/* 배경 그라데이션 */}
            <defs>
              <filter
                id="dropShadow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                <feOffset dx="1" dy="1" result="offset" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.2" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <pattern
                id="seaPattern"
                patternUnits="userSpaceOnUse"
                width="20"
                height="20"
              >
                <circle cx="10" cy="10" r="1" fill="#cbd5e1" opacity="0.3" />
              </pattern>
            </defs>

            {/* 바다 배경 */}
            <rect width="800" height="850" fill="#e2e8f0" opacity="0.3" />

            {/* 각 행정구역 렌더링 */}
            {Object.entries(provinces).map(([key, province]) => (
              <path
                key={key}
                d={province.path}
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                filter="url(#dropShadow)"
                className="transition-colors duration-200 hover:fill-gray-100"
                opacity="0.95"
              />
            ))}

            {/* 주요 섬들 */}
            {/* 독도 */}
            <circle
              cx="680"
              cy="140"
              r="3"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            <circle
              cx="685"
              cy="142"
              r="2"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {/* 울릉도 */}
            <circle
              cx="650"
              cy="160"
              r="8"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />

            {/* 각 도시 마커 */}
            {cities.map((city) => {
              const position = cityPositions[city.id]
              if (!position) return null

              const isSelected = selectedRegion?.id === city.id
              const isHovered = hoveredRegion === city.id

              return (
                <g key={city.id}>
                  {/* 선택된 도시 하이라이트 */}
                  {isSelected && (
                    <>
                      <circle
                        cx={position.x}
                        cy={position.y}
                        r="25"
                        fill="rgba(59, 130, 246, 0.2)"
                        stroke="rgba(59, 130, 246, 0.4)"
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                      <circle
                        cx={position.x}
                        cy={position.y}
                        r="30"
                        fill="none"
                        stroke="rgba(59, 130, 246, 0.6)"
                        strokeWidth="1"
                        className="animate-ping"
                      />
                    </>
                  )}

                  {/* 도시 마커 */}
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={isSelected ? 12 : isHovered ? 10 : 8}
                    fill={
                      isSelected ? '#2563eb' : isHovered ? '#3b82f6' : '#dc2626'
                    }
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:scale-110"
                    onClick={() => onRegionSelect(city.id, city.name)}
                    onMouseEnter={() => setHoveredRegion(city.id)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                  />

                  {/* 도시 이름 배경 */}
                  <rect
                    x={position.x - 20}
                    y={position.y - 30}
                    width="40"
                    height="16"
                    rx="8"
                    fill="rgba(255,255,255,0.95)"
                    stroke="rgba(203, 213, 225, 0.8)"
                    strokeWidth="1"
                    className="drop-shadow-sm"
                  />

                  {/* 도시 이름 라벨 */}
                  <text
                    x={position.x}
                    y={position.y - 20}
                    textAnchor="middle"
                    className={`cursor-pointer text-xs font-medium transition-all duration-200 ${
                      isSelected
                        ? 'font-semibold text-blue-700'
                        : isHovered
                          ? 'text-blue-600'
                          : 'text-gray-700'
                    }`}
                    onClick={() => onRegionSelect(city.id, city.name)}
                    onMouseEnter={() => setHoveredRegion(city.id)}
                    onMouseLeave={() => setHoveredRegion(null)}
                  >
                    {city.name}
                  </text>
                </g>
              )
            })}

            {/* 지도 제목 */}
            <text
              x="400"
              y="35"
              textAnchor="middle"
              className="text-xl font-bold text-gray-700 dark:text-gray-300"
            >
              대한민국
            </text>

            {/* 범례 */}
            <g transform="translate(50, 750)">
              <rect
                x="0"
                y="0"
                width="180"
                height="80"
                fill="rgba(255,255,255,0.95)"
                stroke="#d1d5db"
                strokeWidth="1"
                rx="6"
              />
              <text
                x="10"
                y="18"
                className="text-sm font-semibold text-gray-700"
              >
                도시 선택
              </text>

              <circle cx="20" cy="35" r="6" fill="#dc2626" />
              <text x="32" y="39" className="text-xs text-gray-600">
                선택 가능
              </text>

              <circle cx="20" cy="52" r="6" fill="#2563eb" />
              <text x="32" y="56" className="text-xs text-gray-600">
                선택됨
              </text>

              <text x="10" y="72" className="text-xs text-gray-500">
                클릭하여 도시를 선택하세요
              </text>
            </g>

            {/* 방향 표시 */}
            <g transform="translate(720, 80)">
              <circle
                cx="0"
                cy="0"
                r="20"
                fill="white"
                stroke="#9ca3af"
                strokeWidth="1.5"
              />
              <path d="M 0 -15 L 4 0 L 0 15 L -4 0 Z" fill="#374151" />
              <text
                x="0"
                y="-25"
                textAnchor="middle"
                className="text-xs font-medium text-gray-600"
              >
                N
              </text>
            </g>
          </svg>
        </div>

        {/* 호버된 도시 정보 */}
        {hoveredRegion && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-md dark:border-gray-600 dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {cities.find((city) => city.id === hoveredRegion)?.name}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {cities.find((city) => city.id === hoveredRegion)?.description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default KoreaMap
