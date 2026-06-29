import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { OremdalLogo } from '../components/common/Icons';
import { useUserStore } from '../store/userStore';
import { useRecordStore } from '../store/recordStore';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

export default function SplashScreen({ navigation }: Props) {
  const loadFromStorage = useUserStore((s) => s.loadFromStorage);

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        loadFromStorage(),
        new Promise<void>((r) => setTimeout(r, 400)),
      ]);
      const { hasCompletedOnboarding, isLoggedIn } = useUserStore.getState();
      if (isLoggedIn) {
        await useRecordStore.getState().loadUserRecords();
      }
      navigation.replace(hasCompletedOnboarding ? 'Main' : 'Onboarding');
    };
    init();
  }, []);

  return (
    <LinearGradient
      colors={['#EEF2FF', '#FFFFFF', '#EEF2FF']}
      style={styles.container}
    >
      <View style={styles.logoWrap}>
        <View style={styles.glowRing} />
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoBox}
        >
          <OremdalLogo size={54} />
        </LinearGradient>
      </View>
      <Text style={styles.title}>오름달</Text>
      <Text style={styles.subtitle}>매매하기 전, 한 번 더 들러보세요</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  glowRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.cta}33`,
  },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.cta,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: 'A2Z-Bold', fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
});
