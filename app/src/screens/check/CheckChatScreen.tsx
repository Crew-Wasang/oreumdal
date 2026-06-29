import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, SafeAreaView,
  KeyboardAvoidingView, Platform, Animated, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { MainStackParamList, ChatMessage } from '../../types';
import ScaleButton from '../../components/common/ScaleButton';
import { useRecordStore } from '../../store/recordStore';
import { useUserStore } from '../../store/userStore';
import SignUpBottomSheet from '../../components/common/SignUpBottomSheet';
import { sendCoachingMessage, generateConclusion } from '../../lib/ai';
import { buildRecordSummary } from '../../lib/ai/recordSummary';
import { fetchMarketContext } from '../../lib/ai/marketContext';
import { requestNotificationPermission, scheduleFollowUp } from '../../lib/notifications';
import { Sparkle, SendIcon, LightbulbIcon, ChevronRight } from '../../components/common/Icons';

type Nav = NativeStackNavigationProp<MainStackParamList, 'CheckChat'>;
type Route = RouteProp<MainStackParamList, 'CheckChat'>;

type InputMode = 'q1' | 'q2' | 'q3' | 'done';
type TradeOutcome = 'pending' | 'done' | 'cancelled' | null;

const PLACEHOLDERS: Record<string, string> = {
  q1: '정보에서인지, 감정에서인지 솔직하게…',
  q2: '구체적인 상황이나 근거를 말해보세요…',
  q3: '지금 이 순간 솔직하게 돌아보면…',
};

interface ResultData {
  score: number;
  verdict: '다시 생각해봐요' | '괜찮아요';
  reason: string;
}

function AIAvatar() {
  return (
    <LinearGradient
      colors={[Colors.accent, Colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.aiAvatar}
    >
      <Sparkle size={13} color="#FFF" />
    </LinearGradient>
  );
}

function TypingBubble() {
  const dots = [
    useRef(new Animated.Value(0.2)).current,
    useRef(new Animated.Value(0.2)).current,
    useRef(new Animated.Value(0.2)).current,
  ];
  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 200),
        Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0.2, duration: 300, useNativeDriver: true }),
        Animated.delay(600 - i * 200),
      ]))
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);
  return (
    <View style={styles.msgRowAI}>
      <AIAvatar />
      <View style={styles.bubbleAI}>
        <View style={styles.typingRow}>
          {dots.map((dot, i) => (
            <Animated.View key={i} style={[styles.typingDot, { opacity: dot }]} />
          ))}
        </View>
      </View>
    </View>
  );
}

function BasisRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.basisRow}>
      <Text style={styles.basisLabel}>{label}</Text>
      <Text style={styles.basisValue}>{value}</Text>
    </View>
  );
}

