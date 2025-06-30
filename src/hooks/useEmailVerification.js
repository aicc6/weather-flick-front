import { useState } from 'react'
import { http } from '@/lib/http'

export const useEmailVerification = () => {
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [verificationInput, setVerificationInput] = useState('')
  const [verificationMsg, setVerificationMsg] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const sendVerificationCode = async (email, nickname) => {
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setVerificationMsg('올바른 이메일 형식을 입력해주세요.')
      return false
    }

    if (!nickname || nickname.trim().length < 2) {
      setVerificationMsg('닉네임을 먼저 입력해주세요.')
      return false
    }

    setVerificationMsg('')
    setVerificationSent(false)
    setIsEmailVerified(false)
    setIsSending(true)
    setVerificationMsg('인증번호 발송 중...')

    try {
      const response = await http.POST('auth/send-verification', {
        body: { email, nickname },
      })

      if (!response.ok) {
        throw new Error('이메일 인증코드 발송에 실패했습니다.')
      }

      setVerificationSent(true)
      setVerificationMsg('인증번호가 이메일로 발송되었습니다.')
      return true
    } catch {
      setVerificationMsg(
        '이미 가입되어 있는 이메일입니다. 다른 이메일을 입력해주세요.',
      )
      return false
    } finally {
      setIsSending(false)
    }
  }

  const verifyCode = async (email, code) => {
    setIsVerifying(true)
    setVerificationMsg('')

    try {
      const response = await http.POST('auth/verify-email', {
        body: {
          email,
          code,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        setVerificationMsg(
          data.detail || '인증에 실패했습니다. 인증번호를 확인해 주세요.',
        )
        setIsEmailVerified(false)
        return false
      }

      setVerificationMsg('이메일 인증이 완료되었습니다!')
      setIsEmailVerified(true)
      setVerificationInput('')
      return true
    } catch {
      setVerificationMsg('인증에 실패했습니다. 네트워크 오류.')
      setIsEmailVerified(false)
      return false
    } finally {
      setIsVerifying(false)
    }
  }

  const resetVerification = () => {
    setIsEmailVerified(false)
    setVerificationSent(false)
    setVerificationInput('')
    setVerificationMsg('')
    setIsVerifying(false)
    setIsSending(false)
  }

  return {
    isEmailVerified,
    verificationSent,
    verificationInput,
    setVerificationInput,
    verificationMsg,
    isVerifying,
    isSending,
    sendVerificationCode,
    verifyCode,
    resetVerification,
  }
}
