import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/SplashScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
import { ChatScreen } from '../screens/ChatScreen';
import { NewPostScreen } from '../screens/NewPostScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

export const AppNavigator: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated, signIn } = useAuth();

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <WelcomeScreen onGoogleSignIn={signIn} />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="NewPost" component={NewPostScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};
