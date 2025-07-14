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
  }),
})

export const { useSubmitContactMutation, useGetContactsQuery } = contactApi
