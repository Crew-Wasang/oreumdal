import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, Alert, Modal, Switch,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import ScaleButton from '../../components/common/ScaleButton';
import { useUserStore } from '../../store/userStore';
import { useRecordStore } from '../../store/recordStore';
import { RootStackParamList } from '../../types';
import { Sparkle, ChevronRight } from '../../components/common/Icons';
import { consumeNotifTrigger } from '../../lib/notifModalTrigger';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
  scheduleWeeklyReport,
  cancelWeeklyReport,
} from '../../lib/notifications';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PERSONALITY_LABEL: Record<string, string> = {
  analytical: '신중한 분석형',
  reactive: '감정적 반응형',
  optimistic: '낙관적 직관형',
  hesitant: '우유부단 보류형',
};

const PROVIDER_LABEL: Record<string, string> = {
  google: 'Google',
  kakao: '카카오',
  apple: 'Apple',
};

function PrincipleItem({
  index, text, onDelete,
}: { index: number; text: string; onDelete: () => void }) {
  return (
    <View style={styles.principleItem}>
      <Text style={styles.principleIndex}>{String(index + 1).padStart(2, '0')}</Text>
      <Text style={styles.principleText}>{text}</Text>
      <ScaleButton onPress={onDelete} style={styles.principleDelete}>
        <Text style={styles.principleDeleteText}>✕</Text>
      </ScaleButton>
    </View>
  );
}

