// RTK Query Base Query exports
export { baseQuery, baseQueryWithReauth } from './baseQuery'

// RTK Query API exports
export { authApi } from './authApi'
export { travelPlansApi } from './travelPlansApi'
export { destinationsApi } from './destinationsApi'
export { weatherApi } from './weatherApi'
export { regionsApi } from './regionsApi'
export { localInfoApi } from './localInfoApi'
export { travelCoursesApi } from './travelCoursesApi'
export { recommendLikesApi } from './recommendLikesApi'
export { customTravelApi } from './customTravelApi'

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

export {
  // Local Info API hooks
  useGetAllRestaurantsQuery,
  useSearchRestaurantsQuery,
  useSearchTransportationQuery,
  useSearchAccommodationsQuery,
  useGetNearbyPlacesQuery,
  useGetCategoriesQuery,
  useGetSupportedCitiesQuery,
  useGetCityInfoQuery,
  useGetUnifiedRegionsLevel1Query,
  useGetRegionsPointQuery,
} from './localInfoApi'

export {
  // Travel Courses API hooks
  useGetTravelCoursesQuery,
  useGetTravelCourseDetailQuery,
  useGetCoursesByRegionQuery,
  useSearchTravelCoursesQuery,
} from './travelCoursesApi'

export {
  useGetCourseLikeQuery,
  useLikeCourseMutation,
  useUnlikeCourseMutation,
} from './recommendLikesApi'

export * from './travelCourseLikesApi'

export {
  // Custom Travel API hooks
  useGetCustomTravelRecommendationsMutation,
} from './customTravelApi'
