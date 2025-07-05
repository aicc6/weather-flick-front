// RTK Query Base Query exports
export { baseQuery, baseQueryWithReauth } from './baseQuery'

// RTK Query API exports
export { authApi } from './authApi'
export { travelPlansApi } from './travelPlansApi'
export { destinationsApi } from './destinationsApi'
export { weatherApi } from './weatherApi'
export { regionsApi } from './regionsApi'

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
  useWithdrawMutation,
} from './authApi'

export {
  // Travel Plans API hooks
  useCreateTravelPlanMutation,
  useGetUserPlansQuery,
  useGetTravelPlanQuery,
  useUpdateTravelPlanMutation,
  useDeleteTravelPlanMutation,
  useShareTravelPlanMutation,
  useGetDestinationRecommendationsQuery,
  useGeneratePlanRecommendationMutation,
} from './travelPlansApi'

export {
  // Destinations API hooks
  useSearchDestinationsQuery,
  useGetDestinationRecommendationsQuery as useGetDestinationRecommendationsQueryDest,
  useGetDestinationsByRegionQuery,
  useGetDestinationDetailQuery,
} from './destinationsApi'

export {
  // Weather API hooks
  useGetWeatherByPlaceIdQuery,
  useGetCurrentWeatherQuery,
  useGetWeatherForecastByCityQuery,
} from './weatherApi'

export {
  // Regions API hooks
  useGetRegionsQuery,
  useGetRegionDetailQuery,
  useGetRegionStatsQuery,
  useGetActiveRegionsQuery,
  useSearchRegionsQuery,
  useUpdateRegionMutation,
  useReverseGeocodeMutation,
} from './regionsApi'
