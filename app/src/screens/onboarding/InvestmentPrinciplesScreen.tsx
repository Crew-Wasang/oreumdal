import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import ScaleButton from '../../components/common/ScaleButton';
import { useUserStore } from '../../store/userStore';
import { Sparkle } from '../../components/common/Icons';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PRESET_PRINCIPLES = [
  '손절은 -10% 이내로 한다.',
  '뉴스/공시 확인 후에만 매매한다.',
  '한 종목에 30% 이상 넣지 않는다.',
  '충동이 오면 하루 기다린다.',
  '수익률보다 원칙을 먼저 지킨다.',
];

const MAX_SELECT = 3;

export default function InvestmentPrinciplesScreen() {
  const navigation = useNavigation<Nav>();
  const setPrinciples = useUserStore((s) => s.setPrinciples);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);

  const [selected, setSelected] = useState<string[]>([]);
  const [customEnabled, setCustomEnabled] = useState(false);
  const [customText, setCustomText] = useState('');

  const totalCount = selected.length + (customEnabled ? 1 : 0);
  const canAddMore = totalCount < MAX_SELECT;
  const customFilled = customEnabled && customText.trim().length > 0;
  const hasAny = selected.length > 0 || customFilled;
  const canSave = !customEnabled || customFilled;

  const togglePreset = (item: string) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((s) => s !== item));
    } else {
      if (!canAddMore) return;
      setSelected([...selected, item]);
    }
  };

  const toggleCustom = () => {
    if (customEnabled) {
      setCustomEnabled(false);
      setCustomText('');
    } else {
      if (!canAddMore) return;
      setCustomEnabled(true);
    }
  };

  const handleSave = () => {
    const all = [...selected];
    if (customEnabled && customText.trim()) all.push(customText.trim());
    setPrinciples(all.join('\n'));
    completeOnboarding();
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.tagRow}>
            <Sparkle size={13} color={Colors.cta} />
            <Text style={styles.tag}>최초 1회 설정</Text>
          </View>

          <Text style={styles.title}>
            앞으로 AI 코치가{'\n'}참고할 <Text style={styles.titleAccent}>나의 원칙</Text>을 골라주세요
          </Text>
          <Text style={styles.desc}>최대 {MAX_SELECT}개까지 선택할 수 있어요 · {totalCount}/{MAX_SELECT}</Text>

          <View style={styles.list}>
            {PRESET_PRINCIPLES.map((item) => {
              const active = selected.includes(item);
              const disabled = !active && !canAddMore;
              return (
                <ScaleButton
                  key={item}
                  style={[styles.item, active && styles.itemActive, disabled && styles.itemDisabled]}
                  onPress={() => togglePreset(item)}
                  disabled={disabled}
                >
                  <View style={[styles.checkbox, active && styles.checkboxActive]}>
                    {active && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.itemText, active && styles.itemTextActive, disabled && styles.itemTextDisabled]}>
                    {item}
                  </Text>
                </ScaleButton>
              );
            })}

            <ScaleButton
              style={[
                styles.item,
                customEnabled && styles.itemActive,
                !customEnabled && !canAddMore && styles.itemDisabled,
              ]}
              onPress={toggleCustom}
              disabled={!customEnabled && !canAddMore}
            >
              <View style={[styles.checkbox, customEnabled && styles.checkboxActive]}>
                {customEnabled && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.itemText, customEnabled && styles.itemTextActive, !customEnabled && !canAddMore && styles.itemTextDisabled]}>
                직접 입력
              </Text>
            </ScaleButton>
          </View>

          {customEnabled && (
            <View style={styles.customWrap}>
              <TextInput
                style={styles.customInput}
                value={customText}
                onChangeText={setCustomText}
                placeholder="나만의 원칙을 적어주세요"
                placeholderTextColor={Colors.textMuted}
                autoFocus
                returnKeyType="done"
              />
            </View>
          )}

          <ScaleButton
            style={[styles.cta, !hasAny && styles.ctaSecondary, !canSave && styles.ctaDisabled]}
            onPress={handleSave}
            disabled={!canSave}
          >
            <Text style={[styles.ctaText, !hasAny && styles.ctaTextSecondary]}>
              {hasAny ? '저장하고 시작하기' : '원칙 없이 시작하기'}
            </Text>
          </ScaleButton>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingTop: 12, paddingBottom: 48, gap: 16 },

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
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 22 * 1.4,
  },
  titleAccent: { color: Colors.cta },
  desc: { fontSize: 12, color: Colors.textSecondary },

  list: { gap: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  itemActive: {
    borderColor: Colors.cta,
    borderWidth: 1.5,
    backgroundColor: Colors.ctaLight,
  },
  itemDisabled: { opacity: 0.4 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxActive: { backgroundColor: Colors.cta, borderColor: Colors.cta },
  checkmark: { fontSize: 11, color: '#FFF', fontWeight: '700' },
  itemText: { fontSize: 14, color: Colors.textSubtle, flex: 1 },
  itemTextActive: { color: Colors.ctaLightText, fontWeight: '500' },
  itemTextDisabled: { color: Colors.textMuted },

  customWrap: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 8,
  },
  customInput: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.textPrimary,
  },

  cta: {
    backgroundColor: Colors.cta,
    borderRadius: 16,
    padding: 17,
    alignItems: 'center',
    marginTop: 4,
  },
  ctaSecondary: {
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  ctaTextSecondary: { color: Colors.textLight },
});
