import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useColorMode } from '@vueuse/core'
export const usePageStore = defineStore('page', () => {
  const { store: currentColorMode, system: systemColorMode } = useColorMode({
    disableTransition: !!document.startViewTransition
  })

  const colorModeState = computed(() => {
    if (currentColorMode.value === 'auto') {
      return systemColorMode.value
    } else {
      return currentColorMode.value
    }
  }, {})

  return {
    currentColorMode,
    systemColorMode,
    colorModeState
  }
})
