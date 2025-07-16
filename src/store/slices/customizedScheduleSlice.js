import { createSlice } from '@reduxjs/toolkit'

const customizedScheduleSlice = createSlice({
  name: 'customizedSchedule',
  initialState: {
    // 지역 정보
    regionCode: null,
    regionName: null,
    
    // 여행 기간 정보
    period: null,
    periodLabel: null,
    days: null,
    
    // 동행자 정보
    companion: null,
    companionData: null,
    
    // 여행 스타일 정보
    travelStyles: [],
    travelStylesData: [],
    
    // 일정 스타일 정보
    scheduleType: null,
    scheduleTypeData: null,
    
    // 진행 상태
    currentStep: 1,
    isGenerating: false,
    
    // 생성된 일정 결과
    generatedSchedule: null,
  },
  reducers: {
    // 지역 관련
    setRegion: (state, action) => {
      state.regionCode = action.payload.code
      state.regionName = action.payload.name
    },
    clearRegion: (state) => {
      state.regionCode = null
      state.regionName = null
    },
    
    // 여행 기간 관련
    setPeriod: (state, action) => {
      state.period = action.payload.id
      state.periodLabel = action.payload.label
      state.days = action.payload.days
    },
    clearPeriod: (state) => {
      state.period = null
      state.periodLabel = null
      state.days = null
    },
    
    // 동행자 관련
    setCompanion: (state, action) => {
      state.companion = action.payload.id
      state.companionData = action.payload
    },
    clearCompanion: (state) => {
      state.companion = null
      state.companionData = null
    },
    
    // 여행 스타일 관련
    setTravelStyles: (state, action) => {
      state.travelStyles = action.payload.ids
      state.travelStylesData = action.payload.data
    },
    addTravelStyle: (state, action) => {
      if (!state.travelStyles.includes(action.payload.id)) {
        state.travelStyles.push(action.payload.id)
        state.travelStylesData.push(action.payload)
      }
    },
    removeTravelStyle: (state, action) => {
      state.travelStyles = state.travelStyles.filter(id => id !== action.payload)
      state.travelStylesData = state.travelStylesData.filter(item => item.id !== action.payload)
    },
    clearTravelStyles: (state) => {
      state.travelStyles = []
      state.travelStylesData = []
    },
    
    // 일정 스타일 관련
    setScheduleType: (state, action) => {
      state.scheduleType = action.payload.id
      state.scheduleTypeData = action.payload
    },
    clearScheduleType: (state) => {
      state.scheduleType = null
      state.scheduleTypeData = null
    },
    
    // 진행 상태 관련
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload
    },
    nextStep: (state) => {
      if (state.currentStep < 5) {
        state.currentStep += 1
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1
      }
    },
    
    // 일정 생성 관련
    setGenerating: (state, action) => {
      state.isGenerating = action.payload
    },
    setGeneratedSchedule: (state, action) => {
      state.generatedSchedule = action.payload
      state.isGenerating = false
    },
    
    // 전체 초기화
    resetAll: (state) => {
      state.regionCode = null
      state.regionName = null
      state.period = null
      state.periodLabel = null
      state.days = null
      state.companion = null
      state.companionData = null
      state.travelStyles = []
      state.travelStylesData = []
      state.scheduleType = null
      state.scheduleTypeData = null
      state.currentStep = 1
      state.isGenerating = false
      state.generatedSchedule = null
    },
    
    // URL 파라미터에서 상태 복원
    restoreFromParams: (state, action) => {
      const { region, period, days, who, styles, schedule } = action.payload
      
      if (region) {
        state.regionCode = region
        // regionName은 별도로 설정되어야 함
      }
      
      if (period) {
        state.periodLabel = period
        state.days = days ? parseInt(days) : null
      }
      
      if (who) {
        state.companion = who
      }
      
      if (styles) {
        state.travelStyles = styles.split(',').filter(Boolean)
      }
      
      if (schedule) {
        state.scheduleType = schedule
      }
    },
  },
})

export const {
  setRegion,
  clearRegion,
  setPeriod,
  clearPeriod,
  setCompanion,
  clearCompanion,
  setTravelStyles,
  addTravelStyle,
  removeTravelStyle,
  clearTravelStyles,
  setScheduleType,
  clearScheduleType,
  setCurrentStep,
  nextStep,
  prevStep,
  setGenerating,
  setGeneratedSchedule,
  resetAll,
  restoreFromParams,
} = customizedScheduleSlice.actions

export default customizedScheduleSlice.reducer
