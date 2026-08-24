import { useEffect, useRef, useState } from 'react'
import lottie, { type AnimationItem } from 'lottie-web'
import pawLoadingAnimation from '@/assets/gray_paw_loading_loader.json'
import './LoadingIndicator.css'

interface LoadingIndicatorProps {
  label: string
  size?: 'small' | 'medium'
  className?: string
}

function getReducedMotionPreference() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export function LoadingIndicator({ className, label, size = 'medium' }: LoadingIndicatorProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getReducedMotionPreference)
  const animationContainerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<AnimationItem | null>(null)
  const reducedMotionRef = useRef(prefersReducedMotion)
  reducedMotionRef.current = prefersReducedMotion
  const classes = ['ds-loading-indicator', `ds-loading-indicator--${size}`, className]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mediaQuery) return
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    const container = animationContainerRef.current
    if (!container) return

    const animation = lottie.loadAnimation({
      animationData: structuredClone(pawLoadingAnimation),
      autoplay: false,
      container,
      loop: true,
      renderer: 'svg',
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
    })
    animationRef.current = animation

    const handleReady = () => {
      if (reducedMotionRef.current) animation.goToAndStop(40, true)
      else animation.play()
    }
    animation.addEventListener('DOMLoaded', handleReady)

    return () => {
      animation.removeEventListener('DOMLoaded', handleReady)
      animation.destroy()
      animationRef.current = null
    }
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) {
      animationRef.current?.goToAndStop(40, true)
      return
    }

    animationRef.current?.play()
  }, [prefersReducedMotion])

  return (
    <div aria-live="polite" className={classes} role="status">
      <div
        aria-hidden="true"
        className="ds-loading-indicator__animation"
        ref={animationContainerRef}
      />
      <span>{label}</span>
    </div>
  )
}

export type { LoadingIndicatorProps }
