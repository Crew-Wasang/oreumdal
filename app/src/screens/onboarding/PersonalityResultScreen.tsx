import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import ScaleButton from '../../components/common/ScaleButton';
import { useUserStore } from '../../store/userStore';

type Nav = NativeStackNavigationProp<OnboardingStackParamList>;
type Route = RouteProp<OnboardingStackParamList, 'PersonalityResult'>;

const PERSONALITY_DATA: Record<string, {
  label: string; summary: string; strength: string; weakness: string; tip: string;
}> = {
  analytical: {
    label: '신중한 분석형',
    summary: '데이터와 논리를 중시하며 결정을 내리기 전에 충분히 검토합니다.',
    strength: '충동적 매매가 적고 근거 있는 판단을 내립니다.',
    weakness: '과도한 분석으로 좋은 타이밍을 놓치거나 손절을 망설이는 경향이 있습니다.',
    tip: '매매 전 체크리스트를 짧게 유지하세요. 완벽한 분석보다 빠른 판단이 필요할 때도 있습니다.',
  },
  reactive: {
    label: '감정적 반응형',
    summary: '시장 변화에 민감하게 반응하며 감정이 판단에 큰 영향을 줍니다.',
    strength: '위험 신호를 빠르게 감지하고 빠른 손절이 가능합니다.',
    weakness: '공포와 탐욕에 따라 결정이 흔들리고 일관성이 부족할 수 있습니다.',
    tip: '매매 전 오름달에 먼저 들러보세요. 감정이 판단을 앞서는 순간을 알아채는 것이 시작입니다.',
  },
  optimistic: {
    label: '낙관적 직관형',
    summary: '직감과 흐름을 믿으며 빠르게 기회를 포착하려 합니다.',
    strength: '트렌드를 빠르게 잡고 기회에 적극적으로 반응합니다.',
    weakness: '근거 없는 낙관으로 손실을 키우거나 묻어두는 경향이 있습니다.',
    tip: '"왜 지금인가"를 한 번 더 짚어보세요. 직감도 근거가 있을 때 더 강해집니다.',
  },
  hesitant: {
    label: '우유부단 보류형',
    summary: '신중하지만 결정을 미루는 경향이 강해 기회와 손절 모두 놓칠 수 있습니다.',
    strength: '충동적 결정이 적고 큰 실수를 잘 하지 않습니다.',
    weakness: '결정을 미루다 더 큰 손실이 나거나 좋은 기회를 놓칩니다.',
    tip: '스스로 매매 기준을 명확히 세워두세요. 기준이 있으면 결정이 쉬워집니다.',
  },
};

const PERSONALITY_ORDER = ['analytical', 'reactive', 'optimistic', 'hesitant'];

function AllTypesSection({ myType }: { myType: string }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => {
    setExpanded(prev => prev === key ? null : key);
  };

  return (
    <View style={styles.allTypes}>
      <Text style={styles.allTypesTitle}>모든 투자 성향 보기</Text>
      {PERSONALITY_ORDER.map((key) => {
        const d = PERSONALITY_DATA[key];
        const isMe = key === myType;
        const isOpen = expanded === key;

        return (
          <ScaleButton
            key={key}
            style={[styles.typeRow, isMe && styles.typeRowMe]}
            onPress={() => toggle(key)}
          >
            <View style={styles.typeRowHeader}>
              <View style={styles.typeRowLeft}>
                {isMe && <View style={styles.meBadge}><Text style={styles.meBadgeText}>나</Text></View>}
                <Text style={[styles.typeRowLabel, isMe && styles.typeRowLabelMe]}>{d.label}</Text>
              </View>
              <Text style={styles.typeRowChevron}>{isOpen ? '∧' : '∨'}</Text>
            </View>
            {isOpen && (
              <View style={styles.typeRowBody}>
                <Text style={styles.typeRowSummary}>{d.summary}</Text>
                <View style={styles.typeRowDetails}>
                  <Text style={styles.typeRowDetailLabel}>강점</Text>
                  <Text style={styles.typeRowDetailText}>{d.strength}</Text>
                  <Text style={styles.typeRowDetailLabel}>주의할 점</Text>
                  <Text style={styles.typeRowDetailText}>{d.weakness}</Text>
                </View>
              </View>
            )}
          </ScaleButton>
        );
      })}
    </View>
  );
}

export default function PersonalityResultScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const setPersonalityType = useUserStore((s) => s.setPersonalityType);
  const myType = route.params.personalityType;
  const data = PERSONALITY_DATA[myType] ?? PERSONALITY_DATA.analytical;

  const handleNext = () => {
    setPersonalityType(myType);
    navigation.navigate('InvestmentPrinciples');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>성향 분석 결과</Text>
        <Text style={styles.typeLabel}>{data.label}</Text>
        <Text style={styles.summary}>{data.summary}</Text>

        <View style={styles.cards}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>강점</Text>
            <Text style={styles.cardBody}>{data.strength}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>주의할 점</Text>
            <Text style={styles.cardBody}>{data.weakness}</Text>
          </View>
          <View style={[styles.card, styles.tipCard]}>
            <Text style={[styles.cardLabel, { color: Colors.accent }]}>오름달의 제안</Text>
            <Text style={styles.cardBody}>{data.tip}</Text>
          </View>
        </View>

        <AllTypesSection myType={myType} />

        <ScaleButton style={styles.btn} onPress={handleNext}>
          <Text style={styles.btnText}>다음</Text>
        </ScaleButton>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingBottom: 48, gap: 16 },

  stepLabel: {
    fontSize: 11, fontWeight: '500', color: Colors.textMuted,
    letterSpacing: 1.5, textTransform: 'uppercase', paddingTop: 8,
  },
  typeLabel: {
    fontSize: 24, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3,
  },
  summary: {
    fontSize: 16, color: Colors.textPrimary, lineHeight: 16 * 1.7, paddingBottom: 4,
  },

  cards: { gap: 10 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 20, gap: 8,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  tipCard: { borderColor: Colors.accent },
  cardLabel: {
    fontSize: 11, fontWeight: '600', color: Colors.textPrimary,
    letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.45,
  },
  cardBody: { fontSize: 15, color: Colors.textPrimary, lineHeight: 15 * 1.7 },

  allTypes: { gap: 8, marginTop: 8 },
  allTypesTitle: {
    fontSize: 11, fontWeight: '600', color: Colors.textMuted,
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4,
  },

  typeRow: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 0.5, borderColor: Colors.border,
    padding: 16, gap: 12,
  },
  typeRowMe: {
    backgroundColor: '#EEF4FB',
    borderWidth: 1.5, borderColor: Colors.cta,
  },
  typeRowHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  typeRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  meBadge: {
    backgroundColor: Colors.cta, borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  meBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  typeRowLabel: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  typeRowLabelMe: { fontWeight: '700', color: Colors.cta },
  typeRowChevron: { fontSize: 12, color: Colors.textMuted },

  typeRowBody: { gap: 10 },
  typeRowSummary: { fontSize: 14, color: Colors.textSecondary, lineHeight: 14 * 1.7 },
  typeRowDetails: { gap: 6 },
  typeRowDetailLabel: {
    fontSize: 11, fontWeight: '600', color: Colors.textMuted,
    letterSpacing: 1, textTransform: 'uppercase',
  },
  typeRowDetailText: { fontSize: 13, color: Colors.textPrimary, lineHeight: 13 * 1.7 },

  btn: {
    backgroundColor: Colors.cta, borderRadius: 10,
    padding: 17, alignItems: 'center', marginTop: 8,
  },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
