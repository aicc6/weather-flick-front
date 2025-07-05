import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useReverseGeocodeMutation } from '@/store/api'

/**
 * 위치 정보를 가져오는 커스텀 훅
 * @returns {Object} 위치 관련 상태와 함수들
 */
export default function useGeolocation() {
  const [isLocating, setIsLocating] = useState(false)

  // RTK Query hook
  const [reverseGeocode] = useReverseGeocodeMutation()

  const getCurrentLocation = useCallback(async () => {
    return new Promise((resolve, reject) => {
      setIsLocating(true)

      if (!navigator.geolocation) {
        const errorMessage =
          '위치 서비스 미지원: 이 브라우저는 위치 정보를 지원하지 않습니다.'
        toast.error(errorMessage)
        setIsLocating(false)
        reject(new Error(errorMessage))
        return
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5분 캐시
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords
          try {
            const data = await reverseGeocode({ lat, lng }).unwrap()

            if (data.address) {
              toast.success(`위치 확인 완료: 현재 위치: ${data.address}`)
              resolve(data.address)
            } else {
              throw new Error('주소를 찾을 수 없습니다.')
            }
          } catch (error) {
            const errorMessage =
              '위치 확인 실패: 위치 정보를 가져오지 못했습니다.'
            toast.error(errorMessage)
            reject(error)
          } finally {
            setIsLocating(false)
          }
        },
        (error) => {
          let message = '위치 정보를 가져올 수 없습니다.'
          if (error.code === error.PERMISSION_DENIED) {
            message = '위치 접근 권한이 거부되었습니다.'
          } else if (error.code === error.TIMEOUT) {
            message = '위치 확인 시간이 초과되었습니다.'
          }

          const errorMessage = `위치 확인 실패: ${message}`
          toast.error(errorMessage)
          setIsLocating(false)
          reject(new Error(errorMessage))
        },
        options,
      )
    })
  }, [reverseGeocode])

  return {
    getCurrentLocation,
    isLocating,
  }
}
