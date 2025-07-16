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
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: 'contact/',
        params: { page, limit },
      }),
      transformResponse: (response) => ({
        items: response.items || [],
        total: response.total || 0,
      }),
      providesTags: ['Contact'],
    }),
    verifyContactPassword: builder.mutation({
      query: ({ contactId, email, password }) => ({
        url: `contact/${contactId}/verify-password`,
        method: 'POST',
        body: { email, password },
      }),
    }),
    getContact: builder.query({
      query: (contactId) => `contact/${contactId}`,
      providesTags: ['Contact'],
    }),
  }),
})

export const {
  useSubmitContactMutation,
  useGetContactsQuery,
  useLazyGetContactQuery,
  useVerifyContactPasswordMutation,
} = contactApi
