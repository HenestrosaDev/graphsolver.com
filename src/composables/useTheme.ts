import { ref, watch, readonly, computed } from 'vue'

export type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')

// Get initial theme from localStorage or system preference
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light'

  const stored = localStorage.getItem('theme') as Theme
  if (stored && (stored === 'light' || stored === 'dark')) {
    return stored
  }

  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

// Initialize theme
theme.value = getInitialTheme()

// Apply theme to document
const applyTheme = (newTheme: Theme) => {
  const root = document.documentElement

  if (newTheme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  localStorage.setItem('theme', newTheme)
}

// Watch for theme changes and apply them
watch(theme, (newTheme) => {
  applyTheme(newTheme)
}, { immediate: true })

// Toggle theme
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

// Listen for system theme changes
if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only update if no manual preference is stored
    if (!localStorage.getItem('theme')) {
      theme.value = e.matches ? 'dark' : 'light'
    }
  })
}

export const useTheme = () => {
  return {
    theme: readonly(theme),
    toggleTheme,
    isDark: computed(() => theme.value === 'dark'),
    isLight: computed(() => theme.value === 'light')
  }
}