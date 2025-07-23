import { useState } from 'react'
import { Copy, Share2, Link, Users, Clock, Shield } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { format, addDays } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function SharePlanModal({ isOpen, onClose, planId, planTitle }) {
  const [shareSettings, setShareSettings] = useState({
    permission: 'view',
    expiresIn: '7', // days
    maxUses: '',
    hasExpiry: true,
    hasMaxUses: false,
  })
  const [shareLink, setShareLink] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeShares, setActiveShares] = useState([])

  // 공유 링크 생성
  const createShareLink = async () => {
    setIsLoading(true)
    try {
      const shareData = {
        permission: shareSettings.permission,
      }

      // 만료 시간 설정
      if (shareSettings.hasExpiry && shareSettings.expiresIn) {
        const expiresAt = addDays(new Date(), parseInt(shareSettings.expiresIn))
        shareData.expires_at = expiresAt.toISOString()
      }

      // 최대 사용 횟수 설정
      if (shareSettings.hasMaxUses && shareSettings.maxUses) {
        shareData.max_uses = parseInt(shareSettings.maxUses)
      }

      const response = await fetch(`/api/travel-plans/${planId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(shareData),
      })

      const result = await response.json()

      if (result.success) {
        const fullLink = `${window.location.origin}/shared/${result.data.share_token}`
        setShareLink(fullLink)
        toast.success('공유 링크가 생성되었습니다')

        // 기존 공유 링크 목록 새로고침
        fetchActiveShares()
      } else {
        toast.error(result.message || '공유 링크 생성에 실패했습니다')
      }
    } catch (error) {
      console.error('공유 링크 생성 오류:', error)
      toast.error('공유 링크 생성 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  // 활성 공유 링크 목록 조회
  const fetchActiveShares = async () => {
    try {
      const response = await fetch(`/api/travel-plans/${planId}/shares`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      })

      const result = await response.json()
      if (result.success) {
        setActiveShares(result.data.filter((share) => share.is_active))
      }
    } catch (error) {
      console.error('공유 링크 목록 조회 오류:', error)
    }
  }

  // 링크 복사
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      toast.success('링크가 클립보드에 복사되었습니다')
    } catch (error) {
      toast.error('링크 복사에 실패했습니다')
    }
  }

  // 공유 링크 비활성화
  const deactivateShare = async (shareId) => {
    try {
      const response = await fetch(
        `/api/travel-plans/${planId}/shares/${shareId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({ is_active: false }),
        },
      )

      const result = await response.json()
      if (result.success) {
        toast.success('공유 링크가 비활성화되었습니다')
        fetchActiveShares()
      }
    } catch (error) {
      console.error('공유 링크 비활성화 오류:', error)
      toast.error('공유 링크 비활성화에 실패했습니다')
    }
  }

  // 모달이 열릴 때 활성 공유 링크 목록 조회
  useState(() => {
    if (isOpen) {
      fetchActiveShares()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            여행 계획 공유하기
          </DialogTitle>
          <DialogDescription>
            &quot;{planTitle}&quot; 여행 계획을 다른 사람과 공유할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 공유 설정 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                권한 설정
              </Label>
              <Select
                value={shareSettings.permission}
                onValueChange={(value) =>
                  setShareSettings({ ...shareSettings, permission: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>보기 전용</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="edit">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>편집 가능</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 만료 시간 설정 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  만료 시간 설정
                </Label>
                <Switch
                  checked={shareSettings.hasExpiry}
                  onCheckedChange={(checked) =>
                    setShareSettings({ ...shareSettings, hasExpiry: checked })
                  }
                />
              </div>
              {shareSettings.hasExpiry && (
                <Select
                  value={shareSettings.expiresIn}
                  onValueChange={(value) =>
                    setShareSettings({ ...shareSettings, expiresIn: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1일</SelectItem>
                    <SelectItem value="7">7일</SelectItem>
                    <SelectItem value="30">30일</SelectItem>
                    <SelectItem value="90">90일</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* 최대 사용 횟수 설정 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  최대 사용 횟수
                </Label>
                <Switch
                  checked={shareSettings.hasMaxUses}
                  onCheckedChange={(checked) =>
                    setShareSettings({ ...shareSettings, hasMaxUses: checked })
                  }
                />
              </div>
              {shareSettings.hasMaxUses && (
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={shareSettings.maxUses}
                  onChange={(e) =>
                    setShareSettings({
                      ...shareSettings,
                      maxUses: e.target.value,
                    })
                  }
                  placeholder="예: 10"
                />
              )}
            </div>
          </div>

          {/* 공유 링크 생성 버튼 */}
          {!shareLink && (
            <Button
              onClick={createShareLink}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  생성 중...
                </>
              ) : (
                <>
                  <Link className="mr-2 h-4 w-4" />
                  공유 링크 생성
                </>
              )}
            </Button>
          )}

          {/* 생성된 공유 링크 */}
          {shareLink && (
            <div className="space-y-2">
              <Label>생성된 공유 링크</Label>
              <div className="flex gap-2">
                <Input value={shareLink} readOnly />
                <Button onClick={copyToClipboard} size="icon" variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={() => {
                  setShareLink('')
                  setShareSettings({
                    permission: 'view',
                    expiresIn: '7',
                    maxUses: '',
                    hasExpiry: true,
                    hasMaxUses: false,
                  })
                }}
                variant="outline"
                className="w-full"
              >
                새 링크 생성
              </Button>
            </div>
          )}

          {/* 활성 공유 링크 목록 */}
          {activeShares.length > 0 && (
            <div className="space-y-2">
              <Label>활성 공유 링크</Label>
              <div className="space-y-2 rounded-lg border p-3">
                {activeShares.map((share) => (
                  <div
                    key={share.share_id}
                    className="flex items-center justify-between rounded border p-2"
                  >
                    <div className="flex-1 text-sm">
                      <div className="font-medium">
                        {share.permission === 'view'
                          ? '보기 전용'
                          : '편집 가능'}
                      </div>
                      <div className="text-gray-500">
                        {share.expires_at
                          ? `만료: ${format(new Date(share.expires_at), 'yyyy-MM-dd', { locale: ko })}`
                          : '무제한'}
                        {share.max_uses &&
                          ` | ${share.use_count}/${share.max_uses}회 사용`}
                      </div>
                    </div>
                    <Button
                      onClick={() => deactivateShare(share.share_id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                    >
                      비활성화
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
