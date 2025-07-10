import { useState, useCallback, memo } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
} from '@/components/icons'
import {
  useGetReviewLikeQuery,
  useLikeReviewMutation,
  useUnlikeReviewMutation,
} from '@/store/api/reviewLikesApi'

// 닉네임 마스킹 함수
function maskNickname(nickname) {
  if (!nickname) return ''
  if (nickname.length <= 2) return nickname[0] + '*'
  return (
    nickname[0] +
    '*'.repeat(Math.max(1, nickname.length - 2)) +
    nickname[nickname.length - 1]
  )
}

// 날짜 포맷
function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/**
 * BEST 댓글 기준: 추천수(좋아요) 내림차순 상위 5개
 * 실제로는 review.likeCount, review.dislikeCount 필드 필요
 */
function splitBestAndNormal(reviews) {
  // 실제 likeCount/dislikeCount만 사용, 없으면 0
  const withLike = reviews.map((r) => ({
    ...r,
    likeCount: r.likeCount ?? 0,
    dislikeCount: r.dislikeCount ?? 0,
  }))
  // 추천수(좋아요) 내림차순 정렬(BEST)
  const sortedBest = [...withLike].sort((a, b) => b.likeCount - a.likeCount)
  const best = sortedBest.slice(0, 5)
  // 전체(normal)는 최신순(작성일 내림차순)
  const sortedNormal = [...withLike].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  )
  return { best, normal: sortedNormal }
}

const ReviewTree = memo(function ReviewTree({
  reviews = [],
  onReply,
  parentId,
  depth = 0,
}) {
  // 최상위 댓글만 분리
  const topLevel = reviews.filter((r) => !r.parent_id)
  // 평균 별점 및 인원수 계산 (삭제 예정)
  // const totalRating = topLevel.reduce((sum, r) => sum + (r.rating || 0), 0)
  // const avgRating = topLevel.length > 0 ? totalRating / topLevel.length : 0
  // const peopleCount = topLevel.length
  const { best, normal } = splitBestAndNormal(topLevel)
  const [tab, setTab] = useState('best')

  // 최상위 댓글 폼 별점 상태
  const [rootRating, setRootRating] = useState(5)

  // 최상위 댓글 등록 핸들러
  const handleRootSubmit = useCallback(
    async (content) => {
      await onReply?.(undefined, content, rootRating)
      // setRootRating(5) 제거: 등록 후에도 사용자가 선택한 별점 유지
    },
    [onReply, rootRating],
  )

  return (
    <div className="">
      {/* 상단: 좋아요 옆에 별점/인원 표시 삭제 */}
      {/* 탭 */}
      <div className="mb-2 flex gap-4">
        <button
          className={`pb-1 font-bold ${tab === 'best' ? 'border-b-2 border-black' : 'text-gray-400'}`}
          onClick={() => setTab('best')}
        >
          BEST 댓글
        </button>
        <button
          className={`pb-1 font-bold ${tab === 'all' ? 'border-b-2 border-black' : 'text-gray-400'}`}
          onClick={() => setTab('all')}
        >
          전체 댓글
        </button>
      </div>
      {tab === 'best' && (
        <div className="mt-4 space-y-6">
          {best.length === 0 && (
            <div className="text-gray-400">BEST 댓글이 없습니다.</div>
          )}
          {best.map((review) => (
            <ReviewNode
              key={review.id}
              review={review}
              onReply={onReply}
              isBest
              depth={depth}
            />
          ))}
        </div>
      )}
      {tab === 'all' && (
        <div className="mt-4 space-y-6">
          {normal.length === 0 && (
            <div className="text-gray-400">아직 댓글이 없습니다.</div>
          )}
          {normal.map((review) => (
            <ReviewNode
              key={review.id}
              review={review}
              onReply={onReply}
              depth={depth}
            />
          ))}
        </div>
      )}
    </div>
  )
})

