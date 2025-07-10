import { configureStore } from '@reduxjs/toolkit'
import {
  authApi,
  travelPlansApi,
  destinationsApi,
  weatherApi,
  regionsApi,
  travelCoursesApi,
} from './api'
import { recommendReviewsApi } from './api/recommendReviewsApi'
import { localInfoApi } from './api/localInfoApi'
import { chatbotApi } from './api/chatbotApi'
import { recommendLikesApi } from './api/recommendLikesApi'
import customizedScheduleReducer from './slices/customizedScheduleSlice'

// RTK Query 통합 스토어 설정
export const store = configureStore({
  reducer: {
    // RTK Query API reducers
    [authApi.reducerPath]: authApi.reducer,
    [travelPlansApi.reducerPath]: travelPlansApi.reducer,
    [destinationsApi.reducerPath]: destinationsApi.reducer,
    [weatherApi.reducerPath]: weatherApi.reducer,
    [regionsApi.reducerPath]: regionsApi.reducer,
    [localInfoApi.reducerPath]: localInfoApi.reducer,
    [chatbotApi.reducerPath]: chatbotApi.reducer,
    [travelCoursesApi.reducerPath]: travelCoursesApi.reducer,
    [recommendReviewsApi.reducerPath]: recommendReviewsApi.reducer,
    [recommendLikesApi.reducerPath]: recommendLikesApi.reducer,
    customizedSchedule: customizedScheduleReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    })
      // RTK Query middleware 추가
      .concat(authApi.middleware)
      .concat(travelPlansApi.middleware)
      .concat(destinationsApi.middleware)
      .concat(weatherApi.middleware)
      .concat(regionsApi.middleware)
      .concat(localInfoApi.middleware)
      .concat(chatbotApi.middleware)
      .concat(travelCoursesApi.middleware)
      .concat(recommendReviewsApi.middleware)
      .concat(recommendLikesApi.middleware),
  devTools: import.meta.env.MODE !== 'production',
})
