import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { OutcomeStats } from '../../lib/reportUtils';

interface Props {
  stats: OutcomeStats;
  insight: string | null;
  loading: boolean;
}

export default function OutcomeComparisonCard({ stats, insight, loading }: Props) {
  const { skippedCount, tradedCount, skippedAvgImpulse, tradedAvgImpulse } = stats;
  const total = skippedCount + tradedCount;
  const heldPct = total > 0 ? Math.round((skippedCount / total) * 100) : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>참은 횟수 vs 매매한 횟수</Text>

      {total === 0 ? (
        <Text style={styles.empty}>실제 매매 여부를 기록하면 여기서 비교해드려요.</Text>
      ) : (
        <>
          <View style={styles.stackBar}>
            <View style={{ flex: heldPct, backgroundColor: Colors.okMid }} />
            <View style={{ flex: 100 - heldPct, backgroundColor: '#FBBF24' }} />
          </View>

          <View style={styles.colGrid}>
            <View style={styles.heldCard}>
              <Text style={styles.heldLabel}>참았어요</Text>
              <Text style={styles.heldCount}>{skippedCount}회</Text>
              <Text style={styles.heldSub}>평균 충동도 {skippedAvgImpulse}%</Text>
            </View>
            <View style={styles.tradedCard}>
              <Text style={styles.tradedLabel}>매매했어요</Text>
              <Text style={styles.tradedCount}>{tradedCount}회</Text>
              <Text style={styles.tradedSub}>평균 충동도 {tradedAvgImpulse}%</Text>
            </View>
          </View>

          {(insight || loading) && (
            <View style={styles.insightWrap}>
              <Text style={loading ? styles.insightLoading : styles.insightText}>
                {loading ? '분석 중...' : insight}
              </Text>
            </View>
          )}
        </>
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

  stackBar: {
    flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden',
  },

  colGrid: { flexDirection: 'row', gap: 10 },
  heldCard: {
    flex: 1, padding: 12, borderRadius: 12,
    backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0',
    gap: 2,
  },
  tradedCard: {
    flex: 1, padding: 12, borderRadius: 12,
    backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A',
    gap: 2,
  },
  heldLabel: { fontSize: 11, color: '#047857' },
  heldCount: { fontSize: 18, fontFamily: 'A2Z-Bold', fontWeight: '700', color: Colors.textPrimary },
  heldSub: { fontSize: 11, color: Colors.textMuted },
  tradedLabel: { fontSize: 11, color: '#B45309' },
  tradedCount: { fontSize: 18, fontFamily: 'A2Z-Bold', fontWeight: '700', color: Colors.textPrimary },
  tradedSub: { fontSize: 11, color: Colors.textMuted },

  insightWrap: { paddingTop: 12, borderTopWidth: 0.5, borderTopColor: Colors.border },
  insightText: {
    fontSize: 13, color: Colors.accent, lineHeight: 13 * 1.7, fontStyle: 'italic',
  },
  insightLoading: { fontSize: 13, color: Colors.textMuted },
});
