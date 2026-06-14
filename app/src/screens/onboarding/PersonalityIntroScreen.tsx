import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import ScaleButton from '../../components/common/ScaleButton';
import { Sparkle } from '../../components/common/Icons';

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
          <View style={styles.tagRow}>
            <Sparkle size={13} color={Colors.cta} />
            <Text style={styles.tag}>투자 성향 진단</Text>
          </View>
          <Text style={styles.title}>내 투자 심리{'\n'}패턴을 먼저 파악해요</Text>
          <Text style={styles.desc}>
            매매 결정 순간, 나도 모르게 감정이 개입하고 있나요?{'\n'}
            5가지 질문으로 나의 투자 성향을 확인하고{'\n'}
            더 정확한 AI 코칭을 시작하세요.
          </Text>
        </View>

        <View style={styles.points}>
          {POINTS.map((p, i) => (
            <View key={p.label} style={[styles.pointRow, i < POINTS.length - 1 && styles.pointRowBorder]}>
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
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 8,
    justifyContent: 'space-between',
  },
  top: { gap: 16, paddingTop: 24 },
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
  tag: {
    fontSize: 12,
    fontFamily: 'SpoqaHanSansNeo-Medium', fontWeight: '500',
    color: Colors.cta,
  },
  title: {
    fontSize: 26,
    fontFamily: 'SpoqaHanSansNeo-Bold', fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 26 * 1.4,
  },
  desc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 14 * 1.7,
  },
  points: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  pointRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 16 },
  pointRowBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.cta,
    marginTop: 6,
    flexShrink: 0,
  },
  pointText: { gap: 2, flex: 1 },
  pointLabel: { fontSize: 15, fontFamily: 'SpoqaHanSansNeo-Bold', fontWeight: '600', color: Colors.textPrimary },
  pointDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 13 * 1.6 },
  cta: {
    backgroundColor: Colors.cta,
    borderRadius: 16,
    padding: 17,
    alignItems: 'center',
  },
  ctaText: { fontSize: 15, fontFamily: 'SpoqaHanSansNeo-Bold', fontWeight: '600', color: '#FFF' },
});
