import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const chatbotApi = createApi({
  reducerPath: 'chatbotApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ChatMessage'],
  endpoints: (builder) => ({
    // 챗봇 메시지 전송
    sendChatMessage: builder.mutation({
      query: (data) => ({
        url: 'chatbot/message',
        method: 'POST',
        body: {
          message: data.text,
          context: data.context || {},
        },
      }),
      invalidatesTags: ['ChatMessage'],
      transformResponse: (response) => {
        return {
          id: response.id,
          text: response.text,
          sender: response.sender,
          timestamp: response.timestamp,
          suggestions: response.suggestions || [],
        }
      },
    }),

    // 챗봇 대화 히스토리 조회
    getChatHistory: builder.query({
      query: (userId) => ({
        url: `chatbot/history/${userId}`,
        method: 'GET',
      }),
      providesTags: ['ChatMessage'],
      keepUnusedDataFor: 300, // 5분간 캐싱
      transformResponse: (response) => {
        return response.map((msg) => ({
          id: msg.id,
          text: msg.text,
          sender: msg.sender,
          timestamp: msg.timestamp,
          suggestions: msg.suggestions || [],
        }))
      },
    }),

    // 챗봇 초기 메시지 조회
    getInitialMessage: builder.query({
      query: () => ({
        url: 'chatbot/initial',
        method: 'GET',
      }),
      providesTags: ['ChatMessage'],
      keepUnusedDataFor: 3600, // 1시간간 캐싱
      transformResponse: (response) => {
        return {
          message: response.message,
          suggestions: response.suggestions || [],
        }
      },
    }),

    // 챗봇 설정 조회
    getChatbotConfig: builder.query({
      query: () => ({
        url: 'chatbot/config',
        method: 'GET',
      }),
      providesTags: ['ChatMessage'],
      keepUnusedDataFor: 7200, // 2시간간 캐싱
      transformResponse: (response) => {
        return {
          welcome_delay: response.welcome_delay,
          typing_delay: response.typing_delay,
          max_context_length: response.max_context_length,
          max_suggestions: response.max_suggestions,
        }
      },
    }),
  }),
})

// Hook 내보내기
export const {
  useSendChatMessageMutation,
  useGetChatHistoryQuery,
  useGetInitialMessageQuery,
  useGetChatbotConfigQuery,
} = chatbotApi
