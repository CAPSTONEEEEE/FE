//screens/MarketScreen/ProductDetailScreen.js
import { View, Text, Button } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import api from "../../utils/apiClient";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();   // ← /market/product/[id]
  const router = useRouter();
  const [item, setItem] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await api.get(`/markets/items/${id}`);
        setItem(res.data);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, [id]);

  if (!item) {
    return <View style={{ flex: 1, padding: 16 }}><Text>불러오는 중…</Text></View>;
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>{item.name}</Text>
      <Text>{item.price?.toLocaleString()}원</Text>
      <Text>{item.description}</Text>

      <Button title="장바구니 담기" onPress={() => {/* POST /markets/cart */}} />
      <Button title="뒤로 가기" onPress={() => router.back()} />
    </View>
  );
}
