import { useState, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, Clock, Info } from '@/components/icons'

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

// 기존 문의 목록 (예시 데이터)
const existingInquiries = [
  {
    id: 1,
    category: '서비스 이용',
    title: '여행지 추천 알고리즘 개선 제안',
    status: '완료',
    views: 45,
    date: '2024-01-15',
    isPublic: true,
  },
  {
    id: 2,
    category: '계정/보안',
    title: '비밀번호 재설정 관련 문의',
    status: '처리중',
    views: 12,
    date: '2024-01-14',
    isPublic: false,
  },
  {
    id: 3,
    category: '기술 지원',
    title: '날씨 정보 업데이트 지연 문제',
    status: '완료',
    views: 78,
    date: '2024-01-13',
    isPublic: true,
  },
  {
    id: 4,
    category: '기타',
    title: '모바일 앱 출시 일정 문의',
    status: '답변대기',
    views: 23,
    date: '2024-01-12',
    isPublic: true,
  },
]

const inquiryCategories = [
  { value: 'service', label: '서비스 이용' },
  { value: 'account', label: '계정/보안' },
  { value: 'technical', label: '기술 지원' },
  { value: 'other', label: '기타' },
]

const statusColors = {
  완료: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  처리중: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  답변대기:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
}

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState('write')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
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

  // 문의 제출 핸들러
  const onSubmit = useCallback(
    async (data) => {
      try {
        console.log('문의 제출:', data)
        // TODO: API 호출 로직 추가
        alert('문의가 성공적으로 접수되었습니다.')
        reset()
      } catch (error) {
        alert('문의 접수 중 오류가 발생했습니다.')
      }
    },
    [reset],
  )

  // 필터링된 문의 목록
  const filteredInquiries = useMemo(() => {
    return existingInquiries.filter((inquiry) => {
      const matchesSearch = inquiry.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchesCategory =
        selectedCategory === 'all' || inquiry.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory])

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

      {/* 탭 네비게이션 */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="write">문의하기</TabsTrigger>
          <TabsTrigger value="list">문의 목록</TabsTrigger>
        </TabsList>

        {/* 문의 작성 탭 */}
        <TabsContent value="write">
          <Card>
            <CardHeader>
              <CardTitle>새로운 문의 작성</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* 문의 분류 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">문의 분류 *</label>
                  <Select
                    onValueChange={(value) => setValue('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="문의 분류를 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {inquiryCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* 제목 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">제목 *</label>
                  <Input
                    {...register('title')}
                    placeholder="문의 제목을 입력해주세요"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* 문의 내용 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">문의 내용 *</label>
                  <Textarea
                    {...register('content')}
                    placeholder="문의 내용을 자세히 작성해주세요"
                    rows={6}
                    className={errors.content ? 'border-red-500' : ''}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>최소 10자 이상 입력해주세요</span>
                    <span>{watch('content')?.length || 0}/1000</span>
                  </div>
                  {errors.content && (
                    <p className="text-sm text-red-600">
                      {errors.content.message}
                    </p>
                  )}
                </div>

                {/* 연락처 정보 */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">이름 *</label>
                    <Input
                      {...register('name')}
                      placeholder="이름을 입력해주세요"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">이메일 *</label>
                    <Input
                      {...register('email')}
                      type="email"
                      placeholder="이메일을 입력해주세요"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* 공개 설정 */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    {...register('isPublic')}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isPublic" className="text-sm">
                    다른 사용자에게 공개하기 (답변 내용이 공개됩니다)
                  </label>
                </div>

                {/* 제출 버튼 */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? '문의 접수 중...' : '문의 접수하기'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 문의 목록 탭 */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>문의 목록</CardTitle>
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
                      <SelectItem key={cat.value} value={cat.label}>
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
                    {filteredInquiries.map((inquiry) => (
                      <tr
                        key={inquiry.id}
                        className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-2 py-3">{inquiry.id}</td>
                        <td className="px-2 py-3">{inquiry.category}</td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-2">
                            <span className="max-w-xs truncate">
                              {inquiry.title}
                            </span>
                            {!inquiry.isPublic && (
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
                        <td className="px-2 py-3 text-center">
                          {inquiry.views}
                        </td>
                        <td className="px-2 py-3 text-center">
                          {inquiry.date}
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
        </TabsContent>
      </Tabs>

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
