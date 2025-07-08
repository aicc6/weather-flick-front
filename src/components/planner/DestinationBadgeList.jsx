import { memo, useState } from 'react'
import { X } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useGetWeatherByPlaceIdQuery } from '@/store/api/weatherApi'

/**
 * 선택된 목적지들을 뱃지 형태로 표시하는 컴포넌트
 * @param {Object} props
 * @param {string[]} props.destinations - 목적지 배열
 * @param {function} props.onRemove - 목적지 제거 함수 (destination) => void
 * @param {function} props.onReorder - 목적지 순서 변경 함수 (newOrder) => void
 */
const DestinationListItem = ({
  desc,
  photoUrl,
  placeId,
  date,
  onRemove,
  onHover,
  onUnhover,
  hovered,
  dragHandleProps,
}) => {
  // RTK Query를 사용한 날씨 정보 조회
  const {
    data: weather,
    isLoading: loading,
    error,
  } = useGetWeatherByPlaceIdQuery(
    { placeId, date },
    {
      skip: !placeId || !date, // placeId나 date가 없으면 쿼리 실행 안함
      refetchOnMountOrArgChange: true, // 컴포넌트 마운트시 새로 요청
    },
  )

  return (
    <div className="mb-4 flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:border-gray-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      {/* 드래그 핸들 */}
      <div
        {...dragHandleProps}
        className="mt-1 flex cursor-grab flex-col gap-1 text-gray-400 transition-colors hover:text-gray-600"
      >
        <div className="h-1 w-1 rounded-full bg-current"></div>
        <div className="h-1 w-1 rounded-full bg-current"></div>
        <div className="h-1 w-1 rounded-full bg-current"></div>
        <div className="h-1 w-1 rounded-full bg-current"></div>
        <div className="h-1 w-1 rounded-full bg-current"></div>
        <div className="h-1 w-1 rounded-full bg-current"></div>
      </div>
      {/* 썸네일 */}
      {photoUrl && (
        <span className="relative inline-block flex-shrink-0">
          <img
            src={photoUrl}
            alt="장소 사진"
            className="h-14 w-14 rounded-xl border-2 border-gray-200 bg-gray-50 object-cover shadow-sm transition-shadow hover:shadow-md dark:border-gray-600 dark:bg-gray-700"
            style={{ position: 'relative', zIndex: 1 }}
            onMouseOver={onHover}
            onMouseOut={onUnhover}
          />
          {hovered && (
            <div
              className="fixed top-1/2 left-1/2 z-50 flex items-center justify-center"
              style={{ transform: 'translate(-50%, -50%)' }}
              onMouseOver={onHover}
              onMouseOut={onUnhover}
            >
              <img
                src={photoUrl}
                alt="확대된 장소 사진"
                className="max-h-[60vh] max-w-[60vw] rounded border-4 border-white bg-white shadow-2xl dark:border-gray-800"
                style={{
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '60vw',
                  maxHeight: '60vh',
                }}
              />
            </div>
          )}
        </span>
      )}
      {/* 텍스트 영역: 주소 + 날씨정보 세로 배치 */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 주소 (여러 줄, 전체 표시) */}
        <h3 className="mb-2 text-base leading-tight font-semibold break-words whitespace-normal text-gray-800 dark:text-gray-100">
          {desc.replace(/^대한민국\s*/, '')}
        </h3>
        {/* 날씨 정보 (상세 정보) */}
        {placeId && date && (
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
            {loading && (
              <div className="flex items-center gap-2 text-indigo-600">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                <span className="text-sm">날씨 정보 불러오는 중...</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-amber-600">
                <span className="text-lg">🌤️</span>
                <span className="text-sm">날씨 서비스 준비중</span>
              </div>
            )}
            {weather && !loading && !error && (
              <div className="space-y-2">
                {/* 첫 번째 줄: 아이콘, 온도, 날씨 상태 */}
                <div className="flex items-center gap-3">
                  {weather.icon ? (
                    <img
                      src={`https:${weather.icon}`}
                      alt={weather.summary || '날씨'}
                      className="h-7 w-7 flex-shrink-0"
                    />
                  ) : (
                    <span className="flex-shrink-0 text-xl">
                      {weather.summary?.includes('비')
                        ? '🌧️'
                        : weather.summary?.includes('눈')
                          ? '❄️'
                          : weather.summary?.includes('흐림')
                            ? '☁️'
                            : weather.summary?.includes('구름')
                              ? '☁️'
                              : '☀️'}
                    </span>
                  )}
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                      {weather.max_temp && weather.min_temp
                        ? `${Math.round(weather.min_temp)}° ~ ${Math.round(weather.max_temp)}°C`
                        : `${Math.round(weather.temp || weather.temperature || 25)}°C`}
                    </span>
                    {weather.summary && (
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {weather.summary}
                      </span>
                    )}
                  </div>
                </div>

                {/* 두 번째 줄: 추가 정보 */}
                <div className="flex items-center gap-4 text-sm">
                  {weather.chance_of_rain !== undefined && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <span>💧</span>
                      <span>{weather.chance_of_rain}%</span>
                    </div>
                  )}
                  {weather.humidity && (
                    <div className="flex items-center gap-1 text-cyan-600">
                      <span>💨</span>
                      <span>{weather.humidity}%</span>
                    </div>
                  )}
                  {weather.wind_speed && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <span>🌪️</span>
                      <span>{weather.wind_speed}m/s</span>
                    </div>
                  )}
                </div>

                {/* 세 번째 줄: 체감온도, UV 지수 등 */}
                {(weather.feels_like || weather.uv_index) && (
                  <div className="flex items-center gap-4 border-t border-gray-200 pt-1 text-sm dark:border-gray-600">
                    {weather.feels_like && (
                      <div className="flex items-center gap-1 text-purple-600">
                        <span>🌡️</span>
                        <span>체감 {weather.feels_like}°C</span>
                      </div>
                    )}
                    {weather.uv_index && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <span>☀️</span>
                        <span>UV {weather.uv_index}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {/* 삭제 버튼 */}
      <button
        type="button"
        onClick={onRemove}
        className="flex-shrink-0 rounded-lg p-2 text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
        aria-label={`${desc} 제거`}
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}

function SortableListItem({ id, children, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : undefined,
    opacity: isDragging ? 0.7 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...props}>
      {children({ dragHandleProps: listeners })}
    </div>
  )
}

const DestinationBadgeList = memo(
  ({ destinations = [], onRemove, onReorder, date }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null)
    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    )
    const handleDragEnd = (event) => {
      const { active, over } = event
      if (active.id !== over?.id) {
        const oldIndex = destinations.findIndex(
          (_, i) => String(i) === active.id,
        )
        const newIndex = destinations.findIndex((_, i) => String(i) === over.id)
        const newOrder = arrayMove(destinations, oldIndex, newIndex)
        onReorder?.(newOrder)
      }
    }
    if (!destinations || destinations.length === 0) return null
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={destinations.map((_, i) => String(i))}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-0">
            {destinations.map((destination, index) => {
              const desc =
                typeof destination === 'string'
                  ? destination
                  : destination.description
              const photoUrl =
                typeof destination === 'object' && destination.photo_url
              return (
                <SortableListItem id={String(index)} key={desc + '-' + index}>
                  {({ dragHandleProps }) => (
                    <DestinationListItem
                      desc={desc}
                      photoUrl={photoUrl}
                      placeId={
                        typeof destination === 'object'
                          ? destination.place_id
                          : undefined
                      }
                      date={date}
                      onRemove={() => onRemove?.(destination)}
                      onHover={() => setHoveredIndex(index)}
                      onUnhover={() => setHoveredIndex(null)}
                      hovered={hoveredIndex === index}
                      dragHandleProps={dragHandleProps}
                    />
                  )}
                </SortableListItem>
              )
            })}
          </div>
        </SortableContext>
      </DndContext>
    )
  },
)

DestinationBadgeList.displayName = 'DestinationBadgeList'

export default DestinationBadgeList
