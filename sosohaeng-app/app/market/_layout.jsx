import { Stack } from "expo-router";

export default function MarketLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        // gestureEnabled: true, // 필요시
      }}
    >
      <Stack.Screen name="index" options={{ title: "마켓" }} />
      <Stack.Screen name="cart" options={{ title: "장바구니" }} />
      <Stack.Screen name="wishlist" options={{ title: "위시리스트" }} />
      <Stack.Screen name="seller" options={{ title: "판매자" }} />
      <Stack.Screen name="product/[id]" options={{ title: "상품 상세" }} />
    </Stack>
  );
}
