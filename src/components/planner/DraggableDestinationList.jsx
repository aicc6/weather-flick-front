import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { X, GripVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// 개별 드래그 가능한 아이템 컴포넌트
const SortableDestinationItem = ({ id, destination, onRemove }) => {
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
    opacity: isDragging ? 0.5 : 1,
  }

  const displayText =
    typeof destination === 'string'
      ? destination
      : destination.description || destination.name || ''

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 rounded-xl border bg-white px-3 py-2 shadow-sm transition-all hover:shadow-md dark:bg-gray-800 ${
        isDragging ? 'z-50' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none hover:text-gray-600"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <Badge variant="secondary" className="flex-1">
        {displayText}
      </Badge>
      <button
        onClick={() => onRemove(destination)}
        className="opacity-0 transition-opacity group-hover:opacity-100"
        type="button"
      >
        <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
      </button>
    </div>
  )
}

// 드래그 오버레이 컴포넌트
const DragOverlayItem = ({ destination }) => {
  const displayText =
    typeof destination === 'string'
      ? destination
      : destination.description || destination.name || ''

  return (
    <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 shadow-lg dark:bg-gray-800">
      <GripVertical className="h-4 w-4 text-gray-400" />
      <Badge variant="secondary">{displayText}</Badge>
    </div>
  )
}

// 메인 드래그 가능한 목적지 리스트 컴포넌트
export default function DraggableDestinationList({
  destinations = [],
  onRemove,
  onReorder,
  date,
}) {
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // 각 목적지에 고유 ID 생성
  const itemsWithIds = destinations.map((dest, index) => ({
    id: `${date}-${index}`,
    destination: dest,
  }))

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = itemsWithIds.findIndex((item) => item.id === active.id)
      const newIndex = itemsWithIds.findIndex((item) => item.id === over.id)

      const newDestinations = arrayMove(destinations, oldIndex, newIndex)
      onReorder(newDestinations)
    }

    setActiveId(null)
  }

  const activeItem = activeId
    ? itemsWithIds.find((item) => item.id === activeId)
    : null

  if (destinations.length === 0) {
    return (
      <div className="mt-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          아직 추가된 목적지가 없습니다
        </p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="mt-3 space-y-2">
        <SortableContext
          items={itemsWithIds.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {itemsWithIds.map((item) => (
            <SortableDestinationItem
              key={item.id}
              id={item.id}
              destination={item.destination}
              onRemove={onRemove}
            />
          ))}
        </SortableContext>
      </div>

      <DragOverlay>
        {activeItem ? (
          <DragOverlayItem destination={activeItem.destination} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
