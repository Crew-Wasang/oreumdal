import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync();

// 모든 Text 컴포넌트에 A2Z 기본 적용
(Text as any).defaultProps = (Text as any).defaultProps ?? {};
(Text as any).defaultProps.style = [{ fontFamily: 'A2Z-Regular' }];
(TextInput as any).defaultProps = (TextInput as any).defaultProps ?? {};
(TextInput as any).defaultProps.style = [{ fontFamily: 'A2Z-Regular' }];

export default function App() {
  const [fontsLoaded] = useFonts({
    'A2Z-Regular': require('./assets/fonts/A2ZRegular.ttf'),
    'A2Z-Medium': require('./assets/fonts/A2ZMedium.ttf'),
    'A2Z-Bold': require('./assets/fonts/A2ZBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <RootNavigator />
    </NavigationContainer>
  );
}
