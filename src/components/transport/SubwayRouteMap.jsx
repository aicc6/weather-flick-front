import React from 'react'

/**
 * 지하철 노선도 스타일 컴포넌트
 * ODsay API의 stations 데이터를 시각적으로 표시
 */
const SubwayRouteMap = ({ path, className = '' }) => {
  const { stations = [], lane = {}, start_station, end_station } = path

  if (!stations.length) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        상세 노선 정보가 없습니다
      </div>
    )
  }

  // 지하철 노선별 색상 매핑
  const getLineColor = (lineName) => {
    const name = lineName.toLowerCase()
    if (name.includes('1호선')) return 'bg-blue-600'
    if (name.includes('2호선')) return 'bg-green-600'
    if (name.includes('3호선')) return 'bg-orange-500'
    if (name.includes('4호선')) return 'bg-sky-500'
    if (name.includes('5호선')) return 'bg-purple-600'
    if (name.includes('6호선')) return 'bg-amber-600'
    if (name.includes('7호선')) return 'bg-emerald-600'
    if (name.includes('8호선')) return 'bg-pink-500'
    if (name.includes('9호선')) return 'bg-yellow-600'
    if (name.includes('경의중앙선')) return 'bg-cyan-500'
    if (name.includes('경춘선')) return 'bg-emerald-500'
    if (name.includes('공항철도')) return 'bg-blue-500'
    if (name.includes('신분당선')) return 'bg-red-500'
    if (name.includes('경강선')) return 'bg-blue-400'
    // 부산
    if (name.includes('부산 1호선')) return 'bg-orange-500'
    if (name.includes('부산 2호선')) return 'bg-green-500'
    if (name.includes('부산 3호선')) return 'bg-amber-500'
    if (name.includes('부산 4호선')) return 'bg-blue-500'
    // 기타
    return 'bg-gray-500'
  }

  const lineColor = getLineColor(lane.name || '')
  const lineName = lane.name || '지하철'

  return (
    <div className={`subway-route-map ${className}`}>
      {/* 노선 헤더 */}
      <div className="mb-3 flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${lineColor}`}></div>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {lineName}
        </span>
        <span className="text-xs text-gray-500">
          {stations.length}개 역 • {path.section_time}분
        </span>
      </div>

      {/* 노선도 시각화 */}
      <div className="relative">
        {/* 세로 선 */}
        <div
          className={`absolute top-4 bottom-4 left-4 w-1 ${lineColor} rounded-full`}
        ></div>

        {/* 역 목록 */}
        <div className="space-y-3">
          {stations.map((station, index) => {
            const isFirst = index === 0
            const isLast = index === stations.length - 1
            const isTransfer =
              station.station_name === start_station ||
              station.station_name === end_station

            return (
              <div
                key={station.station_id || index}
                className="relative flex items-center"
              >
                {/* 역 아이콘 */}
                <div
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    isTransfer
                      ? `${lineColor} border-white shadow-md`
                      : isFirst || isLast
                        ? `border-gray-300 bg-white`
                        : `border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700`
                  }`}
                >
                  {isTransfer ? (
                    <div className="h-3 w-3 rounded-full bg-white"></div>
                  ) : isFirst ? (
                    <div className="text-xs font-bold text-green-600">시</div>
                  ) : isLast ? (
                    <div className="text-xs font-bold text-red-600">종</div>
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  )}
                </div>

                {/* 역명 */}
                <div className="ml-3 flex-1">
                  <div
                    className={`text-sm font-medium ${
                      isTransfer
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {station.station_name}
                  </div>

                  {/* 환승역 표시 */}
                  {isTransfer && (
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      {station.station_name === start_station ? '승차' : '하차'}
                    </div>
                  )}

                  {/* 역 번호 (index) */}
                  <div className="text-xs text-gray-400">
                    {station.index + 1}번째 역
                  </div>
                </div>

                {/* 시간 표시 (간단 계산) */}
                {index < stations.length - 1 && (
                  <div className="text-xs text-gray-400">
                    {Math.round(path.section_time / stations.length)}분
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 추가 정보 */}
      {path.start_exit_no && (
        <div className="mt-3 text-xs text-gray-500">
          출구 정보: {path.start_exit_no}번 출구 → {path.end_exit_no}번 출구
        </div>
      )}
    </div>
  )
}

export default SubwayRouteMap
