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

// 좋아요/싫어요 mock (실제 연동 시 상태/함수로 대체)
function useLikeDislike(initialLike = 0, initialDislike = 0) {
  const [like, setLike] = useState(initialLike)
  const [dislike, setDislike] = useState(initialDislike)
  const [my, setMy] = useState(null) // 'like' | 'dislike' | null
  const handleLike = () => {
    if (my === 'like') {
      setLike(like - 1)
      setMy(null)
    } else {
      setLike(like + 1)
      if (my === 'dislike') setDislike(dislike - 1)
      setMy('like')
    }
  }
  const handleDislike = () => {
    if (my === 'dislike') {
      setDislike(dislike - 1)
      setMy(null)
    } else {
      setDislike(dislike + 1)
      if (my === 'like') setLike(like - 1)
      setMy('dislike')
    }
  }
  return { like, dislike, my, handleLike, handleDislike }
}

/**
 * BEST 댓글 기준: 좋아요 10개 이상 또는 상위 3개 (mock)
 * 실제로는 review.likeCount, review.dislikeCount 필드 필요
 */
function splitBestAndNormal(reviews) {
  // mock: likeCount 필드가 없으므로 랜덤/임의로 부여
  const withLike = reviews.map((r) => ({
    ...r,
    likeCount: r.likeCount ?? Math.floor(Math.random() * 50),
    dislikeCount: r.dislikeCount ?? Math.floor(Math.random() * 10),
  }))
  const sorted = [...withLike].sort((a, b) => b.likeCount - a.likeCount)
  const best = sorted.slice(0, 3)
  const bestIds = new Set(best.map((r) => r.id))
  const normal = withLike.filter((r) => !bestIds.has(r.id))
  return { best, normal }
}

const ReviewTree = memo(function ReviewTree({
  reviews = [],
  onReply,
  parentId,
  depth = 0,
}) {
  // 최상위 댓글만 분리
  const topLevel = reviews.filter((r) => !r.parent_id)
  const { best, normal } = splitBestAndNormal(topLevel)
  const [tab, setTab] = useState('best')

  return (
    <div className="">
      {/* 탭 */}
      <div className="mb-2 flex gap-6 border-b">
        <button
          className={`pb-2 font-bold ${tab === 'best' ? 'border-b-2 border-black' : 'text-gray-400'}`}
          onClick={() => setTab('best')}
        >
          BEST 댓글
        </button>
        <button
          className={`pb-2 font-bold ${tab === 'all' ? 'border-b-2 border-black' : 'text-gray-400'}`}
          onClick={() => setTab('all')}
        >
          전체 댓글
        </button>
      </div>
      {tab === 'best' && (
        <div className="space-y-6">
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
        <div className="space-y-6">
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
  const { like, dislike, my, handleLike, handleDislike } = useLikeDislike(
    review.likeCount,
    review.dislikeCount,
  )

  const handleReplySubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (!replyContent.trim()) return
      setIsSubmitting(true)
      try {
        await onReply?.(review.id, replyContent, replyRating)
        setReplyContent('')
        setReplyRating(5)
        setShowReply(false)
      } finally {
        setIsSubmitting(false)
      }
    },
    [onReply, review.id, replyContent, replyRating],
  )

  // 답글 개수
  const replyCount = review.children?.length || 0
  // 답글(대댓글) 제한: depth === 0(최상위)만 답글 허용
  const canReply = depth === 0

  return (
    <div
      className={`rounded-lg border bg-white p-4 ${isBest ? 'border-yellow-400' : 'border-gray-200'} shadow-sm dark:border-zinc-700 dark:bg-[#0f172a] dark:text-zinc-100`}
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
      <div className="mb-2 flex items-center gap-2">
        <span className="flex items-center gap-1 text-gray-500 dark:text-zinc-400">
          <ThumbsUp
            className={`h-4 w-4 cursor-pointer ${my === 'like' ? 'text-blue-600 dark:text-blue-400' : ''}`}
            onClick={handleLike}
          />
          {like}
        </span>
        <span className="flex items-center gap-1 text-gray-500 dark:text-zinc-400">
          <ThumbsDown
            className={`h-4 w-4 cursor-pointer ${my === 'dislike' ? 'text-red-500 dark:text-red-400' : ''}`}
            onClick={handleDislike}
          />
          {dislike}
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
            답글
          </Button>
        )}
      </div>
      {showReply && canReply && (
        <form onSubmit={handleReplySubmit} className="mb-2 space-y-1">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="답글을 입력하세요"
            required
            className="w-full dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            rows={2}
          />
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 cursor-pointer ${i < replyRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-zinc-500'}`}
                onClick={() => setReplyRating(i + 1)}
                aria-label={`${i + 1}점`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setReplyRating(i + 1)
                }}
              />
            ))}
            <span className="ml-2 text-xs text-gray-600 dark:text-zinc-300">
              {replyRating}점
            </span>
            <Button
              type="submit"
              size="xs"
              disabled={isSubmitting || !replyContent.trim()}
            >
              {isSubmitting ? '등록 중...' : '답글 등록'}
            </Button>
          </div>
        </form>
      )}
      {/* 답글(자식) 렌더링: depth가 0(최상위)일 때만 children을 한 단계만 평면적으로 렌더링 */}
      {review.children &&
        review.children.length > 0 &&
        showChildren &&
        depth === 0 && (
          <div className="mt-2 ml-6 rounded bg-gray-50 p-2 dark:border dark:border-zinc-700 dark:bg-[#0f172a]">
            {review.children.map((child) => (
              <ReviewNode
                key={child.id}
                review={child}
                onReply={onReply}
                depth={1}
              />
            ))}
          </div>
        )}
    </div>
  )
})

ReviewTree.displayName = 'ReviewTree'
ReviewNode.displayName = 'ReviewNode'

export default ReviewTree
