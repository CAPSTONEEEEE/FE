import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import RecommendScreen from './screens/RecommendScreen.js';
import FestivalsScreen from './screens/FestivalsScreen';
import MarketScreen from './screens/MarketScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: '소소행 홈' }} />
        <Stack.Screen name="Recommend" component={RecommendScreen} options={{ title: '추천 여행지' }} />
        <Stack.Screen name="Festivals" component={FestivalsScreen} options={{ title: '지역 축제' }} />
        <Stack.Screen name="Market" component={MarketScreen} options={{ title: '로컬 마켓' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}



/*
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
*/