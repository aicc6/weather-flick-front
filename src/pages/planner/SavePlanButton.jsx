import { Button } from '@/components/ui/button'
import { Loader2 } from '@/components/icons'

export default function SavePlanButton({ planResults, onSave, isLoading }) {
  if (!planResults || planResults.length === 0) return null

  return (
    <div className="mt-6 text-center">
      <Button className="w-full" onClick={onSave} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            저장 중...
          </>
        ) : (
          '내 플랜에 저장하기'
        )}
      </Button>
    </div>
  )
}
