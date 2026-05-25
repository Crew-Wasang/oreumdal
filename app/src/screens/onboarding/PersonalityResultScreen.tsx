import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import ScaleButton from '../../components/common/ScaleButton';
import { useUserStore } from '../../store/userStore';
import { Sparkle, ChevronRight } from '../../components/common/Icons';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;
type Route = RouteProp<OnboardingStackParamList, 'PersonalityResult'>;

type TypeKey = 'analytical' | 'reactive' | 'optimistic' | 'hesitant';
const PERSONALITY_DATA: Record<TypeKey, {
  label: string; summary: string; strength: string; weakness: string; tip: string; risk: string;
}> = {
  analytical: {
    label: '신중한 분석형',
    summary: '데이터와 논리를 중시하며 결정을 내리기 전에 충분히 검토합니다.',
    strength: '충동적 매매가 적고 근거 있는 판단을 내립니다.',
    weakness: '과도한 분석으로 좋은 타이밍을 놓치거나 손절을 망설이는 경향이 있습니다.',
    tip: '매매 전 체크리스트를 짧게 유지하세요. 완벽한 분석보다 빠른 판단이 필요할 때도 있습니다.',
    risk: '낮음',
  },
  reactive: {
    label: '감정적 반응형',
    summary: '시장 변화에 민감하게 반응하며 감정이 판단에 큰 영향을 줍니다.',
    strength: '위험 신호를 빠르게 감지하고 빠른 손절이 가능합니다.',
    weakness: '공포와 탐욕에 따라 결정이 흔들리고 일관성이 부족할 수 있습니다.',
    tip: '매매 전 오름달에 먼저 들러보세요. 감정이 판단을 앞서는 순간을 알아채는 것이 시작입니다.',
    risk: '높음',
  },
  optimistic: {
    label: '낙관적 직관형',
    summary: '직감과 흐름을 믿으며 빠르게 기회를 포착하려 합니다.',
    strength: '트렌드를 빠르게 잡고 기회에 적극적으로 반응합니다.',
    weakness: '근거 없는 낙관으로 손실을 키우거나 묻어두는 경향이 있습니다.',
    tip: '"왜 지금인가"를 한 번 더 짚어보세요. 직감도 근거가 있을 때 더 강해집니다.',
    risk: '중간',
  },
  hesitant: {
    label: '우유부단 보류형',
    summary: '신중하지만 결정을 미루는 경향이 강해 기회와 손절 모두 놓칠 수 있습니다.',
    strength: '충동적 결정이 적고 큰 실수를 잘 하지 않습니다.',
    weakness: '결정을 미루다 더 큰 손실이 나거나 좋은 기회를 놓칩니다.',
    tip: '스스로 매매 기준을 명확히 세워두세요. 기준이 있으면 결정이 쉬워집니다.',
    risk: '중간',
  },
};

const TYPE_ORDER: TypeKey[] = ['analytical', 'reactive', 'optimistic', 'hesitant'];

