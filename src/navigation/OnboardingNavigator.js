import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LinkAppsScreen from '../screens/onboarding/LinkAppsScreen';
import PickVibeScreen from '../screens/onboarding/PickVibeScreen';
import TextLengthScreen from '../screens/onboarding/TextLengthScreen';
import PermissionsScreen from '../screens/onboarding/PermissionsScreen';

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' }, animation: 'slide_from_right' }}>
      <Stack.Screen name="LinkApps" component={LinkAppsScreen} />
      <Stack.Screen name="PickVibe" component={PickVibeScreen} />
      <Stack.Screen name="TextLength" component={TextLengthScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
    </Stack.Navigator>
  );
}