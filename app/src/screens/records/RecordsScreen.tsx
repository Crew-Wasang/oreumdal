import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { MainStackParamList, SessionRecord } from '../../types';
import { useRecordStore } from '../../store/recordStore';
import { useUserStore } from '../../store/userStore';
import ScaleButton from '../../components/common/ScaleButton';

type Nav = NativeStackNavigationProp<MainStackParamList>;
type Tab = 'all' | 'followed' | 'skipped';
type Direction = 'buy' | 'sell';

const TABS: { value: Tab; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'followed', label: '조언 따름' },
  { value: 'skipped', label: '그대로 매매' },
];

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: 'buy', label: '매수' },
  { value: 'sell', label: '매도' },
];

function formatDate(iso: string): string {
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

function RecordCard({ record, onPress }: { record: SessionRecord; onPress: () => void }) {
  const isBuy = record.direction === 'buy';
  const isOk = record.verdict === 'ok';
  const score = record.impulse_score;
  const isReconsider = record.verdict === 'reconsider';

  return (
    <ScaleButton style={styles.card} onPress={onPress}>
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardStock}>{record.stock_name}</Text>
          <View style={[styles.actionBadge, isBuy ? styles.buyBadge : styles.sellBadge]}>
            <Text style={[styles.actionBadgeText, isBuy ? styles.buyText : styles.sellText]}>
              {isBuy ? '매수' : '매도'}
            </Text>
          </View>
        </View>
        <Text style={styles.cardDate}>{formatDate(record.created_at)}</Text>
      </View>
      <View style={styles.cardBottom}>
        <Text style={styles.cardVerdict}>
          {record.verdict === 'ok' ? '지금 매매해도 괜찮아요' :
           record.verdict === 'reconsider' ? '한 번 더 생각해봐요' : '직접 기록'}
        </Text>
        {score !== undefined && (
          <View style={[styles.scoreBadge,
            isOk ? styles.scoreBadgeOk : isReconsider ? styles.scoreBadgeAmber : styles.scoreBadgeNeutral,
          ]}>
            <Text style={[styles.scoreBadgeText,
              isOk ? styles.scoreBadgeOkText : isReconsider ? styles.scoreBadgeAmberText : styles.scoreBadgeNeutralText,
            ]}>
              충동도 {score}%
            </Text>
          </View>
        )}
      </View>
    </ScaleButton>
  );
}

