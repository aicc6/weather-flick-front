import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const contactApi = createApi({
  reducerPath: 'contactApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Contact'],
  endpoints: (builder) => ({
    submitContact: builder.mutation({
      query: (data) => ({
        url: 'contact/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Contact'],
    }),
    getContacts: builder.query({
      query: () => 'contact/',
      providesTags: ['Contact'],
    }),
    verifyContactPassword: builder.mutation({
      query: ({ contactId, email, password }) => ({
        url: `contact/${contactId}/verify-password`,
        method: 'POST',
        body: { email, password },
      }),
    }),
    // 조회수 증가
    incrementContactViews: builder.mutation({
      query: (contactId) => ({
        url: `contact/${contactId}/increment-views`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, contactId) => [
        { type: 'Contact', id: contactId },
        'Contact',
      ],
    }),
  }),
})

export const {
  useSubmitContactMutation,
  useGetContactsQuery,
  useVerifyContactPasswordMutation,
  useIncrementContactViewsMutation,
} = contactApi
