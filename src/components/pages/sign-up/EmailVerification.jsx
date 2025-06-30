import { forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const EmailVerification = forwardRef(function EmailVerification(
  {
    register,
    errors,
    isEmailVerified,
    verificationSent,
    verificationInput,
    setVerificationInput,
    verificationMsg,
    isVerifying,
    isSending,
    onSendVerification,
    onVerifyCode,
  },
  ref,
) {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">이메일</Label>
      <div className="flex gap-2">
        <Input
          id="email"
          type="email"
          placeholder="example@email.com"
          {...register('email')}
          ref={ref}
          className={errors.email ? 'flex-1 border-red-500' : 'flex-1'}
          disabled={isEmailVerified}
        />
        <Button
          type="button"
          variant="outline"
          onClick={onSendVerification}
          disabled={isEmailVerified || isSending}
        >
          {isSending ? '발송 중...' : '인증번호 발송'}
        </Button>
      </div>

      {verificationSent && (
        <div className="mt-2 flex gap-2">
          <Input
            type="text"
            placeholder="인증번호 입력"
            value={verificationInput}
            onChange={(e) => setVerificationInput(e.target.value)}
            className="flex-1"
          />

          <Button
            type="button"
            variant="secondary"
            onClick={onVerifyCode}
            disabled={isVerifying || isEmailVerified}
          >
            {isVerifying ? '인증 중...' : '인증하기'}
          </Button>
        </div>
      )}

      {verificationMsg && (
        <p
          className={`mt-1 text-sm ${
            isEmailVerified ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {verificationMsg}
        </p>
      )}

      {!verificationMsg && errors.email && (
        <p className="text-sm text-red-500">{errors.email.message}</p>
      )}
    </div>
  )
})
