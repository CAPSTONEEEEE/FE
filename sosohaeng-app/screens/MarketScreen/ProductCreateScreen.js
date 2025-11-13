// /screens/MarketScreen/ProductCreateScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Image, Alert, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../../src/config/api';


export default function ProductCreateScreen() {
  const router = useRouter();

  // ---- 권한/프로필 상태 ----
  const [checking, setChecking] = useState(true);
  const [me, setMe] = useState(null); // { id, name, isSeller, businessNumber, sellerStatus }

  // ---- 폼 상태 ----
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState('');
  const [shopName, setShopName] = useState('');
  const [location, setLocation] = useState('');
  const [summary, setSummary] = useState('');
  const [sellerNote, setSellerNote] = useState('');
  const [price, setPrice] = useState('');
  const [delivery, setDelivery] = useState('');

  // 1) 내 정보 조회 (JWT는 실제 앱의 스토리지/컨텍스트에서 읽어 주입)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setChecking(true);
        const r = await fetch(`${API_BASE_URL}/me`, {
          headers: { Authorization: 'Bearer <JWT>' }, // (어차피 더미 함수가 처리)
        });
        if (!r.ok) throw new Error('권한 확인 실패');
        const j = await r.json();
        if (alive) setMe(j);
      } catch (e) {
        if (alive) setMe(null);
      } finally {
        if (alive) setChecking(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const pickImage = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!r.canceled) setImages(prev => [...prev, r.assets[0]]);
  };

  const submit = async () => {
    if (!title || !price) {
      return Alert.alert('필수항목', '상품명과 가격을 입력해주세요.');
    }
    const form = new FormData();
    images.forEach((img, idx) => {
      form.append('images', { uri: img.uri, name: `photo_${idx}.jpg`, type: 'image/jpeg' });
    });
    form.append('title', title);
    form.append('shop_name', shopName);
    form.append('location', location);
    form.append('summary', summary);
    form.append('seller_note', sellerNote);
    form.append('price', Number(price));
    form.append('delivery_info', delivery);

    const r = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { Authorization: 'Bearer <JWT>' },
      body: form,
    });
    if (r.ok) {
      Alert.alert('등록 완료', '상품이 등록되었어요.');
      router.back();
    } else if (r.status === 403) {
      Alert.alert('권한 없음', '판매자(사업자)만 등록할 수 있습니다.');
    } else {
      Alert.alert('등록 실패', '유효성/서버 오류를 확인해주세요.');
    }
  };

  // --- 로딩 화면 ---
  if (checking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: '#556870' }}>권한 확인 중…</Text>
      </View>
    );
  }

  // --- 사업자 아님(또는 미등록)일 때 차단 화면 ---
  if (!me?.isSeller) {
    return (
      <View style={styles.center}>
        <Text style={styles.lockEmoji}>🔒</Text>
        <Text style={styles.lockTitle}>사업자 전용 기능</Text>
        <Text style={styles.lockText}>
          상품 등록은 회원가입 시 사업자등록번호를 인증한 판매자만 이용할 수 있어요.
        </Text>
        <Text style={[styles.lockText, { marginTop: 4 }]}>
          내 상태: {me?.businessNumber ? '심사 중/미승인' : '사업자 미등록'}
        </Text>
        <View style={{ height: 12 }} />
        <TouchableOpacity style={styles.toHomeBtn} onPress={() => router.back()} activeOpacity={0.9}>
          <Text style={styles.toHomeText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- 폼 화면 (사업자) ---
  return (
    <ScrollView contentContainerStyle={{ padding: 14 }}>
      <Text style={styles.pageTitle}>상품 등록</Text>

      <Text style={styles.label}>상품 사진</Text>
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        {images.map((img, i) => (
          <Image key={i} source={{ uri: img.uri }} style={{ width: 88, height: 88, borderRadius: 10 }} />
        ))}
        <TouchableOpacity onPress={pickImage} style={styles.addThumb} activeOpacity={0.9}>
          <Text style={{ fontWeight: '800' }}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>상품명 *</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>가게 이름</Text>
      <TextInput style={styles.input} value={shopName} onChangeText={setShopName} />

      <Text style={styles.label}>가게 위치</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="예: 전남 순천시 ○○로 12" />

      <Text style={styles.label}>상품 설명</Text>
      <TextInput style={[styles.input, { height: 110 }]} multiline value={summary} onChangeText={setSummary} />

      <Text style={styles.label}>가게 사장님 한마디</Text>
      <TextInput style={styles.input} value={sellerNote} onChangeText={setSellerNote} placeholder="예: 매일 아침 수확한 신선한 채소만 판매합니다." />

      <Text style={styles.label}>판매가(원) *</Text>
      <TextInput style={styles.input} keyboardType="number-pad" value={price} onChangeText={setPrice} placeholder="예: 12000" />

      <Text style={styles.label}>배송정보</Text>
      <TextInput
        style={styles.input}
        placeholder="예: 제주/도서산간 별도, 택배 2~3일"
        value={delivery}
        onChangeText={setDelivery}
      />

      <TouchableOpacity style={styles.submit} onPress={submit} activeOpacity={0.9}>
        <Text style={styles.submitText}>상품 등록</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 20, fontWeight: '900', color: '#0f3c45', marginBottom: 8 },

  label: { marginTop: 10, marginBottom: 6, fontWeight: '900', color: '#0f3c45' },
  input: { backgroundColor: '#f3f6f8', borderRadius: 10, padding: 10 },
  addThumb: {
    width: 88, height: 88, borderRadius: 10, borderWidth: 1,
    borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center'
  },
  submit: {
    marginTop: 16, height: 48, borderRadius: 12,
    backgroundColor: '#0f93a6', alignItems: 'center', justifyContent: 'center'
  },
  submitText: { color: '#fff', fontWeight: '900' },

  // 권한 차단 화면
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  lockEmoji: { fontSize: 38, marginBottom: 8 },
  lockTitle: { fontSize: 18, fontWeight: '900', color: '#0f3c45' },
  lockText: { marginTop: 6, color: '#455e68', textAlign: 'center' },
  toHomeBtn: {
    height: 44, paddingHorizontal: 16, borderRadius: 10,
    backgroundColor: '#e8f5f8', alignItems: 'center', justifyContent: 'center'
  },
  toHomeText: { color: '#0f6b7a', fontWeight: '800' },
});
