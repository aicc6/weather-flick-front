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
  }),
})

export const {
  useSubmitContactMutation,
  useGetContactsQuery,
  useVerifyContactPasswordMutation,
} = contactApi
