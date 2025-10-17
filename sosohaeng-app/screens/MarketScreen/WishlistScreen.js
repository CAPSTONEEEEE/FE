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
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={22} color="#0f3c45" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>위시리스트</Text>
        <View style={{ width: 22 }} />
      </View>

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
