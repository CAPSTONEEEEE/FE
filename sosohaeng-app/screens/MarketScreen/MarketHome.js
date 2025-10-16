// screens/MarketScreen/MarketHome.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "../../src/config/api";

const REGIONS = ["전체", "서울", "경기", "강원", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
const SORTS = [
  { key: "popular", label: "인기순" },
  { key: "review", label: "후기순" },
  { key: "new", label: "최신순" },
];

export default function MarketHome() {
  const router = useRouter();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState("전체");
  const [sort, setSort] = useState("popular");
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ mock_markets.json 불러오기
  useEffect(() => {
    const loadData = async () => {
      try {
        //const res = await fetch("http://192.168.0.67:8000/mock_data/mock_markets.json");
        //const data = await res.json();

        const res = await fetch(`${API_BASE_URL}/mock_data/mock_markets.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMarkets(data);

        setMarkets(data);
      } catch (err) {
        console.error("❌ mock_markets.json 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ✅ 검색 / 필터 / 정렬
  const filtered = useMemo(() => {
    let arr = [...markets];

    if (region !== "전체") arr = arr.filter((p) => p.region === region);
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "review":
        arr.sort((a, b) => b.rating - a.rating);
        break;
      case "new":
        arr.sort((a, b) => Number(b.id) - Number(a.id));
        break;
      default:
        arr.sort((a, b) => b.likes - a.likes);
        break;
    }

    return arr;
  }, [markets, region, sort, searchQuery]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: "/market/product/[id]", params: { id: item.id } })}
      style={styles.card}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardLoc}>📍 {item.location}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.desc}
        </Text>
        <View style={styles.cardMeta}>
          <View style={styles.metaRow}>
            <Ionicons name="star" size={14} color="#1f7a8c" />
            <Text style={styles.metaText}>{item.rating.toFixed(1)}</Text>
          </View>
          <View style={[styles.metaRow, { marginLeft: 12 }]}>
            <Ionicons name="heart" size={14} color="#1f7a8c" />
            <Text style={styles.metaText}>{item.likes}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <Header title="로컬 특산물 구경하기" />
      <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
        {loading ? (
          <ActivityIndicator size="large" color="#1f7a8c" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={{ paddingHorizontal: 12 }}>
                {/* 검색 */}
                <View style={styles.searchBar}>
                  <Ionicons name="search" size={18} color="#9aa7b3" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="상품명 또는 설명으로 검색"
                    placeholderTextColor="#9aa7b3"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery !== "" && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                      <Ionicons name="close-circle" size={18} color="#9aa7b3" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* 정렬칩 */}
                <View style={styles.rowWrap}>
                  {SORTS.map((s) => {
                    const active = s.key === sort;
                    return (
                      <TouchableOpacity
                        key={s.key}
                        onPress={() => setSort(s.key)}
                        style={[styles.sortChip, active && styles.sortChipActive]}
                      >
                        <Text
                          style={[styles.sortText, active && styles.sortTextActive]}
                        >
                          {s.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 지역칩 */}
                <View style={[styles.rowWrap, { marginTop: 6 }]}>
                  {REGIONS.map((r) => {
                    const active = r === region;
                    return (
                      <TouchableOpacity
                        key={r}
                        onPress={() => setRegion(r)}
                        style={[styles.regionChip, active && styles.regionChipActive]}
                      >
                        <Text
                          style={[styles.regionText, active && styles.regionTextActive]}
                        >
                          {r}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  safe: { flex: 1, backgroundColor: "#fff" },
  searchBar: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "#f2f5f6",
    height: 40,
    borderRadius: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  sortChip: {
    paddingHorizontal: 14,
    height: 36,
    backgroundColor: "#f0f4f6",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sortChipActive: { backgroundColor: "#e6f3f6", borderWidth: 1, borderColor: "#c5e6ee" },
  sortText: { color: "#6b7b86", fontWeight: "600" },
  sortTextActive: { color: "#1f7a8c" },
  regionChip: {
    paddingHorizontal: 12,
    height: 34,
    backgroundColor: "#f7fafb",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5eef2",
  },
  regionChipActive: { backgroundColor: "#dff3f7", borderColor: "#bfe7ef" },
  regionText: { color: "#7a8c97" },
  regionTextActive: { color: "#1f7a8c", fontWeight: "700" },
  card: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#f9fcfd",
    marginHorizontal: 12,
    marginVertical: 8,
    gap: 12,
  },
  cardImage: { width: 110, height: 110, borderRadius: 12, backgroundColor: "#d3eaf2" },
  cardTitle: { fontSize: 20, fontWeight: "800", color: "#0f3c45" },
  cardLoc: { marginTop: 2, color: "#46616b" },
  cardDesc: { marginTop: 4, color: "#5c717b" },
  cardMeta: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: "#0f3c45", fontWeight: "700" },
});
