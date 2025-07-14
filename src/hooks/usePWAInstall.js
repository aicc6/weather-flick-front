import { useState, useEffect } from 'react'

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // PWA가 이미 설치되었는지 확인
    const checkIfInstalled = () => {
      // 1. 미디어 쿼리로 확인
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)',
      ).matches
      // 2. navigator.standalone 확인 (iOS Safari)
      const isIOSStandalone = window.navigator.standalone === true
      // 3. URL에서 확인 (일부 브라우저)
      const isInStandaloneMode =
        window.location.search.includes('mode=standalone')

      return isStandalone || isIOSStandalone || isInStandaloneMode
    }

    setIsInstalled(checkIfInstalled())

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e) => {
      // 기본 브라우저 설치 프롬프트 방지
      e.preventDefault()
      // 프롬프트 이벤트 저장
      setDeferredPrompt(e)
      setCanInstall(true)
    }

    // appinstalled 이벤트 리스너
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installPWA = async () => {
    if (!deferredPrompt) {
      return { outcome: 'unavailable' }
    }

    try {
      // 설치 프롬프트 표시
      await deferredPrompt.prompt()

      // 사용자의 선택 대기
      const { outcome } = await deferredPrompt.userChoice

      // 프롬프트 재사용 방지
      setDeferredPrompt(null)
      setCanInstall(false)

      if (outcome === 'accepted') {
        console.log('PWA 설치 승인됨')
      } else {
        console.log('PWA 설치 거부됨')
      }

      return { outcome }
    } catch (error) {
      console.error('PWA 설치 프롬프트 오류:', error)
      return { outcome: 'error', error }
    }
  }

  return {
    canInstall,
    isInstalled,
    installPWA,
  }
}
