import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MainStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import ScaleButton from '../../components/common/ScaleButton';
import { useUserStore } from '../../store/userStore';
import { Sparkle, ChevronLeft } from '../../components/common/Icons';

type Nav = NativeStackNavigationProp<MainStackParamList>;

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

export default function PersonalityProfileScreen() {
  const navigation = useNavigation<Nav>();
  const personalityType = useUserStore((s) => s.personalityType);

  const typeKey = (personalityType as TypeKey) ?? null;
  const data = typeKey ? PERSONALITY_DATA[typeKey] : null;

  const handleRetake = () => {
    (navigation as any).navigate('Onboarding', {
      screen: 'PersonalityTest',
      params: { fromRedo: true },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <ScaleButton onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={26} color={Colors.textPrimary} />
        </ScaleButton>
        <Text style={styles.headerTitle}>내 투자 성향</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {data ? (
          <>
            <View style={styles.tagRow}>
              <Sparkle size={13} color={Colors.cta} />
              <Text style={styles.tag}>진단 결과</Text>
            </View>

            <Text style={styles.title}>
              당신은 <Text style={styles.titleAccent}>{data.label}</Text>{'\n'}투자자에 가까워요
            </Text>

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

            <View style={styles.tipCard}>
              <Sparkle size={14} color={Colors.cta} />
              <Text style={styles.tipText}>
                <Text style={styles.tipBold}>코치의 조언 · </Text>
                {data.tip}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>아직 성향 진단이 없어요</Text>
            <Text style={styles.emptyDesc}>
              투자 성향 테스트를 완료하면{'\n'}나의 투자 심리 유형을 알 수 있어요
            </Text>
          </View>
        )}

        <ScaleButton style={styles.retakeBtn} onPress={handleRetake}>
          <Text style={styles.retakeBtnText}>
            {data ? '투자 성향 테스트 다시하기' : '투자 성향 테스트 시작하기'}
          </Text>
        </ScaleButton>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 48,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },

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

  title: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary, lineHeight: 24 * 1.4 },
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
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: `${Colors.cta}22`,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 22, color: Colors.cta },
  mainCardLabel: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  mainCardRisk: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  mainCardSummary: { fontSize: 14, color: Colors.textSubtle, lineHeight: 14 * 1.7 },

  cardRow: { flexDirection: 'row', gap: 10 },
  halfCard: { flex: 1, borderRadius: 16, padding: 16, gap: 10, borderWidth: 0.5 },
  strengthCard: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  weaknessCard: { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' },
  halfCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  strengthDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#22C55E' },
  strengthLabel: { fontSize: 14, fontWeight: '700', color: '#15803D' },
  weaknessDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#EF4444' },
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

  emptyWrap: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  emptyDesc: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 13 * 1.7 },

  retakeBtn: { alignSelf: 'center', paddingVertical: 10, marginTop: 8 },
  retakeBtnText: { fontSize: 13, color: Colors.textSecondary, textDecorationLine: 'underline' },
});
