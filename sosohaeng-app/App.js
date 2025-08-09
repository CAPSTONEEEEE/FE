// App.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import HomeScreen from './screens/HomeScreen';
import FestivalsScreen from './screens/FestivalsScreen';
import RecommendHome from './screens/RecommendScreen/RecommendHome';
import RandomRecommend from './screens/RecommendScreen/RandomRecommend';
import ChatbotRecommend from './screens/RecommendScreen/ChatbotRecommend'; 
import RandomResultScreen from './screens/RecommendScreen/RandomResult';
import MarketScreen from './screens/MarketScreen';
import SettingsScreen from './screens/SettingsScreen';
import FavoritesScreen from './screens/FavoritesScreen';

// PNG 아이콘(없으면 폴백)
const FAB_ICON = (() => {
  try { return require('./assets/icons/fab_home.png'); } catch { return null; }
})();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/* --------------------- 커스텀 탭바 (전체폭) --------------------- */
// ⚠️ 이름을 CustomTabBarComp로 바꿔 충돌 방지
function CustomTabBarComp({ state, navigation }) {
  const insets = useSafeAreaInsets();

  // 크기/여백 조절 포인트
  const TAB_HEIGHT = 50;                                   // 바 높이(안전영역 제외)
  const INNER_BOTTOM_PAD = Math.max(12, insets.bottom + 6); // 내부 바닥 여백
  const H_PADDING = 18;                                    // 좌우 내부 패딩
  const RADIUS = 20;                                       // 윗모서리 라운드

  // 실제로 보일 탭 4개 (홈은 숨김)
  const routes = state.routes.filter(r => r.name !== '홈');
  const SPACER_WIDTH = 64 + 18; // 중앙 FAB 자리(64) + 여유

  const focusedRouteName = state.routes[state.index].name;

  const iconFor = (name, focused, size = 22) => {
    const color = focused ? '#1f6feb' : '#9aa0a6';
    if (name === '추천') return <Ionicons name="sparkles-outline" size={size} color={color} />;
    if (name === '축제') return <MaterialCommunityIcons name="party-popper" size={size} color={color} />;
    if (name === '마켓') return <Ionicons name="basket-outline" size={size} color={color} />;
    if (name === '설정') return <Ionicons name="settings-outline" size={size} color={color} />;
    return null;
  };

  const onPress = (name) => navigation.navigate('Main', { screen: name });

  return (
    <View
      style={[
        styles.tabCard,
        {
          left: 0,
          right: 0,
          bottom: 0,
          height: TAB_HEIGHT + insets.bottom,
          paddingTop: 8,
          paddingBottom: INNER_BOTTOM_PAD,
          paddingHorizontal: H_PADDING,
          borderTopLeftRadius: RADIUS,
          borderTopRightRadius: RADIUS,
        },
      ]}
    >
      {/* 왼쪽 2개 */}
      {routes.slice(0, 2).map((r) => {
        const focused = focusedRouteName === r.name;
        return (
          <TouchableOpacity
            key={r.key}
            style={styles.tabItem}
            activeOpacity={0.9}
            onPress={() => onPress(r.name)}
          >
            {iconFor(r.name, focused)}
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{r.name}</Text>
          </TouchableOpacity>
        );
      })}

      {/* 중앙 FAB 공간 */}
      <View style={{ width: SPACER_WIDTH }} />

      {/* 오른쪽 2개 */}
      {routes.slice(2).map((r) => {
        const focused = focusedRouteName === r.name;
        return (
          <TouchableOpacity
            key={r.key}
            style={styles.tabItem}
            activeOpacity={0.9}
            onPress={() => onPress(r.name)}
          >
            {iconFor(r.name, focused)}
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{r.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
/* --------------------------------------------------------------- */
// RecommendHome과 RandomRecommend를 위한 스택 내비게이터를 생성합니다.
const RecommendStack = createNativeStackNavigator();

// ✅ 새 스택 내비게이터 컴포넌트
function RecommendStackScreen() {
  return (
    <RecommendStack.Navigator screenOptions={{ headerShown: false }}>
      <RecommendStack.Screen name="RecommendHome" component={RecommendHome} />
      <RecommendStack.Screen name="RandomRecommend" component={RandomRecommend} />
      <RecommendStack.Screen name="ChatbotRecommend" component={ChatbotRecommend} />
      <RecommendStack.Screen name="RandomResult" component={RandomResultScreen} />
    </RecommendStack.Navigator>
  );
}
/* --------------------------------------------------------------- */
function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName="홈"
      screenOptions={{ headerShown: false }}   // ✅ 네이티브 헤더 OFF (TopBackBar 사용)
      tabBar={(props) => <CustomTabBarComp {...props} />} // ← 새 이름 사용
    >
      {/* 홈은 탭에 포함(버튼 숨김) */}
      <Tab.Screen name="홈" component={HomeScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="추천" component={RecommendStackScreen} />
      <Tab.Screen name="축제" component={FestivalsScreen} />
      <Tab.Screen name="마켓" component={MarketScreen} />
      <Tab.Screen name="설정" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function MainTabsWithFab({ navigation }) {
  const insets = useSafeAreaInsets();
  const TAB_HEIGHT = 50;
  const INNER_BOTTOM_PAD = Math.max(12, insets.bottom + 6);
  const fabBottom = (TAB_HEIGHT + INNER_BOTTOM_PAD) - 32; // FAB 겹침 정도

  return (
    <View style={{ flex: 1 }}>
      <Tabs />
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Main', { screen: '홈' })}
        style={[styles.fab, { bottom: fabBottom }]}
      >
        {FAB_ICON ? (
          <Image source={FAB_ICON} style={styles.fabIcon} />
        ) : (
          <Ionicons name="home" size={26} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#ffffff' } };

  return (
    // ✅ SafeAreaProvider로 감싸서 각 화면에서 useSafeAreaInsets() 정상 동작
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabsWithFab} />
          <Stack.Screen name="찜" component={FavoritesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  /* 전체폭 탭 카드 */
  tabCard: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderTopWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    elevation: 10,                 // Android
    shadowColor: '#000',           // iOS
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', width: 64, gap: 2 },
  tabLabel: { fontSize: 12, color: '#9aa0a6' },
  tabLabelActive: { color: '#1f6feb', fontWeight: '600' },

  /* FAB */
  fab: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -32 }],
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1f6feb',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 3,
    borderColor: '#fff',
  },
  fabIcon: { width: 28, height: 28, resizeMode: 'contain', tintColor: '#fff' }, // tintColor 지우면 원본색
});
