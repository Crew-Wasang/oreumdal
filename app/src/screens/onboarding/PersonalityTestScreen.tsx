import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import ScaleButton from '../../components/common/ScaleButton';
import { ChevronLeft } from '../../components/common/Icons';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'PersonalityTest'>;
type Route = RouteProp<OnboardingStackParamList, 'PersonalityTest'>;

const QUESTIONS = [
  {
    id: 1,
    question: '손실이 나고 있는 종목을 보면\n가장 먼저 드는 생각은?',
    options: [
      { label: '왜 떨어지는지 원인부터 찾는다', type: 'A' },
      { label: '일단 팔고 손실을 줄인다', type: 'B' },
      { label: '더 사서 평단을 낮춘다', type: 'C' },
      { label: '그냥 둔다. 언젠간 오른다', type: 'D' },
    ],
  },
  {
    id: 2,
    question: '매수 결정을 내리기 전,\n나는 보통 어떻게 하나요?',
    options: [
      { label: '재무제표, 뉴스, 차트 등 꼼꼼히 분석한다', type: 'A' },
      { label: '흐름이 좋다 싶으면 바로 산다', type: 'B' },
      { label: '주변이나 커뮤니티 의견을 참고한다', type: 'C' },
      { label: '오래 지켜보다 타이밍을 놓치기도 한다', type: 'D' },
    ],
  },
  {
    id: 3,
    question: '수익이 나고 있을 때\n내 행동 패턴은?',
    options: [
      { label: '목표가에 도달하면 계획대로 매도한다', type: 'A' },
      { label: '더 오를 것 같아 계속 보유한다', type: 'C' },
      { label: '빠르게 수익을 확정 짓는다', type: 'B' },
      { label: '팔까 말까 고민하다 결국 못 판다', type: 'D' },
    ],
  },
  {
    id: 4,
    question: '투자 결정을 후회하는 순간은\n주로 언제인가요?',
    options: [
      { label: '충분히 분석하지 않고 샀을 때', type: 'A' },
      { label: '감정적으로 급하게 팔았을 때', type: 'D' },
      { label: '남의 말만 믿고 결정했을 때', type: 'C' },
      { label: '원칙을 어겼을 때', type: 'A' },
    ],
  },
  {
    id: 5,
    question: '시장이 급락할 때\n나는?',
    options: [
      { label: '미리 세운 대응 계획을 실행한다', type: 'A' },
      { label: '공황 상태가 되어 전부 팔고 싶다', type: 'B' },
      { label: '저가 매수 기회라고 생각한다', type: 'C' },
      { label: '아무것도 못 하고 상황을 지켜본다', type: 'D' },
    ],
  },
];

const PERSONALITY_MAP: Record<string, string> = {
  A: 'analytical', B: 'reactive', C: 'optimistic', D: 'hesitant',
};

function calcPersonality(answers: string[]): string {
  const count: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  answers.forEach(a => { if (a in count) count[a]++; });
  const dominant = Object.entries(count).sort((x, y) => y[1] - x[1])[0][0];
  return PERSONALITY_MAP[dominant];
}

export default function PersonalityTestScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const fromRedo = route.params?.fromRedo;

  useEffect(() => {
    if (fromRedo) navigation.setOptions({ gestureEnabled: false });
  }, []);

  const question = QUESTIONS[current];
  const isLast = current === QUESTIONS.length - 1;
  const progress = (current + 1) / QUESTIONS.length;

  const handleSelect = (type: string, idx: number) => {
    setSelectedIdx(idx);
    setTimeout(() => {
      const newAnswers = [...answers, idx];
      if (isLast) {
        const types = newAnswers.map((optIdx, qIdx) => QUESTIONS[qIdx].options[optIdx].type);
        navigation.navigate('PersonalityResult', {
          personalityType: calcPersonality(types),
          fromRedo: route.params?.fromRedo,
        });
      } else {
        setAnswers(newAnswers);
        setCurrent(prev => prev + 1);
        setSelectedIdx(null);
      }
    }, 180);
  };

  const handleBack = () => {
    if (current === 0) {
      if (fromRedo) {
        (navigation as any).navigate('Main');
      } else {
        navigation.goBack();
      }
    } else {
      const prevIdx = answers[current - 1];
      setAnswers(prev => prev.slice(0, -1));
      setCurrent(prev => prev - 1);
      setSelectedIdx(prevIdx ?? null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <ScaleButton onPress={handleBack} style={styles.backBtn}>
          <ChevronLeft size={26} color={Colors.textPrimary} />
        </ScaleButton>
        <Text style={styles.headerTitle}>{current + 1} / {QUESTIONS.length}</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepLabel}>투자 성향 진단</Text>
        <Text style={styles.question}>{question.question}</Text>

        <View style={styles.options}>
          {question.options.map((opt, i) => {
            const active = selectedIdx === i;
            return (
              <ScaleButton
                key={opt.label}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => handleSelect(opt.type, i)}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>
                  {opt.label}
                </Text>
              </ScaleButton>
            );
          })}
        </View>
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
  headerTitle: { fontSize: 15, fontFamily: 'A2Z-Bold', fontWeight: '600', color: Colors.textPrimary },
  progressBg: {
    height: 3,
    marginHorizontal: 20,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.cta, borderRadius: 2 },
  body: { padding: 24, paddingTop: 28, gap: 28, paddingBottom: 40 },
  stepLabel: { fontSize: 12, fontFamily: 'A2Z-Medium', fontWeight: '500', color: Colors.cta },
  question: {
    fontSize: 22,
    fontFamily: 'A2Z-Bold', fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 22 * 1.4,
  },
  options: { gap: 10 },
  option: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  optionActive: {
    borderWidth: 1.5,
    borderColor: Colors.cta,
    backgroundColor: Colors.ctaLight,
  },
  optionText: { fontSize: 14, color: Colors.textLight, lineHeight: 14 * 1.5 },
  optionTextActive: { color: Colors.ctaLightText, fontFamily: 'A2Z-Bold', fontWeight: '600' },
});
