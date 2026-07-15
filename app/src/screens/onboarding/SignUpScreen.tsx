import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
  Modal, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';
import { MainStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import { useUserStore } from '../../store/userStore';
import { useRecordStore } from '../../store/recordStore';
import ScaleButton from '../../components/common/ScaleButton';
import { OremdalLogo, Sparkle } from '../../components/common/Icons';

type Nav = NativeStackNavigationProp<MainStackParamList, 'SignUp'>;
type Provider = 'google' | 'kakao' | 'apple';
type Step = 'social' | 'profile';
type DocKey = 'terms' | 'privacy';

const DOC_CONTENT: Record<DocKey, { title: string; sections: { heading: string; body: string }[] }> = {
  terms: {
    title: '이용약관',
    sections: [
      { heading: '제1조 (목적)', body: '본 약관은 오름달(이하 "회사")이 제공하는 AI 투자 심리 코칭 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.' },
      { heading: '제2조 (서비스의 성격)', body: '오름달은 매매 의사결정의 심리적 패턴을 진단·코칭하는 서비스로, 투자 자문이나 매수·매도 권유를 제공하지 않습니다. 모든 매매 판단과 결과 책임은 회원에게 있습니다.' },
      { heading: '제3조 (회원가입)', body: '회원은 카카오·Apple·Google 계정을 통해 가입할 수 있으며, 가입 시 본 약관에 동의한 것으로 간주됩니다.' },
      { heading: '제4조 (계정의 관리)', body: '회원은 자신의 계정 정보를 안전하게 관리할 의무가 있으며, 계정이 도용되거나 제3자에 의해 사용된 경우 즉시 회사에 통지해야 합니다.' },
      { heading: '제5조 (서비스 이용의 제한)', body: '회사는 회원이 약관을 위반하거나 서비스의 정상적인 운영을 방해한 경우 사전 통지 없이 이용을 제한할 수 있습니다.' },
      { heading: '제6조 (책임의 한계)', body: '회사는 회원의 매매 결과로 발생한 손익에 대해 어떠한 책임도 지지 않습니다. 서비스가 제공하는 코칭 내용은 참고 자료이며, 투자 결정은 회원의 단독 판단에 따릅니다.' },
      { heading: '제7조 (약관의 변경)', body: '회사는 필요 시 약관을 변경할 수 있으며, 변경 시 최소 7일 전 서비스 내 공지를 통해 안내합니다.' },
    ],
  },
  privacy: {
    title: '개인정보 처리방침',
    sections: [
      { heading: '1. 수집하는 개인정보 항목', body: '이메일 주소, 닉네임, 서비스 이용 기록(매매 충동 체크 응답, 감정 기록, 매매 기록).' },
      { heading: '2. 개인정보의 수집·이용 목적', body: '회원 식별 및 로그인, 맞춤형 심리 코칭 제공, 개인화된 리포트 생성, 서비스 개선을 위한 통계 분석.' },
      { heading: '3. 개인정보의 보관 기간', body: '회원 탈퇴 시까지 보관하며, 탈퇴 후 30일 내 모든 개인정보를 파기합니다. 다만 관련 법령에 따라 보존 의무가 있는 경우에는 해당 기간 동안 보관합니다.' },
      { heading: '4. 개인정보의 제3자 제공', body: '회사는 회원의 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 따른 요청이 있을 경우에는 예외로 합니다.' },
      { heading: '5. 개인정보의 처리 위탁', body: '원활한 서비스 제공을 위해 클라우드 인프라(AWS), AI 분석(OpenAI)에 일부 데이터 처리를 위탁하며, 위탁 시 개인정보 보호 의무를 명확히 합니다.' },
      { heading: '6. 회원의 권리', body: '회원은 언제든지 개인정보 열람·정정·삭제·처리정지를 요청할 수 있으며, 마이페이지 또는 고객센터(crewwasang@gmail.com)를 통해 요청할 수 있습니다.' },
      { heading: '7. 개인정보 보호책임자', body: '성명: 오름달팀 / 연락처: crewwasang@gmail.com' },
    ],
  },
};

function LegalDocModal({ docKey, onClose }: { docKey: DocKey; onClose: () => void }) {
  const doc = DOC_CONTENT[docKey];
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={legalStyles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={legalStyles.sheet}>
        <View style={legalStyles.sheetHeader}>
          <Text style={legalStyles.sheetTitle}>{doc.title}</Text>
          <ScaleButton onPress={onClose} style={legalStyles.closeBtn}>
            <Text style={legalStyles.closeBtnText}>✕</Text>
          </ScaleButton>
        </View>
        <ScrollView style={legalStyles.body} showsVerticalScrollIndicator={false}>
          {doc.sections.map((s) => (
            <View key={s.heading} style={legalStyles.section}>
              <Text style={legalStyles.sectionHeading}>{s.heading}</Text>
              <Text style={legalStyles.sectionBody}>{s.body}</Text>
            </View>
          ))}
          <Text style={legalStyles.effectiveDate}>시행일: 2026년 1월 1일</Text>
        </ScrollView>
        <View style={legalStyles.footer}>
          <ScaleButton style={legalStyles.confirmBtn} onPress={onClose}>
            <Text style={legalStyles.confirmBtnText}>확인</Text>
          </ScaleButton>
        </View>
      </View>
    </Modal>
  );
}

const legalStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '85%',
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  sheetTitle: { fontSize: 16, lineHeight: 24, fontFamily: 'A2Z-Bold', fontWeight: '700', color: Colors.textPrimary },
  closeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 16, color: Colors.textMuted },
  body: { paddingHorizontal: 20, paddingTop: 16 },
  section: { marginBottom: 16 },
  sectionHeading: { fontSize: 13, lineHeight: 20, fontFamily: 'A2Z-Bold', fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  sectionBody: { fontSize: 12, color: Colors.textSecondary, lineHeight: 12 * 1.7 },
  effectiveDate: { fontSize: 11, color: Colors.textMuted, marginBottom: 24 },
  footer: {
    padding: 16,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  confirmBtn: {
    backgroundColor: Colors.textPrimary,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  confirmBtnText: { fontSize: 15, lineHeight: 22, fontFamily: 'A2Z-Bold', fontWeight: '600', color: '#FFF' },
});

const API_BASE = 'https://oreumdal.co.kr';
const DEEP_LINK_BASE = 'oremdal://app';

function parseUrlParams(url: string): Record<string, string> {
  const query = url.split('?')[1] ?? '';
  if (!query) return {};
  return Object.fromEntries(
    query.split('&').map((pair) => {
      const idx = pair.indexOf('=');
      const key = pair.slice(0, idx);
      const val = decodeURIComponent(pair.slice(idx + 1));
      return [key, val];
    })
  );
}

export default function SignUpScreen() {
  const navigation = useNavigation<Nav>();
  const login = useUserStore((s) => s.login);
  const clearRecords = useRecordStore((s) => s.clearRecords);

  const [step, setStep] = useState<Step>('social');
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [nickname, setNickname] = useState('');
  const [agreeRequired, setAgreeRequired] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [openDoc, setOpenDoc] = useState<DocKey | null>(null);

  const [pendingAuth, setPendingAuth] = useState<{
    userId: string;
    accessToken: string;
    refreshToken: string;
    provider: string;
  } | null>(null);

  const canComplete = nickname.trim().length > 0 && agreeRequired;

  const handleSocial = async (provider: Provider) => {
    setLoadingProvider(provider);
    try {
      const loginUrl =
        `${API_BASE}/api/auth/${provider}` +
        `?platform=app&front_url=${encodeURIComponent(DEEP_LINK_BASE)}`;

      const result = await WebBrowser.openAuthSessionAsync(loginUrl, DEEP_LINK_BASE);

      if (result.type !== 'success') return;

      const params = parseUrlParams(result.url);
      const { access_token, refresh_token, user_id, nick_name } = params;

      if (!access_token || !user_id) {
        Alert.alert('로그인 실패', '인증 정보를 받지 못했습니다. 다시 시도해 주세요.');
        return;
      }

      if (nick_name && nick_name !== 'None') {
        // 기존 유저: 프로필 단계 건너뜀
        const storedNickname = useUserStore.getState().nickname;
        login({
          nickname: storedNickname || nick_name.slice(0, 10),
          userId: user_id,
          accessToken: access_token,
          refreshToken: refresh_token ?? '',
          provider,
        });
        await useRecordStore.getState().loadUserRecords();
        const { hasCompletedOnboarding } = useUserStore.getState();
        if (!hasCompletedOnboarding) {
          (navigation as any).navigate('Onboarding', { screen: 'PersonalityTest' });
        } else {
          navigation.goBack();
        }
        return;
      }

      // 신규 유저: 닉네임·약관 입력 단계
      setPendingAuth({
        userId: user_id,
        accessToken: access_token,
        refreshToken: refresh_token ?? '',
        provider,
      });
      setStep('profile');
    } catch {
      Alert.alert('오류', '로그인 중 문제가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleComplete = () => {
    if (!canComplete || !pendingAuth) return;
    clearRecords();
    login({
      nickname: nickname.trim(),
      userId: pendingAuth.userId,
      accessToken: pendingAuth.accessToken,
      refreshToken: pendingAuth.refreshToken,
      provider: pendingAuth.provider,
    });
    (navigation as any).navigate('Onboarding', { screen: 'PersonalityTest' });
  };

  if (step === 'social') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScaleButton style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </ScaleButton>
        <View style={styles.content}>
          <View style={styles.top}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBox}
            >
              <OremdalLogo size={34} />
            </LinearGradient>
            <Text style={styles.title}>매매하기 전,{'\n'}잠깐 들러보세요</Text>
            <Text style={styles.desc}>
              오름달은 수익률이 아닌, 당신의 의사결정 습관을 다듬어주는 AI 심리 코치예요.
            </Text>
            <View style={styles.tagRow}>
              <Sparkle size={13} color={Colors.cta} />
              <Text style={styles.tagText}>매매 충동을 느낄 때 가장 먼저 떠올리는 곳</Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <ScaleButton
              style={styles.kakaoBtn}
              onPress={() => handleSocial('kakao')}
              disabled={loadingProvider !== null}
            >
              {loadingProvider === 'kakao' ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.kakaoBtnText}>카카오로 계속하기</Text>
              )}
            </ScaleButton>

            <ScaleButton
              style={styles.appleBtn}
              onPress={() => handleSocial('apple')}
              disabled={loadingProvider !== null}
            >
              {loadingProvider === 'apple' ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.appleBtnText}>Apple로 계속하기</Text>
              )}
            </ScaleButton>

            <ScaleButton
              style={styles.googleBtn}
              onPress={() => handleSocial('google')}
              disabled={loadingProvider !== null}
            >
              {loadingProvider === 'google' ? (
                <ActivityIndicator color={Colors.textPrimary} />
              ) : (
                <Text style={styles.googleBtnText}>Google로 계속하기</Text>
              )}
            </ScaleButton>

            <Text style={styles.terms}>
              가입 시{' '}
              <Text style={styles.termsLink} onPress={() => setOpenDoc('terms')}>이용약관</Text>
              과{' '}
              <Text style={styles.termsLink} onPress={() => setOpenDoc('privacy')}>개인정보 처리방침</Text>
              에 동의합니다
            </Text>
          </View>
        </View>
        {openDoc && <LegalDocModal docKey={openDoc} onClose={() => setOpenDoc(null)} />}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.profileContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScaleButton onPress={() => setStep('social')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </ScaleButton>

          <Text style={styles.title}>닉네임을 정해봐요</Text>
          <Text style={styles.desc}>앱 안에서 사용할 이름이에요</Text>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.textInput}
              placeholder="최대 10자"
              placeholderTextColor={Colors.textMuted}
              value={nickname}
              onChangeText={(v) => setNickname(v.slice(0, 10))}
              autoFocus
              returnKeyType="done"
            />
            <Text style={styles.charCount}>{nickname.length} / 10</Text>
          </View>

          <View style={styles.consentSection}>
            <ScaleButton style={styles.checkRow} onPress={() => setAgreeRequired(!agreeRequired)}>
              <View style={[styles.checkbox, agreeRequired && styles.checkboxActive]}>
                {agreeRequired && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>
                <Text style={styles.required}>[필수] </Text>
                이용약관 및 개인정보처리방침 동의
              </Text>
            </ScaleButton>
            <ScaleButton style={styles.checkRow} onPress={() => setAgreeMarketing(!agreeMarketing)}>
              <View style={[styles.checkbox, agreeMarketing && styles.checkboxActive]}>
                {agreeMarketing && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>
                <Text style={styles.optional}>[선택] </Text>
                마케팅 정보 수신 동의
              </Text>
            </ScaleButton>
          </View>

          <ScaleButton
            style={[styles.completeBtn, !canComplete && styles.completeBtnDisabled]}
            onPress={handleComplete}
            disabled={!canComplete}
          >
            <Text style={styles.completeBtnText}>가입 완료</Text>
          </ScaleButton>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  closeBtn: { position: 'absolute', top: 56, right: 24, zIndex: 10, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 18, color: Colors.textMuted },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  profileContent: {
    padding: 24,
    paddingBottom: 48,
    gap: 24,
  },
  top: { flex: 1, justifyContent: 'center', gap: 0 },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: Colors.cta,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontFamily: 'A2Z-Bold', fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 39,
  },
  desc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 14 * 1.7,
    marginTop: 12,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
  },
  tagText: {
    fontSize: 12,
    color: Colors.cta,
  },
  buttons: { gap: 10, paddingBottom: 8 },
  kakaoBtn: {
    borderRadius: 16,
    padding: 17,
    alignItems: 'center',
    backgroundColor: '#FEE500',
  },
  kakaoBtnText: {
    fontSize: 15, lineHeight: 23,
    fontFamily: 'A2Z-Bold', fontWeight: '600',
    color: '#191600',
  },
  appleBtn: {
    borderRadius: 16,
    padding: 17,
    alignItems: 'center',
    backgroundColor: '#18181B',
  },
  appleBtnText: {
    fontSize: 15, lineHeight: 23,
    fontFamily: 'A2Z-Bold', fontWeight: '600',
    color: '#FFFFFF',
  },
  googleBtn: {
    borderRadius: 16,
    padding: 17,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  googleBtnText: {
    fontSize: 15, lineHeight: 23,
    fontFamily: 'A2Z-Bold', fontWeight: '600',
    color: Colors.textPrimary,
  },
  terms: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  termsLink: {
    fontSize: 11,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', marginBottom: 8 },
  backBtnText: { fontSize: 18, color: Colors.textSecondary },
  inputWrap: { gap: 6 },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  consentSection: { gap: 14 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { borderColor: Colors.cta, backgroundColor: Colors.cta },
  checkmark: { fontSize: 12, lineHeight: 18, color: '#FFF', fontFamily: 'A2Z-Bold', fontWeight: '700' },
  checkLabel: { fontSize: 14, color: Colors.textSecondary, flex: 1 },
  required: { color: Colors.cta, fontFamily: 'A2Z-Bold', fontWeight: '600' },
  optional: { color: Colors.textMuted },
  completeBtn: {
    backgroundColor: Colors.cta,
    borderRadius: 16,
    padding: 17,
    alignItems: 'center',
    marginTop: 8,
  },
  completeBtnDisabled: { opacity: 0.35 },
  completeBtnText: { fontSize: 15, lineHeight: 22, fontFamily: 'A2Z-Bold', fontWeight: '600', color: '#FFF' },
});
