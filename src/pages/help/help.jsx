import { useState, useMemo, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

const helpCategories = [
  {
    key: 'common',
    label: '자주 묻는 질문',
    faqs: [
      {
        q: 'Weather Flick은 어떤 서비스인가요?',
        a: 'Weather Flick은 날씨 기반 맞춤형 여행지 추천 및 여행 플래너 서비스를 제공합니다.',
      },
      {
        q: '여행지 추천은 어떻게 이루어지나요?',
        a: '기상청, 관광공사 등 다양한 데이터를 바탕으로 사용자의 선호와 날씨를 고려해 추천합니다.',
      },
      {
        q: '계정이 잠겼어요. 어떻게 해야 하나요?',
        a: '로그인 화면에서 "비밀번호 찾기"를 이용하거나, 고객센터로 문의해 주세요.',
      },
    ],
  },
  {
    key: 'account',
    label: '계정/보안',
    faqs: [
      {
        q: '비밀번호를 잊어버렸어요.',
        a: '로그인 화면의 "비밀번호 찾기"를 통해 재설정할 수 있습니다.',
      },
      {
        q: '이메일 인증이 안 돼요.',
        a: '스팸함을 확인하거나, 인증 메일 재발송을 시도해 주세요.',
      },
      {
        q: '회원 탈퇴는 어떻게 하나요?',
        a: '마이페이지 > 계정설정에서 회원 탈퇴를 진행할 수 있습니다.',
      },
    ],
  },
  {
    key: 'service',
    label: '서비스 이용',
    faqs: [
      {
        q: '여행 플래너는 어떻게 사용하나요?',
        a: '여행 플래너 메뉴에서 여행 일정을 추가하고, 추천 여행지를 선택해 계획을 세울 수 있습니다.',
      },
      {
        q: '리뷰는 어떻게 작성하나요?',
        a: '여행지 상세 페이지에서 리뷰를 남길 수 있습니다.',
      },
      {
        q: '날씨 정보는 어디서 확인하나요?',
        a: '여행지 상세, 플래너, 대시보드 등에서 실시간 날씨 정보를 제공합니다.',
      },
    ],
  },
  {
    key: 'privacy',
    label: '개인정보/정책',
    faqs: [
      {
        q: '내 정보는 안전하게 보호되나요?',
        a: 'Weather Flick은 개인정보 보호법을 준수하며, 암호화 및 보안 정책을 적용합니다.',
      },
      {
        q: '광고/마케팅 수신 동의는 어떻게 변경하나요?',
        a: '마이페이지 > 알림설정에서 변경할 수 있습니다.',
      },
      {
        q: '데이터 삭제 요청은 어떻게 하나요?',
        a: '고객센터로 문의하시면 신속히 처리해 드립니다.',
      },
    ],
  },
]

export default function HelpPage() {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('common')

  // 검색 결과 필터링
  const filteredFaqs = useMemo(() => {
    if (!search.trim()) return helpCategories
    const lower = search.toLowerCase()
    return helpCategories
      .map((cat) => ({
        ...cat,
        faqs: cat.faqs.filter(
          (faq) =>
            faq.q.toLowerCase().includes(lower) ||
            faq.a.toLowerCase().includes(lower),
        ),
      }))
      .filter((cat) => cat.faqs.length > 0)
  }, [search])

  // 탭 변경 핸들러
  const handleTabChange = useCallback((key) => {
    setTab(key)
    setSearch('')
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <h1 className="mb-2 text-center text-3xl font-bold">도움말 센터</h1>
      <p className="mb-8 text-center text-gray-500">
        Weather Flick 서비스 이용에 궁금한 점을 빠르게 찾아보세요.
      </p>
      <div className="mb-6 flex flex-col items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="궁금한 내용을 검색하세요 (예: 비밀번호, 여행지 추천)"
          className="w-full max-w-md"
          aria-label="도움말 검색"
        />
      </div>
      <Tabs value={tab} onValueChange={handleTabChange} className="mb-8">
        <TabsList className="flex flex-wrap justify-center gap-2">
          {helpCategories.map((cat) => (
            <TabsTrigger
              key={cat.key}
              value={cat.key}
              className="min-w-[100px]"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {helpCategories.map((cat) => (
          <TabsContent key={cat.key} value={cat.key}>
            <div className="mt-6 space-y-4">
              {filteredFaqs.find((f) => f.key === cat.key)?.faqs.length ? (
                filteredFaqs
                  .find((f) => f.key === cat.key)
                  .faqs.map((faq, i) => (
                    <Card key={i} className="bg-white p-4 dark:bg-gray-800">
                      <div className="mb-1 text-base font-semibold">
                        Q. {faq.q}
                      </div>
                      <Separator className="my-2" />
                      <div className="text-gray-700 dark:text-gray-200">
                        {faq.a}
                      </div>
                    </Card>
                  ))
              ) : (
                <div className="py-8 text-center text-gray-400">
                  해당 카테고리에 검색 결과가 없습니다.
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      <div className="mt-12 text-center text-xs text-gray-400 dark:text-gray-500">
        본 도움말은 Weather Flick 서비스 이용자를 위한 안내입니다.
        <br />
        추가 문의는{' '}
        <a href="mailto:contact@weatherflick.com" className="underline">
          고객센터 이메일
        </a>
        로 연락해 주세요.
      </div>
    </div>
  )
}