export default function RecordsScreen() {
  const navigation = useNavigation<Nav>();
  const records = useRecordStore((s) => s.records);
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);

  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [selectedDirections, setSelectedDirections] = useState<Direction[]>([]);

  const toggleDirection = (dir: Direction) => {
    setSelectedDirections(prev =>
      prev.includes(dir) ? prev.filter(d => d !== dir) : [...prev, dir]
    );
  };

  const filtered = useMemo(() => {
    let result = records;
    // 조언 따름: AI 판단과 행동이 일치한 케이스 (ok+traded, reconsider+skipped)
    if (tab === 'followed') result = result.filter(r =>
      (r.verdict === 'ok' && r.trade_outcome === 'traded') ||
      (r.verdict === 'reconsider' && r.trade_outcome === 'skipped')
    );
    // 그대로 매매: AI가 말렸는데 매매한 케이스만
    if (tab === 'skipped') result = result.filter(r =>
      r.verdict === 'reconsider' && r.trade_outcome === 'traded'
    );
    if (selectedDirections.length > 0) {
      result = result.filter(r => selectedDirections.includes(r.direction as Direction));
    }
    if (search.trim()) result = result.filter(r => r.stock_name.includes(search.trim()));
    return result;
  }, [records, tab, search, selectedDirections]);

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>매매 기록</Text>
        </View>
        <View style={styles.lockedWrap}>
          <Text style={styles.lockedTitle}>로그인하면 기록을 볼 수 있어요</Text>
          <Text style={styles.lockedDesc}>코칭 기록과 매매 내역이 저장됩니다</Text>
          <ScaleButton style={styles.lockedBtn} onPress={() => navigation.navigate('SignUp', { trigger: 'save' })}>
            <Text style={styles.lockedBtnText}>로그인하기</Text>
          </ScaleButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>매매 기록</Text>
        <Text style={styles.subtitle}>총 {records.length}회의 코칭 기록</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="종목명 검색"
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      <View style={styles.tabRow}>
        {TABS.map(({ value, label }) => (
          <ScaleButton
            key={value}
            style={[styles.tabPill, tab === value && styles.tabPillActive]}
            onPress={() => setTab(value)}
          >
            <Text style={[styles.tabPillText, tab === value && styles.tabPillTextActive]}>
              {label}
            </Text>
          </ScaleButton>
        ))}
      </View>

      <View style={styles.directionRow}>
        {DIRECTIONS.map(({ value, label }) => {
          const active = selectedDirections.includes(value);
          const isBuy = value === 'buy';
          return (
            <ScaleButton
              key={value}
              style={[
                styles.directionPill,
                active && (isBuy ? styles.directionPillBuy : styles.directionPillSell),
              ]}
              onPress={() => toggleDirection(value)}
            >
              <Text style={[
                styles.directionPillText,
                active && (isBuy ? styles.directionPillBuyText : styles.directionPillSellText),
              ]}>
                {label}
              </Text>
            </ScaleButton>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>조건에 맞는 기록이 없어요</Text>
          </View>
        ) : (
          filtered.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              onPress={() => navigation.navigate('RecordDetail', { sessionId: record.id })}
            />
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  title: { fontSize: 22, fontFamily: 'A2Z-Bold', fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  searchWrap: { paddingHorizontal: 20, paddingVertical: 10 },
  searchInput: {
    backgroundColor: Colors.surface, borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: Colors.textPrimary,
    borderWidth: 0.5, borderColor: Colors.border,
  },

  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 8 },

  directionRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 12 },
  directionPill: {
    paddingVertical: 5, paddingHorizontal: 12,
    borderRadius: 20, backgroundColor: Colors.surface,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  directionPillBuy: { backgroundColor: Colors.buyBg, borderColor: Colors.buy },
  directionPillSell: { backgroundColor: Colors.sellBg, borderColor: Colors.sell },
  directionPillText: { fontSize: 12, fontFamily: 'A2Z-Medium', fontWeight: '500', color: Colors.textSecondary },
  directionPillBuyText: { color: Colors.buy },
  directionPillSellText: { color: Colors.sell },
  tabPill: {
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 20, backgroundColor: Colors.surface,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  tabPillActive: { backgroundColor: Colors.textPrimary, borderColor: Colors.textPrimary },
  tabPillText: { fontSize: 12, fontFamily: 'A2Z-Bold', fontWeight: '600', color: Colors.textSecondary },
  tabPillTextActive: { color: '#FFF' },

  list: { paddingHorizontal: 20, gap: 12 },
  emptyWrap: { paddingTop: 60, alignItems: 'center' },
  emptyText: { fontSize: 15, color: Colors.textMuted },

  card: {
    padding: 16, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 0.5, borderColor: Colors.border, gap: 10,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardStock: { fontSize: 15, fontFamily: 'A2Z-Bold', fontWeight: '600', color: Colors.textPrimary },
  cardDate: { fontSize: 11, color: Colors.textMuted },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardVerdict: { fontSize: 13, color: Colors.textSubtle },

  actionBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  buyBadge: { backgroundColor: Colors.buyBg },
  sellBadge: { backgroundColor: Colors.sellBg },
  actionBadgeText: { fontSize: 10, fontFamily: 'A2Z-Medium', fontWeight: '500' },
  buyText: { color: Colors.buy },
  sellText: { color: Colors.sell },

  scoreBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  scoreBadgeAmber: { backgroundColor: Colors.impulseBg },
  scoreBadgeOk: { backgroundColor: Colors.okBg },
  scoreBadgeNeutral: { backgroundColor: Colors.surface },
  scoreBadgeText: { fontSize: 11 },
  scoreBadgeAmberText: { color: Colors.impulse },
  scoreBadgeOkText: { color: Colors.ok },
  scoreBadgeNeutralText: { color: Colors.textMuted },

  lockedWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  lockedTitle: { fontSize: 17, fontFamily: 'A2Z-Bold', fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  lockedDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  lockedBtn: {
    marginTop: 8, backgroundColor: Colors.cta, borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 40,
  },
  lockedBtnText: { color: '#FFF', fontSize: 15, fontFamily: 'A2Z-Bold', fontWeight: '600' },
});
