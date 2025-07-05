import { configureStore } from '@reduxjs/toolkit'

// 기본 더미 리듀서 (빈 객체는 오류를 발생시킴)
const dummyReducer = (state = {}, action) => {
  return state
}

// 기본 스토어 설정
export const store = configureStore({
  reducer: {
    dummy: dummyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
})