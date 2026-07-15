import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { MainStackParamList } from '../../types';
import { useRecordStore } from '../../store/recordStore';
import ScaleButton from '../../components/common/ScaleButton';
import { TrashIcon, ChevronLeft } from '../../components/common/Icons';
import ActionTag from '../../components/common/ActionTag';

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
  const { records, deleteRecord } = useRecordStore();
  const record = records.find((r) => r.id === sessionId);

  const handleDelete = () => {
    Alert.alert(
      '기록 삭제',
      '이 코칭 기록을 삭제할까요? 삭제한 기록은 복구할 수 없어요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            deleteRecord(sessionId);
            navigation.goBack();
          },
        },
      ],
    );
  };

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

  const tradeOutcomeLabel =
    record.trade_outcome === 'traded' ? '매매 실행' :
    record.trade_outcome === 'skipped' ? '매매 안 함' : '미기록';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <ScaleButton onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={26} color={Colors.textPrimary} />
        </ScaleButton>
        <Text style={styles.headerTitle}>기록 상세</Text>
        <ScaleButton onPress={handleDelete} style={styles.deleteBtn}>
          <TrashIcon size={20} color={Colors.textSecondary} />
        </ScaleButton>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 메타 */}
        <View>
          <Text style={styles.metaDate}>{formatDate(record.created_at)}</Text>
          <View style={styles.metaNameRow}>
            <Text style={styles.metaStock}>{record.stock_name}</Text>
            <ActionTag action={isBuy ? '매수' : '매도'} />
          </View>
          <View style={styles.infoRows}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>선택한 감정</Text>
              <Text style={styles.infoValue}>{record.emotion_label || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>매매 여부</Text>
              <Text style={styles.infoValue}>{tradeOutcomeLabel}</Text>
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
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 15, lineHeight: 22, fontFamily: 'A2Z-Bold', fontWeight: '600', color: Colors.textPrimary },
  deleteBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  content: { padding: 20, gap: 16 },

  metaDate: { fontSize: 12, color: Colors.textMuted },
  metaNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  metaStock: { fontSize: 22, lineHeight: 33, fontFamily: 'A2Z-Bold', fontWeight: '700', color: Colors.textPrimary },
  infoRows: { marginTop: 12, gap: 6 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 13, color: Colors.textSecondary },
  infoValue: { fontSize: 13, lineHeight: 20, fontFamily: 'A2Z-Bold', fontWeight: '600', color: Colors.textPrimary },

  resultCard: {
    borderRadius: 20, padding: 16, borderWidth: 1, gap: 8,
  },
  resultCardAmber: { backgroundColor: '#FFFBEB', borderColor: '#FCD34D' },
  resultCardOk: { backgroundColor: '#F0FDF4', borderColor: '#6EE7B7' },
  resultCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultVerdict: { fontSize: 14, lineHeight: 21, fontFamily: 'A2Z-Bold', fontWeight: '600' },
  verdictAmberText: { color: Colors.impulse },
  verdictOkText: { color: Colors.ok },
  resultScore: { fontSize: 14, lineHeight: 21, fontFamily: 'A2Z-Bold', fontWeight: '700' },
  resultReason: { fontSize: 12, color: Colors.textSubtle, lineHeight: 12 * 1.7 },

  sectionLabel: {
    fontSize: 13, lineHeight: 20, fontFamily: 'A2Z-Bold', fontWeight: '600', color: Colors.textPrimary, marginBottom: 8,
  },

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

});
