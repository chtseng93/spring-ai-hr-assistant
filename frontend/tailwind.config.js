/** @type {import('tailwindcss').Config} */
// 來源：original-design/*.html 內 <script id="tailwind-config">，六檔一致，原樣搬過來
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "on-background": "#1c1b1b", "on-primary": "#ffffff", "secondary-fixed": "#e5ea54",
        "primary-fixed-dim": "#ffb59e", "primary-fixed": "#ffdbd0", "on-tertiary": "#ffffff",
        "on-secondary-container": "#646700", "tertiary-fixed": "#dce1ff", "primary": "#ae3200",
        "surface-dim": "#dcd9d9", "error-container": "#ffdad6", "on-tertiary-fixed": "#00164d",
        "background": "#fcf9f8", "tertiary-fixed-dim": "#b5c4ff", "surface-container-high": "#ebe7e7",
        "tertiary-container": "#678cff", "error": "#ba1a1a", "secondary": "#5f6200",
        "outline-variant": "#e4beb3", "inverse-on-surface": "#f3f0ef", "on-primary-fixed-variant": "#852400",
        "surface-variant": "#e5e2e1", "surface-tint": "#ae3200", "surface-container-lowest": "#ffffff",
        "surface-container": "#f0edec", "on-error-container": "#93000a", "on-tertiary-fixed-variant": "#003cac",
        "on-surface": "#1c1b1b", "surface-container-highest": "#e5e2e1", "tertiary": "#1853d7",
        "primary-container": "#ff5a1f", "outline": "#8f7067", "on-secondary-fixed-variant": "#484a00",
        "secondary-container": "#e2e751", "surface": "#fcf9f8", "secondary-fixed-dim": "#c9ce39",
        "inverse-surface": "#313030", "on-error": "#ffffff", "on-primary-container": "#541400",
        "on-tertiary-container": "#002470", "on-surface-variant": "#5b4038", "on-secondary": "#ffffff",
        "surface-bright": "#fcf9f8", "inverse-primary": "#ffb59e", "on-primary-fixed": "#3a0b00",
        "surface-container-low": "#f6f3f2", "on-secondary-fixed": "#1c1d00",
      },
      borderRadius: { DEFAULT: "0.25rem", lg: "0.5rem", xl: "0.75rem", full: "9999px" },
      spacing: { "base-unit": "8px", "grid-margin": "40px", "section-gap": "120px", gutter: "24px" },
      // 多字字型名稱必須加引號，否則本地 PostCSS 版 Tailwind 產出無效的 font-family（會整條被瀏覽器忽略、退回襯線）。
      fontFamily: {
        "headline-md": ['"Archivo Narrow"', "system-ui", "sans-serif"],
        "body-main": ['"Inter"', "system-ui", "sans-serif"],
        "body-sm": ['"Inter"', "system-ui", "sans-serif"],
        "headline-lg": ['"Archivo Narrow"', "system-ui", "sans-serif"],
        "headline-lg-mobile": ['"Archivo Narrow"', "system-ui", "sans-serif"],
        "display-xl": ['"Archivo Narrow"', "system-ui", "sans-serif"],
        "label-mono": ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        "headline-md": ["32px", { lineHeight: "36px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-main": ["15px", { lineHeight: "1.6", letterSpacing: "normal", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.5", letterSpacing: "normal", fontWeight: "400" }],
        "headline-lg": ["80px", { lineHeight: "72px", letterSpacing: "-0.04em", fontWeight: "900" }],
        "headline-lg-mobile": ["48px", { lineHeight: "44px", letterSpacing: "-0.03em", fontWeight: "900" }],
        "display-xl": ["130px", { lineHeight: "110px", letterSpacing: "-0.05em", fontWeight: "900" }],
        "label-mono": ["11px", { lineHeight: "12px", letterSpacing: "0.15em", fontWeight: "500" }],
      },
    },
  },
  plugins: [],
};
