export const themeTokens = {
  surfaces: {
    obsidian: '#08090a',
    obsidianSoft: '#0c0d0f',
    graphite: '#131418',
    graphiteHigh: '#1b1c21',
    hairline: '#2a2c31',
    hairlineSoft: '#1e2024',
  },
  chrome: {
    100: '#f4f5f6',
    200: '#dfe1e4',
    300: '#b9bcc3',
    500: '#8a8e96',
    700: '#55585f',
  },
  signal: {
    base: '#f2761d',
    high: '#ff8a3d',
    dim: '#f2761d26',
  },
  radius: {
    md: '3px',
    lg: '6px',
  },
  container: {
    page: '1400px',
  },
} as const;

export type ThemeTokens = typeof themeTokens;
