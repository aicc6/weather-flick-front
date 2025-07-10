import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const reviewLikesApi = createApi({
  reducerPath: 'reviewLikesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ReviewLike'],
  endpoints: (builder) => ({
    getReviewLike: builder.query({
      query: (reviewId) => `/review-likes/${reviewId}`,
      providesTags: (result, error, reviewId) => [
        { type: 'ReviewLike', id: reviewId },
      ],
    }),
    likeReview: builder.mutation({
      query: ({ reviewId, isLike }) => ({
        url: '/review-likes/',
        method: 'POST',
        body: { review_id: reviewId, is_like: isLike },
      }),
      invalidatesTags: (result, error, { reviewId }) => [
        { type: 'ReviewLike', id: reviewId },
      ],
    }),
    unlikeReview: builder.mutation({
      query: ({ reviewId, isLike }) => ({
        url: `/review-likes/${reviewId}?is_like=${isLike}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { reviewId }) => [
        { type: 'ReviewLike', id: reviewId },
      ],
    }),
  }),
})

export const {
  useGetReviewLikeQuery,
  useLikeReviewMutation,
  useUnlikeReviewMutation,
} = reviewLikesApi
