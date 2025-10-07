//screens/MarketScreen/SellerScreen.js
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function SellerScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>판매자 메뉴</Text>
      <Button title="상품 등록" onPress={() => {/* 폼 화면 만들면 /market/seller/new 로 */}} />
      <Button title="내 상품 관리" onPress={() => {/* 목록 화면으로 */}} />
      <Button title="뒤로" onPress={() => router.back()} />
    </View>
  );
}
