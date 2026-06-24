import React from 'react';
import Svg, { Circle, Path, G, Defs, RadialGradient, LinearGradient, Stop, ClipPath, Ellipse } from 'react-native-svg';

// Sparkle — AI 코치 인디케이터, CTA 카드 등에 사용
export function Sparkle({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <Path d="M8 0l1.5 5L14 6.5 9.5 8 8 13 6.5 8 2 6.5 6.5 5z" opacity={0.95} />
      <Path d="M13 9l.7 2L15 11.5 13.7 12 13 14l-.7-2L11 11.5 12.3 11z" opacity={0.7} />
    </Svg>
  );
}

// MoodIcon — 홈 감정 체크인 5종
export function MoodIcon({
  kind,
  size = 26,
  color = '#18181B',
}: {
  kind: 'calm' | 'ok' | 'neutral' | 'anxious' | 'tense';
  size?: number;
  color?: string;
}) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' };
  const stroke = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (kind) {
    case 'calm':
      return (
        <Svg {...props}>
          <Circle cx="12" cy="12" r="9" {...stroke} />
          <Path d="M8 14.5c1.2 1.6 2.5 2.3 4 2.3s2.8-.7 4-2.3" {...stroke} />
          <Path d="M7.8 10.2c.6-.7 1.6-.7 2.2 0" {...stroke} />
          <Path d="M13.8 10.2c.6-.7 1.6-.7 2.2 0" {...stroke} />
        </Svg>
      );
    case 'ok':
      return (
        <Svg {...props}>
          <Circle cx="12" cy="12" r="9" {...stroke} />
          <Path d="M8.5 14.5c1 1 2 1.5 3.5 1.5s2.5-.5 3.5-1.5" {...stroke} />
          <Circle cx="9" cy="10" r="0.9" fill={color} />
          <Circle cx="15" cy="10" r="0.9" fill={color} />
        </Svg>
      );
    case 'neutral':
      return (
        <Svg {...props}>
          <Circle cx="12" cy="12" r="9" {...stroke} />
          <Path d="M8.5 15h7" {...stroke} />
          <Circle cx="9" cy="10" r="0.9" fill={color} />
          <Circle cx="15" cy="10" r="0.9" fill={color} />
        </Svg>
      );
    case 'anxious':
      return (
        <Svg {...props}>
          <Circle cx="12" cy="12" r="9" {...stroke} />
          <Path d="M8 15.5c1-.8 1.6-.8 2.5 0s1.5.8 2.5 0 1.5-.8 2.5 0" {...stroke} />
          <Path d="M7.5 9.5l2-1M14.5 8.5l2 1" {...stroke} />
          <Circle cx="9.2" cy="10.6" r="0.9" fill={color} />
          <Circle cx="14.8" cy="10.6" r="0.9" fill={color} />
        </Svg>
      );
    case 'tense':
      return (
        <Svg {...props}>
          <Circle cx="12" cy="12" r="9" {...stroke} />
          <Path d="M8 15.5l1.3-1 1.3 1 1.3-1 1.3 1 1.3-1 1.3 1" {...stroke} />
          <Path d="M9 9.5l-1.2.7M15 9.5l1.2.7" {...stroke} />
        </Svg>
      );
  }
}

// OremdalLogo — 로그인/스플래시 로고
export function OremdalLogo({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Defs>
        <RadialGradient id="orem-body" cx="38%" cy="32%" rx="85%" ry="85%">
          <Stop offset="0" stopColor="#A7F3D0" />
          <Stop offset="0.45" stopColor="#6EE7B7" />
          <Stop offset="0.78" stopColor="#FDBA74" />
          <Stop offset="1" stopColor="#FB923C" />
        </RadialGradient>
        <RadialGradient id="orem-highlight" cx="32%" cy="25%" rx="40%" ry="40%">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.85" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="orem-rim" x1="32" y1="6" x2="32" y2="58" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
          <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.15" />
          <Stop offset="1" stopColor="#FCA5A5" stopOpacity="0.6" />
        </LinearGradient>
        <ClipPath id="orem-clip">
          <Path d="M52 32a20 20 0 1 1-20-20 16 16 0 0 0 20 20z" />
        </ClipPath>
      </Defs>
      <Path d="M52 32a20 20 0 1 1-20-20 16 16 0 0 0 20 20z" fill="url(#orem-body)" />
      <G clipPath="url(#orem-clip)">
        <Ellipse cx="22" cy="20" rx="14" ry="9" fill="url(#orem-highlight)" />
      </G>
      <Path
        d="M52 32a20 20 0 1 1-20-20 16 16 0 0 0 20 20z"
        fill="none"
        stroke="url(#orem-rim)"
        strokeWidth={1.2}
        opacity={0.9}
      />
      <G clipPath="url(#orem-clip)">
        <Ellipse cx="44" cy="44" rx="14" ry="10" fill="#7C2D12" opacity={0.18} />
      </G>
    </Svg>
  );
}

// GreetSun — 홈 인사 옆 태양 아이콘
export function GreetSun({ size = 20, color = '#F59E0B' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="4" fill={color} />
      <G stroke={color} strokeWidth={1.8} strokeLinecap="round">
        <Path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" />
      </G>
    </Svg>
  );
}

// ChevronRight — 목록/카드 우측 화살표
export function ChevronRight({ size = 18, color = '#A1A1AA' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ChevronLeft — 헤더 뒤로가기
export function ChevronLeft({ size = 26, color = '#18181B' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Send — 채팅 전송 버튼
export function SendIcon({ size = 18, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Lightbulb — 투자 원칙 유도 카드
export function LightbulbIcon({ size = 18, color = '#6366F1' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8C7.21 13.16 6 11.22 6 9a6 6 0 0 1 6-6z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// SettingsIcon — 헤더 설정 버튼
export function SettingsIcon({ size = 22, color = '#71717A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={2} />
      <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function BellIcon({ size = 22, color = '#71717A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Tab bar icons
export function TabHomeIcon({ size = 22, color = '#A1A1AA' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 21V12h6v9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function TabRecordsIcon({ size = 22, color = '#A1A1AA' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 6h16M4 10h16M4 14h10M4 18h7" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function TabReportIcon({ size = 22, color = '#A1A1AA' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function TabMyIcon({ size = 22, color = '#A1A1AA' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={2} />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

// ThumbsUp — 온보딩 결과 강점 카드
export function ThumbsUp({ size = 18, color = '#059669' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// AlertTriangle — 온보딩 결과 주의 카드
export function AlertTriangle({ size = 18, color = '#E11D48' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 9v4M12 17h.01" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function TrashIcon({ size = 20, color = '#71717A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 11v6M14 11v6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
