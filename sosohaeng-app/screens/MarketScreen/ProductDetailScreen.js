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
import { API_BASE_URL } from "../../src/config/api";
import useFavoritesStore from "../stores/favoritesStore";

export default function ProductDetailScreen(props) {
  const params = useLocalSearchParams();
  const id = useMemo(
    () => String(params?.id ?? props?.productId ?? props?.route?.params?.id ?? ""),

    [params?.id, props?.productId, props?.route?.params?.id]
  );

  const [item, setItem] = useState(null);
  const [fetching, setFetching] = useState(true);


  const { isFavorite, toggleFavorite, likeDelta, upsertItem } = useFavoritesStore();
  const liked = isFavorite(id);
  const delta = likeDelta[id] ?? 0;

  useEffect(() => {
    if (!id) return;
    let alive = true;

    (async () => {
      try {
        setFetching(true);

        // 1) 상세 전용 JSON
        const dRes = await fetch(`${API_BASE_URL}/mock_data/mock_productdetails.json`);
        const dJson = await dRes.json();
        const asMap = !Array.isArray(dJson) ? dJson : null;
        const asArr = Array.isArray(dJson) ? dJson : null;
        let detail =
          (asMap && asMap[id]) ||
          (asArr && asArr.find((o) => String(o.id) === String(id)));

        // 2) 없으면 목록에서 보강
        if (!detail) {
          const mRes = await fetch(`${API_BASE_URL}/mock_data/mock_markets.json`);
          const mJson = await mRes.json();
          const list = Array.isArray(mJson) ? mJson : (mJson.items ?? []);
          const found =
            list.find((p) => String(p.id) === String(id)) ||
            list.find((p) => String(p.slug ?? p.code ?? p.key) === String(id)) ||
            list.find((p) => String(p.name) === String(id));

          if (found) {
            detail = {
              id: String(found.id ?? id),
              title: found.title ?? found.seller ?? "로컬 스토어",
              productName: found.productName ?? found.title ?? "상품",
              region: found.region ?? "",
              location: found.location ?? "",
              rating: Number(found.rating ?? 4.2),
              likes: Number(found.likes ?? 0),
              price: Number(found.price ?? 0),
              sellerNote: found.sellerNote ?? found.description ?? "",
              images: Array.isArray(found.images) ? found.images : [found.image].filter(Boolean),
              summary: found.summary ?? found.desc ?? "",

              specs: Array.isArray(found.specs) ? found.specs : [],
              delivery: Array.isArray(found.delivery) ? found.delivery : ["전국 택배 배송"],
            };
          }
        }

        if (alive) {
          setItem(detail ?? null);
          if (detail) {
            upsertItem({
              id: detail.id,
              title: detail.productName ?? detail.title,
              image: detail.images?.[0],
              location: detail.location ?? "",
              price: Number(detail.price ?? 0),
              rating: Number(detail.rating ?? 0),
              likes: Number(detail.likes ?? 0),
              region: detail.region ?? "",
            });
          }
        }
      } catch (e) {
        if (alive) setItem(null);
      } finally {
        if (alive) setFetching(false);
      }
    })();

    return () => { alive = false; };
  }, [id, upsertItem]);

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

          <TouchableOpacity
            onPress={() => router.push('/market/wishlist')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="heart" size={22} color="#ff4d6d" />
          </TouchableOpacity>
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

          {/* ✅ 상품명 + 별/하트(빨간 영역으로 이동) */}
          <View style={[styles.card, { marginTop: 10 }]}>
            <Text style={styles.productName}>{item.productName}</Text>

            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <View style={styles.metaRow}>
                <Ionicons name="star" size={16} color="#1f7a8c" />
                <Text style={styles.metaText}>{Number(item.rating ?? 0).toFixed(1)}</Text>
              </View>
              <View style={[styles.metaRow, { marginLeft: 12 }]}>
                <Ionicons name="heart" size={16} color="#1f7a8c" />
                <Text style={styles.metaText}>{likesShown}</Text>
              </View>
            </View>
          </View>

          {/* ✅ 매장명 + 주소 + 채팅/찜 버튼(파란 영역으로 이동) */}
          <View style={[styles.shopBlock, { marginTop: 10 }]}>
            <Text style={styles.shopTitle}>{item.title}</Text>
            {!!item.location && <Text style={styles.location}>📍 {item.location}</Text>}
            <View style={styles.actionRow}>
              <TouchableOpacity activeOpacity={0.9} style={styles.chatBtn}>
                <Text style={styles.chatText}>채팅하기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleFavorite({
                  id: item.id,
                  title: item.productName ?? item.title,
                  image: item.images?.[0],
                  location: item.location,
                  price: Number(item.price ?? 0),
                  rating: Number(item.rating ?? 0),
                  likes: Number(item.likes ?? 0),
                  region: item.region ?? '',
                })}
                style={styles.favToggleBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={liked ? "heart" : "heart-outline"}
                  size={22}
                  color={liked ? "#ff4d6d" : "#0f3c45"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 설명 및 기타 */}
          {!!item.summary && (
            <View style={[styles.card, { marginTop: 10 }]}>
              <Text style={styles.sectionTitle}>🧾 상품 설명</Text>
              <Text style={styles.paragraph}>{item.summary}</Text>
            </View>
          )}
          {!!item.sellerNote && (
            <View style={[styles.card, { marginTop: 10 }]}>
              <Text style={styles.sectionTitle}>💬 가게 사장님 한마디</Text>
              <Text style={[styles.paragraph, { fontStyle: "italic" }]}>“{item.sellerNote}”</Text>
            </View>
          )}
          <View style={[styles.card, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>🪙 판매가</Text>
            <Text style={[styles.paragraph, { fontWeight: "700" }]}>
              ₩{Number(item.price ?? 0).toLocaleString()} <Text style={{ fontWeight: "400" }}>(배송비 무료)</Text>
            </Text>
          </View>
          {!!item.delivery?.length && (
            <View style={[styles.card, { marginTop: 10 }]}>
              <Text style={styles.sectionTitle}>🚚 배송 정보</Text>
              {item.delivery.map((d, i) => (
                <Text key={i} style={styles.paragraph}>• {d}</Text>
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