export default function PersonalityResultScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const setPersonalityType = useUserStore((s) => s.setPersonalityType);
  const [showAll, setShowAll] = useState(false);

  const myType = (route.params.personalityType as TypeKey) ?? 'analytical';
  const data = PERSONALITY_DATA[myType];

  const handleNext = () => {
    setPersonalityType(myType);
    navigation.navigate('InvestmentPrinciples');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tagRow}>
          <Sparkle size={13} color={Colors.cta} />
          <Text style={styles.tag}>진단 결과</Text>
        </View>

        <Text style={styles.title}>
          당신은 <Text style={styles.titleAccent}>{data.label}</Text>{'\n'}투자자에 가까워요
        </Text>

        {/* 메인 결과 카드 */}
        <LinearGradient
          colors={[Colors.ctaLight, '#F5F3FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainCard}
        >
          <View style={styles.mainCardTop}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>◐</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mainCardLabel}>{data.label}</Text>
              <Text style={styles.mainCardRisk}>충동 위험도 · {data.risk}</Text>
            </View>
          </View>
          <Text style={styles.mainCardSummary}>{data.summary}</Text>
        </LinearGradient>

        {/* 강점 / 주의할 점 */}
        <View style={styles.cardRow}>
          <View style={[styles.halfCard, styles.strengthCard]}>
            <View style={styles.halfCardHeader}>
              <View style={styles.strengthDot} />
              <Text style={styles.strengthLabel}>강점</Text>
            </View>
            <Text style={styles.halfCardBody}>{data.strength}</Text>
          </View>
          <View style={[styles.halfCard, styles.weaknessCard]}>
            <View style={styles.halfCardHeader}>
              <View style={styles.weaknessDot} />
              <Text style={styles.weaknessLabel}>주의할 점</Text>
            </View>
            <Text style={styles.halfCardBody}>{data.weakness}</Text>
          </View>
        </View>

        {/* 코치 조언 */}
        <View style={styles.tipCard}>
          <Sparkle size={14} color={Colors.cta} />
          <Text style={styles.tipText}>
            <Text style={styles.tipBold}>코치의 조언 · </Text>
            {data.tip}
          </Text>
        </View>

        {/* 모든 유형 보기 */}
        <ScaleButton
          style={styles.showAllBtn}
          onPress={() => setShowAll(v => !v)}
        >
          <Text style={styles.showAllText}>모든 투자 유형 보기</Text>
          <Text style={styles.showAllChevron}>{showAll ? '∧' : '∨'}</Text>
        </ScaleButton>

        {showAll && (
          <View style={styles.allList}>
            {TYPE_ORDER.map((key) => {
              const t = PERSONALITY_DATA[key];
              const isMe = key === myType;
              return (
                <View key={key} style={[styles.typeRow, isMe && styles.typeRowMe]}>
                  <View style={styles.typeRowHeader}>
                    <Text style={[styles.typeRowLabel, isMe && styles.typeRowLabelMe]}>
                      {t.label}
                    </Text>
                    {isMe && (
                      <View style={styles.meBadge}>
                        <Text style={styles.meBadgeText}>나의 유형</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.typeRowSummary}>{t.summary}</Text>
                </View>
              );
            })}
          </View>
        )}

        <ScaleButton style={styles.cta} onPress={handleNext}>
          <Text style={styles.ctaText}>오름달 시작하기</Text>
        </ScaleButton>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingTop: 12, paddingBottom: 48, gap: 14 },

  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.ctaLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tag: { fontSize: 12, fontWeight: '500', color: Colors.cta },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 24 * 1.4,
  },
  titleAccent: { color: Colors.cta },

  mainCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 0.5,
    borderColor: Colors.ctaBorder,
    gap: 14,
  },
  mainCardTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: `${Colors.cta}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, color: Colors.cta },
  mainCardLabel: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  mainCardRisk: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  mainCardSummary: { fontSize: 14, color: Colors.textSubtle, lineHeight: 14 * 1.7 },

  cardRow: { flexDirection: 'row', gap: 10 },
  halfCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 0.5,
  },
  strengthCard: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  weaknessCard: { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' },
  halfCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  strengthDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center' },
  strengthLabel: { fontSize: 14, fontWeight: '700', color: '#15803D' },
  weaknessDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
  weaknessLabel: { fontSize: 14, fontWeight: '700', color: '#B91C1C' },
  halfCardBody: { fontSize: 12, color: Colors.textSubtle, lineHeight: 12 * 1.7 },

  tipCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: Colors.ctaLight,
    borderRadius: 16,
    padding: 14,
    borderWidth: 0.5,
    borderColor: Colors.ctaBorder,
  },
  tipText: { flex: 1, fontSize: 13, color: Colors.textSubtle, lineHeight: 13 * 1.7 },
  tipBold: { fontWeight: '700', color: Colors.cta },

  showAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  showAllText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  showAllChevron: { fontSize: 12, color: Colors.textMuted },

  allList: { gap: 8 },
  typeRow: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 6,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  typeRowMe: {
    backgroundColor: Colors.ctaLight,
    borderColor: Colors.ctaBorder,
    borderWidth: 1,
  },
  typeRowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeRowLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  typeRowLabelMe: { color: Colors.cta },
  meBadge: {
    backgroundColor: Colors.cta,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  meBadgeText: { fontSize: 10, fontWeight: '600', color: '#FFF' },
  typeRowSummary: { fontSize: 12, color: Colors.textSecondary, lineHeight: 12 * 1.6 },

  cta: {
    backgroundColor: Colors.cta,
    borderRadius: 16,
    padding: 17,
    alignItems: 'center',
    marginTop: 4,
  },
  ctaText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
});
