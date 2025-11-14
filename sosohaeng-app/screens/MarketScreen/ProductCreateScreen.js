// screens/MarketScreen/ProductCreateScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../../src/config/api';
import useAuthStore from '../../src/stores/authStore';

const TAB_BAR_HEIGHT = 76;

export default function ProductCreateScreen() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const insets = useSafeAreaInsets();

  const [checking, setChecking] = useState(true);
  const [me, setMe] = useState(null);

  const [images, setImages] = useState([]);
  const [title, setTitle] = useState('');
  const [shopName, setShopName] = useState('');
  const [location, setLocation] = useState('');
  const [summary, setSummary] = useState('');
  const [sellerNote, setSellerNote] = useState('');
  const [price, setPrice] = useState('');
  const [delivery, setDelivery] = useState('');
  const [region, setRegion] = useState('');

  // ===========================
  // 1) 내 정보 조회
  // ===========================
  useEffect(() => {
    if (!token) {
      setChecking(false);
      setMe(null);
      return;
    }

    let alive = true;
    (async () => {
      try {
        setChecking(true);
        const r = await fetch(`${API_BASE_URL}/auth/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
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

    return () => (alive = false);
  }, [token]);

  // ===========================
  // 이미지 선택
  // ===========================
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '앨범 접근 권한이 필요합니다.');
      return;
    }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!r.canceled) setImages((prev) => [...prev, r.assets[0]]);
  };

  // ===========================
  // 상품 등록
  // ===========================
  const submit = async () => {
    if (!title || !price) {
      return Alert.alert('필수항목', '상품명과 가격을 입력해주세요.');
    }
    if (!region) {
      return Alert.alert('필수 선택', '지역을 선택해주세요.');
    }

    const form = new FormData();
    images.forEach((img, idx) => {
      const ext = img.uri.split('.').pop();
      form.append('images', {
        uri: img.uri,
        name: `photo_${idx}.${ext}`,
        type: `image/${ext}`,
      });
    });

    form.append('title', title);
    form.append('shop_name', shopName);
    form.append('location', location);
    form.append('summary', summary);
    form.append('seller_note', sellerNote);
    form.append('price', Number(price));
    form.append('delivery_info', delivery);
    form.append('region', region);

    const r = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
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

  // ===========================
  // 로딩 화면
  // ===========================
  if (checking) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: '#556870' }}>권한 확인 중…</Text>
      </SafeAreaView>
    );
  }

  // ===========================
  // 사업자가 아닐 때 차단 화면
  // ===========================
  if (!me || !me?.is_business) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.lockEmoji}>🔒</Text>
        <Text style={styles.lockTitle}>사업자 전용 기능</Text>
        <Text style={styles.lockText}>
          {!me
            ? '로그인이 필요합니다.'
            : '상품 등록은 회원가입 시 사업자등록번호를 인증한 판매자만 이용할 수 있어요.'}
        </Text>
        <TouchableOpacity
          style={styles.toHomeBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.toHomeText}>돌아가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ===========================
  // 상품 등록 화면
  // ===========================
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 14,
            paddingTop: 14,
            paddingBottom: insets.bottom + 50,
          }}
        >
          <Text style={styles.pageTitle}>상품 등록</Text>

          {/* ===========================
              상품 이미지
          =========================== */}
          <Text style={styles.label}>상품 사진</Text>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            {images.map((img, i) => (
              <Image
                key={i}
                source={{ uri: img.uri }}
                style={{ width: 88, height: 88, borderRadius: 10 }}
              />
            ))}
            <TouchableOpacity
              onPress={pickImage}
              style={styles.addThumb}
              activeOpacity={0.9}
            >
              <Text style={{ fontWeight: '800' }}>+</Text>
            </TouchableOpacity>
          </View>

          {/* ===========================
              지역 선택
          =========================== */}
          <Text style={styles.label}>지역 *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={region}
              onValueChange={(v) => setRegion(v)}
            >
              <Picker.Item label="지역을 선택하세요" value="" />
              <Picker.Item label="서울" value="서울" />
              <Picker.Item label="경기" value="경기" />
              <Picker.Item label="강원" value="강원" />
              <Picker.Item label="부산" value="부산" />
              <Picker.Item label="대구" value="대구" />
              <Picker.Item label="인천" value="인천" />
              <Picker.Item label="광주" value="광주" />
              <Picker.Item label="대전" value="대전" />
              <Picker.Item label="울산" value="울산" />
              <Picker.Item label="세종" value="세종" />
              <Picker.Item label="충북" value="충북" />
              <Picker.Item label="충남" value="충남" />
              <Picker.Item label="전북" value="전북" />
              <Picker.Item label="전남" value="전남" />
              <Picker.Item label="경북" value="경북" />
              <Picker.Item label="경남" value="경남" />
              <Picker.Item label="제주" value="제주" />
            </Picker>
          </View>

          {/* =========================== */}
          <Text style={styles.label}>상품명 *</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} />

          <Text style={styles.label}>가게 이름</Text>
          <TextInput style={styles.input} value={shopName} onChangeText={setShopName} />

          <Text style={styles.label}>가게 위치</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="예: 전남 순천시 ○○로 ○○길"
          />

          <Text style={styles.label}>상품 설명</Text>
          <TextInput
            style={[styles.input, { height: 110 }]}
            multiline
            value={summary}
            onChangeText={setSummary}
          />

          <Text style={styles.label}>가게 사장님 한마디</Text>
          <TextInput
            style={styles.input}
            value={sellerNote}
            onChangeText={setSellerNote}
            placeholder="예: 매일 아침 수확한 신선한 채소만 판매합니다."
          />

          <Text style={styles.label}>판매가(원) *</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={price}
            onChangeText={setPrice}
            placeholder="예: 12000"
          />

          <Text style={styles.label}>배송정보</Text>
          <TextInput
            style={styles.input}
            value={delivery}
            onChangeText={setDelivery}
            placeholder="예: 제주/도서산간 별도, 택배 2~3일"
          />

          <TouchableOpacity style={styles.submit} onPress={submit}>
            <Text style={styles.submitText}>상품 등록</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f3c45',
    marginBottom: 8,
  },
  label: { marginTop: 10, marginBottom: 6, fontWeight: '900', color: '#0f3c45' },
  input: { backgroundColor: '#f3f6f8', borderRadius: 10, padding: 10 },
  addThumb: {
    width: 88,
    height: 88,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerWrapper: {
    backgroundColor: '#f3f6f8',
    borderRadius: 10,
    marginBottom: 10,
  },
  submit: {
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0f93a6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: '#fff', fontWeight: '900' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  lockEmoji: { fontSize: 38, marginBottom: 8 },
  lockTitle: { fontSize: 18, fontWeight: '900', color: '#0f3c45' },
  lockText: { marginTop: 6, color: '#455e68', textAlign: 'center' },
  toHomeBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#e8f5f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toHomeText: { color: '#0f6b7a', fontWeight: '800' },
});
