import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  thisWeekAvg: number | null;
  lastWeekAvg: number | null;
  totalAvgImpulse: number;
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.miniBarWrap}>
      <View style={styles.miniBarRow}>
        <Text style={styles.miniBarLabel}>{label}</Text>
        <Text style={styles.miniBarPct}>{value}%</Text>
      </View>
      <View style={styles.miniBarBg}>
        <View style={[styles.miniBarFill, { width: `${value}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function GrowthSummaryCard({ thisWeekAvg, lastWeekAvg, totalAvgImpulse }: Props) {
  const hasComparison = thisWeekAvg !== null && lastWeekAvg !== null;
  const diff = hasComparison ? thisWeekAvg! - lastWeekAvg! : 0;
  const improved = diff < 0;
  const displayScore = thisWeekAvg ?? totalAvgImpulse;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.headerLabel}>이번 주 평균 충동도</Text>
        {hasComparison && diff !== 0 && (
          <Text style={[styles.trendText, improved ? styles.trendGood : styles.trendBad]}>
            {improved ? '↓' : '↑'} {diff > 0 ? '+' : ''}{diff}%p
          </Text>
        )}
      </View>

      <View style={styles.scoreRow}>
        <Text style={styles.score}>{displayScore}%</Text>
        {hasComparison && lastWeekAvg !== null && (
          <Text style={styles.lastWeekNote}>지난주 {lastWeekAvg}%</Text>
        )}
      </View>

      {hasComparison && (
        <View style={styles.miniBarGrid}>
          <MiniBar label="이번 주" value={thisWeekAvg!} color={Colors.cta} />
          <MiniBar label="지난 주" value={lastWeekAvg!} color="#D4D4D8" />
        </View>
      )}

      <Text style={styles.footer}>누적 평균 {totalAvgImpulse}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 0.5, borderColor: Colors.border, gap: 10,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLabel: { fontSize: 12, color: Colors.textMuted },
  trendText: { fontSize: 11, fontFamily: 'SpoqaHanSansNeo-Bold', fontWeight: '700' },
  trendGood: { color: Colors.ok },
  trendBad: { color: Colors.buy },

  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  score: { fontSize: 28, fontFamily: 'SpoqaHanSansNeo-Bold', fontWeight: '700', color: Colors.textPrimary },
  lastWeekNote: { fontSize: 12, color: Colors.textMuted },

  miniBarGrid: { flexDirection: 'row', gap: 10 },
  miniBarWrap: { flex: 1, gap: 4 },
  miniBarRow: { flexDirection: 'row', justifyContent: 'space-between' },
  miniBarLabel: { fontSize: 11, color: Colors.textMuted },
  miniBarPct: { fontSize: 11, color: Colors.textSubtle },
  miniBarBg: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  miniBarFill: { height: '100%' as any, borderRadius: 4 },

  footer: { fontSize: 11, color: Colors.textMuted },
});
