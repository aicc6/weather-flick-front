import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContextRTK'
import { 
  useGetMyDestinationSavesQuery,
  useGetMyDestinationLikesQuery 
} from '@/store/api/destinationLikesSavesApi'
import { 
  useGetMyTravelCourseSavesQuery 
} from '@/store/api/travelCourseSavesApi'
import { useGetUserPlansQuery } from '@/store/api/travelPlansApi'

/**
 * 마이페이지 디버깅을 위한 컴포넌트
 * 각 API 호출 상태와 응답 데이터를 실시간으로 모니터링
 */
export function ProfileDebugger() {
  const { user: authUser, isAuthenticated } = useAuth()
  const [debugLog, setDebugLog] = useState([])

  // API 쿼리들
  const savedDestinationsQuery = useGetMyDestinationSavesQuery(
    { skip: 0, limit: 20 },
    { skip: !isAuthenticated }
  )

  const likedDestinationsQuery = useGetMyDestinationLikesQuery(
    { skip: 0, limit: 50 },
    { skip: !isAuthenticated }
  )

  const savedCoursesQuery = useGetMyTravelCourseSavesQuery(
    { skip: 0, limit: 20 },
    { skip: !isAuthenticated }
  )

  const userPlansQuery = useGetUserPlansQuery(undefined, {
    skip: !isAuthenticated
  })

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugLog(prev => [...prev, { timestamp, message, type }])
  }

  useEffect(() => {
    addLog('ProfileDebugger 초기화됨', 'info')
    addLog(`인증 상태: ${isAuthenticated}`, 'info')
    addLog(`사용자 정보: ${authUser ? authUser.email : '없음'}`, 'info')
  }, [isAuthenticated, authUser])

  useEffect(() => {
    if (savedDestinationsQuery.isLoading) {
      addLog('저장된 여행지 API 호출 시작...', 'loading')
    } else if (savedDestinationsQuery.isSuccess) {
      addLog(`저장된 여행지 API 성공: ${savedDestinationsQuery.data?.length || 0}개`, 'success')
      console.log('저장된 여행지 데이터:', savedDestinationsQuery.data)
    } else if (savedDestinationsQuery.isError) {
      addLog(`저장된 여행지 API 오류: ${savedDestinationsQuery.error?.message || '알 수 없는 오류'}`, 'error')
      console.error('저장된 여행지 API 오류:', savedDestinationsQuery.error)
    }
  }, [savedDestinationsQuery.isLoading, savedDestinationsQuery.isSuccess, savedDestinationsQuery.isError, savedDestinationsQuery.data, savedDestinationsQuery.error])

  useEffect(() => {
    if (savedCoursesQuery.isLoading) {
      addLog('저장된 여행 코스 API 호출 시작...', 'loading')
    } else if (savedCoursesQuery.isSuccess) {
      addLog(`저장된 여행 코스 API 성공: ${savedCoursesQuery.data?.length || 0}개`, 'success')
      console.log('저장된 여행 코스 데이터:', savedCoursesQuery.data)
    } else if (savedCoursesQuery.isError) {
      addLog(`저장된 여행 코스 API 오류: ${savedCoursesQuery.error?.message || '알 수 없는 오류'}`, 'error')
      console.error('저장된 여행 코스 API 오류:', savedCoursesQuery.error)
    }
  }, [savedCoursesQuery.isLoading, savedCoursesQuery.isSuccess, savedCoursesQuery.isError, savedCoursesQuery.data, savedCoursesQuery.error])

  useEffect(() => {
    if (likedDestinationsQuery.isLoading) {
      addLog('좋아요한 여행지 API 호출 시작...', 'loading')
    } else if (likedDestinationsQuery.isSuccess) {
      addLog(`좋아요한 여행지 API 성공: ${likedDestinationsQuery.data?.length || 0}개`, 'success')
      console.log('좋아요한 여행지 데이터:', likedDestinationsQuery.data)
    } else if (likedDestinationsQuery.isError) {
      addLog(`좋아요한 여행지 API 오류: ${likedDestinationsQuery.error?.message || '알 수 없는 오류'}`, 'error')
      console.error('좋아요한 여행지 API 오류:', likedDestinationsQuery.error)
    }
  }, [likedDestinationsQuery.isLoading, likedDestinationsQuery.isSuccess, likedDestinationsQuery.isError, likedDestinationsQuery.data, likedDestinationsQuery.error])

  useEffect(() => {
    if (userPlansQuery.isLoading) {
      addLog('사용자 여행 플랜 API 호출 시작...', 'loading')
    } else if (userPlansQuery.isSuccess) {
      addLog(`사용자 여행 플랜 API 성공: ${userPlansQuery.data?.length || 0}개`, 'success')
      console.log('사용자 여행 플랜 데이터:', userPlansQuery.data)
    } else if (userPlansQuery.isError) {
      addLog(`사용자 여행 플랜 API 오류: ${userPlansQuery.error?.message || '알 수 없는 오류'}`, 'error')
      console.error('사용자 여행 플랜 API 오류:', userPlansQuery.error)
    }
  }, [userPlansQuery.isLoading, userPlansQuery.isSuccess, userPlansQuery.isError, userPlansQuery.data, userPlansQuery.error])

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'loading': return 'text-blue-600'
      case 'warning': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const clearLogs = () => {
    setDebugLog([])
  }

  const refetchAll = () => {
    addLog('모든 API 다시 호출...', 'info')
    savedDestinationsQuery.refetch()
    savedCoursesQuery.refetch()
    likedDestinationsQuery.refetch()
    userPlansQuery.refetch()
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden z-50">
      {/* 헤더 */}
      <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
        <h3 className="text-sm font-medium">🔍 프로필 API 디버거</h3>
        <div className="flex gap-1">
          <button
            onClick={refetchAll}
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            새로고침
          </button>
          <button
            onClick={clearLogs}
            className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            지우기
          </button>
        </div>
      </div>

      {/* API 상태 요약 */}
      <div className="px-4 py-2 border-b bg-gray-50">
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span>저장된 여행지:</span>
            <span className={savedDestinationsQuery.isLoading ? 'text-blue-600' : savedDestinationsQuery.isError ? 'text-red-600' : 'text-green-600'}>
              {savedDestinationsQuery.isLoading ? '로딩중' : savedDestinationsQuery.isError ? '오류' : `${savedDestinationsQuery.data?.length || 0}개`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>저장된 코스:</span>
            <span className={savedCoursesQuery.isLoading ? 'text-blue-600' : savedCoursesQuery.isError ? 'text-red-600' : 'text-green-600'}>
              {savedCoursesQuery.isLoading ? '로딩중' : savedCoursesQuery.isError ? '오류' : `${savedCoursesQuery.data?.length || 0}개`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>좋아요 여행지:</span>
            <span className={likedDestinationsQuery.isLoading ? 'text-blue-600' : likedDestinationsQuery.isError ? 'text-red-600' : 'text-green-600'}>
              {likedDestinationsQuery.isLoading ? '로딩중' : likedDestinationsQuery.isError ? '오류' : `${likedDestinationsQuery.data?.length || 0}개`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>여행 플랜:</span>
            <span className={userPlansQuery.isLoading ? 'text-blue-600' : userPlansQuery.isError ? 'text-red-600' : 'text-green-600'}>
              {userPlansQuery.isLoading ? '로딩중' : userPlansQuery.isError ? '오류' : `${userPlansQuery.data?.length || 0}개`}
            </span>
          </div>
        </div>
      </div>

      {/* 로그 영역 */}
      <div className="px-4 py-2 max-h-64 overflow-y-auto">
        <div className="text-xs space-y-1">
          {debugLog.map((log, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-gray-400 text-xs shrink-0">{log.timestamp}</span>
              <span className={getLogColor(log.type)}>{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProfileDebugger