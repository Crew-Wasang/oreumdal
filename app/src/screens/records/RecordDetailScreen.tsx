import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { MainStackParamList, TradeOutcome } from '../../types';
import { useRecordStore } from '../../store/recordStore';
import ScaleButton from '../../components/common/ScaleButton';
import { Sparkle } from '../../components/common/Icons';

type Nav = NativeStackNavigationProp<MainStackParamList>;
type Route = RouteProp<MainStackParamList, 'RecordDetail'>;

function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 · ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function RecordDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { sessionId } = route.params;
  const { records, updateTradeOutcome } = useRecordStore();
  const record = records.find((r) => r.id === sessionId);
  const [localOutcome, setLocalOutcome] = useState<TradeOutcome>(record?.trade_outcome ?? null);

  if (!record) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>기록을 찾을 수 없어요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isBuy = record.direction === 'buy';
  const isOk = record.verdict === 'ok';
  const score = record.impulse_score ?? 0;

  const handleOutcomeSelect = (outcome: TradeOutcome) => {
    setLocalOutcome(outcome);
    updateTradeOutcome(sessionId, outcome);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <ScaleButton onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ 뒤로</Text>
        </ScaleButton>
        <Text style={styles.headerTitle}>기록 상세</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 메타 */}
        <View>
          <Text style={styles.metaDate}>{formatDate(record.created_at)}</Text>
          <View style={styles.metaNameRow}>
            <Text style={styles.metaStock}>{record.stock_name}</Text>
            <View style={[styles.dirBadge, isBuy ? styles.dirBuyBadge : styles.dirSellBadge]}>
              <Text style={[styles.dirBadgeText, isBuy ? styles.dirBuyText : styles.dirSellText]}>
                {isBuy ? '매수' : '매도'}
              </Text>
            </View>
          </View>
        </View>

        {/* 코칭 결과 카드 */}
        {record.type === 'check' && record.verdict && (
          <View style={[styles.resultCard, isOk ? styles.resultCardOk : styles.resultCardAmber]}>
            <View style={styles.resultCardHeader}>
              <Text style={[styles.resultVerdict, isOk ? styles.verdictOkText : styles.verdictAmberText]}>
                {isOk ? '지금 매매해도 괜찮아요' : '한 번 더 생각해봐요'}
              </Text>
              <Text style={[styles.resultScore, isOk ? styles.verdictOkText : styles.verdictAmberText]}>
                충동도 {score}%
              </Text>
            </View>
            {record.reason && (
              <Text style={styles.resultReason}>{record.reason}</Text>
            )}
          </View>
        )}

        {/* POST 메모 */}
        {record.type === 'post' && record.memo && (
          <View style={styles.memoCard}>
            <Text style={styles.sectionLabel}>메모</Text>
            <Text style={styles.memoText}>{record.memo}</Text>
          </View>
        )}

        {/* 코칭 대화 */}
        {record.type === 'check' && record.messages.length > 0 && (
          <View style={styles.chatSection}>
            <Text style={styles.sectionLabel}>당시 코칭 대화</Text>
            <View style={styles.chatBubbles}>
              {record.messages.map((msg, i) => (
                msg.role === 'assistant' ? (
                  <View key={i} style={styles.bubbleWrapAI}>
                    <View style={styles.bubbleAI}>
                      <Text style={styles.textAI}>{msg.content}</Text>
                    </View>
                  </View>
                ) : (
                  <View key={i} style={styles.bubbleWrapUser}>
                    <View style={styles.bubbleUser}>
                      <Text style={styles.textUser}>{msg.content}</Text>
                    </View>
                  </View>
                )
              ))}
            </View>
          </View>
        )}

        {/* 매매 결과 기록 */}
        <View style={styles.outcomeCard}>
          <Text style={styles.outcomeCardLabel}>매매 후 결과 (직접 기록)</Text>
          <View style={styles.outcomeButtons}>
            <ScaleButton
              style={[styles.outcomeBtn, localOutcome === 'skipped' && styles.outcomeBtnOk]}
              onPress={() => handleOutcomeSelect(localOutcome === 'skipped' ? null : 'skipped')}
            >
              <Text style={[styles.outcomeBtnText, localOutcome === 'skipped' && styles.outcomeBtnOkText]}>
                매매 안 함
              </Text>
            </ScaleButton>
            <ScaleButton
              style={[styles.outcomeBtn, localOutcome === 'traded' && styles.outcomeBtnActive]}
              onPress={() => handleOutcomeSelect(localOutcome === 'traded' ? null : 'traded')}
            >
              <Text style={[styles.outcomeBtnText, localOutcome === 'traded' && styles.outcomeBtnActiveText]}>
                그대로 매매
              </Text>
            </ScaleButton>
          </View>
          <View style={styles.outcomeNote}>
            <Sparkle size={11} color={Colors.cta} />
            <Text style={styles.outcomeNoteText}>결과를 남기면 AI 리포트의 정확도가 올라가요</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15, color: Colors.textMuted },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  backBtn: { paddingVertical: 4, paddingRight: 8 },
  backText: { fontSize: 16, color: Colors.accent, fontWeight: '500' },
  headerTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },

  content: { padding: 20, gap: 16 },

  metaDate: { fontSize: 12, color: Colors.textMuted },
  metaNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  metaStock: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  dirBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  dirBuyBadge: { backgroundColor: Colors.buyBg },
  dirSellBadge: { backgroundColor: Colors.sellBg },
  dirBadgeText: { fontSize: 11, fontWeight: '500' },
  dirBuyText: { color: Colors.buy },
  dirSellText: { color: Colors.sell },

  resultCard: {
    borderRadius: 20, padding: 16, borderWidth: 1, gap: 8,
  },
  resultCardAmber: { backgroundColor: '#FFFBEB', borderColor: '#FCD34D' },
  resultCardOk: { backgroundColor: '#F0FDF4', borderColor: '#6EE7B7' },
  resultCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultVerdict: { fontSize: 14, fontWeight: '600' },
  verdictAmberText: { color: Colors.impulse },
  verdictOkText: { color: Colors.ok },
  resultScore: { fontSize: 14, fontWeight: '700' },
  resultReason: { fontSize: 12, color: Colors.textSubtle, lineHeight: 12 * 1.7 },

  sectionLabel: {
    fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8,
  },

  memoCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  memoText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 14 * 1.7 },

  chatSection: { gap: 0 },
  chatBubbles: { gap: 8 },
  bubbleWrapAI: { alignSelf: 'flex-start', maxWidth: '82%' },
  bubbleWrapUser: { alignSelf: 'flex-end', maxWidth: '82%' },
  bubbleAI: {
    backgroundColor: Colors.surface,
    borderTopRightRadius: 16, borderBottomRightRadius: 16, borderTopLeftRadius: 16,
    padding: 12, borderWidth: 0.5, borderColor: Colors.border,
  },
  bubbleUser: {
    backgroundColor: `${Colors.cta}E6`,
    borderTopLeftRadius: 16, borderBottomLeftRadius: 16, borderTopRightRadius: 16,
    padding: 12,
  },
  textAI: { fontSize: 13, color: Colors.textPrimary, lineHeight: 13 * 1.75 },
  textUser: { fontSize: 13, color: '#FFF', lineHeight: 13 * 1.75 },

  outcomeCard: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 16,
    borderWidth: 0.5, borderColor: Colors.border, gap: 12,
  },
  outcomeCardLabel: { fontSize: 12, color: Colors.textSecondary },
  outcomeButtons: { flexDirection: 'row', gap: 10 },
  outcomeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 14,
    backgroundColor: Colors.background, borderWidth: 0.5, borderColor: Colors.border,
    alignItems: 'center',
  },
  outcomeBtnOk: {
    backgroundColor: '#F0FDF4', borderColor: Colors.okMid, borderWidth: 1,
  },
  outcomeBtnActive: {
    backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#FECDD3',
  },
  outcomeBtnText: { fontSize: 13, color: Colors.textSubtle, fontWeight: '500' },
  outcomeBtnOkText: { color: Colors.ok },
  outcomeBtnActiveText: { color: '#BE123C' },

  outcomeNote: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  outcomeNoteText: { fontSize: 11, color: Colors.textMuted },
});
