import { MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 목적지 자동완성 드롭다운 컴포넌트
 * @param {Object} props
 * @param {string[]} props.suggestions - 자동완성 제안 목록
 * @param {boolean} props.isVisible - 드롭다운 표시 여부
 * @param {function} props.onSelect - 제안 선택 함수 (suggestion) => void
 */
export default function DestinationAutocomplete({
  suggestions = [],
  isVisible = false,
  onSelect,
}) {
  if (!isVisible || !suggestions || suggestions.length === 0) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
      >
        {suggestions.map((suggestion, index) => (
          <button
            key={`${suggestion}-${index}`}
            type="button"
            className="w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
            onMouseDown={() => onSelect(suggestion)}
          >
            <div className="flex items-center gap-2">
              <MapPin className="text-muted-foreground h-4 w-4" />
              <span className="text-sm">{suggestion}</span>
            </div>
          </button>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}