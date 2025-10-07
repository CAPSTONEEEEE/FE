// screens/MarketScreen/MarketHome.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { useRouter } from "expo-router";

export default function MarketHome() {
  const router = useRouter();

  return (
    // SafeAreaView로 상단 노치 영역만큼 확보
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* 상단바(뒤로가기/타이틀)는 공용 Header로 통일 */}
      <Header title="마켓" />

      <View style={styles.container}>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  link: {
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    marginTop: 14,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#e6f4f7",
  },
  buttonText: {
    fontSize: 18,
    color: "#2c6e7f",
  },
});
