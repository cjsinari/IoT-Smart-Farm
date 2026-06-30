import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FiRrChartLineUpSvg, FiRrFolderSvg, FiRrHomeSvg } from 'react-native-icon-flaticon/lib/commonjs';
import { FlaticonIcon, ICON_SIZES } from './components/FlaticonIcon';

import HomeScreen from './screens/HomeScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import DatalogScreen from './screens/DatalogScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ Icon, focused }) => (
  <FlaticonIcon
    Icon={Icon}
    size={ICON_SIZES.tab}
    color={focused ? '#34a853' : '#999'}
  />
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
            tabBarIcon: ({ focused }) => <TabIcon Icon={FiRrHomeSvg} focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{
            tabBarLabel: 'Analytics',
            tabBarIcon: ({ focused }) => <TabIcon Icon={FiRrChartLineUpSvg} focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Datalog"
          component={DatalogScreen}
          options={{
            tabBarLabel: 'Data Log',
            tabBarIcon: ({ focused }) => <TabIcon Icon={FiRrFolderSvg} focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}