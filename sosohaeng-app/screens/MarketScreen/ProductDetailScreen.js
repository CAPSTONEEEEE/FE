// screens/MarketScreen/ProductDetailScreen.js
import React, { useEffect, useMemo, useState } from "react";
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
import { API_BASE_URL } from "../../src/config/api"; // ✅ 외부 JSON 경로 계산에 사용

export default function ProductDetailScreen(props) {
  // ✅ id를 다경로로 안전하게 수신
  const params = useLocalSearchParams();
  const id = useMemo(
    () =>
      String(
        params?.id ?? props?.productId ?? props?.route?.params?.id ?? ""
      ),
    [params?.id, props?.productId, props?.route?.params?.id]
  );

  const [item, setItem] = useState(null);
  const [fetching, setFetching] = useState(true);

  // ✅ 상세 JSON(mock_productdetails.json) → 없으면 mock_markets.json에서 보강
  useEffect(() => {
    if (!id) return;
    let isActive = true;

    (async () => {
      try {
        setFetching(true);

        // 1) 상세 전용 JSON에서 먼저 찾기 (id-keyed object 또는 배열 둘 다 지원)
        const dRes = await fetch(`${API_BASE_URL}/mock_data/mock_productdetails.json`);
        const dJson = await dRes.json();
        const asMap = !Array.isArray(dJson) ? dJson : null;
        const asArr = Array.isArray(dJson) ? dJson : null;

        let detail =
          (asMap && asMap[id]) ||
          (asArr && asArr.find((o) => String(o.id) === String(id)));

        // 2) 못 찾으면 mock_markets.json에서 최소 필드로 정규화
        if (!detail) {
          const mRes = await fetch(`${API_BASE_URL}/mock_data/mock_markets.json`);
          const mJson = await mRes.json();
          const items = mJson.items ?? mJson;
          const found =
            items.find((p) => String(p.id) === String(id)) ||
            items.find((p) => String(p.slug ?? p.code ?? p.key) === String(id)) ||
            items.find((p) => String(p.name) === String(id));

          if (found) {
            detail = {
              id: String(found.id ?? id),
              title: found.title ?? found.seller ?? found.shop ?? found.market ?? "로컬 스토어",
              productName: found.productName ?? found.name ?? found.title ?? "상품",
              region: found.region ?? found.area ?? "",
              location: found.location ?? found.address ?? "",
              rating: Number(found.rating ?? 4.2),
              likes: Number(found.likes ?? found.favs ?? 0),
              price: Number(found.price ?? found.cost ?? 0),
              sellerNote: found.sellerNote ?? found.description ?? "",
              images: Array.isArray(found.images)
                ? found.images
                : [found.image].filter(Boolean),
              summary: found.summary ?? found.description ?? "",
              specs: Array.isArray(found.specs) ? found.specs : [],
              delivery: Array.isArray(found.delivery) ? found.delivery : ["전국 택배 배송"],
            };
          }
        }

        if (isActive) setItem(detail ?? null);
      } catch (e) {
        if (isActive) setItem(null);
      } finally {
        if (isActive) setFetching(false);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [id]);

  const router = useRouter();
  const navigation = useNavigation();

  // ✅ 기본 Stack 헤더 숨김(중복 방지)
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  if (!id || (!item && !fetching)) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>상품 정보를 찾을 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  if (fetching && !item) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>불러오는 중…</Text>
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
            {(item?.images?.length ? item.images : [null]).map((uri, idx) =>
              uri ? (
                <Image key={idx} source={{ uri }} style={styles.heroImage} />
              ) : (
                <View key={idx} style={[styles.heroImage, { backgroundColor: "#e6eef2" }]} />
              )
            )}
          </ScrollView>

          {/* 상단 타이틀/주소 */}
          <View style={styles.block}>
            <Text style={styles.shopTitle}>{item.title}</Text>
            {!!item.location && <Text style={styles.location}>📍 {item.location}</Text>}

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
                <Text style={styles.metaText}>
                  {(item.rating ?? 0).toFixed ? item.rating.toFixed(1) : Number(item.rating).toFixed(1)}
                </Text>
              </View>
              <View style={[styles.metaRow, { marginLeft: 12 }]}>
                <Ionicons name="heart" size={16} color="#1f7a8c" />
                <Text style={styles.metaText}>{item.likes ?? 0}</Text>
              </View>
            </View>
          </View>

          {/* 설명 박스 */}
          <View style={[styles.card, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>🧾 상품 설명</Text>
            {!!item.summary && <Text style={styles.paragraph}>{item.summary}</Text>}

            {!!item.specs?.length && (
              <View style={{ marginTop: 10, gap: 6 }}>
                {item.specs.map((s, i) => (
                  <Text key={i} style={styles.bullet}>
                    • <Text style={{ fontWeight: "700" }}>{s.k}</Text>: {s.v}
                  </Text>
                ))}
              </View>
            )}
          </View>

          {/* 판매가 / 배송 정보 */}
          {!!item.sellerNote && (
            <View style={[styles.card, { marginTop: 10 }]}>
              <Text style={styles.sectionTitle}>💬 가게 사장님 한마디</Text>
              <Text style={[styles.paragraph, { fontStyle: "italic" }]}>
                “{item.sellerNote}”
              </Text>
            </View>
          )}

          <View style={[styles.card, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>🪙 판매가</Text>
            <Text style={[styles.paragraph, { fontWeight: "700" }]}>
              ₩{Number(item.price ?? 0).toLocaleString()}{" "}
              <Text style={{ fontWeight: "400" }}>(배송비 무료)</Text>
            </Text>
          </View>

          {!!item.delivery?.length && (
            <View style={[styles.card, { marginTop: 10 }]}>
              <Text style={styles.sectionTitle}>🚚 배송 정보</Text>
              {item.delivery.map((d, i) => (
                <Text key={i} style={styles.paragraph}>
                  • {d}
                </Text>
              ))}
            </View>
          )}
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
