import { useRef, useEffect, useState } from 'react'

export const useScrollFadeIn = (
  direction = 'up',
  duration = 0.7,
  delay = 0,
) => {
  const dom = useRef()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const { current } = dom
    if (!current) return
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.2 },
    )
    observer.observe(current)
    return () => observer && observer.disconnect()
  }, [])

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return 'translateY(40px)'
      case 'down':
        return 'translateY(-40px)'
      case 'left':
        return 'translateX(40px)'
      case 'right':
        return 'translateX(-40px)'
      default:
        return 'none'
    }
  }

  return {
    ref: dom,
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : getTransform(),
      transition: `all ${duration}s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
    },
  }
}
