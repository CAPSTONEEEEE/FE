import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Text } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CustomTabBar({ state, navigation }) {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const focusedRouteName = state.routes[state.index]?.name;
    // ✅ 탭 순서를 명확하게 정의합니다.
    const tabOrder = ['recommend', 'market', 'settings']; 
    const visibleRoutes = tabOrder
        .map(name => state.routes.find(r => r.name === name))
        .filter(Boolean);

    // ✅ 중간 지점을 계산해서 탭을 왼쪽과 오른쪽 그룹으로 나눕니다.
    const splitIndex = Math.ceil(visibleRoutes.length / 2);
    const leftTabs = visibleRoutes.slice(0, splitIndex);
    const rightTabs = visibleRoutes.slice(splitIndex);

    const getIcon = (routeName, isFocused) => {
        const color = isFocused ? '#1f6feb' : '#9aa0a6';
        const icons = {
            recommend: 'sparkles-outline',
            market: 'basket-outline',
            settings: 'settings-outline',
        };
        return <Ionicons name={icons[routeName]} size={24} color={color} />;
    };

    const getLabel = (routeName) => ({
        recommend: '추천', market: '마켓', settings: '설정'
    }[routeName]);
    
    // ✅ 탭 아이템을 렌더링하는 부분을 함수로 분리하여 가독성을 높입니다.
    const renderTabItem = (route) => (
        <TouchableOpacity 
            key={route.key} 
            style={styles.tabItem} 
            onPress={() => router.push(`/${route.name}`)} 
            activeOpacity={0.7}
        >
            {getIcon(route.name, focusedRouteName === route.name)}
            <Text style={[styles.tabLabel, focusedRouteName === route.name && styles.tabLabelActive]}>
                {getLabel(route.name)}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.tabBarWrapper}>
            {/* 홈 버튼 (FAB) */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push('/home')}
                // ✅ bottom 값을 조절해 높이를 미세 조정하세요.
                style={[styles.fab, { bottom: insets.bottom + 15 }]} 
            >
                <Image source={require('../../assets/icons/fab_home.png')} style={styles.fabIcon} />
            </TouchableOpacity>
            
            {/* 탭 바 컨테이너 */}
            <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
                {/* ✅ 왼쪽 탭들, 중간의 빈 공간, 오른쪽 탭들 순서로 렌더링 */}
                {leftTabs.map(renderTabItem)}
                <View style={styles.tabSpacer} />
                {rightTabs.map(renderTabItem)}
            </View>
        </View>
    );
}
export default function TabsLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
            <Tabs.Screen name="recommend" />
            <Tabs.Screen name="market" />
            <Tabs.Screen name="settings" />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBarWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center', // FAB를 중앙 정렬하기 위함
    },
    tabBarContainer: {
        height: 60, // ✅ 패딩으로 높이를 조절하므로 고정 높이로 변경
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center', // ✅ 아이템들을 중앙 정렬
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center', // ✅ 아이콘과 텍스트를 중앙 정렬
        gap: 4,
    },
    // ✅ 홈 버튼이 들어갈 빈 공간의 스타일
    tabSpacer: {
        width: 60, // FAB의 너비와 비슷하게 설정
    },
    tabLabel: {
        fontSize: 12,
        color: '#9aa0a6',
    },
    tabLabelActive: {
        color: '#1f6feb',
        fontWeight: '600',
    },
    fab: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10, // 탭 바보다 위에 있도록 보장
    },
    fabIcon: {
        width: 64,
        height: 64,
    },
});

