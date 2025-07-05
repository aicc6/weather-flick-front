import { configureStore } from '@reduxjs/toolkit'
import { authApi, travelPlansApi } from './api'

// RTK Query 통합 스토어 설정
export const store = configureStore({
  reducer: {
    // RTK Query API reducers
    [authApi.reducerPath]: authApi.reducer,
    [travelPlansApi.reducerPath]: travelPlansApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    })
    // RTK Query middleware 추가
    .concat(authApi.middleware)
    .concat(travelPlansApi.middleware),
  devTools: import.meta.env.MODE !== 'production',
})
