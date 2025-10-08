// screens/MarketScreen/ProductDetailScreen.js
import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";

// 상세용 더미 데이터
const PRODUCT_MAP = {
  rice: {
    id: "rice",
    title: "함평 고을농장",
    productName: "[친환경] 함평 나비쌀 10kg",
    region: "전라",
    location: "전라남도 함평군 학교면 나비로 123",
    rating: 4.3,
    likes: 128,
    price: 32000,
    sellerNote:
      "30년 농사 경험을 담았습니다. 매일 우리 가족이 먹는 마음으로 정성껏 짓는 쌀이에요.",
    images: [
      "https://images.unsplash.com/photo-1514511547117-f9c36e3f2f5b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579783901897-0f3f7106f27d?q=80&w=1200&auto=format&fit=crop",
    ],
    summary:
      "청정한 함평 들녘에서 재배한 고품질 쌀! 햇살 가득한 자연 속에서 자란 함평 나비쌀은 찰기, 윤기, 풍미 모두 뛰어나 밥맛이 탁월합니다. 친환경 무농약 인증을 받은 농지에서 생산되어, 아이부터 어르신까지 안심하고 드실 수 있는 건강한 쌀입니다.",
    specs: [
      { k: "품종", v: "일품" },
      { k: "재배 방식", v: "친환경 저농약" },
      { k: "수확 시기", v: "2025년 10월" },
      { k: "용량", v: "10kg / 5kg 옵션 선택 가능" },
    ],
    delivery: [
      "전국 택배 배송 (2~3일 소요)",
      "제주/도서산간 지역 추가 배송비 있음",
    ],
  },
  honey: {
    id: "honey",
    title: "영월 봉방",
    productName: "영월 토종꿀 2병",
    region: "강원",
    location: "강원도 영월군",
    rating: 4.1,
    likes: 108,
    price: 28000,
    sellerNote: "자연 그대로의 진한 향과 맛을 담았습니다.",
    images: [
      "https://images.unsplash.com/photo-1505577058444-a3dab90d4253?q=80&w=1200&auto=format&fit=crop",
    ],
    summary:
      "깨끗한 산간에서 채밀한 100% 자연 토종꿀. 향이 진하고 향균 성분이 풍부하여 선물용으로도 인기가 높습니다.",
    specs: [
      { k: "구성", v: "500g × 2병" },
      { k: "원산지", v: "국내산" },
    ],
    delivery: ["전국 택배 배송", "여름철 아이스팩 동봉"],
  },
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const item = useMemo(() => PRODUCT_MAP[id], [id]);
  const router = useRouter();
  const navigation = useNavigation();

  // ✅ 기본 Stack 헤더 숨김(중복 방지)
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>상품 정보를 찾을 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["left", "right", "top", "bottom"]}>
        {/* 커스텀 헤더 */}
        <View style={styles.customHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={26} color="#0f3c45" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>상품 상세</Text>
          <View style={{ width: 30 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
          {/* 이미지 가로 스크롤 */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ height: 230, backgroundColor: "#f1f7fa" }}
          >
            {item.images.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.heroImage} />
            ))}
          </ScrollView>

          {/* 상단 타이틀/주소 */}
          <View style={styles.block}>
            <Text style={styles.shopTitle}>{item.title}</Text>
            <Text style={styles.location}>📍 {item.location}</Text>

            <TouchableOpacity activeOpacity={0.9} style={styles.chatBtn}>
              <Text style={styles.chatText}>채팅하기</Text>
            </TouchableOpacity>
          </View>

          {/* 상품명 박스 */}
          <View style={[styles.card, { marginTop: 10 }]}>
            <Text style={styles.productName}>{item.productName}</Text>

            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <View style={styles.metaRow}>
                <Ionicons name="star" size={16} color="#1f7a8c" />
                <Text style={styles.metaText}>{item.rating.toFixed(1)}</Text>
              </View>
              <View style={[styles.metaRow, { marginLeft: 12 }]}>
                <Ionicons name="heart" size={16} color="#1f7a8c" />
                <Text style={styles.metaText}>{item.likes}</Text>
              </View>
            </View>
          </View>

          {/* 설명 박스 */}
          <View style={[styles.card, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>🧾 상품 설명</Text>
            <Text style={styles.paragraph}>{item.summary}</Text>

            <View style={{ marginTop: 10, gap: 6 }}>
              {item.specs.map((s, i) => (
                <Text key={i} style={styles.bullet}>
                  • <Text style={{ fontWeight: "700" }}>{s.k}</Text>: {s.v}
                </Text>
              ))}
            </View>
          </View>

          {/* 판매가 / 배송 정보 */}
          <View style={[styles.card, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>💬 가게 사장님 한마디</Text>
            <Text style={[styles.paragraph, { fontStyle: "italic" }]}>
              “{item.sellerNote}”
            </Text>
          </View>

          <View style={[styles.card, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>🪙 판매가</Text>
            <Text style={[styles.paragraph, { fontWeight: "700" }]}>
              ₩{item.price.toLocaleString()}{" "}
              <Text style={{ fontWeight: "400" }}>(배송비 무료)</Text>
            </Text>
          </View>

          <View style={[styles.card, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>🚚 배송 정보</Text>
            {item.delivery.map((d, i) => (
              <Text key={i} style={styles.paragraph}>
                • {d}
              </Text>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  safe: { flex: 1 },

  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e3e9ec",
    backgroundColor: "#fff",
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#0f3c45" },

  heroImage: { width: 360, height: 230, resizeMode: "cover" },

  block: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e6eef2",
  },
  shopTitle: { fontSize: 28, fontWeight: "900", color: "#0f3c45" },
  location: { marginTop: 6, color: "#3f5c66" },

  chatBtn: {
    alignSelf: "flex-end",
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#e8f5f8",
  },
  chatText: { color: "#0f6b7a", fontWeight: "800" },

  card: {
    marginHorizontal: 14,
    backgroundColor: "#e9f9ff",
    borderRadius: 16,
    padding: 14,
  },
  productName: { fontSize: 20, fontWeight: "900", color: "#0f3c45" },

  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#0f3c45" },
  paragraph: { marginTop: 6, lineHeight: 21, color: "#455e68" },
  bullet: { color: "#455e68" },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: "#0f3c45", fontWeight: "800" },
});
