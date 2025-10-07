//screens/MarketScreen/MarketHome.js
import { View, Text, Button, FlatList, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import api from "../../utils/apiClient"; // 경로 확인

export default function MarketHome() {
  const router = useRouter();
  const [items, setItems] = useState([]);

  useEffect(() => {
    // 예시: 상품 목록 조회
    (async () => {
      try {
        const res = await api.get("/markets/items", { params: { page: 1, size: 20 } });
        setItems(res.data?.items ?? []);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{ padding: 12, borderBottomWidth: 1, borderColor: "#eee" }}
      onPress={() => router.push(`/market/product/${item.id}`)}
    >
      <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.name}</Text>
      <Text>{item.price?.toLocaleString()}원</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, gap: 8 }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>마켓</Text>
        {/* Link 예시 */}
        <Link href="/market/cart">장바구니로 가기</Link>
        <Link href="/market/wishlist">위시리스트로 가기</Link>
        <Link href="/market/seller">판매자 메뉴</Link>
        {/* 버튼으로 push 예시 */}
        <Button title="장바구니 push" onPress={() => router.push("/market/cart")} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
      />
    </View>
  );
}
