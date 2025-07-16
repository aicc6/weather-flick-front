import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, AlertCircle } from '@/components/icons'
import { Link } from 'react-router-dom'

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                홈으로 돌아가기
              </Link>
            </Button>
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-800"
            >
              🚧 개발 버전
            </Badge>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-2xl">
              <Shield className="h-8 w-8 text-blue-600" />
              <span>개인정보처리방침</span>
            </CardTitle>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>시행일자: 2024년 1월 1일</span>
              <span>•</span>
              <span>최종 수정: 2024년 12월 31일</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* 중요 안내 */}
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-orange-600" />
                <div>
                  <h3 className="mb-1 font-semibold text-orange-800">
                    개발 중인 서비스 안내
                  </h3>
                  <p className="text-sm text-orange-700">
                    현재 Weather Flick은 개발 단계의 서비스입니다. 정식 서비스
                    런칭 시 법무 검토를 거친 정식 개인정보처리방침으로 교체될
                    예정입니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 개인정보처리방침 내용 */}
            <div className="prose max-w-none">
              <h2 className="mb-4 text-xl font-bold text-gray-800">
                제1조 (개인정보의 처리목적)
              </h2>
              <p className="mb-6 text-gray-700">
                Weather Flick(이하 &apos;회사&apos;)은 다음의 목적을 위하여 개인정보를
                처리합니다:
              </p>
              <ul className="mb-8 list-inside list-disc space-y-2 text-gray-700">
                <li>회원 가입, 로그인 및 회원 관리</li>
                <li>맞춤형 여행 추천 서비스 제공</li>
                <li>날씨 기반 여행 계획 서비스 제공</li>
                <li>고객 문의 및 민원 처리</li>
                <li>서비스 개선 및 새로운 서비스 개발</li>
              </ul>

              <h2 className="mb-4 text-xl font-bold text-gray-800">
                제2조 (처리하는 개인정보의 항목)
              </h2>
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="mb-2 font-semibold text-green-700">
                      ✅ 필수정보
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• 이메일 주소</li>
                      <li>• 닉네임</li>
                      <li>• 비밀번호 (암호화 저장)</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="mb-2 font-semibold text-blue-700">
                      📝 선택정보
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• 프로필 사진</li>
                      <li>• 여행 선호도</li>
                      <li>• 관심 지역</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <h2 className="mb-4 text-xl font-bold text-gray-800">
                제3조 (개인정보의 처리 및 보유기간)
              </h2>
              <p className="mb-4 text-gray-700">
                회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터
                개인정보를 수집시에 동의받은 개인정보 보유·이용기간 내에서
                개인정보를 처리·보유합니다.
              </p>
              <div className="mb-8 rounded-lg bg-blue-50 p-4">
                <h4 className="mb-2 font-semibold text-blue-800">
                  주요 보유기간
                </h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• 회원정보: 회원 탈퇴 시까지</li>
                  <li>• 여행 계획 데이터: 회원 탈퇴 후 1년</li>
                  <li>• 고객 문의 기록: 처리 완료 후 3년</li>
                </ul>
              </div>

              <h2 className="mb-4 text-xl font-bold text-gray-800">
                제4조 (개인정보의 제3자 제공)
              </h2>
              <p className="mb-6 text-gray-700">
                회사는 개인정보를 제1조의 목적 범위 내에서만 처리하며,
                정보주체의 동의 없이는 본래의 목적 범위를 초과하여 처리하거나
                제3자에게 제공하지 않습니다.
              </p>

              <h2 className="mb-4 text-xl font-bold text-gray-800">
                제5조 (정보주체의 권리·의무 및 행사방법)
              </h2>
              <p className="mb-4 text-gray-700">
                정보주체는 언제든지 다음과 같은 권리를 행사할 수 있습니다:
              </p>
              <ul className="mb-8 list-inside list-disc space-y-2 text-gray-700">
                <li>개인정보 처리현황 통지 요구</li>
                <li>개인정보 열람 요구</li>
                <li>개인정보 정정·삭제 요구</li>
                <li>개인정보 처리정지 요구</li>
              </ul>
            </div>

            {/* 연락처 정보 */}
            <div className="rounded-lg bg-gray-50 p-6">
              <h3 className="mb-4 font-semibold text-gray-800">
                개인정보 보호책임자
              </h3>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div>
                  <span className="font-medium text-gray-700">이메일:</span>
                  <span className="ml-2 text-blue-600">
                    privacy@weatherflick.com
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">고객센터:</span>
                  <span className="ml-2 text-gray-600">
                    support@weatherflick.com
                  </span>
                </div>
              </div>
            </div>

            {/* 하단 안내 */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른
                변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행
                7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage
