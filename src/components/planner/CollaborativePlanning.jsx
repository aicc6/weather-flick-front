import { memo, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Users,
  UserPlus,
  MessageSquare,
  Vote,
  Bell,
  Settings,
  CheckCircle,
} from '@/components/icons'
import { toast } from 'sonner'

/**
 * 협업 여행 계획 컴포넌트
 * 실시간 공동 편집, 투표, 댓글 기능 제공
 */
const CollaborativePlanning = memo(
  ({ planId, currentUser, onCollaboratorUpdate, className }) => {
    const [collaborators, setCollaborators] = useState([
      {
        id: 1,
        name: '김철수',
        email: 'kim@example.com',
        role: 'owner',
        avatar: null,
        status: 'online',
      },
      {
        id: 2,
        name: '박영희',
        email: 'park@example.com',
        role: 'editor',
        avatar: null,
        status: 'offline',
      },
    ])
    const [inviteEmail, setInviteEmail] = useState('')
    const [polls, setPolls] = useState([
      {
        id: 1,
        question: '첫째 날 점심 장소는?',
        options: [
          { id: 1, text: '제주 흑돼지 맛집', votes: ['김철수', '박영희'] },
          { id: 2, text: '해산물 뷔페', votes: ['김철수'] },
          { id: 3, text: '카페 브런치', votes: [] },
        ],
        creator: '김철수',
        deadline: '2024-01-20',
        status: 'active',
      },
    ])
    const [comments, setComments] = useState([
      {
        id: 1,
        user: '박영희',
        content: '한라산 등반은 날씨 확인 후 결정하는 게 좋을 것 같아요!',
        timestamp: '2024-01-15 14:30',
        replies: [
          {
            id: 2,
            user: '김철수',
            content: '동감이에요. 비 오면 실내 활동으로 바꿔요.',
            timestamp: '2024-01-15 14:35',
          },
        ],
      },
    ])

    // 협업자 초대
    const handleInviteCollaborator = useCallback(async () => {
      if (!inviteEmail.trim()) {
        toast.error('이메일을 입력해주세요')
        return
      }

      try {
        // API 호출 (모의)
        const newCollaborator = {
          id: collaborators.length + 1,
          name: inviteEmail.split('@')[0],
          email: inviteEmail,
          role: 'viewer',
          avatar: null,
          status: 'pending',
        }

        setCollaborators((prev) => [...prev, newCollaborator])
        setInviteEmail('')
        toast.success(`${inviteEmail}에게 초대장을 보냈습니다`)
        onCollaboratorUpdate?.(collaborators.length + 1)
      } catch (error) {
        toast.error('초대 전송에 실패했습니다')
      }
    }, [inviteEmail, collaborators.length, onCollaboratorUpdate])

    // 권한 변경
    const handleRoleChange = useCallback((collaboratorId, newRole) => {
      setCollaborators((prev) =>
        prev.map((collab) =>
          collab.id === collaboratorId ? { ...collab, role: newRole } : collab,
        ),
      )
      toast.success('권한이 변경되었습니다')
    }, [])

    // 투표 생성
    const handleCreatePoll = useCallback(() => {
      // 투표 생성 모달 등 구현
      toast.info('투표 생성 기능 준비 중입니다')
    }, [])

    // 투표하기
    const handleVote = useCallback(
      (pollId, optionId) => {
        setPolls((prev) =>
          prev.map((poll) => {
            if (poll.id !== pollId) return poll

            return {
              ...poll,
              options: poll.options.map((option) => {
                if (option.id === optionId) {
                  // 이미 투표했으면 제거, 아니면 추가
                  const hasVoted = option.votes.includes(currentUser?.name)
                  return {
                    ...option,
                    votes: hasVoted
                      ? option.votes.filter(
                          (voter) => voter !== currentUser?.name,
                        )
                      : [...option.votes, currentUser?.name],
                  }
                } else {
                  // 다른 옵션에서 기존 투표 제거 (단일 선택)
                  return {
                    ...option,
                    votes: option.votes.filter(
                      (voter) => voter !== currentUser?.name,
                    ),
                  }
                }
              }),
            }
          }),
        )
      },
      [currentUser?.name],
    )

    // 실시간 활동 상태
    const getStatusColor = (status) => {
      switch (status) {
        case 'online':
          return 'bg-green-500'
        case 'offline':
          return 'bg-gray-400'
        case 'pending':
          return 'bg-yellow-500'
        default:
          return 'bg-gray-400'
      }
    }

    return (
      <div className={`space-y-6 ${className}`}>
        {/* 협업자 관리 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>함께 계획하기</span>
              <Badge variant="secondary">{collaborators.length}명</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 협업자 초대 */}
            <div className="mb-4 flex space-x-2">
              <Input
                placeholder="이메일 주소로 초대"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyPress={(e) =>
                  e.key === 'Enter' && handleInviteCollaborator()
                }
              />
              <Button onClick={handleInviteCollaborator}>
                <UserPlus className="mr-1 h-4 w-4" />
                초대
              </Button>
            </div>

            {/* 협업자 목록 */}
            <div className="space-y-3">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {collaborator.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(collaborator.status)}`}
                      />
                    </div>
                    <div>
                      <div className="font-medium">{collaborator.name}</div>
                      <div className="text-sm text-gray-500">
                        {collaborator.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        collaborator.role === 'owner' ? 'default' : 'outline'
                      }
                    >
                      {collaborator.role === 'owner' && '소유자'}
                      {collaborator.role === 'editor' && '편집자'}
                      {collaborator.role === 'viewer' && '보기'}
                    </Badge>
                    {collaborator.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRoleChange(
                            collaborator.id,
                            collaborator.role === 'editor'
                              ? 'viewer'
                              : 'editor',
                          )
                        }
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 실시간 투표 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Vote className="h-5 w-5 text-purple-600" />
                <span>실시간 투표</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleCreatePoll}>
                투표 만들기
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {polls.map((poll) => (
              <div key={poll.id} className="mb-4 rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-medium">{poll.question}</h4>
                  <Badge
                    variant={poll.status === 'active' ? 'default' : 'secondary'}
                  >
                    {poll.status === 'active' ? '진행중' : '종료'}
                  </Badge>
                </div>

                <div className="mb-3 space-y-2">
                  {poll.options.map((option) => {
                    const voteCount = option.votes.length
                    const totalVotes = poll.options.reduce(
                      (sum, opt) => sum + opt.votes.length,
                      0,
                    )
                    const percentage =
                      totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0
                    const hasVoted = option.votes.includes(currentUser?.name)

                    return (
                      <div key={option.id} className="relative">
                        <button
                          onClick={() => handleVote(poll.id, option.id)}
                          className={`w-full rounded border p-3 text-left transition-colors ${
                            hasVoted
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={
                                hasVoted ? 'font-medium text-blue-700' : ''
                              }
                            >
                              {option.text}
                            </span>
                            <div className="flex items-center space-x-2">
                              {hasVoted && (
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                              )}
                              <span className="text-sm font-medium">
                                {voteCount}표
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-blue-600 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </button>
                      </div>
                    )
                  })}
                </div>

                <div className="text-xs text-gray-500">
                  {poll.creator}님이 생성 • 마감: {poll.deadline}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 댓글 및 피드백 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <span>의견 및 댓글</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-l-4 border-blue-200 pl-4"
                >
                  <div className="mb-2 flex items-center space-x-2">
                    <span className="font-medium">{comment.user}</span>
                    <span className="text-xs text-gray-500">
                      {comment.timestamp}
                    </span>
                  </div>
                  <p className="mb-2 text-gray-700">{comment.content}</p>

                  {/* 답글 */}
                  {comment.replies &&
                    comment.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="mt-2 ml-4 rounded bg-gray-50 p-2"
                      >
                        <div className="mb-1 flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {reply.user}
                          </span>
                          <span className="text-xs text-gray-500">
                            {reply.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{reply.content}</p>
                      </div>
                    ))}

                  <Button variant="ghost" size="sm" className="mt-2">
                    답글 달기
                  </Button>
                </div>
              ))}
            </div>

            {/* 새 댓글 작성 */}
            <div className="mt-4 border-t pt-4">
              <Input placeholder="의견이나 제안을 남겨주세요..." />
              <Button className="mt-2" size="sm">
                <MessageSquare className="mr-1 h-3 w-3" />
                댓글 작성
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 실시간 알림 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-orange-600" />
              <span>실시간 활동</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span>박영희님이 2일차 일정을 수정했습니다</span>
                <span className="text-xs">방금 전</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span>김철수님이 새로운 투표를 만들었습니다</span>
                <span className="text-xs">5분 전</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span>새로운 협업자가 참여했습니다</span>
                <span className="text-xs">10분 전</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  },
)

CollaborativePlanning.displayName = 'CollaborativePlanning'

export default CollaborativePlanning
