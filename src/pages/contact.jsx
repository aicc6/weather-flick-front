import { useState, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, Clock, Info, PlusCircle } from '@/components/icons'
import {
  useGetContactsQuery,
  useSubmitContactMutation,
  useVerifyContactPasswordMutation,
} from '@/store/api/contactApi'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import ContactForm from '@/components/contact/ContactForm'
import { useAuth } from '@/contexts/AuthContextRTK'

// 문의 스키마 정의
const contactSchema = z.object({
  category: z.string().min(1, '문의 분류를 선택해주세요'),
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(100, '제목은 100자 이내로 입력해주세요'),
  content: z
    .string()
    .min(10, '문의 내용을 10자 이상 입력해주세요')
    .max(1000, '문의 내용은 1000자 이내로 입력해주세요'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  name: z.string().min(1, '이름을 입력해주세요'),
  isPublic: z.boolean().default(false),
})

// 문의 분류 카테고리
const inquiryCategories = [
  { value: '일반 문의', label: '일반 문의' },
  { value: '버그 신고', label: '버그 신고' },
  { value: '기능 요청', label: '기능 요청' },
  { value: '기타', label: '기타' },
]

// 문의 상태 색상
const statusColors = {
  대기중:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  처리중: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  완료: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  '답변 대기':
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  비공개: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

// 날짜 포맷 함수
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul', // KST로 변환
  })
}

