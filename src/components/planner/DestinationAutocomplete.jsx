import { memo, useCallback } from 'react'
import { MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 목적지 자동완성 드롭다운 컴포넌트
 * @param {Object} props
 * @param {string[]} props.suggestions - 자동완성 제안 목록
 * @param {boolean} props.isVisible - 드롭다운 표시 여부
 * @param {function} props.onSelect - 제안 선택 함수 (suggestion) => void
 */
const DestinationAutocomplete = memo(
  ({ suggestions = [], isVisible = false, onSelect }) => {
    const handleSelect = useCallback(
      (suggestion) => {
        onSelect?.(suggestion)
      },
      [onSelect],
    )
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
          {suggestions.map((suggestion, index) => {
            // suggestion이 string이면 description으로, 객체면 그대로 사용
            const desc =
              typeof suggestion === 'string'
                ? suggestion
                : suggestion.description
            const photoUrl =
              typeof suggestion === 'object' && suggestion.photo_url
            return (
              <button
                key={desc + '-' + index}
                type="button"
                className="w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                onMouseDown={() => handleSelect(suggestion)}
              >
                <div className="flex items-center gap-2">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="장소 사진"
                      className="h-7 w-7 rounded border border-gray-200 bg-gray-100 object-cover dark:border-gray-700 dark:bg-gray-700"
                    />
                  ) : (
                    <MapPin className="text-muted-foreground h-5 w-5" />
                  )}
                  <span className="text-sm">{desc}</span>
                </div>
              </button>
            )
          })}
        </motion.div>
      </AnimatePresence>
    )
  },
)

DestinationAutocomplete.displayName = 'DestinationAutocomplete'

export default DestinationAutocomplete
