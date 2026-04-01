import { ref, watch, onMounted } from 'vue'

const isDark = ref(false)

export function useDarkMode() {
  function init() {
    const stored = localStorage.getItem('bt_dark_mode')
    if (stored !== null) {
      isDark.value = stored === 'true'
    } else {
      isDark.value = false // default to light mode
    }
    apply()
  }

  function toggle() {
    isDark.value = !isDark.value
    localStorage.setItem('bt_dark_mode', isDark.value)
    apply()
  }

  function apply() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return { isDark, toggle, init }
}
