import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync();

// 모든 Text 컴포넌트에 Spoqa 기본 적용
(Text as any).defaultProps = (Text as any).defaultProps ?? {};
(Text as any).defaultProps.style = [{ fontFamily: 'SpoqaHanSansNeo-Regular' }];
(TextInput as any).defaultProps = (TextInput as any).defaultProps ?? {};
(TextInput as any).defaultProps.style = [{ fontFamily: 'SpoqaHanSansNeo-Regular' }];

export default function App() {
  const [fontsLoaded] = useFonts({
    'SpoqaHanSansNeo-Thin': require('./assets/fonts/SpoqaHanSansNeo-Thin.ttf'),
    'SpoqaHanSansNeo-Light': require('./assets/fonts/SpoqaHanSansNeo-Light.ttf'),
    'SpoqaHanSansNeo-Regular': require('./assets/fonts/SpoqaHanSansNeo-Regular.ttf'),
    'SpoqaHanSansNeo-Medium': require('./assets/fonts/SpoqaHanSansNeo-Medium.ttf'),
    'SpoqaHanSansNeo-Bold': require('./assets/fonts/SpoqaHanSansNeo-Bold.ttf'),
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
