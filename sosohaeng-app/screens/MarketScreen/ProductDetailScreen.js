// screens/MarketScreen/ProductDetailScreen.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator, // 로딩 표시기 추가
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { API_BASE_URL, SERVER_ROOT_URL } from "../../src/config/api";
import useFavoritesStore from "../stores/favoritesStore";

export default function ProductDetailScreen(props) {
  const params = useLocalSearchParams();
  // 라우터 파라미터에서 id를 가져옵니다.
  const id = useMemo(
    () => String(params?.id ?? props?.productId ?? props?.route?.params?.id ?? ""),
    [params?.id, props?.productId, props?.route?.params?.id]
  );

  const [item, setItem] = useState(null);
  const [fetching, setFetching] = useState(true);

  // [수정] likeDelta, upsertItem 제거 (이전 단계에서 반영됨)
  const { isFavorite, toggleFavorite } = useFavoritesStore(); 
  // [수정] itemType ('PRODUCT') 추가 (이전 단계에서 반영됨)
  const liked = isFavorite(id, 'PRODUCT'); 

  useEffect(() => {
    if (!id) {
      setFetching(false);
      return;
    }
    let alive = true;

    (async () => {
      try {
        setFetching(true);
        
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const detail = await res.json(); 

        // ▼▼▼ [핵심 수정] ▼▼▼
        // image_url이 http로 시작하는지 확인하는 로직 추가
        const validImages = (detail.images && detail.images.length > 0)
          ? detail.images
              // 1. img 객체와 image_url이 유효한지 확인
              .filter(img => img && img.image_url && String(img.image_url).trim()) 
              .map(img => {
                const url = String(img.image_url).trim();
                
                // 2. 이미 http:// 또는 https://로 시작하는 완전한 URL인 경우 (postimages 등)
                if (url.startsWith('http://') || url.startsWith('https://')) {
                  return url; // 그대로 사용
                }
                
                // 3. 상대 경로인 경우 (/static/uploads/...) SERVER_ROOT_URL을 붙여줌
                // (주의: SERVER_ROOT_URL이 null이나 undefined가 아니어야 함)
                return `${SERVER_ROOT_URL || ''}${url}`;
              })
          : [];
        // ▲▲▲ [핵심 수정] ▲▲▲

        // [디버깅] 생성된 이미지 URL 배열을 콘솔에 출력
        console.log("✅ 상세페이지 이미지 URL:", validImages);

        const mappedItem = {
          id: String(detail.id),
          title: detail.shop_name || detail.title || "로컬 스토어", 
          productName: detail.title || "상품", 
          region: detail.region || "",
          location: detail.location || "",
          rating: Number(detail.rating ?? 0),
          likes: Number(detail.likes ?? 0),
          price: Number(detail.price ?? 0),
          sellerNote: detail.seller_note || "",
          images: validImages, // ✅ 수정된 배열 사용
          summary: detail.summary || "",
          delivery: [detail.delivery_info].filter(Boolean) 
        };

        if (alive) {
          setItem(mappedItem);
          // [수정] upsertItem 호출 블록 제거 (이전 단계에서 반영됨)
        }
      } catch (e) {
        console.error("상품 상세정보 불러오기 실패:", e);
        if (alive) setItem(null);
      } finally {
        if (alive) setFetching(false);
      }
    })();
    return () => { alive = false; };
  }, [id]); // [수정] upsertItem 의존성 제거 (이전 단계에서 반영됨)

  const router = useRouter();
  const navigation = useNavigation();
  
  // 헤더 숨기기
  useEffect(() => { navigation.setOptions({ headerShown: false }); }, [navigation]);

  // --- 로딩 중 ---
  if (fetching && !item) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
        <Text style={{marginTop: 8}}>불러오는 중…</Text>
      </SafeAreaView>
    );
  }

  // --- 정보 없음 ---
  if (!id || (!item && !fetching)) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>상품 정보를 찾을 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  // [수정] delta 제거 (이전 단계에서 반영됨)
  const likesShown = Number(item.likes ?? 0); 
  
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["left", "right", "top", "bottom"]}>
        {/* 헤더 */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
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

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {/* 이미지 */}
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
                <View key={idx} style={[styles.heroImage, { backgroundColor: "#e6eef2", alignItems: 'center', justifyContent: 'center' }]} >
                  <Text style={{color: '#888'}}>이미지 없음</Text>
                </View>
              )
            )}
          </ScrollView>

          {/* 상품명 + 별/하트 */}
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

          {/* 매장명 + 주소 + 문의/찜 버튼 */}
          <View style={[styles.shopBlock, { marginTop: 10 }]}>
            <Text style={styles.shopTitle}>{item.title}</Text>
            {!!item.location && <Text style={styles.location}>📍 {item.location}</Text>}
            <View style={styles.actionRow}>
              {/* Q&A 화면으로 이동 (ProductQnAScreen.js) */}
              <TouchableOpacity 
                activeOpacity={0.9} 
                style={styles.chatBtn}
                onPress={() => router.push({
                    pathname: '/market/product/[id]/qna',
                    params: { id: item.id, title: item.productName }
                })}
              >
                <Text style={styles.chatText}>문의하기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleFavorite(
                  // [수정] 스토어 통합 규격에 맞게 객체 전달 (이전 단계에서 반영됨)
                  {
                    id: item.id,
                    title: item.productName, // 스토어는 'title' 사용
                    image_url: item.images?.[0] || null, // 스토어는 'image_url' 사용
                    
                    location: item.location,
                    price: Number(item.price ?? 0),
                    rating: Number(item.rating ?? 0),
                    likes: Number(item.likes ?? 0),
                    region: item.region ?? '',
                  },
                  'PRODUCT' // [수정] 2번째 인자로 itemType ('PRODUCT') 전달 (이전 단계에서 반영됨)
                )}
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
              ₩{Number(item.price ?? 0).toLocaleString()} 
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

// 기존 스타일 (styles)
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

  // 매장 블록
  shopBlock: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e6eef2",
  },
  shopTitle: { fontSize: 24, fontWeight: "900", color: "#0f3c45" },
  location: { marginTop: 4, color: "#3f5c66" },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  chatBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#e8f5f8",
  },
  chatText: { color: "#0f6b7a", fontWeight: "800" },
  favToggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#f2f6f8",
  },

  // 상품 정보 블록
  card: {
    marginHorizontal: 14,
    backgroundColor: "#e9f9ff",
    borderRadius: 16,
    padding: 14,
  },
  productName: { fontSize: 20, fontWeight: "900", color: "#0f3c45" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: "#0f3c45", fontWeight: "800" },

  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#0f3c45" },
  paragraph: { marginTop: 6, lineHeight: 21, color: "#455e68" },
});