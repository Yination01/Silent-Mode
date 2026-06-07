import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminLoginScreen from './AdminLoginScreen';
import AdminDashboardScreen from './AdminDashboardScreen';

const Stack = createNativeStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    </Stack.Navigator>
  );
}