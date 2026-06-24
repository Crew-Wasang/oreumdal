import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, Modal, Animated,
  Dimensions, TouchableWithoutFeedback,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { EmotionType, TradeDirection } from '../../types';
import ScaleButton from '../common/ScaleButton';
import { searchStocks, Stock } from '../../data/stocks';

const SHEET_HEIGHT = Dimensions.get('window').height * 0.76;

const EMOTIONS: { type: EmotionType; label: string }[] = [
  { type: 'anxious', label: '불안해요' },
  { type: 'excited', label: '조급해요' },
  { type: 'greedy', label: '신나요' },
  { type: 'calm', label: '확신이 있어요' },
  { type: 'fearful', label: '두려워요' },
  { type: 'confused', label: '후회돼요' },
];

interface Props {
  visible: boolean;
  onStart: (p: { stockName: string; direction: TradeDirection; emotions: EmotionType[] }) => void;
  onClose: () => void;
}

export default function CheckBottomSheet({ visible, onStart, onClose }: Props) {
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [stockName, setStockName] = useState('');
  const [suggestions, setSuggestions] = useState<Stock[]>([]);
  const [direction, setDirection] = useState<TradeDirection | null>(null);
  const [emotions, setEmotions] = useState<EmotionType[]>([]);

  const canStart = stockName.trim().length > 0 && direction !== null && emotions.length > 0;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: SHEET_HEIGHT, duration: 220, useNativeDriver: true }),
      ]).start();
      setStockName(''); setSuggestions([]); setDirection(null); setEmotions([]);
    }
  }, [visible]);

  const MAX_EMOTIONS = 2;

  const toggleEmotion = (type: EmotionType) =>
    setEmotions(prev =>
      prev.includes(type)
        ? prev.filter(e => e !== type)
        : prev.length >= MAX_EMOTIONS ? prev : [...prev, type]
    );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.handleWrap}><View style={styles.handle} /></View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>지금 무엇을,{'\n'}어떻게 매매하려고 하나요?</Text>
            <Text style={styles.subtitle}>상황을 알려주면 코치가 함께 점검해드려요</Text>

            {/* 종목명 */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>종목명</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 삼성전자, AAPL"
                placeholderTextColor={Colors.textMuted}
                value={stockName}
                onChangeText={(v) => {
                  setStockName(v);
                  setSuggestions(searchStocks(v));
                }}
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

            {/* 방향 */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>방향</Text>
              <View style={styles.dirRow}>
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

            {/* 감정 */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>지금 감정 (최대 2개)</Text>
              <View style={styles.emotionWrap}>
                {EMOTIONS.map((e) => {
                  const active = emotions.includes(e.type);
                  const disabled = !active && emotions.length >= MAX_EMOTIONS;
                  return (
                    <ScaleButton
                      key={e.type}
                      style={[styles.emotionPill, active && styles.emotionPillActive, disabled && styles.emotionPillDisabled]}
                      onPress={() => toggleEmotion(e.type)}
                      disabled={disabled}
                    >
                      <Text style={[styles.emotionPillText, active && styles.emotionPillTextActive]}>
                        {e.label}
                      </Text>
                    </ScaleButton>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <ScaleButton
              style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
              onPress={() => canStart && direction && onStart({ stockName: stockName.trim(), direction, emotions })}
              disabled={!canStart}
            >
              <Text style={styles.startBtnText}>AI 코치와 대화 시작</Text>
            </ScaleButton>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: SHEET_HEIGHT,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  handleWrap: { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border },

  scrollContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8, gap: 24 },
  title: { fontSize: 22, fontFamily: 'A2Z-Bold', fontWeight: '700', color: Colors.textPrimary, lineHeight: 22 * 1.4 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: -16 },

  section: { gap: 10 },
  sectionLabel: { fontSize: 12, color: Colors.textSecondary },

  input: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: Colors.textPrimary,
    borderWidth: 0.5, borderColor: Colors.border,
  },

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
  suggestionName: { fontSize: 14, color: Colors.textPrimary, fontFamily: 'A2Z-Medium', fontWeight: '500' },
  suggestionCode: { fontSize: 12, color: Colors.textMuted },

  dirRow: { flexDirection: 'row', gap: 12 },
  dirBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 16,
    backgroundColor: Colors.surface, borderWidth: 0.5, borderColor: Colors.border,
    alignItems: 'center',
  },
  dirBtnBuy: { backgroundColor: Colors.buyBg, borderColor: Colors.buyBorder, borderWidth: 1.5 },
  dirBtnSell: { backgroundColor: Colors.sellBg, borderColor: Colors.sellBorder, borderWidth: 1.5 },
  dirBtnText: { fontSize: 15, fontFamily: 'A2Z-Bold', fontWeight: '600', color: Colors.textLight },
  dirBtnBuyText: { color: Colors.buy },
  dirBtnSellText: { color: Colors.sell },

  emotionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emotionPill: {
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 24, backgroundColor: Colors.surface,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  emotionPillActive: {
    backgroundColor: Colors.ctaLight,
    borderColor: Colors.cta, borderWidth: 1.5,
  },
  emotionPillDisabled: { opacity: 0.35 },
  emotionPillText: { fontSize: 13, color: Colors.textLight },
  emotionPillTextActive: { color: Colors.ctaLightText, fontFamily: 'A2Z-Medium', fontWeight: '500' },

  footer: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 0.5, borderTopColor: Colors.border },
  startBtn: { backgroundColor: Colors.cta, borderRadius: 16, padding: 17, alignItems: 'center' },
  startBtnDisabled: { opacity: 0.35 },
  startBtnText: { color: '#FFF', fontSize: 15, fontFamily: 'A2Z-Bold', fontWeight: '600' },
});
