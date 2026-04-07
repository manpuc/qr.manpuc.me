import { store } from './store';

export function initTheme() {
  const applyTheme = (theme: 'light' | 'dark' | 'auto') => {
    let actualTheme = theme;
    if (theme === 'auto') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', actualTheme);
    
    // Update theme-color meta tag for PWA
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', actualTheme === 'dark' ? '#2a2a2a' : '#ffffff');
    }
  };

  // Subscribe to changes
  store.subscribe((state) => {
    applyTheme(state.theme);
  });

  // Listen to OS changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (store.state.theme === 'auto') {
      applyTheme('auto');
    }
  });

  // Apply initial
  applyTheme(store.state.theme);
}
