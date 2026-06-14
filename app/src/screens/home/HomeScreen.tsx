import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Modal, Switch, Alert } from 'react-native';
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
  Sparkle, BellIcon, ChevronRight,
} from '../../components/common/Icons';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
  scheduleWeeklyReport,
  cancelWeeklyReport,
} from '../../lib/notifications';

function GuestDataBanner({ onLogin }: { onLogin: () => void }) {
  return (
    <ScaleButton onPress={onLogin} style={guestBannerStyles.banner}>
      <Text style={guestBannerStyles.text}>로그인하면 기록과 리포트를 저장할 수 있어요</Text>
      <Text style={guestBannerStyles.cta}>로그인하기 →</Text>
    </ScaleButton>
  );
}

const guestBannerStyles = StyleSheet.create({
  banner: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FCD34D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: { fontSize: 12, color: '#92400E', flex: 1 },
  cta: { fontSize: 12, fontFamily: 'SpoqaHanSansNeo-Bold', fontWeight: '600', color: '#B45309', marginLeft: 8 },
});

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
  const notifSettings = useUserStore((s) => s.notifSettings);
  const setNotifSettings = useUserStore((s) => s.setNotifSettings);
  const [showNotif, setShowNotif] = useState(false);

  const handleNotifToggleDaily = async (val: boolean) => {
    if (val) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('알림 권한 필요', '설정 > 오름달에서 알림을 허용해주세요.');
        return;
      }
      await scheduleDailyReminder(9);
    } else {
      await cancelDailyReminder();
    }
    setNotifSettings({ ...notifSettings, dailyEnabled: val });
  };

  const handleNotifToggleWeekly = async (val: boolean) => {
    if (val) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('알림 권한 필요', '설정 > 오름달에서 알림을 허용해주세요.');
        return;
      }
      await scheduleWeeklyReport(2, 9);
    } else {
      await cancelWeeklyReport();
    }
    setNotifSettings({ ...notifSettings, weeklyEnabled: val });
  };

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
      {/* 고정 헤더 */}
      <View style={styles.stickyHeader}>
        {!isLoggedIn && (
          <GuestDataBanner onLogin={() => navigation.navigate('SignUp', { trigger: 'chk' })} />
        )}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerDate}>{getTodayLabel()}</Text>
            <Text style={styles.headerGreet}>
              안녕하세요, {nickname || '반가워요'}님
            </Text>
          </View>
          <ScaleButton
            onPress={() => setShowNotif(true)}
            style={styles.settingsBtn}
          >
            <BellIcon size={22} color={Colors.textSecondary} />
          </ScaleButton>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

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
                <ChevronRight size={12} color="rgba(255,255,255,0.75)" />
              </ScaleButton>
            </View>
          </LinearGradient>
        </ScaleButton>

        {/* 최근 코칭 */}
        {isLoggedIn && (
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
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      <CheckBottomSheet
        visible={sheetVisible}
        onStart={handleStart}
        onClose={() => setSheetVisible(false)}
      />

      <Modal visible={showNotif} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>알림 설정</Text>
            <ScaleButton onPress={() => setShowNotif(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </ScaleButton>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.notifCard}>
              <View style={styles.notifCardHeader}>
                <View style={{ gap: 4 }}>
                  <Text style={styles.notifCardLabel}>매일 리마인더</Text>
                  <Text style={styles.notifCardTime}>매일 오전 9시</Text>
                </View>
                <Switch
                  value={notifSettings.dailyEnabled}
                  onValueChange={handleNotifToggleDaily}
                  trackColor={{ true: Colors.cta }}
                  thumbColor="#FFF"
                />
              </View>
              <Text style={styles.notifCardDesc}>매매 전 체크를 잊지 않도록 매일 알려드려요</Text>
            </View>
            <View style={styles.notifCard}>
              <View style={styles.notifCardHeader}>
                <View style={{ gap: 4 }}>
                  <Text style={styles.notifCardLabel}>주간 리포트</Text>
                  <Text style={styles.notifCardTime}>매주 월요일 오전 9시</Text>
                </View>
                <Switch
                  value={notifSettings.weeklyEnabled}
                  onValueChange={handleNotifToggleWeekly}
                  trackColor={{ true: Colors.cta }}
                  thumbColor="#FFF"
                />
              </View>
              <Text style={styles.notifCardDesc}>지난주 나의 투자 심리 패턴을 알려드려요</Text>
            </View>
            <View style={styles.notifCard}>
              <Text style={styles.notifCardLabel}>코칭 후 결과 추적</Text>
              <Text style={styles.notifCardDesc}>
                코칭 화면에서 "나중에 알려주기"를 선택하면 8시간 후 자동으로 알림을 보내드려요
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ── 스타일 ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  stickyHeader: {
    backgroundColor: Colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
  },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, gap: 28 },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerDate: { fontSize: 12, color: Colors.textMuted },
  headerGreet: { fontSize: 18, fontFamily: 'SpoqaHanSansNeo-Bold', fontWeight: '600', color: Colors.textPrimary, marginTop: 4 },
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
    fontFamily: 'SpoqaHanSansNeo-Bold', fontWeight: '700',
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
  ctaPrimaryPillText: { fontSize: 13, fontFamily: 'SpoqaHanSansNeo-Bold', fontWeight: '600', color: Colors.cta },
  ctaSecondaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  ctaSecondaryPillText: { fontSize: 12, fontFamily: 'SpoqaHanSansNeo-Medium', fontWeight: '500', color: '#FFF' },

  sectionTitle: { fontSize: 14, fontFamily: 'SpoqaHanSansNeo-Bold', fontWeight: '600', color: Colors.textPrimary, marginBottom: 12 },

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
  recentCardStock: { fontSize: 15, fontFamily: 'SpoqaHanSansNeo-Bold', fontWeight: '600', color: Colors.textPrimary },
  recentCardTime: { fontSize: 11, color: Colors.textMuted },
  recentCardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recentCardVerdict: { fontSize: 13, color: Colors.textSubtle },

  actionBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  actionBuy: { backgroundColor: Colors.buyBg },
  actionSell: { backgroundColor: Colors.sellBg },
  actionBadgeText: { fontSize: 10, fontFamily: 'SpoqaHanSansNeo-Medium', fontWeight: '500' },
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

  modalSafe: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingBottom: 16,
  },
  modalTitle: { fontSize: 18, fontFamily: 'SpoqaHanSansNeo-Bold', fontWeight: '600', color: Colors.textPrimary },
  modalClose: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  modalCloseText: { fontSize: 18, color: Colors.textSecondary },
  modalContent: { padding: 20, gap: 12 },
  notifCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 18,
    borderWidth: 0.5, borderColor: Colors.border, gap: 10,
  },
  notifCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifCardLabel: { fontSize: 14, fontFamily: 'SpoqaHanSansNeo-Bold', fontWeight: '600', color: Colors.textPrimary },
  notifCardTime: { fontSize: 12, color: Colors.textSecondary },
  notifCardDesc: { fontSize: 13, color: Colors.textMuted, lineHeight: 13 * 1.6 },
});
