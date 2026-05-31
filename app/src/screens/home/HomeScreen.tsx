import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { MainStackParamList, EmotionType, TradeDirection, SessionRecord } from '../../types';
import ScaleButton from '../../components/common/ScaleButton';
import CheckBottomSheet from '../../components/check/CheckBottomSheet';
import { useRecordStore } from '../../store/recordStore';
import { useUserStore } from '../../store/userStore';
import {
  Sparkle, GreetSun, BellIcon, ChevronRight,
} from '../../components/common/Icons';
import { triggerNotifOpen } from '../../lib/notifModalTrigger';

type Nav = NativeStackNavigationProp<MainStackParamList>;

const EMOTION_LABEL: Record<EmotionType, string> = {
  excited: '흥분', anxious: '불안', greedy: '욕심',
  fearful: '두려움', calm: '차분', confused: '혼란',
};

const DAY_KR = ['일', '월', '화', '수', '목', '금', '토'];


function getTodayLabel() {
  const d = new Date();
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${DAY_KR[d.getDay()]}요일`;
}

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (h < 1) return '방금 전';
  if (h < 24) return `${h}시간 전`;
  if (d === 1) return '어제';
  if (d < 7) return `${d}일 전`;
  const date = new Date(iso);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

// ── 최근 코칭 카드 ────────────────────────────────────────────────────────────

function RecentCard({
  record,
  onPress,
}: {
  record: SessionRecord;
  onPress: () => void;
}) {
  const isOk = record.verdict === 'ok';
  const isBuy = record.direction === 'buy';
  const score = record.impulse_score;

  const verdictLabel = isOk ? '지금 매매해도 괜찮아요' : '한 번 더 생각해봐요';
  const scoreColor = isOk ? styles.scoreBadgeOk : styles.scoreBadgeAmber;
  const scoreTextColor = isOk ? styles.scoreBadgeOkText : styles.scoreBadgeAmberText;
  const actionStyle = isBuy ? styles.actionBuy : styles.actionSell;
  const actionTextStyle = isBuy ? styles.actionBuyText : styles.actionSellText;

  return (
    <ScaleButton style={styles.recentCard} onPress={onPress}>
      <View style={styles.recentCardTop}>
        <View style={styles.recentCardLeft}>
          <Text style={styles.recentCardStock}>{record.stock_name}</Text>
          <View style={[styles.actionBadge, actionStyle]}>
            <Text style={[styles.actionBadgeText, actionTextStyle]}>
              {isBuy ? '매수' : '매도'}
            </Text>
          </View>
        </View>
        <Text style={styles.recentCardTime}>{formatTime(record.created_at)}</Text>
      </View>
      <View style={styles.recentCardBottom}>
        <Text style={styles.recentCardVerdict}>{verdictLabel}</Text>
        {score !== undefined && (
          <View style={[styles.scoreBadge, scoreColor]}>
            <Text style={[styles.scoreBadgeText, scoreTextColor]}>충동도 {score}%</Text>
          </View>
        )}
      </View>
    </ScaleButton>
  );
}

// ── 홈 ───────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [sheetVisible, setSheetVisible] = useState(false);

  const records = useRecordStore((s) => s.records);
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const nickname = useUserStore((s) => s.nickname);

  const recentSessions = useMemo(
    () => records.filter((r) => r.type === 'check').slice(0, 2),
    [records],
  );

  const handleCheckPress = () => {
    if (isLoggedIn) setSheetVisible(true);
    else navigation.navigate('SignUp', { trigger: 'chk' });
  };

  const handlePostTradePress = () => {
    if (isLoggedIn) navigation.navigate('PostTrade');
    else navigation.navigate('SignUp', { trigger: 'save' });
  };

  const handleStart = ({
    stockName, direction, emotions,
  }: {
    stockName: string; direction: TradeDirection; emotions: EmotionType[];
  }) => {
    setSheetVisible(false);
    setTimeout(() => {
      navigation.navigate('CheckChat', {
        stockName,
        direction,
        emotions,
        emotionLabel: emotions.map((e) => EMOTION_LABEL[e]).join(', '),
      });
    }, 300);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerDate}>{getTodayLabel()}</Text>
            <View style={styles.headerGreetRow}>
              <Text style={styles.headerGreet}>
                안녕하세요, {nickname || '반가워요'}님
              </Text>
              <GreetSun size={18} color="#F59E0B" />
            </View>
          </View>
          <ScaleButton
            onPress={() => { triggerNotifOpen(); navigation.navigate('Tabs', { screen: 'My' } as any); }}
            style={styles.settingsBtn}
          >
            <BellIcon size={22} color={Colors.textSecondary} />
          </ScaleButton>
        </View>

        {/* 메인 CTA 그라디언트 카드 */}
        <ScaleButton onPress={handleCheckPress} style={styles.ctaCardWrap}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaCard}
          >
            {/* 배경 글로우 서클 */}
            <View style={styles.ctaGlow} />

            <View style={styles.ctaAiTag}>
              <Sparkle size={12} color="rgba(255,255,255,0.85)" />
              <Text style={styles.ctaAiTagText}>AI 심리 코치</Text>
            </View>
            <Text style={styles.ctaTitle}>지금 매매하고{'\n'}싶어요?</Text>
            <Text style={styles.ctaSubtitle}>결정 전, 1분만 같이 점검해봐요</Text>

            <View style={styles.ctaBtnRow}>
              <View style={styles.ctaPrimaryPill}>
                <Text style={styles.ctaPrimaryPillText}>충동 체크 시작하기</Text>
                <ChevronRight size={14} color={Colors.cta} />
              </View>
              <ScaleButton
                style={styles.ctaSecondaryPill}
                onPress={handlePostTradePress}
              >
                <Text style={styles.ctaSecondaryPillText}>이미 매매했어요 · 기록만 남기기</Text>
              </ScaleButton>
            </View>
          </LinearGradient>
        </ScaleButton>

        {/* 최근 코칭 */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 코칭</Text>
            <ScaleButton onPress={() => navigation.navigate('Tabs', { screen: 'Records' } as any)}>
              <Text style={styles.sectionMore}>전체보기</Text>
            </ScaleButton>
          </View>

          {recentSessions.length > 0 ? (
            <View style={styles.recentList}>
              {recentSessions.map((s) => (
                <RecentCard
                  key={s.id}
                  record={s}
                  onPress={() => navigation.navigate('RecordDetail', { sessionId: s.id })}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyRecent}>
              <Text style={styles.emptyRecentText}>아직 코칭 기록이 없어요</Text>
              <Text style={styles.emptyRecentSub}>첫 충동 체크를 시작해봐요</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      <CheckBottomSheet
        visible={sheetVisible}
        onStart={handleStart}
        onClose={() => setSheetVisible(false)}
      />
    </SafeAreaView>
  );
}

// ── 스타일 ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 28 },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 4,
  },
  headerDate: { fontSize: 12, color: Colors.textMuted },
  headerGreetRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  headerGreet: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  settingsBtn: { padding: 4, marginTop: 4 },

  // CTA 카드
  ctaCardWrap: { borderRadius: 28, overflow: 'hidden' },
  ctaCard: {
    borderRadius: 28,
    padding: 24,
    overflow: 'hidden',
    shadowColor: Colors.cta,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  ctaGlow: {
    position: 'absolute',
    right: -24,
    top: -24,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  ctaAiTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ctaAiTagText: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  ctaTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFF',
    lineHeight: 26 * 1.3,
    marginTop: 12,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
  },
  ctaBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  ctaPrimaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  ctaPrimaryPillText: { fontSize: 13, fontWeight: '600', color: Colors.cta },
  ctaSecondaryPill: {
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  ctaSecondaryPillText: { fontSize: 12, fontWeight: '500', color: '#FFF' },

  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 12 },

  // 최근 코칭
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionMore: { fontSize: 12, color: Colors.textMuted },
  recentList: { gap: 10 },

  // 최근 코칭 카드
  recentCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    gap: 12,
  },
  recentCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recentCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recentCardStock: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  recentCardTime: { fontSize: 11, color: Colors.textMuted },
  recentCardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recentCardVerdict: { fontSize: 13, color: Colors.textSubtle },

  actionBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  actionBuy: { backgroundColor: Colors.buyBg },
  actionSell: { backgroundColor: Colors.sellBg },
  actionBadgeText: { fontSize: 10, fontWeight: '500' },
  actionBuyText: { color: Colors.buy },
  actionSellText: { color: Colors.sell },

  scoreBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  scoreBadgeAmber: { backgroundColor: Colors.impulseBg },
  scoreBadgeOk: { backgroundColor: Colors.okBg },
  scoreBadgeText: { fontSize: 11 },
  scoreBadgeAmberText: { color: Colors.impulse },
  scoreBadgeOkText: { color: Colors.ok },

  // 빈 상태
  emptyRecent: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 4,
  },
  emptyRecentText: { fontSize: 14, color: Colors.textSecondary },
  emptyRecentSub: { fontSize: 12, color: Colors.textMuted },

  bottomPad: { height: 8 },
});