export default function CheckChatScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { stockName, direction, emotions, emotionLabel } = route.params;
  const directionText = direction === 'buy' ? '매수' : '매도';
  const addRecord = useRecordStore((s) => s.addRecord);
  const records = useRecordStore((s) => s.records);
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const principles = useUserStore((s) => s.principles);

  const sessionCtx = useRef({ recordSummary: '', marketContext: '' });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('done');
  const [aiError, setAiError] = useState(false);
  const [customText, setCustomText] = useState('');
  const [result, setResult] = useState<ResultData | null>(null);
  const [tradeOutcome, setTradeOutcome] = useState<TradeOutcome>(null);
  const [saved, setSaved] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const outcomeFadeAnim = useRef(new Animated.Value(0)).current;
  const lastAiCallRef = useRef<ChatMessage[]>([]);

  const userTurn = messages.filter(m => m.role === 'user').length;

  const scrollToBottom = () =>
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

  const callAIQuestion = async (currentMessages: ChatMessage[]) => {
    lastAiCallRef.current = currentMessages;
    setIsTyping(true);
    setAiError(false);
    scrollToBottom();
    try {
      const reply = await sendCoachingMessage({
        stockName, direction, emotions, emotionLabel,
        investmentPrinciples: principles || undefined,
        recordSummary: sessionCtx.current.recordSummary || undefined,
        marketContext: sessionCtx.current.marketContext || undefined,
        messages: currentMessages,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      const userCount = currentMessages.filter(m => m.role === 'user').length;
      if (userCount === 0) setInputMode('q1');
      else if (userCount === 1) setInputMode('q2');
      else setInputMode('q3');
    } catch {
      setAiError(true);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '잠시 연결이 불안정해요.',
      }]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const handleRetry = () => {
    setAiError(false);
    setMessages(prev => prev.slice(0, -1));
    callAIQuestion(lastAiCallRef.current);
  };

  const callAIConclusion = async (currentMessages: ChatMessage[]) => {
    setIsTyping(true);
    scrollToBottom();
    try {
      const res = await generateConclusion({
        stockName, direction, emotions, emotionLabel,
        investmentPrinciples: principles || undefined,
        recordSummary: sessionCtx.current.recordSummary || undefined,
        marketContext: sessionCtx.current.marketContext || undefined,
        messages: currentMessages,
      });
      setResult({
        score: res.impulseScore,
        verdict: res.conclusion === 'ok' ? '괜찮아요' : '다시 생각해봐요',
        reason: res.reason,
      });
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    } catch {
      setResult({ score: 55, verdict: '다시 생각해봐요', reason: '결과를 분석하지 못했어요' });
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const handleUserChoice = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(prev => [...prev, userMsg]);
    setCustomText('');
    setInputMode('done');
    scrollToBottom();
    const userCount = nextMessages.filter(m => m.role === 'user').length;
    if (userCount < 3) {
      callAIQuestion(nextMessages);
    } else {
      callAIConclusion(nextMessages);
    }
  };

  useEffect(() => {
    const init = async () => {
      sessionCtx.current.recordSummary = buildRecordSummary(records, stockName);
      sessionCtx.current.marketContext = await fetchMarketContext(stockName).catch(() => '');
      callAIQuestion([]);
    };
    init();
  }, []);

  const doSave = () => {
    if (result) {
      addRecord({
        type: 'check',
        stock_name: stockName,
        direction,
        emotions,
        emotion_label: emotionLabel,
        verdict: result.verdict === '괜찮아요' ? 'ok' : 'reconsider',
        impulse_score: result.score,
        reason: result.reason,
        messages,
        trade_outcome:
          tradeOutcome === 'done' ? 'traded'
          : tradeOutcome === 'cancelled' ? 'skipped'
          : null,
      });
    }
  };

  const handleSaveAndClose = () => {
    doSave();
    setSaved(true);
    if (!isLoggedIn) {
      setShowSignUp(true);
    } else {
      navigation.goBack();
    }
  };

  const handleSkipSave = () => navigation.goBack();

  const handleClose = () => {
    if (result && !saved) {
      Alert.alert(
        '코칭 기록을 저장할까요?',
        '저장하지 않으면 이 코칭 내용이 사라져요.',
        [
          { text: '저장하고 닫기', onPress: handleSaveAndClose },
          { text: '그냥 닫기', style: 'destructive', onPress: () => navigation.goBack() },
          { text: '취소', style: 'cancel' },
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  const handleLaterOutcomeNotify = async () => {
    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert('알림 권한 필요', '설정 > 오름달에서 알림을 허용해주세요.');
      return;
    }
    await scheduleFollowUp(stockName, direction);
    Alert.alert('알림 예약', `8시간 후에 "${stockName} ${directionText}, 결국 어떻게 하셨나요?" 알림을 보내드릴게요.`);
    handleTradeOutcome('pending');
  };

  const handleTradeOutcome = (outcome: TradeOutcome) => {
    setTradeOutcome(outcome);
    Animated.timing(outcomeFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    scrollToBottom();
  };

  const isOk = result?.verdict === '괜찮아요';

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <ScaleButton onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </ScaleButton>
          <Text style={styles.headerTitle}>AI 코칭</Text>
          <Text style={styles.turnCounter}>{Math.min(userTurn + 1, 3)}/3</Text>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, i) =>
            msg.role === 'assistant' ? (
              <View key={i} style={styles.msgRowAI}>
                <AIAvatar />
                <View style={styles.bubbleAI}>
                  <Text style={styles.textAI}>{msg.content}</Text>
                </View>
              </View>
            ) : (
              <View key={i} style={styles.msgRowUser}>
                <View style={styles.bubbleUser}>
                  <Text style={styles.textUser}>{msg.content}</Text>
                </View>
              </View>
            )
          )}

          {isTyping && <TypingBubble />}

          {result && (
            <Animated.View style={[styles.resultWrap, { opacity: fadeAnim }]}>
              {/* 판정 카드 */}
              <LinearGradient
                colors={isOk
                  ? ['#D1FAE5', '#ECFDF5']
                  : ['rgba(167,243,208,0.55)', 'rgba(110,231,183,0.35)', 'rgba(253,186,116,0.35)', 'rgba(251,146,60,0.45)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.verdictCard, { borderColor: isOk ? '#6EE7B7' : 'rgba(110,231,183,0.5)' }]}
              >
                <View style={[styles.verdictGlow, { backgroundColor: isOk ? 'rgba(52,211,153,0.3)' : 'rgba(167,243,208,0.3)' }]} />
                <View style={[styles.verdictTag, { backgroundColor: isOk ? '#A7F3D0' : 'rgba(255,255,255,0.7)' }]}>
                  <Sparkle size={11} color={isOk ? Colors.ok : Colors.textSecondary} />
                  <Text style={[styles.verdictTagText, { color: isOk ? Colors.ok : '#3F3F46' }]}>AI 코치 의견</Text>
                </View>
                <Text style={[styles.verdictText, { color: isOk ? Colors.ok : Colors.textPrimary }]}>
                  {isOk ? '지금\n매매해도 괜찮아요' : '한 번 더\n생각해봐요'}
                </Text>
                <Text style={styles.verdictReason}>{result.reason}</Text>
              </LinearGradient>

              {/* 충동도 카드 */}
              <View style={styles.scoreCard}>
                <View style={styles.scoreHeader}>
                  <Text style={styles.scoreLabel}>충동도</Text>
                  <Text style={[styles.scoreValue, { color: result.score >= 55 ? Colors.impulse : Colors.ok }]}>
                    {result.score}%
                  </Text>
                </View>
                <View style={styles.barBg}>
                  <LinearGradient
                    colors={[Colors.impulseGradientLow, Colors.impulseGradientMid, '#F59E0B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.barFill, { width: `${result.score}%` as any }]}
                  />
                </View>
                <View style={styles.barLabels}>
                  <Text style={styles.barLabelText}>차분</Text>
                  <Text style={styles.barLabelText}>주의</Text>
                  <Text style={styles.barLabelText}>충동</Text>
                </View>
                <View style={styles.basisList}>
                  <BasisRow label="감정 상태" value={emotionLabel} />
                  <BasisRow label="매매 방향" value={`${stockName} ${directionText}`} />
                  <BasisRow
                    label="충동 위험도"
                    value={result.score >= 70 ? '높음' : result.score >= 45 ? '보통' : '낮음'}
                  />
                </View>
              </View>

              {/* 결국 어떻게? */}
              <View style={styles.outcomeCard}>
                <Text style={styles.outcomeSectionLabel}>결국 어떻게 하셨어요?</Text>
                {tradeOutcome === null ? (
                  <View style={styles.outcomeButtons}>
                    {[
                      { label: '아직 안 했어요', value: 'pending' as TradeOutcome },
                      { label: '했어요', value: 'done' as TradeOutcome },
                      { label: '안 하기로 했어요', value: 'cancelled' as TradeOutcome },
                    ].map((item) => (
                      <ScaleButton
                        key={item.label}
                        style={styles.outcomeBtn}
                        onPress={() => handleTradeOutcome(item.value)}
                      >
                        <Text style={styles.outcomeBtnText}>{item.label}</Text>
                      </ScaleButton>
                    ))}
                    <ScaleButton style={styles.outcomeBtn} onPress={handleLaterOutcomeNotify}>
                      <Text style={styles.outcomeBtnText}>나중에 알려주기</Text>
                    </ScaleButton>
                  </View>
                ) : (
                  <Animated.View style={{ opacity: outcomeFadeAnim }}>
                    <Text style={styles.outcomeConfirm}>
                      {tradeOutcome === 'pending'
                        ? '아직 결정하지 않으셨군요. 충분히 생각해보세요.'
                        : tradeOutcome === 'done'
                        ? '기록해두었어요. 결과는 나중에 돌아봐도 좋아요.'
                        : '잘 하셨어요. 원칙을 지킨 선택이에요.'}
                    </Text>
                  </Animated.View>
                )}
              </View>

              {/* 저장 — outcome 선택 후에만 노출 */}
              {tradeOutcome !== null && !saved && (
                <View style={styles.saveCard}>
                  <Text style={styles.saveSectionLabel}>이 코칭을 기록으로 저장할까요?</Text>
                  <View style={styles.saveButtons}>
                    <ScaleButton style={styles.savePrimaryWrap} onPress={handleSaveAndClose}>
                      <LinearGradient
                        colors={['#6366F1', '#4F46E5', '#7C3AED']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.savePrimary}
                      >
                        <Text style={styles.savePrimaryText}>기록 저장하고 닫기</Text>
                      </LinearGradient>
                    </ScaleButton>
                    <ScaleButton style={styles.saveSecondary} onPress={handleSkipSave}>
                      <Text style={styles.saveSecondaryText}>저장 안 함</Text>
                    </ScaleButton>
                  </View>
                </View>
              )}

              {/* 투자 원칙 유도 */}
              {!principles && (
                <ScaleButton
                  style={styles.principlesCard}
                  onPress={() => navigation.navigate('Tabs', { screen: 'My' } as any)}
                >
                  <View style={styles.principlesLeft}>
                    <View style={styles.principlesIconBox}>
                      <LightbulbIcon size={18} color={Colors.cta} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.principlesTag}>더 정확한 코칭을 받고 싶다면</Text>
                      <Text style={styles.principlesText}>투자 원칙을 설정해보세요</Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={Colors.cta} />
                </ScaleButton>
              )}
            </Animated.View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {!result && aiError && !isTyping && (
          <View style={styles.retryArea}>
            <ScaleButton style={styles.retryBtn} onPress={handleRetry}>
              <Text style={styles.retryBtnText}>다시 시도</Text>
            </ScaleButton>
          </View>
        )}

        {!result && !aiError && inputMode !== 'done' && (
          <View style={styles.inputArea}>
            <TextInput
              style={styles.customInput}
              placeholder={PLACEHOLDERS[inputMode] ?? '솔직하게 답해보세요…'}
              placeholderTextColor={Colors.textMuted}
              value={customText}
              onChangeText={setCustomText}
              returnKeyType="send"
              autoFocus
              onSubmitEditing={() => handleUserChoice(customText.trim())}
            />
            <ScaleButton
              style={[styles.sendBtn, !customText.trim() && styles.sendBtnDisabled]}
              onPress={() => handleUserChoice(customText.trim())}
              disabled={!customText.trim()}
            >
              <SendIcon size={18} color="#FFF" />
            </ScaleButton>
          </View>
        )}
      </KeyboardAvoidingView>

      <SignUpBottomSheet
        visible={showSignUp}
        trigger="chk"
        onClose={() => { setShowSignUp(false); navigation.goBack(); }}
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
  headerTitle: { fontSize: 15, fontFamily: 'A2Z-Bold', fontWeight: '600', color: Colors.textPrimary },
  turnCounter: { fontSize: 13, fontFamily: 'A2Z-Bold', fontWeight: '600', color: Colors.cta, width: 40, textAlign: 'right' },

  chatContent: { padding: 20, gap: 14, paddingBottom: 8 },

  msgRowAI: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '85%' },
  msgRowUser: { alignSelf: 'flex-end', maxWidth: '82%' },

  aiAvatar: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },

  bubbleAI: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopRightRadius: 16, borderBottomRightRadius: 16, borderTopLeftRadius: 16,
    padding: 14,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  bubbleUser: {
    backgroundColor: Colors.cta,
    borderTopLeftRadius: 16, borderBottomLeftRadius: 16, borderTopRightRadius: 16,
    padding: 14,
  },
  textAI: { fontSize: 14, color: Colors.textPrimary, lineHeight: 14 * 1.75 },
  textUser: { fontSize: 14, color: '#FFF', lineHeight: 14 * 1.75 },

  typingRow: { flexDirection: 'row', gap: 5, paddingVertical: 2 },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.textMuted },

  // 결과 영역
  resultWrap: { gap: 12, marginTop: 4 },

  verdictCard: {
    borderRadius: 24, padding: 20, borderWidth: 1, overflow: 'hidden', gap: 12,
  },
  verdictGlow: {
    position: 'absolute', right: -40, top: -40,
    width: 160, height: 160, borderRadius: 80,
  },
  verdictTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  verdictTagText: { fontSize: 11, fontFamily: 'A2Z-Medium', fontWeight: '500' },
  verdictText: { fontSize: 26, fontFamily: 'A2Z-Bold', fontWeight: '700', lineHeight: 26 * 1.3 },
  verdictReason: { fontSize: 13, color: Colors.textSubtle, lineHeight: 13 * 1.7 },

  scoreCard: {
    backgroundColor: Colors.surface, borderRadius: 24, padding: 20,
    borderWidth: 0.5, borderColor: Colors.border, gap: 12,
  },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  scoreLabel: { fontSize: 13, color: Colors.textSecondary },
  scoreValue: { fontSize: 22, fontFamily: 'A2Z-Bold', fontWeight: '700' },
  barBg: { height: 8, backgroundColor: Colors.impulseBar, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabelText: { fontSize: 10, color: Colors.textMuted },
  basisList: { gap: 8 },
  basisRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: Colors.background, borderRadius: 12,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  basisLabel: { fontSize: 12, color: Colors.textSecondary },
  basisValue: { fontSize: 13, color: Colors.textPrimary },

  outcomeCard: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 20,
    borderWidth: 0.5, borderColor: Colors.border, gap: 12,
  },
  outcomeSectionLabel: { fontSize: 13, fontFamily: 'A2Z-Bold', fontWeight: '600', color: Colors.textPrimary },
  outcomeButtons: { gap: 8 },
  outcomeBtn: {
    paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12,
    backgroundColor: Colors.background, borderWidth: 0.5, borderColor: Colors.border,
    alignItems: 'center',
  },
  outcomeBtnText: { fontSize: 14, color: Colors.textPrimary, fontFamily: 'A2Z-Medium', fontWeight: '500' },
  outcomeConfirm: { fontSize: 13, color: Colors.textSecondary, lineHeight: 13 * 1.7, fontStyle: 'italic' },

  saveCard: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 20,
    borderWidth: 0.5, borderColor: Colors.border, gap: 12,
  },
  saveSectionLabel: { fontSize: 13, color: Colors.textSubtle },
  saveButtons: { flexDirection: 'column', gap: 4 },
  savePrimaryWrap: { borderRadius: 14 },
  savePrimary: { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  savePrimaryText: { fontSize: 15, fontFamily: 'A2Z-Bold', fontWeight: '600', color: '#FFF' },
  saveSecondary: { paddingVertical: 10, alignItems: 'center' },
  saveSecondaryText: { fontSize: 14, color: Colors.textMuted },

  principlesCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderRadius: 20,
    backgroundColor: Colors.ctaLight, borderWidth: 0.5, borderColor: Colors.ctaBorder,
  },
  principlesLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  principlesIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(99,102,241,0.12)', alignItems: 'center', justifyContent: 'center',
  },
  principlesTag: { fontSize: 11, color: Colors.cta },
  principlesText: { fontSize: 13, fontFamily: 'A2Z-Medium', fontWeight: '500', color: Colors.textPrimary, marginTop: 2 },

  retryArea: {
    borderTopWidth: 0.5, borderTopColor: Colors.border,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  retryBtn: {
    paddingVertical: 12, paddingHorizontal: 28,
    borderRadius: 14, backgroundColor: Colors.surfaceElevated,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  retryBtnText: { fontSize: 14, fontFamily: 'A2Z-Bold', fontWeight: '600', color: Colors.textPrimary },

  inputArea: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderTopWidth: 0.5, borderTopColor: Colors.border,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  customInput: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 24,
    paddingHorizontal: 18, paddingVertical: 12,
    fontSize: 14, color: Colors.textPrimary,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.cta, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.35 },
});
