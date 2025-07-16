import React from 'react'
import { useSelector } from 'react-redux'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from '@/components/icons'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, label: '지역 선택', description: '여행지' },
  { id: 2, label: '기간 선택', description: '여행 기간' },
  { id: 3, label: '동행자 선택', description: '함께 갈 사람' },
  { id: 4, label: '스타일 선택', description: '여행 스타일' },
  { id: 5, label: '일정 선택', description: '일정 스타일' },
]

export default function ProgressSteps({ currentStep, onBack, showBackButton = true }) {
  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="mb-8">
      {/* 헤더와 뒤로가기 버튼 */}
      <div className="mb-6 flex items-center gap-4">
        {showBackButton && onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {currentStep}/{STEPS.length}
          </span>
          <div className="h-1 w-px bg-gray-300 dark:bg-gray-600" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            맞춤 일정 생성
          </span>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="mb-4">
        <Progress value={progress} className="h-2" />
      </div>

      {/* 단계 표시 */}
      <div className="flex justify-between">
        {STEPS.map((step) => (
          <div key={step.id} className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors',
                currentStep >= step.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              )}
            >
              {currentStep > step.id ? (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                step.id
              )}
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs font-medium text-gray-900 dark:text-white">
                {step.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}