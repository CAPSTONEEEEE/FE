// screens/MarketScreen/MarketHome.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { useRouter } from "expo-router";

export default function MarketHome() {
  const router = useRouter();

  return (
    // ⬇️ 헤더 위쪽은 SafeArea 적용 안 함(여백 과다 방지)
    <View style={styles.root}>
      <Header title="마켓" />

      {/* ⬇️ 컨텐츠에만 좌/우/하단 SafeArea 적용 */}
      <SafeAreaView style={styles.content} edges={["left", "right", "bottom"]}>
        <Text style={styles.link} onPress={() => router.push("/(tabs)/market/cart")}>
          장바구니로 가기
        </Text>
        <Text style={styles.link} onPress={() => router.push("/(tabs)/market/wishlist")}>
          위시리스트로 가기
        </Text>
        <Text style={styles.link} onPress={() => router.push("/(tabs)/market/seller")}>
          판매자 메뉴
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/market/cart")}
          style={styles.button}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>장바구니 push</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },        // 헤더 포함 전체
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 12, backgroundColor: "#fff" }, // 본문
  link: { fontSize: 16, marginBottom: 16 },
  button: {
    marginTop: 24,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#e6f4f7",
  },
  buttonText: { fontSize: 18, color: "#2c6e7f" },
});
