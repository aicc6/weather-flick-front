import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, MoreHorizontal } from '@/components/icons'
import { reviews as initialReviews } from '@/data'

/**
 * URL: /reviews
 */
export function ReviewsPage() {
  const navigate = useNavigate()
  const [helpfulVotes, setHelpfulVotes] = useState({})

  // 각 리뷰의 유용성 투표 카운트를 저장하는 상태
  const [helpfulCounts, setHelpfulCounts] = useState(() => {
    // 초기값을 랜덤하게 설정 (1-15 사이)
    const initialCounts = {}
    initialReviews.forEach((review) => {
      initialCounts[review.id] = Math.floor(Math.random() * 15) + 1
    })
    return initialCounts
  })

  // 평점 통계 계산
  const calculateRatingStats = () => {
    const ratings = initialReviews.map((review) => review.rating)
    const total = ratings.length
    const average = ratings.reduce((sum, rating) => sum + rating, 0) / total

    // 평점별 개수 계산
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    ratings.forEach((rating) => {
      distribution[rating] = (distribution[rating] || 0) + 1
    })

    return {
      average: average.toFixed(1),
      total,
      distribution,
    }
  }

  const { average, total, distribution } = calculateRatingStats()

  // 별점 렌더링
  const renderStars = (rating, size = 'h-5 w-5') => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`${size} ${i < rating ? 'fill-green-500 text-green-500' : 'text-gray-300'}`}
        />,
      )
    }
    return stars
  }

  // 유용성 투표 처리
  const handleVote = (reviewId, isHelpful) => {
    const previousVote = helpfulVotes[reviewId]

    // 투표 상태 업데이트
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: isHelpful,
    }))

    // 카운트 업데이트
    setHelpfulCounts((prev) => {
      const newCounts = { ...prev }

      // 이전 투표가 '예'였고 현재 '아니오'를 누르면 카운트 감소
      if (previousVote === true && !isHelpful) {
        newCounts[reviewId] = Math.max(0, (newCounts[reviewId] || 0) - 1)
      }
      // 이전 투표가 '아니오'였거나 없었고 현재 '예'를 누르면 카운트 증가
      else if (previousVote !== true && isHelpful) {
        newCounts[reviewId] = (newCounts[reviewId] || 0) + 1
      }

      return newCounts
    })
  }

  // 아바타 생성
  const generateAvatar = (author) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
    ]
    const colorIndex = author.charCodeAt(0) % colors.length
    return colors[colorIndex]
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* 상단 평점 요약 */}
        <div className="bg-card border-border mb-8 rounded-lg border p-6">
          <div className="flex items-start gap-8">
            {/* 평균 평점 */}
            <div className="text-center">
              <div className="text-foreground mb-2 text-6xl font-bold">
                {average}
              </div>
              <div className="mb-2 flex justify-center">
                {renderStars(Math.round(parseFloat(average)))}
              </div>
              <div className="text-muted-foreground text-sm">
                리뷰 {total}개
              </div>
            </div>

            {/* 평점 분포 */}
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="mb-2 flex items-center gap-3">
                  <span className="text-foreground w-2 text-sm">{rating}</span>
                  <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 rounded-full bg-green-500 transition-all duration-300"
                      style={{
                        width: `${total > 0 ? (distribution[rating] / total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-muted-foreground w-8 text-sm">
                    {distribution[rating]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 상위 4개 리뷰 카드 */}
        <div className="mb-8">
          <h2 className="text-foreground mb-4 text-xl font-bold">
            ⭐ 가장 유용한 리뷰
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[...initialReviews]
              .sort((a, b) => {
                const countA = helpfulCounts[a.id] || 0
                const countB = helpfulCounts[b.id] || 0
                return countB - countA
              })
              .slice(0, 4)
              .map((review) => (
                <div
                  key={`top-${review.id}`}
                  className="bg-card border-border rounded-lg border p-4 transition-shadow duration-200 hover:shadow-md"
                >
                  {/* 카드 헤더 */}
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${generateAvatar(review.author)}`}
                    >
                      {review.author.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="text-foreground text-sm font-medium">
                        {review.author}
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating, 'h-3 w-3')}
                        <span className="text-muted-foreground text-xs">
                          {review.date}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <span className="text-xs font-medium">
                        👍 {helpfulCounts[review.id] || 0}
                      </span>
                    </div>
                  </div>

                  {/* 리뷰 내용 (요약) */}
                  <div className="text-foreground line-clamp-3 text-sm leading-relaxed">
                    {review.content}
                  </div>

                  {/* 유용성 투표 (컴팩트) */}
                  <div className="border-border mt-3 flex items-center justify-between border-t pt-3">
                    <span className="text-muted-foreground text-xs">
                      유용함 {helpfulCounts[review.id] || 0}명
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleVote(review.id, true)}
                        className={`rounded-full px-2 py-1 text-xs transition-colors ${
                          helpfulVotes[review.id] === true
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        👍
                      </button>
                      <button
                        onClick={() => handleVote(review.id, false)}
                        className={`rounded-full px-2 py-1 text-xs transition-colors ${
                          helpfulVotes[review.id] === false
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        👎
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* 리뷰 작성 버튼 */}
        <div className="mb-8 text-center">
          <button
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-3 font-medium transition-colors"
            onClick={() => navigate('/reviews/write')}
          >
            리뷰 작성하기
          </button>
        </div>

        {/* 개별 리뷰 목록 */}
        <div className="space-y-6">
          <h2 className="text-foreground mb-4 text-xl font-bold">
            📝 모든 리뷰
          </h2>
          {[...initialReviews]
            .sort((a, b) => {
              // 유용성 평가 점수가 높은 순으로 정렬
              const countA = helpfulCounts[a.id] || 0
              const countB = helpfulCounts[b.id] || 0
              return countB - countA
            })
            .map((review) => (
              <div
                key={review.id}
                className="bg-card border-border rounded-lg border p-6"
              >
                {/* 리뷰 헤더 */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* 아바타 */}
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${generateAvatar(review.author)}`}
                    >
                      {review.author.charAt(0)}
                    </div>

                    {/* 작성자 정보 */}
                    <div>
                      <div className="text-foreground font-medium">
                        {review.author}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {review.date}
                      </div>
                    </div>
                  </div>

                  {/* 더보기 버튼 */}
                  <button className="text-muted-foreground hover:text-foreground p-1">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>

                {/* 별점 */}
                <div className="mb-3 flex items-center gap-2">
                  {renderStars(review.rating)}
                  <span className="text-muted-foreground ml-2 text-sm">
                    {review.date}
                  </span>
                </div>

                {/* 리뷰 내용 */}
                <div className="text-foreground mb-4 leading-relaxed">
                  {review.content}
                </div>

                {/* 유용성 투표 */}
                <div className="border-border flex items-center gap-4 border-t pt-4">
                  <span className="text-muted-foreground text-sm">
                    사용자 {helpfulCounts[review.id] || 0}명이 이 리뷰가
                    유용하다고 평가함
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      이 리뷰가 유용했나요?
                    </span>
                    <button
                      onClick={() => handleVote(review.id, true)}
                      className={`rounded-full px-3 py-1 text-sm transition-colors ${
                        helpfulVotes[review.id] === true
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      예
                    </button>
                    <button
                      onClick={() => handleVote(review.id, false)}
                      className={`rounded-full px-3 py-1 text-sm transition-colors ${
                        helpfulVotes[review.id] === false
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      아니오
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* 더 보기 버튼 */}
        <div className="mt-8 text-center">
          <button className="text-primary hover:text-primary/80 font-medium">
            더 많은 리뷰 보기
          </button>
        </div>
      </div>
    </div>
  )
}
