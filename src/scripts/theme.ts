import { store } from './store';

export function applyResolvedTheme(pref?: string | null) {
  const effectivePref = pref || localStorage.getItem('manpuc-theme') || 'system';
  const isDark =
    effectivePref === 'dark' ||
    ((effectivePref === 'system' || effectivePref === 'auto') &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const actualTheme = isDark ? 'dark' : 'light';
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.setAttribute('data-theme', actualTheme);

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', isDark ? '#000000' : '#ffffff');
  }

  store.state.theme =
    effectivePref === 'light' || effectivePref === 'dark' ? effectivePref : 'auto';
}

export function initTheme() {
  // Migrate legacy qr_maker_theme if manpuc-theme is not set
  try {
    const legacy = localStorage.getItem('qr_maker_theme');
    if (legacy) {
      if (!localStorage.getItem('manpuc-theme') && (legacy === 'light' || legacy === 'dark')) {
        localStorage.setItem('manpuc-theme', legacy);
      }
      localStorage.removeItem('qr_maker_theme');
    }
  } catch {
    // Ignore storage errors
  }

  applyResolvedTheme();

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const current = localStorage.getItem('manpuc-theme') || 'system';
    if (current === 'system' || current === 'auto') {
      applyResolvedTheme('system');
    }
  });
}
