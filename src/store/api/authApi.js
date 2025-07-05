import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // 회원가입
    register: builder.mutation({
      query: (userData) => ({
        url: 'auth/register',
        method: 'POST',
        body: userData
      })
    }),

    // 로그인 (FastAPI OAuth2PasswordRequestForm 형식)
    login: builder.mutation({
      query: (credentials) => {
        const formData = new URLSearchParams()
        formData.append('username', credentials.username)
        formData.append('password', credentials.password)

        return {
          url: 'auth/login',
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      },
      invalidatesTags: ['User']
    }),

    // 로그아웃
    logout: builder.mutation({
      query: () => ({
        url: 'auth/logout',
        method: 'POST'
      }),
      invalidatesTags: ['User']
    }),

    // 현재 사용자 정보 조회
    getMe: builder.query({
      query: () => 'auth/me',
      providesTags: ['User'],
      keepUnusedDataFor: 60 // 1분간 캐싱
    }),

    // 사용자 프로필 업데이트
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: 'auth/me',
        method: 'PUT',
        body: userData
      }),
      invalidatesTags: ['User']
    }),

    // 비밀번호 변경
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: 'auth/change-password',
        method: 'POST',
        body: passwordData
      })
    }),

    // 구글 OAuth 인증 URL 생성
    getGoogleAuthUrl: builder.query({
      query: () => 'auth/google/auth-url'
    }),

    // OAuth 콜백 처리 (기존 방식 - 호환성을 위해 유지)
    googleCallback: builder.query({
      query: ({ code, state }) => ({
        url: 'auth/google/callback',
        params: { code, state }
      })
    }),

    // 임시 인증 코드를 JWT 토큰으로 교환 (새로운 보안 방식)
    exchangeGoogleAuthCode: builder.mutation({
      query: (authCode) => ({
        url: 'auth/google/exchange',
        method: 'POST',
        body: { auth_code: authCode }
      }),
      invalidatesTags: ['User']
    }),

    // 비밀번호 찾기 (임시 비밀번호 발급)
    forgotPassword: builder.mutation({
      query: (userData) => ({
        url: 'auth/forgot-password',
        method: 'POST',
        body: { email: userData.email }
      })
    }),

    // 회원탈퇴
    withdraw: builder.mutation({
      query: (withdrawData) => ({
        url: 'auth/withdraw',
        method: 'DELETE',
        body: withdrawData
      }),
      invalidatesTags: ['User']
    })
  })
})

// Export hooks for usage in functional components
export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetGoogleAuthUrlQuery,
  useGoogleCallbackQuery,
  useExchangeGoogleAuthCodeMutation,
  useForgotPasswordMutation,
  useWithdrawMutation
} = authApi