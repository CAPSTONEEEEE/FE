//export { default } from '../../screens/MarketScreen';

// app/(tabs)/market.jsx
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";

/**
 * 탭에서 "마켓"을 눌렀을 때 /market 스택으로 라우팅
 * Tabs.Screen 자체에 컴포넌트를 붙이지 않고, 탭 선택 시 스택으로 이동하는 방식
 * (탭에서 곧바로 스택 화면을 보여주고 싶으면 아래 useEffect 유지)
 */
export default function MarketTabEntry() {
  const router = useRouter();

  useEffect(() => {
    // 탭 진입 시 /market 으로 이동
    router.replace("/market");
  }, [router]);

  return (
    <Tabs.Screen
      name="market"
      options={{
        title: "마켓",
        // tabBarIcon: ({ color, size }) => <YourIcon color={color} size={size} />,
      }}
    />
  );
}
