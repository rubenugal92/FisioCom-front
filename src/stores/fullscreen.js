import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFullscreenStore = defineStore('fullscreen', () => {
  const isFullscreen = ref(false)

  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value
  }

  const setFullscreen = (value) => {
    isFullscreen.value = value
  }

  return {
    isFullscreen,
    toggleFullscreen,
    setFullscreen
  }
})
