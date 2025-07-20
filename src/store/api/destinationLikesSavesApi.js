import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const destinationLikesSavesApi = createApi({
  reducerPath: 'destinationLikesSavesApi',
  baseQuery,
  tagTypes: ['DestinationLike', 'DestinationSave', 'Destination'],
  endpoints: (builder) => ({
    // 좋아요 관련 엔드포인트
    addDestinationLike: builder.mutation({
      query: (body) => ({
        url: '/destinations/likes',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { destination_id }) => [
        { type: 'DestinationLike', id: 'LIST' },
        { type: 'Destination', id: destination_id },
      ],
    }),

    removeDestinationLike: builder.mutation({
      query: (destinationId) => ({
        url: `/destinations/likes/${destinationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, destinationId) => [
        { type: 'DestinationLike', id: 'LIST' },
        { type: 'Destination', id: destinationId },
      ],
    }),

    getMyDestinationLikes: builder.query({
      query: ({ skip = 0, limit = 20 } = {}) => ({
        url: '/destinations/likes',
        params: { skip, limit },
      }),
      providesTags: ['DestinationLike'],
    }),

    // 저장(북마크) 관련 엔드포인트
    addDestinationSave: builder.mutation({
      query: (body) => ({
        url: '/destinations/saves',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { destination_id }) => [
        { type: 'DestinationSave', id: 'LIST' },
        { type: 'Destination', id: destination_id },
      ],
    }),

    removeDestinationSave: builder.mutation({
      query: (destinationId) => ({
        url: `/destinations/saves/${destinationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, destinationId) => [
        { type: 'DestinationSave', id: 'LIST' },
        { type: 'Destination', id: destinationId },
      ],
    }),

    getMyDestinationSaves: builder.query({
      query: ({ skip = 0, limit = 20 } = {}) => ({
        url: '/destinations/saves',
        params: { skip, limit },
      }),
      providesTags: ['DestinationSave'],
    }),

    updateDestinationSaveNote: builder.mutation({
      query: ({ destinationId, note }) => ({
        url: `/destinations/saves/${destinationId}`,
        method: 'PUT',
        body: { note },
      }),
      invalidatesTags: (result, error, { destinationId }) => [
        { type: 'DestinationSave', id: destinationId },
      ],
    }),

    // 여행지 상세 정보 (좋아요/저장 정보 포함)
    getDestinationDetail: builder.query({
      query: (destinationId) => ({
        url: `/destinations/${destinationId}`,
      }),
      providesTags: (result, error, destinationId) => [
        { type: 'Destination', id: destinationId },
      ],
    }),
  }),
});

export const {
  useAddDestinationLikeMutation,
  useRemoveDestinationLikeMutation,
  useGetMyDestinationLikesQuery,
  useAddDestinationSaveMutation,
  useRemoveDestinationSaveMutation,
  useGetMyDestinationSavesQuery,
  useUpdateDestinationSaveNoteMutation,
  useGetDestinationDetailQuery,
} = destinationLikesSavesApi;