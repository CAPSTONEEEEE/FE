// screens/MarketScreen/MarketHome.js
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// --- 더미 데이터 (API로 교체 가능) ---
const PRODUCTS = [
  {
    id: "rice",
    title: "함평 나비쌀",
    region: "전라",
    location: "전라남도 함평군",
    desc:
      "청정 자연에서 자란 고품질 쌀로, 찰기와 윤기가 뛰어나 밥맛이 좋기로 유명합니다.",
    images: [
      "https://images.unsplash.com/photo-1551462147-ff29053bfc14?q=80&w=1200&auto=format&fit=crop",
    ],
    rating: 4.3,
    likes: 128,
    createdAt: 20250101,
    price: 32000,
  },
  {
    id: "honey",
    title: "영월 토종꿀",
    region: "강원",
    location: "강원도 영월군",
    desc:
      "깨끗한 산간에서 채밀한 100% 자연 토종꿀로 향이 진하고 향균 성분이 풍부합니다.",
    images: [
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
    ],
    rating: 4.1,
    likes: 108,
    createdAt: 20250110,
    price: 28000,
  },
  {
    id: "jeju_jam",
    title: "제주 감귤청",
    region: "제주",
    location: "제주도",
    desc:
      "제주 감귤을 껍질째 저온 숙성해 만든 천연 감귤청. 상큼하고 달콤한 맛이 특징입니다.",
    images: [
      "https://images.unsplash.com/photo-1615486363876-9f8b1e1f75ff?q=80&w=1200&auto=format&fit=crop",
    ],
    rating: 4.0,
    likes: 96,
    createdAt: 20250120,
    price: 15000,
  },
  {
    id: "seoul_tea",
    title: "한방 차(블렌딩)",
    region: "서울",
    location: "서울특별시",
    desc: "국내산 재료로 블렌딩한 향기로운 한방차. 선물용으로도 인기가 많습니다.",
    images: [
      "https://images.unsplash.com/photo-1498550744921-75f79806b8a7?q=80&w=1200&auto=format&fit=crop",
    ],
    rating: 4.6,
    likes: 201,
    createdAt: 20241231,
    price: 18000,
  },
];

const REGIONS = ["전체", "서울", "경기", "강원", "전라", "제주"];
const SORTS = [
  { key: "popular", label: "인기순" },
  { key: "review", label: "후기순" },
  { key: "new", label: "최신순" },
];

export default function MarketHome() {
  const router = useRouter();
  const [region, setRegion] = useState("전체");
  const [sort, setSort] = useState("popular");

  const data = useMemo(() => {
    let arr = PRODUCTS.filter((p) => (region === "전체" ? true : p.region === region));
    switch (sort) {
      case "review":
        arr = arr.sort((a, b) => b.rating - a.rating);
        break;
      case "new":
        arr = arr.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "popular":
      default:
        arr = arr.sort((a, b) => b.likes - a.likes);
        break;
    }
    return arr;
  }, [region, sort]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/market/product/[id]",
          params: { id: item.id },
        })
      }
      style={styles.card}
    >
      <Image source={{ uri: item.images[0] }} style={styles.cardImage} />
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
        {/* 검색 */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9aa7b3" />
          <Text style={styles.searchHint}>Search</Text>
          <Ionicons name="mic-outline" size={18} color="#9aa7b3" />
        </View>

        {/* 정렬칩 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 8, paddingTop: 2 , paddingBottom: 4 }}
          style={{ marginTop: 8, marginBottom: 12 }}
        >
          {SORTS.map((s) => {
            const active = s.key === sort;
            return (
              <TouchableOpacity
                key={s.key}
                onPress={() => setSort(s.key)}
                style={[styles.sortChip, active && styles.sortChipActive]}
                activeOpacity={0.9}
              >
                <Text style={[styles.sortText, active && styles.sortTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 지역칩 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 8, paddingTop: 2 , paddingBottom: 6 }}
          style={{ marginTop: 4 }}
        >
          {REGIONS.map((r) => {
            const active = r === region;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => setRegion(r)}
                style={[styles.regionChip, active && styles.regionChipActive]}
                activeOpacity={0.9}
              >
                <Text style={[styles.regionText, active && styles.regionTextActive]}>
                  {r}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 리스트 */}
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  safe: { flex: 1 },

  searchBar: {
    marginTop: 8,
    marginHorizontal: 12,
    backgroundColor: "#eef5f7",
    height: 40,
    borderRadius: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  searchHint: { color: "#9aa7b3", flex: 1 },

  sortChip: {
    paddingHorizontal: 14,
    height: 36,
    backgroundColor: "#f0f4f6",
    borderRadius: 18,
    marginHorizontal: 6,
    marginBottom: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  sortChipActive: { backgroundColor: "#e6f3f6", borderWidth: 1.5, borderColor: "#c5e6ee" },
  sortText: { color: "#6b7b86", fontWeight: "600" },
  sortTextActive: { color: "#1f7a8c" },

  regionChip: {
    paddingHorizontal: 12,
    height: 34,
    backgroundColor: "#f7fafb",
    borderRadius: 16,
    marginHorizontal: 6,
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
    backgroundColor: "#e9f9ff",
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
