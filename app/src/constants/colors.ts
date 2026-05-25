export const Colors = {
  // 배경
  background: '#FFFFFF',
  surface: '#FAFAFA',       // zinc-50
  surfaceElevated: '#F4F4F5', // zinc-100
  border: '#E4E4E7',        // zinc-200
  borderLight: '#F4F4F5',   // zinc-100

  // 텍스트
  textPrimary: '#18181B',   // zinc-900
  textSecondary: '#71717A', // zinc-500
  textMuted: '#A1A1AA',     // zinc-400
  textLight: '#52525B',     // zinc-600
  textSubtle: '#3F3F46',    // zinc-700

  // 포인트 (인디고)
  cta: '#6366F1',           // indigo-500
  ctaDeep: '#4F46E5',       // indigo-600
  ctaLight: '#EEF2FF',      // indigo-50
  ctaLightText: '#4338CA',  // indigo-700
  ctaBorder: '#C7D2FE',     // indigo-200
  accent: '#818CF8',        // indigo-400

  // 그라디언트 (CTA 카드, 로고)
  gradientStart: '#6366F1', // indigo-500
  gradientMid: '#4F46E5',   // indigo-600
  gradientEnd: '#7C3AED',   // purple-700

  // 매수/매도
  buy: '#E11D48',           // rose-600
  buyBg: '#FFE4E6',         // rose-100
  buyBorder: '#FDA4AF',     // rose-300 (approx)
  sell: '#0284C7',          // sky-600
  sellBg: '#E0F2FE',        // sky-100
  sellBorder: '#7DD3FC',    // sky-300 (approx)

  // 충동도/경고 (amber)
  impulse: '#B45309',       // amber-700
  impulseBg: '#FEF3C7',     // amber-100
  impulseMid: '#FBBF24',    // amber-400
  impulseBar: '#E4E4E7',    // zinc-200 (배경 바)

  // 괜찮음 (emerald)
  ok: '#047857',            // emerald-700
  okBg: '#D1FAE5',          // emerald-100
  okMid: '#34D399',         // emerald-400

  // 충동도 바 그라디언트: okMid → impulseMid → rose-500
  impulseGradientLow: '#34D399',  // emerald-400
  impulseGradientMid: '#FBBF24',  // amber-400
  impulseGradientHigh: '#F43F5E', // rose-500

  // 탭바
  tabActive: '#6366F1',     // indigo-500
  tabInactive: '#A1A1AA',   // zinc-400

  // 하위 호환 alias
  reconsider: '#B45309',    // = impulse (amber-700)
  inputBorder: '#E4E4E7',   // = border (zinc-200)
};
