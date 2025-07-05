import { configureStore } from '@reduxjs/toolkit'

// 기본 더미 리듀서 (빈 객체는 오류를 발생시킴)
const dummyReducer = (state = {}, action) => {
  return state
}

// RTK Query 통합 스토어 설정
export const store = configureStore({
  reducer: {
    dummy: dummyReducer,
    // 추후 RTK Query API reducers가 여기에 추가됩니다
    // [authApi.reducerPath]: authApi.reducer,
    // [weatherApi.reducerPath]: weatherApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  // 추후 RTK Query middleware가 여기에 추가됩니다
  // .concat(authApi.middleware)
  // .concat(weatherApi.middleware)
  devTools: import.meta.env.MODE !== 'production',
})
