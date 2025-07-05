// RTK Query Base Query exports
export { baseQuery, baseQueryWithReauth } from './baseQuery'

// RTK Query API exports
export { authApi } from './authApi'

// Export all hooks for convenience
export {
  // Auth API hooks
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
} from './authApi'