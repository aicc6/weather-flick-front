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
    <div className="mb-2 flex items-center gap-3 rounded-lg bg-blue-100 px-4 py-2 shadow-sm dark:bg-blue-900">
      {/* 드래그 핸들 */}
      <span
        {...dragHandleProps}
        className="mr-1 cursor-grab text-blue-400 select-none"
      >
        ≡
      </span>
      {/* 썸네일 */}
      {photoUrl && (
        <span className="relative inline-block flex-shrink-0">
          <img
            src={photoUrl}
            alt="장소 사진"
            className="h-10 w-10 rounded border border-gray-200 bg-gray-100 object-cover dark:border-gray-700 dark:bg-gray-700"
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
        <span className="mb-1 text-base font-semibold break-words whitespace-normal text-blue-900 dark:text-blue-100">
          {desc.replace(/^대한민국\s*/, '')}
        </span>
        {/* 날씨 정보 (한 줄, compact) */}
        {placeId && date && (
          <span className="flex min-w-[120px] items-center gap-2 text-xs whitespace-nowrap">
            {loading && <span>⏳ 날씨 로딩중...</span>}
            {error && (
              <span className="text-orange-500 text-xs">
                🌤️ 날씨 서비스 준비중
              </span>
            )}
            {weather && !loading && !error && (
              <>
                <span className="text-lg">☀️</span>
                <span className="font-semibold text-blue-700">
                  {weather.temperature || weather.temp || '25'}°C
                </span>
                {weather.description && (
                  <span className="text-gray-600">
                    {weather.description}
                  </span>
                )}
                {weather.humidity && (
                  <span className="text-blue-600">
                    습도 {weather.humidity}%
                  </span>
                )}
              </>
            )}
          </span>
        )}
      </div>
      {/* 삭제 버튼 */}
      <button
        type="button"
        onClick={onRemove}
        className="ml-2 text-blue-500 transition-colors hover:text-red-500"
        aria-label={`${desc} 제거`}
      >
        <X className="h-4 w-4" />
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
