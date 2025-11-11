// screens/MarketScreen/ProductCreateScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "../../src/config/api";

export default function ProductCreateScreen() {
  const router = useRouter();

  // ✅ BE 요구 필드 (최소): name, price, market_id
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [marketId, setMarketId] = useState(""); // 숫자 문자열로 입력

  // 선택 필드(있으면 BE가 받아 저장): summary, description, stock, unit, category_id, region_id
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("0");
  const [unit, setUnit] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [regionId, setRegionId] = useState("");

  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    // 권한 요청
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "앨범 접근 권한이 필요합니다.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets?.[0] ?? null);
    }
  };

  const submit = async () => {
    // 필수값 검증
    if (!name.trim()) return Alert.alert("확인", "상품명을 입력하세요.");
    if (!price || isNaN(Number(price))) return Alert.alert("확인", "가격을 숫자로 입력하세요.");
    if (!marketId || isNaN(Number(marketId))) return Alert.alert("확인", "market_id를 숫자로 입력하세요.");

    try {
      setSubmitting(true);

      const fd = new FormData();
      // ⚠️ 폼 데이터는 문자열로 전송 (서버에서 형 변환)
      fd.append("name", String(name).trim());
      fd.append("price", String(price));            // float
      fd.append("market_id", String(marketId));     // int

      if (summary.trim()) fd.append("summary", summary);
      if (description.trim()) fd.append("description", description);
      if (stock && !isNaN(Number(stock))) fd.append("stock", String(stock)); // int
      if (unit.trim()) fd.append("unit", unit);
      if (categoryId && !isNaN(Number(categoryId))) fd.append("category_id", String(categoryId));
      if (regionId && !isNaN(Number(regionId))) fd.append("region_id", String(regionId));

      if (image?.uri) {
        // filename/type 보정
        const guessedName =
          image.fileName ||
          (image.uri.split("/").pop() || `upload_${Date.now()}.jpg`);
        // Android는 mimeType이 없는 경우가 있어 기본값 설정
        const guessedType = image.mimeType || "image/jpeg";

        fd.append("image", {
          uri: image.uri,
          name: guessedName,
          type: guessedType,
        });
      }

      // ✅ Content-Type은 직접 지정하지 말 것(브라우저/네이티브가 boundary 포함 헤더 자동 설정)
      const res = await fetch(`${API_BASE_URL}/markets/products`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "상품 등록 실패");
      }

      const data = await res.json();
      Alert.alert("완료", `상품이 등록되었습니다. (#${data.id})`);
      // 필요 시 상세 화면으로 이동
      // router.push(`/market/product/${data.id}`);
      router.back();
    } catch (err) {
      Alert.alert("에러", err?.message ?? "등록 중 문제가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>상품 등록</Text>

        {/* 이미지 선택 미리보기 */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.85}>
          {image?.uri ? (
            <Image source={{ uri: image.uri }} style={styles.preview} />
          ) : (
            <Text style={{ color: "#4d7983" }}>이미지 선택하기</Text>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="상품명 (name)*"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="가격 (price)*"
          value={price}
          keyboardType="numeric"
          onChangeText={setPrice}
        />
        <TextInput
          style={styles.input}
          placeholder="마켓 ID (market_id)*"
          value={marketId}
          keyboardType="numeric"
          onChangeText={setMarketId}
        />

        <TextInput
          style={styles.input}
          placeholder="요약 (summary)"
          value={summary}
          onChangeText={setSummary}
        />
        <TextInput
          style={[styles.input, { height: 96 }]}
          placeholder="설명 (description)"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <View style={styles.twoCols}>
          <TextInput
            style={[styles.input, styles.col]}
            placeholder="재고 (stock)"
            value={stock}
            keyboardType="numeric"
            onChangeText={setStock}
          />
          <TextInput
            style={[styles.input, styles.col]}
            placeholder="단위 (unit) (예: 개, 박스)"
            value={unit}
            onChangeText={setUnit}
          />
        </View>
        <View style={styles.twoCols}>
          <TextInput
            style={[styles.input, styles.col]}
            placeholder="카테고리 ID (category_id)"
            value={categoryId}
            keyboardType="numeric"
            onChangeText={setCategoryId}
          />
          <TextInput
            style={[styles.input, styles.col]}
            placeholder="지역 ID (region_id)"
            value={regionId}
            keyboardType="numeric"
            onChangeText={setRegionId}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
          onPress={submit}
          disabled={submitting}
          activeOpacity={0.9}
        >
          <Text style={styles.submitText}>{submitting ? "등록 중..." : "상품 등록"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: "900", color: "#0f3c45", marginBottom: 10 },
  imagePicker: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d6e6ea",
    backgroundColor: "#f3fafc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  preview: { width: "100%", height: "100%", resizeMode: "cover" },
  input: {
    borderWidth: 1,
    borderColor: "#d6e6ea",
    backgroundColor: "#f8fdff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  twoCols: { flexDirection: "row", gap: 10 },
  col: { flex: 1 },
  submitBtn: {
    marginTop: 8,
    backgroundColor: "#0f6b7a",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});
