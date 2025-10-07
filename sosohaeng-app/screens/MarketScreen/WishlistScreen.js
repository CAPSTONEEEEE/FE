//screens/MarketScreen/WishlistScreen.js
import { View, Text, FlatList } from "react-native";
import { useEffect, useState } from "react";
import api from "../../utils/apiClient";

export default function WishlistScreen() {
  const [list, setList] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/markets/wishlist", { params: { user_id: 1, page: 1, size: 50 } });
        setList(res.data?.items ?? []);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>위시리스트</Text>
      <FlatList
        data={list}
        keyExtractor={(it, idx) => `${it.id ?? idx}`}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: "#eee" }}>
            <Text>{item.product_name}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>찜한 상품이 없습니다.</Text>}
      />
    </View>
  );
}
