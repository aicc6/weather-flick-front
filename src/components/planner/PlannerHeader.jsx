import { memo } from 'react'
import { motion } from 'framer-motion'

/**
 * AI 여행 플래너 헤더 컴포넌트
 * 페이지 제목과 설명을 표시하는 정적 컴포넌트
 */
const PlannerHeader = memo(() => {
  return (
    <div className="mb-12 text-center">
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
          🌤️ AI 여행 플래너
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          14일 이후의 날씨 데이터는 알림으로 알려드립니다.
        </p>
      </motion.div>
    </div>
  )
})

PlannerHeader.displayName = 'PlannerHeader'

export default PlannerHeader
