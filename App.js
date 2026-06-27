import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import DatalogScreen from './screens/DatalogScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ emoji, focused }) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown:     false,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor:  '#eee',
            height:          65,
            paddingBottom:   10,
          },
          tabBarActiveTintColor:   '#34a853',
          tabBarInactiveTintColor: '#999',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Live',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🌿" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{
            tabBarLabel: 'Analytics',
            tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="DataLog"
          component={DataLogScreen}
          options={{
            tabBarLabel: 'Data Log',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🗂️" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}