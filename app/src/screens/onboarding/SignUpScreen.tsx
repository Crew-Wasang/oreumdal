import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
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

      setPendingAuth({
        userId: user_id,
        accessToken: access_token,
        refreshToken: refresh_token ?? '',
        provider,
      });

      if (nick_name && nick_name !== 'None') {
        setNickname(nick_name.slice(0, 10));
      }

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
    navigation.goBack();
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

            <Text style={styles.terms}>가입 시 이용약관과 개인정보 처리방침에 동의합니다</Text>
          </View>
        </View>
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
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 26 * 1.3,
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
    fontSize: 15,
    fontWeight: '600',
    color: '#191600',
  },
  appleBtn: {
    borderRadius: 16,
    padding: 17,
    alignItems: 'center',
    backgroundColor: '#18181B',
  },
  appleBtnText: {
    fontSize: 15,
    fontWeight: '600',
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
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  terms: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
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
  checkmark: { fontSize: 12, color: '#FFF', fontWeight: '700' },
  checkLabel: { fontSize: 14, color: Colors.textSecondary, flex: 1 },
  required: { color: Colors.cta, fontWeight: '600' },
  optional: { color: Colors.textMuted },
  completeBtn: {
    backgroundColor: Colors.cta,
    borderRadius: 16,
    padding: 17,
    alignItems: 'center',
    marginTop: 8,
  },
  completeBtnDisabled: { opacity: 0.35 },
  completeBtnText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
});