export default function MyPageScreen() {
  const navigation = useNavigation<Nav>();
  const {
    principles, setPrinciples, personalityType,
    nickname, provider, logout, notifSettings, setNotifSettings, setNickname,
  } = useUserStore();
  const clearRecords = useRecordStore((s) => s.clearRecords);

  const [newPrinciple, setNewPrinciple] = useState('');
  const [principleError, setPrincipleError] = useState('');
  const [showAccount, setShowAccount] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  useFocusEffect(useCallback(() => {
    if (consumeNotifTrigger()) setShowNotif(true);
  }, []));
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState(nickname);

  const principleLines = principles
    ? principles.split('\n').filter(l => l.trim().length > 0)
    : [];

  const PRINCIPLE_ALLOWED = /^[가-힣a-zA-Z0-9\s\-\.%,]+$/;

  const MAX_PRINCIPLES = 10;

  const addPrinciple = () => {
    const trimmed = newPrinciple.trim();
    if (!trimmed) return;
    if (principleLines.length >= MAX_PRINCIPLES) {
      setPrincipleError(`최대 ${MAX_PRINCIPLES}개까지 추가할 수 있어요`);
      return;
    }
    if (trimmed.length < 5) {
      setPrincipleError('최소 5자 이상 입력해주세요');
      return;
    }
    if (!PRINCIPLE_ALLOWED.test(trimmed)) {
      setPrincipleError('한글, 영어, 숫자, -, ., %, ,만 입력 가능해요');
      return;
    }
    const updated = [...principleLines, trimmed];
    setPrinciples(updated.join('\n'));
    setNewPrinciple('');
    setPrincipleError('');
  };

  const handlePrincipleChange = (text: string) => {
    if (text.length <= 60) setNewPrinciple(text);
    if (principleError) setPrincipleError('');
  };

  const deletePrinciple = (index: number) => {
    const updated = principleLines.filter((_, i) => i !== index);
    setPrinciples(updated.join('\n'));
  };

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

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃', style: 'destructive',
        onPress: () => { logout(); clearRecords(); navigation.replace('Main'); },
      },
    ]);
  };

  const handleSaveNickname = () => {
    if (!nicknameDraft.trim()) return;
    setNickname(nicknameDraft.trim());
    setEditingNickname(false);
  };

  const menuItems = [
    { label: '알림 설정', onPress: () => setShowNotif(true) },
    { label: '계정 설정', onPress: () => { setNicknameDraft(nickname); setShowAccount(true); } },
    { label: '로그아웃', danger: true, onPress: handleLogout },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.pageTitle}>마이</Text>

          {/* 프로필 카드 */}
          <View style={styles.profileCard}>
            <LinearGradient
              colors={[Colors.accent, Colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileAvatar}
            >
              <Text style={styles.profileAvatarText}>
                {(nickname || '?')[0].toUpperCase()}
              </Text>
            </LinearGradient>
            <View>
              <Text style={styles.profileName}>{nickname || '이름 없음'}</Text>
              <Text style={styles.profileSub}>
                {personalityType ? PERSONALITY_LABEL[personalityType] ?? personalityType : '성향 미진단'}
              </Text>
            </View>
          </View>

          {/* 투자 원칙 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sparkle size={13} color={Colors.cta} />
              <Text style={styles.sectionTitle}>내 투자 원칙</Text>
            </View>
            <Text style={styles.sectionDesc}>여기에 적은 내용만 AI 코치가 참고해요</Text>

            <View style={styles.principleList}>
              {principleLines.map((p, i) => (
                <PrincipleItem
                  key={i}
                  index={i}
                  text={p}
                  onDelete={() => deletePrinciple(i)}
                />
              ))}
            </View>

            <View style={styles.principleAddRow}>
              <TextInput
                style={[styles.principleInput, !!principleError && styles.principleInputError]}
                value={newPrinciple}
                onChangeText={handlePrincipleChange}
                placeholder="새로운 원칙 추가하기"
                placeholderTextColor={Colors.textMuted}
                returnKeyType="done"
                onSubmitEditing={addPrinciple}
                maxLength={60}
              />
              <ScaleButton
                style={[styles.addBtn, !newPrinciple.trim() && styles.addBtnDisabled]}
                onPress={addPrinciple}
                disabled={!newPrinciple.trim()}
              >
                <Text style={styles.addBtnText}>+</Text>
              </ScaleButton>
            </View>
            <View style={styles.principleFooter}>
              {principleError
                ? <Text style={styles.principleErrorText}>{principleError}</Text>
                : <View />
              }
              <Text style={styles.principleCount}>{newPrinciple.length}/60</Text>
            </View>
          </View>

          {/* 메뉴 */}
          <View style={styles.menuCard}>
            {menuItems.map((item, i) => (
              <ScaleButton
                key={item.label}
                style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]}
                onPress={item.onPress}
              >
                <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                  {item.label}
                </Text>
                <ChevronRight size={16} color={item.danger ? Colors.reconsider : Colors.textMuted} />
              </ScaleButton>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 알림 설정 모달 */}
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

      {/* 계정 설정 모달 */}
      <Modal visible={showAccount} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>계정 설정</Text>
            <ScaleButton
              onPress={() => { setShowAccount(false); setEditingNickname(false); }}
              style={styles.modalClose}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </ScaleButton>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.notifCard}>
              <View style={styles.notifCardHeader}>
                <Text style={styles.notifCardLabel}>닉네임</Text>
                {!editingNickname && (
                  <ScaleButton onPress={() => setEditingNickname(true)}>
                    <Text style={styles.editLink}>수정</Text>
                  </ScaleButton>
                )}
              </View>
              {editingNickname ? (
                <View style={{ gap: 10 }}>
                  <TextInput
                    style={styles.principleInput}
                    value={nicknameDraft}
                    onChangeText={(v) => setNicknameDraft(v.slice(0, 10))}
                    autoFocus
                    maxLength={10}
                    returnKeyType="done"
                  />
                  <ScaleButton
                    style={[styles.saveNicknameBtn, !nicknameDraft.trim() && { opacity: 0.4 }]}
                    onPress={handleSaveNickname}
                    disabled={!nicknameDraft.trim()}
                  >
                    <Text style={styles.saveNicknameBtnText}>저장</Text>
                  </ScaleButton>
                </View>
              ) : (
                <Text style={styles.accountValue}>{nickname || '-'}</Text>
              )}
            </View>
            <View style={styles.notifCard}>
              <Text style={styles.notifCardLabel}>소셜 로그인</Text>
              <Text style={styles.accountValue}>{PROVIDER_LABEL[provider] || provider || '-'}</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 20, paddingBottom: 48 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, paddingTop: 4 },

  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 0.5, borderColor: Colors.border,
  },
  profileAvatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  profileAvatarText: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  profileName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  profileSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  sectionDesc: { fontSize: 12, color: Colors.textMuted, marginTop: -4 },

  principleList: { gap: 8 },
  principleItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    padding: 14, borderRadius: 16,
    backgroundColor: Colors.surface, borderWidth: 0.5, borderColor: Colors.border,
  },
  principleIndex: { fontSize: 12, fontWeight: '500', color: Colors.cta, marginTop: 1, minWidth: 20 },
  principleText: { flex: 1, fontSize: 14, color: Colors.textSubtle, lineHeight: 14 * 1.5 },
  principleDelete: { padding: 2 },
  principleDeleteText: { fontSize: 13, color: Colors.textMuted },

  principleAddRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 8, paddingLeft: 14, borderRadius: 16,
    backgroundColor: Colors.surface, borderWidth: 0.5, borderColor: Colors.border,
  },
  principleInput: {
    flex: 1, fontSize: 14, color: Colors.textPrimary, paddingVertical: 8,
  },
  principleInputError: { borderBottomWidth: 1, borderBottomColor: Colors.reconsider },
  principleFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  principleErrorText: { fontSize: 12, color: Colors.reconsider },
  principleCount: { fontSize: 12, color: Colors.textMuted },
  addBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.cta, alignItems: 'center', justifyContent: 'center',
  },
  addBtnDisabled: { backgroundColor: Colors.surfaceElevated },
  addBtnText: { fontSize: 20, color: '#FFF', lineHeight: 22 },

  menuCard: {
    backgroundColor: Colors.surface, borderRadius: 16,
    overflow: 'hidden', borderWidth: 0.5, borderColor: Colors.border,
  },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 18,
  },
  menuItemBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  menuLabel: { fontSize: 14, color: Colors.textPrimary },
  menuLabelDanger: { color: Colors.reconsider },

  modalSafe: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  modalClose: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  modalCloseText: { fontSize: 18, color: Colors.textSecondary },
  modalContent: { padding: 20, gap: 12 },

  notifCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 18,
    borderWidth: 0.5, borderColor: Colors.border, gap: 10,
  },
  notifCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifCardLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  notifCardTime: { fontSize: 12, color: Colors.textSecondary },
  notifCardDesc: { fontSize: 13, color: Colors.textMuted, lineHeight: 13 * 1.6 },

  editLink: { fontSize: 13, color: Colors.accent, fontWeight: '500' },
  accountValue: { fontSize: 14, color: Colors.textPrimary },
  saveNicknameBtn: {
    backgroundColor: Colors.cta, borderRadius: 12, padding: 13, alignItems: 'center',
  },
  saveNicknameBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});
