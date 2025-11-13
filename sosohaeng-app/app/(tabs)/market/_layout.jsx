// app/(tabs)/market/_layout.jsx
import { Stack } from "expo-router";

export default function MarketLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,            // 헤더 표시 (뒤로가기 버튼 활성화)
        headerTitleAlign: "center",   // 제목 가운데 정렬 유지
      }}
    >
      <Stack.Screen name="index" options={{ title: "마켓" }} />
      <Stack.Screen name="wishlist" options={{ title: "위시리스트" }} />
      <Stack.Screen name="product/[id]" options={{ title: "상품 상세" }} />
      <Stack.Screen name="product/new" options={{ title: "상품 등록하기" }} />
    </Stack>
  );
}
