import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { EmotionStat } from '../../lib/reportUtils';
import { EmotionType } from '../../types';

const EMOTION_COLORS: Record<EmotionType, string> = {
  anxious:  '#FBBF24', // amber-400
  excited:  '#FB7185', // rose-400
  greedy:   '#FB7185', // rose-400
  fearful:  '#38BDF8', // sky-400
  calm:     '#818CF8', // indigo-400
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

  return (
    <View style={styles.card}>
      <Text style={styles.title}>매매 직전 감정 분포</Text>

      <View style={styles.stackBar}>
        {stats.map((e) => (
          <View
            key={e.type}
            style={{ flex: e.percent, backgroundColor: EMOTION_COLORS[e.type] ?? '#D4D4D8' }}
          />
        ))}
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
    borderWidth: 0.5, borderColor: Colors.border, gap: 12,
  },
  title: { fontSize: 12, fontWeight: '600', color: Colors.textSubtle },
  empty: { fontSize: 14, color: Colors.textMuted, lineHeight: 14 * 1.6 },

  stackBar: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden' },

  legend: { gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  legendLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, color: Colors.textSubtle },
  legendPct: { fontSize: 12, color: Colors.textMuted },

  insightWrap: { paddingTop: 12, borderTopWidth: 0.5, borderTopColor: Colors.border },
  insightText: {
    fontSize: 13, color: Colors.accent, lineHeight: 13 * 1.7, fontStyle: 'italic',
  },
  insightLoading: { fontSize: 13, color: Colors.textMuted },
});
