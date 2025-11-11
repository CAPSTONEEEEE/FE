//screens/MarketScreen/CartScreen.js
import { View, Text, FlatList } from "react-native";
import { useEffect, useState } from "react";
import api from '../../src/config/client'; 
export default function CartScreen() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/markets/cart", { params: { user_id: 1, page: 1, size: 50 } });
        setCart(res.data?.items ?? []);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>장바구니</Text>
      <FlatList
        data={cart}
        keyExtractor={(it, idx) => `${it.id ?? idx}`}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: "#eee" }}>
            <Text>{item.product_name}</Text>
            <Text>{item.quantity}개</Text>
          </View>
        )}
        ListEmptyComponent={<Text>장바구니가 비어 있습니다.</Text>}
      />
    </View>
  );
}
