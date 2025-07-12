import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const customTravelApi = createApi({
  reducerPath: 'customTravelApi',
  baseQuery,
  tagTypes: ['CustomTravel'],
  endpoints: (builder) => ({
    getCustomTravelRecommendations: builder.mutation({
      query: (data) => ({
        url: '/custom-travel/recommendations',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response,
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          message: response.data?.detail || '추천 생성에 실패했습니다.',
        };
      },
    }),
  }),
});

export const { useGetCustomTravelRecommendationsMutation } = customTravelApi;