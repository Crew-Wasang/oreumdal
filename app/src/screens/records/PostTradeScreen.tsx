import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { MainStackParamList, TradeDirection, EmotionType } from '../../types';
import { useRecordStore } from '../../store/recordStore';
import { useUserStore } from '../../store/userStore';
import ScaleButton from '../../components/common/ScaleButton';
import SignUpBottomSheet from '../../components/common/SignUpBottomSheet';
import { searchStocks, Stock } from '../../data/stocks';

type Nav = NativeStackNavigationProp<MainStackParamList>;

const EMOTIONS: { type: EmotionType; label: string }[] = [
  { type: 'anxious', label: '불안했어요' },
  { type: 'excited', label: '조급했어요' },
  { type: 'greedy', label: '신났어요' },
  { type: 'calm', label: '확신이 있었어요' },
  { type: 'fearful', label: '두려웠어요' },
  { type: 'confused', label: '후회돼요' },
];

export default function PostTradeScreen() {
  const navigation = useNavigation<Nav>();
  const addRecord = useRecordStore((s) => s.addRecord);
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);

  const [stockName, setStockName] = useState('');
  const [suggestions, setSuggestions] = useState<Stock[]>([]);
  const [direction, setDirection] = useState<TradeDirection | null>(null);
  const [emotions, setEmotions] = useState<EmotionType[]>([]);
  const [memo, setMemo] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);

  const MAX_EMOTIONS = 2;
  const canSave = stockName.trim().length > 0 && direction !== null;

  const toggleEmotion = (type: EmotionType) =>
    setEmotions(prev =>
      prev.includes(type)
        ? prev.filter(e => e !== type)
        : prev.length >= MAX_EMOTIONS ? prev : [...prev, type]
    );

  const handleSave = () => {
    if (!canSave || !direction) return;
    const emotionLabel = emotions
      .map(e => EMOTIONS.find(x => x.type === e)?.label ?? e)
      .join(', ');
    addRecord({
      type: 'post',
      stock_name: stockName.trim(),
      direction,
      emotions,
      emotion_label: emotionLabel,
      messages: [],
      trade_outcome: 'traded',
      memo: memo.trim() || undefined,
    });
    if (!isLoggedIn) {
      setShowSignUp(true);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <ScaleButton onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </ScaleButton>
          <Text style={styles.headerTitle}>매매 기록 남기기</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.subtitle}>이미 끝난 매매를 기록만 남겨요 · AI 코칭은 진행되지 않아요</Text>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>종목명</Text>
            <TextInput
              style={styles.textInput}
              placeholder="예: 삼성전자, AAPL"
              placeholderTextColor={Colors.textMuted}
              value={stockName}
              onChangeText={(v) => { setStockName(v); setSuggestions(searchStocks(v)); }}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => setSuggestions([])}
            />
            {suggestions.length > 0 && (
              <View style={styles.suggestionBox}>
                {suggestions.map((s) => (
                  <ScaleButton
                    key={s.code}
                    style={styles.suggestionItem}
                    onPress={() => { setStockName(s.name); setSuggestions([]); }}
                  >
                    <Text style={styles.suggestionName}>{s.name}</Text>
                    <Text style={styles.suggestionCode}>{s.code}</Text>
                  </ScaleButton>
                ))}
              </View>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>방향</Text>
            <View style={styles.directionRow}>
              <ScaleButton
                style={[styles.dirBtn, direction === 'buy' && styles.dirBtnBuy]}
                onPress={() => setDirection('buy')}
              >
                <Text style={[styles.dirBtnText, direction === 'buy' && styles.dirBtnBuyText]}>매수</Text>
              </ScaleButton>
              <ScaleButton
                style={[styles.dirBtn, direction === 'sell' && styles.dirBtnSell]}
                onPress={() => setDirection('sell')}
              >
                <Text style={[styles.dirBtnText, direction === 'sell' && styles.dirBtnSellText]}>매도</Text>
              </ScaleButton>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>당시 감정 (최대 2개, 선택)</Text>
            <View style={styles.emotionWrap}>
              {EMOTIONS.map(({ type, label }) => {
                const active = emotions.includes(type);
                const disabled = !active && emotions.length >= MAX_EMOTIONS;
                return (
                  <ScaleButton
                    key={type}
                    style={[styles.emotionPill, active && styles.emotionPillActive, disabled && styles.emotionPillDisabled]}
                    onPress={() => toggleEmotion(type)}
                    disabled={disabled}
                  >
                    <Text style={[styles.emotionPillText, active && styles.emotionPillTextActive]}>
                      {label}
                    </Text>
                  </ScaleButton>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>메모 (선택)</Text>
            <TextInput
              style={[styles.textInput, styles.memoInput]}
              placeholder="매매하게 된 상황이나 이유를 짧게 남겨두면 리포트에 반영돼요"
              placeholderTextColor={Colors.textMuted}
              value={memo}
              onChangeText={setMemo}
              multiline
              maxLength={200}
            />
          </View>

          <ScaleButton
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!canSave}
          >
            <Text style={styles.saveBtnText}>기록 저장하기</Text>
          </ScaleButton>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <SignUpBottomSheet
        visible={showSignUp}
        trigger="save"
        onClose={() => { setShowSignUp(false); navigation.navigate('Tabs'); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  closeBtn: { width: 40, height: 40, justifyContent: 'center' },
  closeBtnText: { fontSize: 18, color: Colors.textSecondary },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },

  subtitle: {
    fontSize: 12, color: Colors.textSecondary,
    paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },

  content: { padding: 20, gap: 24 },

  field: { gap: 10 },
  fieldLabel: { fontSize: 12, color: Colors.textSecondary },

  textInput: {
    backgroundColor: Colors.surface, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 14, color: Colors.textPrimary,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  memoInput: { minHeight: 80, textAlignVertical: 'top' },

  directionRow: { flexDirection: 'row', gap: 12 },
  dirBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 16,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  dirBtnBuy: { backgroundColor: Colors.buyBg, borderColor: Colors.buyBorder, borderWidth: 1.5 },
  dirBtnSell: { backgroundColor: Colors.sellBg, borderColor: Colors.sellBorder, borderWidth: 1.5 },
  dirBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  dirBtnBuyText: { color: Colors.buy },
  dirBtnSellText: { color: Colors.sell },

  suggestionBox: {
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    overflow: 'hidden',
    marginTop: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  suggestionName: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  suggestionCode: { fontSize: 12, color: Colors.textMuted },

  emotionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emotionPill: {
    paddingVertical: 7, paddingHorizontal: 14,
    borderRadius: 20, backgroundColor: Colors.surface,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  emotionPillActive: { backgroundColor: Colors.ctaLight, borderColor: Colors.cta, borderWidth: 1.5 },
  emotionPillDisabled: { opacity: 0.35 },
  emotionPillText: { fontSize: 13, color: Colors.textSecondary },
  emotionPillTextActive: { color: Colors.textPrimary, fontWeight: '500' },

  saveBtn: {
    backgroundColor: Colors.cta, borderRadius: 16,
    padding: 16, alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: Colors.surfaceElevated },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
