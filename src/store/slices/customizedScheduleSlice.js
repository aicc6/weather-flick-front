import { createSlice } from '@reduxjs/toolkit'

const customizedScheduleSlice = createSlice({
  name: 'customizedSchedule',
  initialState: {
    regionCode: null,
    regionName: null,
  },
  reducers: {
    setRegion: (state, action) => {
      state.regionCode = action.payload.code
      state.regionName = action.payload.name
    },
    clearRegion: (state) => {
      state.regionCode = null
      state.regionName = null
    },
  },
})

export const { setRegion, clearRegion } = customizedScheduleSlice.actions
export default customizedScheduleSlice.reducer
