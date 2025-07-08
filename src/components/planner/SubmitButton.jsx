import { memo } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

/**
 * 플랜 생성 제출 버튼 컴포넌트
 * @param {Object} props
 * @param {boolean} props.isSubmitting - 제출 중 상태
 * @param {boolean} props.disabled - 버튼 비활성화 여부
 * @param {function} props.onSubmit - 제출 함수
 * @param {boolean} props.isEditMode - 편집 모드 여부
 */
const SubmitButton = memo(
  ({
    isSubmitting = false,
    disabled = false,
    onSubmit,
    isEditMode = false,
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Button
          type="submit"
          disabled={disabled || isSubmitting}
          onClick={onSubmit}
          className="h-14 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>
                {isEditMode ? '플랜 수정 중...' : '여행 계획 생성 중...'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span>
                {isEditMode ? '플랜 수정하기' : '여행 계획 만들기'}
              </span>
            </div>
          )}
        </Button>
      </motion.div>
    )
  },
)

SubmitButton.displayName = 'SubmitButton'

export default SubmitButton
