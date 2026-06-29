import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { EmotionStat } from '../../lib/reportUtils';
import { EmotionType } from '../../types';

const EMOTION_COLORS: Record<EmotionType, string> = {
  anxious:  '#F59E0B', // amber-500
  excited:  '#FCD34D', // amber-300
  greedy:   '#FCD34D', // amber-300
  fearful:  '#6EE7B7', // emerald-300
  calm:     '#10B981', // emerald-500
  confused: '#D4D4D8', // zinc-300
};

interface Props {
  stats: EmotionStat[];
  insight: string | null;
  loading: boolean;
}

export default function EmotionPatternCard({ stats, insight, loading }: Props) {
  if (!stats.length) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>매매 직전 감정 분포</Text>
        <Text style={styles.empty}>코칭 기록이 쌓이면 자주 온 감정을 분석해드려요.</Text>
      </View>
    );
  }

  const total = stats.reduce((s, e) => s + e.percent, 0);
  const R = 42;
  const circumference = 2 * Math.PI * R;
  let cumulative = 0;
  const segments = stats.map((e) => {
    const frac = e.percent / total;
    const seg = { ...e, dash: frac * circumference, offset: cumulative * circumference };
    cumulative += frac;
    return seg;
  });
  const top = [...stats].sort((a, b) => b.percent - a.percent)[0];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>매매 직전 감정 분포</Text>

      <View style={styles.chartRow}>
        <View style={styles.donutOuter}>
          <View style={styles.donutRotate}>
            <Svg width={104} height={104}>
              <Circle cx={52} cy={52} r={R} fill="none" strokeWidth={14} stroke={Colors.border} />
              {segments.map((seg) => (
                <Circle
                  key={seg.type}
                  cx={52} cy={52} r={R} fill="none"
                  strokeWidth={14} strokeLinecap="butt"
                  stroke={EMOTION_COLORS[seg.type] ?? '#D4D4D8'}
                  strokeDasharray={`${seg.dash} ${circumference}`}
                  strokeDashoffset={-seg.offset}
                />
              ))}
            </Svg>
          </View>
          <View style={styles.donutCenter}>
            <Text style={styles.donutValue}>{top.percent}%</Text>
            <Text style={styles.donutLabel}>{top.label}</Text>
          </View>
        </View>

        <View style={styles.legend}>
          {stats.map((e) => (
            <View key={e.type} style={styles.legendRow}>
              <View style={styles.legendLeft}>
                <View style={[styles.legendDot, { backgroundColor: EMOTION_COLORS[e.type] ?? '#D4D4D8' }]} />
                <Text style={styles.legendLabel}>{e.label}</Text>
              </View>
              <Text style={styles.legendPct}>{e.percent}%</Text>
            </View>
          ))}
        </View>
      </View>

      {(insight || loading) && (
        <View style={styles.insightWrap}>
          <Text style={loading ? styles.insightLoading : styles.insightText}>
            {loading ? '분석 중...' : insight}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border, gap: 12,
  },
  title: { fontSize: 12, fontFamily: 'A2Z-Bold', fontWeight: '600', color: Colors.textSubtle },
  empty: { fontSize: 14, color: Colors.textMuted, lineHeight: 14 * 1.6 },

  chartRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },

  donutOuter: { width: 104, height: 104 },
  donutRotate: { position: 'absolute', top: 0, left: 0, transform: [{ rotate: '-90deg' }] },
  donutCenter: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  donutValue: { fontSize: 18, fontFamily: 'A2Z-Bold', fontWeight: '700', color: Colors.textPrimary },
  donutLabel: { fontSize: 10, color: Colors.textMuted },

  legend: { flex: 1, gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  legendLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, color: Colors.textSubtle },
  legendPct: { fontSize: 12, color: Colors.textMuted },

  insightWrap: { paddingTop: 12, borderTopWidth: 0.5, borderTopColor: Colors.border },
  insightText: { fontSize: 13, color: Colors.accent, lineHeight: 13 * 1.7, fontStyle: 'italic' },
  insightLoading: { fontSize: 13, color: Colors.textMuted },
});
