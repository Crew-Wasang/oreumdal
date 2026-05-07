import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import ScaleButton from '../../components/common/ScaleButton';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'PersonalityIntro'>;

const POINTS = [
  { label: '5가지 질문', desc: '실제 투자 상황 기반의 짧은 질문' },
  { label: '나의 성향 파악', desc: '감정적 결정을 유발하는 내 패턴 확인' },
  { label: 'AI 코칭 맞춤화', desc: '성향에 맞는 심리 코칭을 받을 수 있어요' },
];

export default function PersonalityIntroScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.top}>
          <Text style={styles.tag}>투자 성향 테스트</Text>
          <Text style={styles.title}>내 투자 심리{'\n'}패턴을 먼저 파악해요</Text>
          <Text style={styles.desc}>
            매매 결정 순간, 나도 모르게 감정이 개입하고 있나요?{'\n'}
            5가지 질문으로 나의 투자 성향을 확인하고{'\n'}
            더 정확한 AI 코칭을 시작하세요.
          </Text>
        </View>

        <View style={styles.points}>
          {POINTS.map((p) => (
            <View key={p.label} style={styles.pointRow}>
              <View style={styles.dot} />
              <View style={styles.pointText}>
                <Text style={styles.pointLabel}>{p.label}</Text>
                <Text style={styles.pointDesc}>{p.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <ScaleButton style={styles.cta} onPress={() => navigation.navigate('PersonalityTest')}>
          <Text style={styles.ctaText}>테스트 시작하기</Text>
        </ScaleButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: {
    flex: 1,
    padding: 28,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  top: { gap: 16, paddingTop: 24 },
  tag: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 28 * 1.4,
    letterSpacing: -0.5,
  },
  desc: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 15 * 1.7,
  },
  points: {
    gap: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  pointRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    marginTop: 5,
  },
  pointText: { gap: 2, flex: 1 },
  pointLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  pointDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 13 * 1.6 },
  cta: {
    backgroundColor: Colors.cta,
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
  },
  ctaText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});