export default function ContactPage() {
  // RTK Query로 DB에서 문의 목록 가져오기
  const {
    data: existingInquiries = [],
    isLoading,
    isError,
  } = useGetContactsQuery()

  const [_activeTab, _setActiveTab] = useState('write')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [detailInquiry, setDetailInquiry] = useState(null)

  const {
    _register,
    _handleSubmit,
    formState: { _errors, _isSubmitting },
    reset,
    _watch,
    _setValue,
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      category: '',
      title: '',
      content: '',
      email: '',
      name: '',
      isPublic: false,
    },
  })

  const [submitContact] = useSubmitContactMutation()
  const [verifyContactPassword] = useVerifyContactPasswordMutation()

  const { user } = useAuth() || {}

  // 문의 제출 핸들러
  const _onSubmit = useCallback(
    async (data) => {
      try {
        await submitContact(data).unwrap()
        alert('문의가 성공적으로 접수되었습니다.')
        reset()
      } catch (_error) {
        alert('문의 접수 중 오류가 발생했습니다.')
      }
    },
    [reset, submitContact],
  )

  // 문의 등록 성공 시 모달 닫기
  const handleFormSuccess = useCallback(() => {
    setFormOpen(false)
  }, [])

  // 필터링된 문의 목록 (항상 훅 최상단에서 호출)
  const filteredInquiries = useMemo(() => {
    return existingInquiries.filter((inquiry) => {
      const matchesSearch = inquiry.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchesCategory =
        selectedCategory === 'all' || inquiry.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [existingInquiries, searchTerm, selectedCategory])

  // isPublic: true = 비공개글, false = 공개글
  // 상세 모달 열기
  const handleTitleClick = (inquiry) => {
    // 비공개 문의: 작성자만 열람
    if (inquiry.isPublic || inquiry.is_public) {
      if (!user || user.email !== inquiry.email) {
        alert('비공개 문의입니다. 작성자만 열람할 수 있습니다.')
        return
      }
      setSelectedInquiry(inquiry)
      setPasswordModalOpen(true)
      setPassword('')
      setPasswordError('')
      return
    }
    // 공개 문의: 누구나 바로 열람
    setDetailInquiry(inquiry)
    setModalOpen(true)
  }

  // 상세 모달 닫기
  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedInquiry(null)
  }

  if (isLoading) return <div>문의 목록을 불러오는 중입니다...</div>
  if (isError) return <div>문의 목록을 불러오지 못했습니다.</div>

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-16">
      {/* 헤더 */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold">문의사항</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Weather Flick 서비스 이용에 불편하신 점이 있으시다면 언제든 말씀해
          주세요.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>contact@weatherflick.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>02-1234-5678</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>평일 09:00-18:00</span>
          </div>
        </div>
      </div>

      {/* 안내 카드 */}
      <Card className="mb-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                문의사항 답변 절차
              </h3>
              <ol className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li>① 문의 확인 → ② 담당자 전달 → ③ 답변 작성 → ④ 답변 등록</li>
                <li>
                  답변 작성 중 필요시 담당자가 연락을 드릴 수 있으며, 답변 등록
                  전까지 &apos;처리중&apos;으로 표시됩니다.
                </li>
                <li>
                  문의사항에 작성된 내용은 본인 외에는 확인하실 수 없습니다.
                  (공개 설정 시 제외)
                </li>
                <li>
                  답변 기한은 7일이며, 추가 검토가 필요한 경우 14일까지 소요될
                  수 있습니다.
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 문의 목록 탭 */}
      <Card>
        <CardHeader>
          <CardTitle>문의 목록</CardTitle>
          <CardAction>
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogTrigger asChild>
                <Button variant="primary" size="sm" aria-label="문의하기">
                  <PlusCircle className="mr-1" /> 문의하기
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>문의하기</DialogTitle>
                <ContactForm
                  onSuccess={handleFormSuccess}
                  defaultName={user?.nickname || ''}
                  defaultEmail={user?.email || ''}
                />
              </DialogContent>
            </Dialog>
          </CardAction>
        </CardHeader>
        <CardContent>
          {/* 검색 및 필터 */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <Input
              placeholder="제목으로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="전체 분류" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 분류</SelectItem>
                {inquiryCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 문의 목록 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-2 py-3 text-left">번호</th>
                  <th className="px-2 py-3 text-left">분류</th>
                  <th className="px-2 py-3 text-left">제목</th>
                  <th className="px-2 py-3 text-center">답변여부</th>
                  <th className="px-2 py-3 text-center">조회수</th>
                  <th className="px-2 py-3 text-center">등록일</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map((inquiry, index) => (
                  <tr
                    key={inquiry.id}
                    className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-2 py-3">
                      {filteredInquiries.length - index}
                    </td>
                    <td className="px-2 py-3">{inquiry.category}</td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="max-w-xs truncate text-left text-blue-700 underline hover:text-blue-900 focus:outline-none"
                          onClick={() => handleTitleClick(inquiry)}
                          aria-label="문의 상세 보기"
                        >
                          {inquiry.title}
                        </button>
                        {/* 대기중 뱃지 항상 표시 */}
                        <Badge className={statusColors['대기중']}>대기중</Badge>
                        {/* 비공개 뱃지는 isPublic true일 때만 표시 */}
                        {(inquiry.isPublic || inquiry.is_public) && (
                          <Badge variant="secondary" className="text-xs">
                            비공개
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <Badge className={statusColors[inquiry.status]}>
                        {inquiry.status}
                      </Badge>
                    </td>
                    <td className="px-2 py-3 text-center">{inquiry.views}</td>
                    <td className="px-2 py-3 text-center">
                      {formatDate(inquiry.created_at || inquiry.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInquiries.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              검색 결과가 없습니다.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상세 모달 */}
      {modalOpen && (detailInquiry || selectedInquiry) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
              onClick={handleCloseModal}
              aria-label="닫기"
            >
              ×
            </button>
            <h3 className="mb-2 text-xl font-bold">
              {(detailInquiry || selectedInquiry).title}
            </h3>
            <div className="mb-4 whitespace-pre-line text-gray-700 dark:text-gray-200">
              {(detailInquiry || selectedInquiry).content}
            </div>
            <div className="mb-2 text-sm text-gray-500">
              <span className="font-medium">분류:</span>{' '}
              {(detailInquiry || selectedInquiry).category}
            </div>
            <div className="mb-2 text-sm text-gray-500">
              <span className="font-medium">이름:</span>{' '}
              {(detailInquiry || selectedInquiry).name}
            </div>
            <div className="mb-2 text-sm text-gray-500">
              <span className="font-medium">이메일:</span>{' '}
              {(detailInquiry || selectedInquiry).email}
            </div>
            <div className="mb-2 text-sm text-gray-500">
              <span className="font-medium">등록일:</span>{' '}
              {formatDate(
                (detailInquiry || selectedInquiry).created_at ||
                  (detailInquiry || selectedInquiry).date,
              )}
            </div>
            <div className="text-right">
              <button
                className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                onClick={handleCloseModal}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
      {passwordModalOpen && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
              onClick={() => {
                setPasswordModalOpen(false)
                setSelectedInquiry(null)
              }}
              aria-label="닫기"
            >
              ×
            </button>
            <h3 className="mb-4 text-lg font-bold">비밀번호 확인</h3>
            <input
              type="password"
              className="mb-2 w-full rounded border px-3 py-2"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {passwordError && (
              <div className="mb-2 text-sm text-red-600">{passwordError}</div>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                onClick={() => {
                  setPasswordModalOpen(false)
                  setSelectedInquiry(null)
                }}
              >
                취소
              </button>
              <button
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                onClick={async () => {
                  try {
                    await verifyContactPassword({
                      contactId: selectedInquiry.id,
                      email: user.email,
                      password,
                    }).unwrap()
                    setDetailInquiry(selectedInquiry)
                    setModalOpen(true)
                    setPasswordModalOpen(false)
                    setSelectedInquiry(null)
                    setPassword('')
                    setPasswordError('')
                  } catch (e) {
                    setPasswordError('비밀번호가 올바르지 않습니다.')
                  }
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 하단 안내 */}
      <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        <p className="mb-2">
          문의사항 이외의 민원성 요청은 서울시 홈페이지 응답소를 이용해 주시기
          바랍니다.
        </p>
        <a
          href="https://eungdapso.seoul.go.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          서울시 응답소 바로가기
        </a>
      </div>
    </div>
  )
}
