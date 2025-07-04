import { memo, useCallback } from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 선택된 목적지들을 뱃지 형태로 표시하는 컴포넌트
 * @param {Object} props
 * @param {string[]} props.destinations - 목적지 배열
 * @param {function} props.onRemove - 목적지 제거 함수 (destination) => void
 */
const DestinationBadgeList = memo(({ destinations = [], onRemove }) => {
  const handleRemove = useCallback(
    (destination) => {
      onRemove?.(destination)
    },
    [onRemove],
  )

  if (!destinations || destinations.length === 0) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="flex flex-wrap gap-2"
      >
        {destinations.map((destination, index) => (
          <motion.div
            key={`${destination}-${index}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-blue-100 px-3 py-1 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              <span>{destination}</span>
              <button
                type="button"
                onClick={() => handleRemove(destination)}
                className="ml-1 transition-colors hover:text-red-500"
                aria-label={`${destination} 제거`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
})

DestinationBadgeList.displayName = 'DestinationBadgeList'

export default DestinationBadgeList
