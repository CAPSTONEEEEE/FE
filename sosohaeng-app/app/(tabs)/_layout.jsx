// app/(tabs)/_layout.jsx
import { Tabs } from "expo-router";
import CustomTabBar from "../../components/CustomTabBar";
import { useRouter } from "expo-router";

export default function TabsLayout() {
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // 상단 헤더는 개별 스택에서 관리
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {/* 홈 탭 */}
      <Tabs.Screen
        name="home"
        options={{
          title: "홈",
        }}
      />

      {/* 추천 탭 */}
      <Tabs.Screen
        name="recommend"
        options={{
          title: "추천",
        }}
      />

      {/* 축제 탭 */}
      <Tabs.Screen
        name="festivals"
        options={{
          title: "축제",
        }}
      />

      {/* 마켓 탭 */}
      <Tabs.Screen
        name="market"
        options={{
          title: "마켓",
        }}
      />

      {/* 설정 탭 */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "설정",
        }}
      />
    </Tabs>
  );
}
