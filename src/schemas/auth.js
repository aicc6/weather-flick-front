import { z } from 'zod'

// 회원가입 폼 스키마
export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, '이름은 2자 이상이어야 합니다.')
      .max(50, '이름은 50자 이하여야 합니다.'),
    email: z
      .string()
      .min(1, '이메일을 입력해주세요.')
      .email('올바른 이메일 형식을 입력해주세요.'),
    password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다.')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다.',
      ),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  })

// 로그인 폼 스키마
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 형식을 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
})

// 에러 메시지 매핑 (인증 관련)
export const authErrorMessages = {
  'Email already registered': '이미 등록된 이메일입니다.',
  'Username already taken': '이미 사용 중인 사용자명입니다.',
  'Password is too weak':
    '비밀번호가 너무 약합니다. 대문자, 소문자, 숫자를 포함해주세요.',
  'Incorrect email or password': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'User not found': '사용자를 찾을 수 없습니다.',
  'Invalid credentials': '로그인 정보가 올바르지 않습니다.',
}
