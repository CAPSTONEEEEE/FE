// screens/MarketScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import TopBackBar from '../components/TopBackBar';

const Stack = createNativeStackNavigator();

const PRODUCTS = [
  {
    id: 'rice',
    name: '함평 나비쌀 5kg',
    price: 23000,
    rating: 4.7,
    seller: '함평농가 협동조합',
    location: '전남 함평',
    image: 'https://images.unsplash.com/photo-1604908554007-87f8b1864fbb?q=80&w=1200&auto=format&fit=crop',
    desc: '갓 도정한 햅쌀의 포슬포슬한 식감과 고소한 향. 산지 직배송.',
    shipping: '로젠택배 / 2~3일 / 3,000원',
    options: ['5kg', '10kg'],
  },
  {
    id: 'honey',
    name: '영월 토종꿀 500g',
    price: 28000,
    rating: 4.8,
    seller: '영월 농가직판',
    location: '강원 영월',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
    desc: '화학첨가물 없는 100% 순수 토종꿀. 진한 향과 풍미.',
    shipping: 'CJ대한통운 / 1~2일 / 3,000원',
    options: ['500g', '1kg'],
  },
  {
    id: 'citrus',
    name: '제주 감귤청 1L',
    price: 15000,
    rating: 4.6,
    seller: '제주 농가',
    location: '제주 서귀포',
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5f?q=80&w=1200&auto=format&fit=crop',
    desc: '제주 감귤로 만든 달콤 상큼한 수제 과일청.',
    shipping: '우체국택배 / 2~3일 / 3,500원',
    options: ['1L'],
  },
];

const getImageSource = (img) => (typeof img === 'string' ? { uri: img } : img);

function MarketHome({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ProductDetail', { product: item })}>
      <Image source={getImageSource(item.image)} style={styles.thumbnail} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <View style={styles.row}>
          <Ionicons name="star" color="#f5a623" size={14} />
          <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.seller} numberOfLines={1}>{item.seller}</Text>
        </View>
        <Text style={styles.price}>{item.price.toLocaleString()}원</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.page}>
      {/* ✅ 상단바: 타이틀 중앙 + 오른쪽 찜 버튼 고정 */}
      <TopBackBar
        title="로컬 마켓"
        right={
          <TouchableOpacity
            onPress={() => navigation.navigate('찜')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="heart-outline" size={22} color="#ff4d6d" />
          </TouchableOpacity>
        }
      />

      {/* ✅ 리스트(스크롤 영역) */}
      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 16 }}
      />
    </View>
  );
}

function ProductDetail({ route, navigation }) {
  const { product } = route.params;

  return (
    <View style={styles.page}>
      {/* ✅ 상단바: 타이틀 중앙 + 오른쪽 찜 버튼 고정 */}
      <TopBackBar
        title="상품 상세"
        right={
          <TouchableOpacity
            onPress={() => navigation.navigate('찜')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="heart-outline" size={22} color="#ff4d6d" />
          </TouchableOpacity>
        }
      />

      {/* ✅ 스크롤 영역 */}
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        <Image source={getImageSource(product.image)} style={styles.hero} />
        <View style={{ padding: 16 }}>
          <Text style={styles.detailName}>{product.name}</Text>
          <View style={styles.row}>
            <Ionicons name="star" color="#f5a623" size={16} />
            <Text style={styles.rating}>{product.rating.toFixed(1)}</Text>
            <Text style={styles.dot}>·</Text>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.location}>{product.location}</Text>
          </View>

          <Text style={styles.detailPrice}>{product.price.toLocaleString()}원</Text>

          <Text style={styles.sectionTitle}>상품 설명</Text>
          <Text style={styles.p}>{product.desc}</Text>

          <Text style={styles.sectionTitle}>옵션</Text>
          <View style={styles.optionsWrap}>
            {product.options.map((op) => (
              <View key={op} style={styles.pill}><Text style={styles.pillText}>{op}</Text></View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>배송정보</Text>
          <Text style={styles.p}>{product.shipping}</Text>

          <Text style={styles.sectionTitle}>판매자</Text>
          <Text style={styles.p}>{product.seller}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

export default function MarketScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MarketHome" component={MarketHome} />
      <Stack.Screen name="ProductDetail" component={ProductDetail} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  card: {
    flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderRadius: 10, padding: 10,
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#eee',
  },
  thumbnail: { width: 84, height: 84, borderRadius: 8, backgroundColor: '#f2f2f2', resizeMode: 'cover' },
  name: { fontWeight: '700', fontSize: 15, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rating: { color: '#333', fontWeight: '600' },
  dot: { color: '#aaa' },
  seller: { color: '#666', flexShrink: 1, maxWidth: 160 },
  price: { marginTop: 6, fontWeight: '800', color: '#1f6feb' },
  hero: { width: '100%', height: 260, backgroundColor: '#eee', resizeMode: 'cover' },
  detailName: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  location: { color: '#444' },
  detailPrice: { fontSize: 20, fontWeight: '900', color: '#1f6feb', marginVertical: 8 },
  sectionTitle: { marginTop: 12, fontWeight: '700' },
  p: { marginTop: 6, color: '#555', lineHeight: 20 },
  optionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  pill: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#eef3ff', borderRadius: 999 },
  pillText: { color: '#1f6feb', fontWeight: '700' },
});
