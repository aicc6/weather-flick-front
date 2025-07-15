import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-16">
      {/* 헤더 */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold">이용약관</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Weather Flick 서비스 이용에 관한 약관입니다.
        </p>
        <div className="mt-4 text-sm text-gray-500">시행일: 2024년 1월 1일</div>
      </div>

      {/* 약관 내용 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Weather Flick 서비스 이용약관</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm leading-relaxed">
          {/* 제1장 총칙 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">제1장 총칙</h2>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-medium">제1조 (목적)</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  본 약관은 Weather Flick(이하 &quot;회사&quot;)이 제공하는 날씨
                  기반 맞춤형 여행 추천 서비스(이하 &quot;서비스&quot;)의 이용과
                  관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타
                  필요한 사항을 규정함을 목적으로 합니다.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-medium">제2조 (정의)</h3>
                <ol className="list-inside list-decimal space-y-2 text-gray-700 dark:text-gray-300">
                  <li>
                    &quot;서비스&quot;란 회사가 제공하는 날씨 정보를 기반으로 한
                    여행지 추천, 여행 계획 수립, 여행 리뷰 등과 관련된 모든
                    서비스를 의미합니다.
                  </li>
                  <li>
                    &quot;이용자&quot;란 본 약관에 따라 회사와 이용계약을
                    체결하고 회사가 제공하는 서비스를 이용하는 회원 및 비회원을
                    의미합니다.
                  </li>
                  <li>
                    &quot;회원&quot;이란 회사에 개인정보를 제공하여 회원등록을
                    한 자로서, 회사의 정보를 지속적으로 제공받으며, 회사가
                    제공하는 서비스를 계속적으로 이용할 수 있는 자를 의미합니다.
                  </li>
                  <li>
                    &quot;비회원&quot;이란 회원에 가입하지 않고 회사가 제공하는
                    서비스를 이용하는 자를 의미합니다.
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 font-medium">
                  제3조 (약관의 효력 및 변경)
                </h3>
                <ol className="list-inside list-decimal space-y-2 text-gray-700 dark:text-gray-300">
                  <li>
                    본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게
                    공지함으로써 효력이 발생합니다.
                  </li>
                  <li>
                    회사는 필요한 경우 관련법령을 위배하지 않는 범위에서 본
                    약관을 변경할 수 있습니다.
                  </li>
                  <li>
                    약관이 변경되는 경우, 회사는 변경사항을 시행일자 7일 전부터
                    공지사항을 통해 공지합니다.
                  </li>
                </ol>
              </div>
            </div>
          </section>

          <Separator />

          {/* 제2장 서비스 이용 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">제2장 서비스 이용</h2>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-medium">제4조 (서비스의 제공)</h3>
                <ol className="list-inside list-decimal space-y-2 text-gray-700 dark:text-gray-300">
                  <li>
                    회사는 다음과 같은 서비스를 제공합니다:
                    <ul className="mt-2 ml-4 list-inside list-disc space-y-1">
                      <li>날씨 기반 여행지 추천 서비스</li>
                      <li>여행 계획 수립 및 관리 서비스</li>
                      <li>여행 리뷰 및 평가 서비스</li>
                      <li>기상청 및 관광공사 데이터 연동 서비스</li>
                      <li>기타 회사가 정하는 서비스</li>
                    </ul>
                  </li>
                  <li>
                    서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 font-medium">제5조 (서비스의 중단)</h3>
                <ol className="list-inside list-decimal space-y-2 text-gray-700 dark:text-gray-300">
                  <li>
                    회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장,
                    통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을
                    일시적으로 중단할 수 있습니다.
                  </li>
                  <li>
                    회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로
                    인하여 이용자 또는 제3자가 입은 손해에 대하여 배상하지
                    아니합니다.
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 font-medium">제6조 (회원가입)</h3>
                <ol className="list-inside list-decimal space-y-2 text-gray-700 dark:text-gray-300">
                  <li>
                    이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후
                    본 약관에 동의한다는 의사표시를 함으로서 회원가입을
                    신청합니다.
                  </li>
                  <li>
                    회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중
                    다음 각호에 해당하지 않는 한 회원으로 등록합니다:
                    <ul className="mt-2 ml-4 list-inside list-disc space-y-1">
                      <li>
                        가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한
                        적이 있는 경우
                      </li>
                      <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                      <li>
                        기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이
                        있다고 판단되는 경우
                      </li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>
          </section>

          <Separator />

          {/* 제3장 개인정보보호 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">제3장 개인정보보호</h2>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-medium">
                  제7조 (개인정보의 수집 및 이용)
                </h3>
                <ol className="list-inside list-decimal space-y-2 text-gray-700 dark:text-gray-300">
                  <li>
                    회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집하고
                    이용합니다:
                    <ul className="mt-2 ml-4 list-inside list-disc space-y-1">
                      <li>필수항목: 이메일 주소, 비밀번호, 닉네임</li>
                      <li>
                        선택항목: 프로필 이미지, 선호 여행 스타일, 관심 지역
                      </li>
                    </ul>
                  </li>
                  <li>
                    회사는 개인정보 수집 시 이용자의 동의를 받고, 수집된
                    개인정보는 서비스 제공 목적 외에는 사용하지 않습니다.
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 font-medium">제8조 (개인정보의 보호)</h3>
                <ol className="list-inside list-decimal space-y-2 text-gray-700 dark:text-gray-300">
                  <li>
                    회사는 개인정보보호법 등 관련 법령이 정하는 바에 따라
                    이용자의 개인정보를 보호합니다.
                  </li>
                  <li>
                    개인정보의 수집, 이용, 제공에 관한 동의 철회, 개인정보의
                    열람, 정정, 삭제, 처리정지 등에 관한 사항은
                    개인정보처리방침에서 정합니다.
                  </li>
                </ol>
              </div>
            </div>
          </section>

          <Separator />

          {/* 제4장 권리와 의무 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">제4장 권리와 의무</h2>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-medium">제9조 (회사의 의무)</h3>
                <ol className="list-inside list-decimal space-y-2 text-gray-700 dark:text-gray-300">
                  <li>
                    회사는 관련법령과 본 약관이 금지하거나 공서양속에 반하는
                    행위를 하지 않으며 본 약관이 정하는 바에 따라 지속적이고,
                    안정적으로 서비스를 제공하기 위하여 노력합니다.
                  </li>
                  <li>
                    회사는 이용자가 안전하게 인터넷 서비스를 이용할 수 있도록
                    이용자의 개인정보(신용정보 포함) 보호를 위한 보안시스템을
                    갖추어야 합니다.
                  </li>
                  <li>
                    회사는 서비스 이용과 관련하여 이용자로부터 제기된 의견이나
                    불만이 정당하다고 객관적으로 인정될 경우에는 적절한 절차를
                    거쳐 즉시 처리하여야 합니다.
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 font-medium">제10조 (이용자의 의무)</h3>
                <ol className="list-inside list-decimal space-y-2 text-gray-700 dark:text-gray-300">
                  <li>
                    이용자는 다음 행위를 하여서는 안 됩니다:
                    <ul className="mt-2 ml-4 list-inside list-disc space-y-1">
                      <li>신청 또는 변경 시 허위내용의 등록</li>
                      <li>타인의 정보 도용</li>
                      <li>회사가 게시한 정보의 변경</li>
                      <li>
                        회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의
                        송신 또는 게시
                      </li>
                      <li>
                        회사 기타 제3자의 저작권 등 지적재산권에 대한 침해
                      </li>
                      <li>
                        회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는
                        행위
                      </li>
                      <li>
                        외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에
                        반하는 정보를 서비스에 공개 또는 게시하는 행위
                      </li>
                    </ul>
                  </li>
                  <li>
                    이용자는 관계법령, 본 약관의 규정, 이용안내 및 서비스상에
                    공지한 주의사항, 회사가 통지하는 사항 등을 준수하여야
                    합니다.
                  </li>
                </ol>
              </div>
            </div>
          </section>

          <Separator />

          {/* 제5장 기타 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">제5장 기타</h2>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-medium">
                  제11조 (저작권의 귀속 및 이용제한)
                </h3>
                <ol className="list-inside list-decimal space-y-2 text-gray-700 dark:text-gray-300">
                  <li>
                    회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에
                    귀속합니다.
                  </li>
                  <li>
                    이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게
                    지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신,
                    출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나
                    제3자에게 이용하게 하여서는 안됩니다.
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 font-medium">제12조 (분쟁해결)</h3>
                <ol className="list-inside list-decimal space-y-2 text-gray-700 dark:text-gray-300">
                  <li>
                    회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그
                    피해를 보상처리하기 위하여 피해보상처리기구를
                    설치·운영합니다.
                  </li>
                  <li>
                    회사와 이용자 간에 발생한 전자상거래 분쟁에 관하여는
                    소비자분쟁조정위원회의 조정에 따를 수 있습니다.
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 font-medium">제13조 (재판권 및 준거법)</h3>
                <ol className="list-inside list-decimal space-y-2 text-gray-700 dark:text-gray-300">
                  <li>
                    회사와 이용자 간에 발생한 분쟁에 관하여는 대한민국 법을
                    적용합니다.
                  </li>
                  <li>
                    회사와 이용자 간에 제기된 소송에는 대한민국 법원을
                    관할법원으로 합니다.
                  </li>
                </ol>
              </div>
            </div>
          </section>

          <Separator />

          {/* 부칙 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">부칙</h2>
            <div className="text-gray-700 dark:text-gray-300">
              <p className="mb-2">
                <strong>[시행일]</strong> 본 약관은 2024년 1월 1일부터
                시행됩니다.
              </p>
              <p>
                개정된 약관의 적용일자 이전 이용자 또는 회원은 개정된 이용약관의
                적용을 받습니다.
              </p>
            </div>
          </section>
        </CardContent>
      </Card>

      {/* 문의 안내 */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p className="mb-2">
          본 약관에 대한 문의사항이 있으시면 고객센터로 연락해 주시기 바랍니다.
        </p>
        <p>
          이메일:{' '}
          <a
            href="mailto:contact@weatherflick.com"
            className="text-blue-600 hover:underline"
          >
            contact@weatherflick.com
          </a>
        </p>
      </div>
    </div>
  )
}
