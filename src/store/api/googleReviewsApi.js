import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

// 구글 리뷰/별점 API (백엔드 프록시)
export const googleReviewsApi = createApi({
  reducerPath: 'googleReviewsApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getGoogleReviews: builder.query({
      query: (placeId) => ({
        url: 'google/reviews',
        params: { place_id: placeId },
      }),
    }),
  }),
})

export const { useGetGoogleReviewsQuery } = googleReviewsApi
