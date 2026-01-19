import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

/**
 * CLOUDFLARE-SAFE RENDER MANAGER
 * 
 * Core principles:
 * 1. Skeletons render SYNCHRONOUSLY on first paint (NOT as Suspense fallback)
 * 2. No setTimeout for visibility (too unreliable in tunnel)
 * 3. Progressive hydration in controlled batches
 * 4. Clear separation: visual structure (skeleton) vs. data (real components)
 * 5. Never render blank - skeleton is primary, content is overlay
 */

export function useBiomedicalRenderManager() {
  // ============================================================
  // STATE: These control VISUAL rendering, not data loading
  // ============================================================

  // PRIMARY STATES (visible on first paint)
  const showSkeletons = ref(true) // Show skeleton loaders (START TRUE, NOT FALSE!)
  const showFiltersContent = ref(false) // Show real FiltersSection
  const showCardsContent = ref(false) // Show real CardsSection
  const showPaginationContent = ref(false) // Show real PaginationBar

  // PROGRESSIVE HYDRATION: Cards render in batches
  const cardsToRender = ref(0) // Number of cards to render (incremented in batches)
  const BATCH_SIZE = 5 // Render 5 cards per frame
  const BATCH_DELAY = 50 // 50ms between batches (allows browser to paint)

  // DATA READY STATE (from composables, not timers)
  const filtersDataReady = ref(false)
  const cardsDataReady = ref(false)
  const paginationDataReady = ref(false)

  // ============================================================
  // RENDERING FLOW
  // ============================================================

  /**
   * T+0ms: Component mounts
   * - showSkeletons = true
   * - Skeletons render immediately (synchronously, no async)
   * - First paint includes skeletons
   */
  function initializeRenderState() {
    showSkeletons.value = true
    showFiltersContent.value = false
    showCardsContent.value = false
    showPaginationContent.value = false
    cardsToRender.value = 0
  }

  /**
   * Call when Filters data is ready
   * Replaces skeleton with real content (fade transition)
   */
  function onFiltersReady() {
    filtersDataReady.value = true
    showFiltersContent.value = true
  }

  /**
   * Call when Cards data is ready
   * Starts progressive hydration of cards
   */
  function onCardsDataReady(totalCards) {
    cardsDataReady.value = true
    // Start rendering first batch (synchronously)
    cardsToRender.value = Math.min(BATCH_SIZE, totalCards)
    // Schedule next batches
    scheduleCardBatches(totalCards)
  }

  /**
   * Progressive card batching
   * Yields control to browser between batches
   */
  function scheduleCardBatches(totalCards) {
    let currentBatch = BATCH_SIZE

    const scheduleNextBatch = () => {
      if (currentBatch < totalCards) {
        requestAnimationFrame(() => {
          cardsToRender.value = Math.min(currentBatch + BATCH_SIZE, totalCards)
          currentBatch += BATCH_SIZE
          
          if (currentBatch < totalCards) {
            setTimeout(scheduleNextBatch, BATCH_DELAY)
          } else {
            // All cards scheduled for render
            onAllCardsScheduled()
          }
        })
      }
    }

    // Schedule first next batch (if there is more than first batch)
    if (currentBatch < totalCards) {
      setTimeout(scheduleNextBatch, BATCH_DELAY)
    }
  }

  /**
   * Call when Pagination data is ready
   */
  function onPaginationReady() {
    paginationDataReady.value = true
    showPaginationContent.value = true
  }

  /**
   * Call when all cards have been scheduled for render
   * (but not necessarily all loaded yet)
   */
  function onAllCardsScheduled() {
    // Cards are now fully being rendered
    // Skeleton can fade out
    showSkeletons.value = false
  }

  /**
   * Call if data loading fails or times out
   * Keeps skeletons visible as fallback
   */
  function onDataLoadError() {
    // Keep skeletons visible indefinitely
    // User can retry or navigate away
    showSkeletons.value = true
    filtersDataReady.value = false
    cardsDataReady.value = false
    paginationDataReady.value = false
  }

  /**
   * Reset state (when navigating away)
   */
  function reset() {
    showSkeletons.value = true
    showFiltersContent.value = false
    showCardsContent.value = false
    showPaginationContent.value = false
    cardsToRender.value = 0
    filtersDataReady.value = false
    cardsDataReady.value = false
    paginationDataReady.value = false
  }

  // ============================================================
  // COMPUTED VISIBILITY (for template v-show/v-if)
  // ============================================================

  /**
   * Show skeleton filters?
   * YES while data is not ready
   * NO when real filters are ready
   */
  const shouldShowFiltersSkeleton = computed(() => {
    return showSkeletons.value && !filtersDataReady.value
  })

  /**
   * Show skeleton cards?
   * YES while data is not ready and skeletons are visible
   * NO when cards are starting to render
   */
  const shouldShowCardsSkeleton = computed(() => {
    return showSkeletons.value && !cardsDataReady.value
  })

  /**
   * Show skeleton pagination?
   * YES while data is not ready and skeletons are visible
   * NO when pagination data is ready
   */
  const shouldShowPaginationSkeleton = computed(() => {
    return showSkeletons.value && !paginationDataReady.value
  })

  /**
   * Is this card index scheduled for render?
   * Used in CardsSection to only render N cards
   */
  function isCardScheduledForRender(cardIndex) {
    return cardIndex < cardsToRender.value
  }

  // ============================================================
  // DEBUGGING / MONITORING
  // ============================================================

  const renderState = computed(() => ({
    showSkeletons: showSkeletons.value,
    showFiltersContent: showFiltersContent.value,
    showCardsContent: showCardsContent.value,
    showPaginationContent: showPaginationContent.value,
    cardsToRender: cardsToRender.value,
    filtersDataReady: filtersDataReady.value,
    cardsDataReady: cardsDataReady.value,
    paginationDataReady: paginationDataReady.value,
    shouldShowFiltersSkeleton: shouldShowFiltersSkeleton.value,
    shouldShowCardsSkeleton: shouldShowCardsSkeleton.value,
    shouldShowPaginationSkeleton: shouldShowPaginationSkeleton.value,
  }))

  return {
    // State
    showSkeletons,
    showFiltersContent,
    showCardsContent,
    showPaginationContent,
    cardsToRender,
    filtersDataReady,
    cardsDataReady,
    paginationDataReady,

    // Methods
    initializeRenderState,
    onFiltersReady,
    onCardsDataReady,
    onPaginationReady,
    onAllCardsScheduled,
    onDataLoadError,
    isCardScheduledForRender,
    reset,

    // Computed
    shouldShowFiltersSkeleton,
    shouldShowCardsSkeleton,
    shouldShowPaginationSkeleton,
    renderState,
  }
}