const ReviewNode = memo(function ReviewNode({
  review,
  onReply,
  isBest,
  depth = 0,
}) {
  const [showReply, setShowReply] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [replyRating, setReplyRating] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showChildren, setShowChildren] = useState(true)
  const { data: likeData, isLoading: likeLoading } = useGetReviewLikeQuery(
    review.id,
  )
  const [likeReview] = useLikeReviewMutation()
  const [unlikeReview] = useUnlikeReviewMutation()

  // 답글(대댓글) 등록 핸들러에서 setReplyRating(5) 제거
  const handleReplySubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (!replyContent.trim()) return
      setIsSubmitting(true)
      try {
        await onReply?.(review.id, replyContent, replyRating)
        setReplyContent('')
        // setReplyRating(5) 제거: 대댓글은 별점 초기화하지 않음
        setShowReply(false)
      } finally {
        setIsSubmitting(false)
      }
    },
    [onReply, review.id, replyContent, replyRating],
  )

  const handleLike = useCallback(async () => {
    if (!likeData) return
    if (likeData.my_like) {
      await unlikeReview({ reviewId: review.id, isLike: true })
    } else {
      await likeReview({ reviewId: review.id, isLike: true })
    }
  }, [likeData, likeReview, unlikeReview, review.id])

  const handleDislike = useCallback(async () => {
    if (!likeData) return
    if (likeData.my_dislike) {
      await unlikeReview({ reviewId: review.id, isLike: false })
    } else {
      await likeReview({ reviewId: review.id, isLike: false })
    }
  }, [likeData, likeReview, unlikeReview, review.id])

  // 답글 개수
  const replyCount = review.children?.length || 0
  // 답글(대댓글) 제한: depth === 0(최상위)만 답글 허용
  const canReply = depth === 0

  return (
    <div
      className={
        depth === 1
          ? 'px-4 py-3 text-sm'
          : `rounded-lg border bg-white p-4 ${isBest ? 'border-yellow-400' : 'border-gray-200'} shadow-sm dark:border-zinc-700 dark:bg-[#0f172a] dark:text-zinc-100`
      }
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="font-semibold">{maskNickname(review.nickname)}</span>
        <span className="text-xs text-gray-400 dark:text-zinc-400">
          {formatDate(review.created_at)}
        </span>
        {isBest && (
          <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900 dark:text-green-200">
            BEST
          </span>
        )}
      </div>
      <div className="mb-2 text-gray-800 dark:text-zinc-100">
        {review.content}
      </div>
      {depth === 0 && (
        <div className="mb-1 flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-zinc-500'}`}
              aria-label={`${i + 1}점`}
            />
          ))}
          <span className="ml-1 text-xs text-gray-500 dark:text-zinc-400">
            {review.rating}점
          </span>
        </div>
      )}
      <div className="mb-2 flex items-center gap-2">
        <span className="flex items-center gap-1 text-gray-500 dark:text-zinc-400">
          <ThumbsUp
            className={`h-4 w-4 cursor-pointer ${likeData?.my_like ? 'text-blue-600 dark:text-blue-400' : ''}`}
            onClick={handleLike}
          />
          {likeLoading ? '-' : (likeData?.total_like ?? 0)}
        </span>
        <span className="flex items-center gap-1 text-gray-500 dark:text-zinc-400">
          <ThumbsDown
            className={`h-4 w-4 cursor-pointer ${likeData?.my_dislike ? 'text-red-500 dark:text-red-400' : ''}`}
            onClick={handleDislike}
          />
          {likeLoading ? '-' : (likeData?.total_dislike ?? 0)}
        </span>
        {replyCount > 0 && depth === 0 && (
          <Button
            size="xs"
            variant="ghost"
            onClick={() => setShowChildren((v) => !v)}
            className="ml-2"
          >
            {showChildren ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            답글 {replyCount}
          </Button>
        )}
        {canReply && (
          <Button
            size="xs"
            variant="ghost"
            onClick={() => setShowReply((v) => !v)}
            aria-label="답글 달기"
          >
            답글 달기
          </Button>
        )}
      </div>
      {showReply && canReply && (
        <form onSubmit={handleReplySubmit} className="mb-2 space-y-1">
          <div className="rounded-lg border border-gray-300 bg-white p-2 dark:border-zinc-600 dark:bg-zinc-800">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="답글을 입력하세요"
              required
              className="w-full border-none bg-transparent shadow-none focus:border-none focus:ring-0 dark:text-zinc-100"
              rows={2}
            />
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 justify-end">
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  className="px-4 py-1 text-gray-900 hover:bg-gray-100 dark:text-zinc-100 dark:hover:bg-zinc-700"
                  disabled={isSubmitting || !replyContent.trim()}
                >
                  {isSubmitting ? '등록 중...' : '답글 등록'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
      {/* 답글(자식) 렌더링: depth가 0(최상위)일 때만 children을 한 단계만 평면적으로 렌더링 */}
      {review.children &&
        review.children.length > 0 &&
        showChildren &&
        depth === 0 && (
          <div className="mt-2 ml-6">
            {review.children.map((child, idx) => (
              <div key={child.id} className="relative mb-2 pl-5">
                {/* ㄴ자 선: 각 답글마다 앞에 개별적으로 */}
                <div className="pointer-events-none absolute top-2 left-0 h-4 w-4">
                  <div
                    className="absolute top-0 left-1/2 h-3 w-0.5 bg-zinc-300 dark:bg-zinc-700"
                    style={{ height: '12px' }}
                  />
                  <div className="absolute top-3 left-1/2 h-0.5 w-4 bg-zinc-300 dark:bg-zinc-700" />
                </div>
                <ReviewNode review={child} onReply={onReply} depth={1} />
              </div>
            ))}
          </div>
        )}
    </div>
  )
})

ReviewTree.displayName = 'ReviewTree'
ReviewNode.displayName = 'ReviewNode'

export default ReviewTree
