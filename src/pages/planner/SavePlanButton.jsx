import { Button } from '@/components/ui/button'

export default function SavePlanButton({ planResults }) {
  if (!planResults || planResults.length === 0) return null
  return (
    <div className="mt-6 text-center">
      <Button className="w-full">내 플랜에 저장하기</Button>
    </div>
  )
}
