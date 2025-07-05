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
  onRemove,
  onHover,
  onUnhover,
  hovered,
  dragHandleProps,
}) => (
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
      <span className="relative inline-block">
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
    {/* 주소 */}
    <span className="flex-1 text-sm break-all text-blue-900 dark:text-blue-100">
      {desc}
    </span>
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
  ({ destinations = [], onRemove, onReorder }) => {
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
