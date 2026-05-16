/**
 * TreadForm App entry point.
 * Step 2: NavigationContainer + Stack Navigator 추가.
 *   Home → Camera → Upload → Processing → Result, MemberSelect.
 */
import React from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './src/i18n';
import { ModeProvider, useMode } from './src/context/ModeContext';
import { COLORS } from './src/constants/colors';
import type { RootStackParamList } from './src/navigation/types';
import { HomeScreen } from './src/screens/HomeScreen';
import { CameraScreen } from './src/screens/CameraScreen';
import { UploadScreen } from './src/screens/UploadScreen';
import { ProcessingScreen } from './src/screens/ProcessingScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { MemberSelectScreen } from './src/screens/MemberSelectScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootStack: React.FC = () => {
  const { hydrated } = useMode();

  if (!hydrated) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.BACKGROUND },
        headerTintColor: COLORS.PRIMARY,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ headerShown: false, orientation: 'landscape' }}
      />
      <Stack.Screen
        name="Upload"
        component={UploadScreen}
        options={{ title: '업로드' }}
      />
      <Stack.Screen
        name="Processing"
        component={ProcessingScreen}
        options={{ title: '분석 중', headerBackVisible: false }}
      />
      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{ title: '결과' }}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: '누적 대시보드' }}
      />
      <Stack.Screen
        name="MemberSelect"
        component={MemberSelectScreen}
        options={{ title: '회원 선택' }}
      />
    </Stack.Navigator>
  );
};

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <ModeProvider>
        <NavigationContainer>
          <RootStack />
        </NavigationContainer>
      </ModeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default App;
