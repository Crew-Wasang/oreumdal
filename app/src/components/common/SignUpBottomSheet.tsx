import React, { useRef, useEffect } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, Pressable,
  Animated, PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import ScaleButton from './ScaleButton';

type Nav = NativeStackNavigationProp<MainStackParamList>;

interface Props {
  visible: boolean;
  trigger: 'chk' | 'save' | 'report';
  onClose: () => void;
}

const CONTENT: Record<Props['trigger'], { title: string; desc: string }> = {
  chk: {
    title: '기록이 저장됐어요',
    desc: '가입하면 기기를 바꿔도\n코칭 기록이 그대로 남아요',
  },
  save: {
    title: '기록이 저장됐어요',
    desc: '가입하면 기기를 바꿔도\n매매 기록이 그대로 남아요',
  },
  report: {
    title: '리포트를 보려면 가입이 필요해요',
    desc: '가입하면 AI가 내 투자 패턴을\n분석해서 리포트를 보내줘요',
  },
};

export default function SignUpBottomSheet({ visible, trigger, onClose }: Props) {
  const navigation = useNavigation<Nav>();
  const { title, desc } = CONTENT[trigger];
  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => { if (g.dy > 0) panY.setValue(g.dy); },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80 || g.vy > 0.5) {
          Animated.timing(panY, { toValue: 500, duration: 200, useNativeDriver: true }).start(() => onClose());
        } else {
          Animated.spring(panY, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) panY.setValue(0);
  }, [visible]);

  const handleSignUp = () => {
    onClose();
    navigation.navigate('SignUp', { trigger });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY: panY }] }]} {...panResponder.panHandlers}>
        <View style={styles.handle} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{desc}</Text>

        <ScaleButton style={styles.signUpBtnWrap} onPress={handleSignUp}>
          <LinearGradient
            colors={['#6366F1', '#4F46E5', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.signUpBtn}
          >
            <Text style={styles.signUpBtnText}>가입하기</Text>
          </LinearGradient>
        </ScaleButton>

        <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>나중에 할게요</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    gap: 16,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18, lineHeight: 27,
    fontFamily: 'A2Z-Bold', fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 14 * 1.7,
    marginTop: -4,
  },
  signUpBtnWrap: { borderRadius: 10, marginTop: 4 },
  signUpBtn: { borderRadius: 10, padding: 17, alignItems: 'center' },
  signUpBtnText: {
    fontSize: 15, lineHeight: 23,
    fontFamily: 'A2Z-Bold', fontWeight: '600',
    color: '#FFF',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  cancelText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
