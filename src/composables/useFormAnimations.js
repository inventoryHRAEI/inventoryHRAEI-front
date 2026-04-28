/**
 * useFormAnimations - Composable for GSAP animations in operation forms
 * Provides smooth, professional animations for form interactions
 */
import { onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'

export function useFormAnimations(options = {}) {
  const {
    autoInit = true,
    staggerDelay = 0.08,
    duration = 0.5
  } = options

  // Store animation instances for cleanup
  const animations = []
  const observers = []

  /**
   * Animate sections on initial load
   */
  function animateSectionsIn(selector = '.section-card') {
    const sections = document.querySelectorAll(selector)
    if (!sections.length) return

    const tl = gsap.timeline()
    
    tl.fromTo(sections, 
      { 
        y: 30, 
        opacity: 0,
        scale: 0.98
      },
      { 
        y: 0, 
        opacity: 1,
        scale: 1,
        duration: duration,
        stagger: staggerDelay,
        ease: 'power3.out',
        clearProps: 'all'
      }
    )

    animations.push(tl)
    return tl
  }

  /**
   * Animate form fields when section is revealed
   */
  function animateFieldsIn(container) {
    const fields = container.querySelectorAll('.field, .field-compact, .field-medium')
    if (!fields.length) return

    const tl = gsap.timeline()
    
    tl.fromTo(fields,
      {
        y: 15,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out',
        clearProps: 'all'
      }
    )

    animations.push(tl)
    return tl
  }

  /**
   * Animate item being added to list
   */
  function animateItemAdded(element) {
    if (!element) return

    const tl = gsap.timeline()
    
    tl.fromTo(element,
      {
        scale: 0.9,
        opacity: 0,
        y: -10
      },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'back.out(1.7)',
        clearProps: 'all'
      }
    )

    // Add subtle highlight effect
    tl.fromTo(element,
      { 
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.4)' 
      },
      { 
        boxShadow: '0 0 0 0px rgba(59, 130, 246, 0)',
        duration: 0.8,
        ease: 'power2.out'
      },
      '-=0.2'
    )

    animations.push(tl)
    return tl
  }

  /**
   * Animate item being removed from list
   */
  function animateItemRemoved(element) {
    return new Promise((resolve) => {
      if (!element) {
        resolve()
        return
      }

      gsap.to(element, {
        scale: 0.9,
        opacity: 0,
        x: -30,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: resolve
      })
    })
  }

  /**
   * Animate counter value change
   */
  function animateCounterChange(element, direction = 'up') {
    if (!element) return

    const yStart = direction === 'up' ? 10 : -10

    gsap.fromTo(element,
      { y: yStart, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.25, 
        ease: 'power2.out' 
      }
    )
  }

  /**
   * Animate button click with ripple effect
   */
  function animateButtonClick(event) {
    const button = event.currentTarget
    if (!button) return

    // Scale animation
    gsap.to(button, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    })
  }

  /**
   * Animate form validation error
   */
  function animateFieldError(element) {
    if (!element) return

    gsap.fromTo(element,
      { x: 0 },
      {
        x: [-6, 6, -4, 4, -2, 2, 0],
        duration: 0.5,
        ease: 'power2.out'
      }
    )

    // Add red glow
    gsap.fromTo(element,
      { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
      {
        boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.15)',
        duration: 0.3,
        yoyo: true,
        repeat: 1
      }
    )
  }

  /**
   * Animate success state
   */
  function animateFieldSuccess(element) {
    if (!element) return

    gsap.fromTo(element,
      { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)' },
      {
        boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.2)',
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      }
    )
  }

  /**
   * Animate loading overlay
   */
  function animateLoadingIn(element) {
    if (!element) return

    gsap.fromTo(element,
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 0.3, 
        ease: 'power2.out' 
      }
    )
  }

  function animateLoadingOut(element) {
    return new Promise((resolve) => {
      if (!element) {
        resolve()
        return
      }

      gsap.to(element, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: resolve
      })
    })
  }

  /**
   * Animate section collapse/expand
   */
  function animateSectionToggle(element, isCollapsing) {
    if (!element) return

    if (isCollapsing) {
      gsap.to(element, {
        height: 0,
        opacity: 0,
        paddingTop: 0,
        paddingBottom: 0,
        duration: 0.35,
        ease: 'power2.inOut'
      })
    } else {
      // First set to auto to measure, then animate
      gsap.set(element, { height: 'auto', opacity: 1 })
      const height = element.offsetHeight
      gsap.fromTo(element,
        { height: 0, opacity: 0 },
        { 
          height: height, 
          opacity: 1, 
          duration: 0.4, 
          ease: 'power2.out',
          clearProps: 'height'
        }
      )
    }
  }

  /**
   * Stagger animation for list items
   */
  function staggerListItems(selector, container = document) {
    const items = container.querySelectorAll(selector)
    if (!items.length) return

    gsap.fromTo(items,
      { 
        y: 20, 
        opacity: 0,
        scale: 0.95
      },
      { 
        y: 0, 
        opacity: 1,
        scale: 1,
        duration: 0.4,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'all'
      }
    )
  }

  /**
   * Animate tooltip appearance
   */
  function animateTooltipIn(element) {
    if (!element) return

    gsap.fromTo(element,
      { 
        opacity: 0, 
        y: -8,
        scale: 0.95
      },
      { 
        opacity: 1, 
        y: 0,
        scale: 1,
        duration: 0.25, 
        ease: 'back.out(2)'
      }
    )
  }

  function animateTooltipOut(element) {
    if (!element) return

    gsap.to(element, {
      opacity: 0,
      y: -5,
      duration: 0.2,
      ease: 'power2.in'
    })
  }

  /**
   * Progress bar animation
   */
  function animateProgress(element, toPercent) {
    if (!element) return

    gsap.to(element, {
      width: `${toPercent}%`,
      duration: 0.6,
      ease: 'power2.out'
    })
  }

  /**
   * Number counter animation
   */
  function animateNumber(element, fromValue, toValue, suffix = '') {
    if (!element) return

    const obj = { value: fromValue }
    
    gsap.to(obj, {
      value: toValue,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => {
        element.textContent = Math.round(obj.value) + suffix
      }
    })
  }

  /**
   * Cleanup all animations
   */
  function cleanup() {
    animations.forEach(anim => {
      if (anim && anim.kill) {
        anim.kill()
      }
    })
    animations.length = 0

    observers.forEach(observer => {
      if (observer && observer.disconnect) {
        observer.disconnect()
      }
    })
    observers.length = 0
  }

  // Auto-init on mount
  if (autoInit) {
    onMounted(() => {
      nextTick(() => {
        animateSectionsIn()
      })
    })
  }

  // Cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })

  return {
    // Section animations
    animateSectionsIn,
    animateFieldsIn,
    animateSectionToggle,
    
    // Item animations
    animateItemAdded,
    animateItemRemoved,
    staggerListItems,
    
    // Field animations
    animateFieldError,
    animateFieldSuccess,
    animateCounterChange,
    
    // UI animations
    animateButtonClick,
    animateLoadingIn,
    animateLoadingOut,
    animateTooltipIn,
    animateTooltipOut,
    animateProgress,
    animateNumber,
    
    // Utilities
    cleanup
  }
}

export default useFormAnimations
