import { configureStore } from '@reduxjs/toolkit'
import {
  authApi,
  travelPlansApi,
  destinationsApi,
  weatherApi,
  regionsApi,
} from './api'

// RTK Query 통합 스토어 설정
export const store = configureStore({
  reducer: {
    // RTK Query API reducers
    [authApi.reducerPath]: authApi.reducer,
    [travelPlansApi.reducerPath]: travelPlansApi.reducer,
    [destinationsApi.reducerPath]: destinationsApi.reducer,
    [weatherApi.reducerPath]: weatherApi.reducer,
    [regionsApi.reducerPath]: regionsApi.reducer,
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
      .concat(regionsApi.middleware),
  devTools: import.meta.env.MODE !== 'production',
})
