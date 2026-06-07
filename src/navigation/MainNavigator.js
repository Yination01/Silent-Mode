import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import HomeScreen from '../screens/main/HomeScreen';
import ModesScreen from '../screens/main/ModesScreen';
import VipScreen from '../screens/main/VipScreen';
import StatsScreen from '../screens/main/StatsScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
    </View>
  );
}

export default function MainNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, borderTopWidth: 1, height: 60, paddingBottom: 8, paddingTop: 8 },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home', tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} /> }} />
      <Tab.Screen name="Modes" component={ModesScreen} options={{ tabBarLabel: 'Modes', tabBarIcon: ({ focused }) => <TabIcon emoji="⚡" focused={focused} /> }} />
      <Tab.Screen name="VIP" component={VipScreen} options={{ tabBarLabel: 'VIP', tabBarIcon: ({ focused }) => <TabIcon emoji="⭐" focused={focused} /> }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ tabBarLabel: 'Stats', tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} /> }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings', tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} /> }} />
    </Tab.Navigator>
  );
}