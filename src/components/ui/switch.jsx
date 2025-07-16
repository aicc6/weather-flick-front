import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

function Switch({ className, ...props }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // 기존 스타일 + OFF 상태에서 bg-gray-300, border-gray-300 추가
        'peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border shadow-xs transition-all outline-none',
        'data-[state=checked]:bg-primary data-[state=checked]:border-primary',
        'data-[state=unchecked]:border-gray-300 data-[state=unchecked]:bg-gray-300',
        'focus-visible:border-ring focus-visible:ring-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Thumb는 항상 흰색, 그림자 추가
          'pointer-events-none block size-4 rounded-full bg-white shadow ring-0 transition-transform',
          'data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
