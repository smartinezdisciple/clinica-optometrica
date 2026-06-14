const config = {
    content: [
        './index.html',
        './src/**/*.{ts,tsx,js,jsx}',
    ],
    theme: {
        extend: {
            colors: {
                // ── Primary ──────────────────────────────────
                primary: '#00658d',
                'primary-container': '#00aeef',
                'on-primary': '#ffffff',
                'on-primary-container': '#001e2d',
                // ── Surface scale ─────────────────────────────
                surface: '#f7f9fb',
                'surface-container-lowest': '#ffffff',
                'surface-container-low': '#f2f4f6',
                'surface-container': '#eceef0',
                'surface-container-high': '#e6e8ea',
                'surface-dim': '#d8dadc',
                'on-surface': '#191c1e',
                'on-surface-variant': '#41484d',
                // ── Tertiary (alerts/warnings) ─────────────────
                tertiary: '#8d4f00',
                'tertiary-container': '#ffdbb6',
                'on-tertiary': '#ffffff',
                'on-tertiary-container': '#2d1600',
                // ── Outline ───────────────────────────────────
                outline: '#71787d',
                'outline-variant': '#c1c8cd',
                // ── Semantic ──────────────────────────────────
                success: '#166534',
                'success-container': '#dcfce7',
                warning: '#854d0e',
                'warning-container': '#fef3c7',
                danger: '#991b1b',
                'danger-container': '#fee2e2',
            },
            fontFamily: {
                headline: ['Manrope', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            borderRadius: {
                DEFAULT: '0.5rem',
                lg: '0.75rem',
                xl: '1rem',
                '2xl': '1.25rem',
                '3xl': '1.5rem',
            },
            backgroundImage: {
                'primary-gradient': 'linear-gradient(135deg, #00658d 0%, #00aeef 100%)',
                'surface-gradient': 'linear-gradient(180deg, #ffffff 0%, #f7f9fb 100%)',
            },
            boxShadow: {
                ambient: '0 8px 32px rgba(25, 28, 30, 0.06)',
                float: '0 16px 32px rgba(25, 28, 30, 0.08)',
                card: '0 2px 8px rgba(25, 28, 30, 0.06)',
                'primary-glow': '0 8px 24px rgba(0, 101, 141, 0.25)',
            },
            animation: {
                'fade-up': 'fadeUp 0.4s ease both',
                'fade-in': 'fadeIn 0.3s ease both',
                'slide-right': 'slideRight 0.35s ease both',
                'scale-in': 'scaleIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                'pulse-dot': 'pulseDot 2.2s infinite',
                'iris-spin': 'irisSpin 1.4s linear infinite',
            },
            keyframes: {
                fadeUp: {
                    from: { opacity: '0', transform: 'translateY(12px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                slideRight: {
                    from: { opacity: '0', transform: 'translateX(-12px)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
                scaleIn: {
                    from: { opacity: '0', transform: 'scale(0.94)' },
                    to: { opacity: '1', transform: 'scale(1)' },
                },
                pulseDot: {
                    '0%, 100%': { transform: 'scale(1)', opacity: '1' },
                    '50%': { transform: 'scale(1.6)', opacity: '0.6' },
                },
                irisSpin: {
                    from: { transform: 'rotate(0deg)' },
                    to: { transform: 'rotate(360deg)' },
                },
            },
        },
    },
};
export default config;
