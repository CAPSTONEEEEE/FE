// screens/MarketScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TopBackBar from '../components/TopBackBar';

// ✅ 전역 찜 스토어 (경로 유지: screens/FavoritesStore.js)
//   만약 /stores/favoritesStore.js 로 옮겼다면 아래 임포트 경로만 바꿔줘.
import { subscribe, isFavorite, toggleFavorite } from './stores/favoritesStore';

const Stack = createNativeStackNavigator();

/* ----------------------- Mock Data ----------------------- */
const PRODUCTS = [
  {
    id: 'rice',
    name: '함평 나비쌀',
    price: 23000,
    rating: 4.7,
    reviews: 321,
    createdAt: '2024-11-01',
    seller: '함평농가 협동조합',
    location: '전남 함평',
    image:
      'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FcU9tOf%2FbtsPL1QhjXG%2FAAAAAAAAAAAAAAAAAAAAAGR3ao7I3LQ-zScvbfHnllofvahOgEDzKJ908NLDdFiJ%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1756652399%26allow_ip%3D%26allow_referer%3D%26signature%3DfKhhMAFwi%252BAUJia2SSzFLzBj8tE%253D',
    desc: '함평의 청정 자연에서 자란 고품질 쌀.',
    shipping: '로젠택배 / 2~3일 / 3,000원',
    options: ['5kg', '10kg'],
  },
  {
    id: 'honey',
    name: '영월 토종꿀 500g',
    price: 28000,
    rating: 4.8,
    reviews: 812,
    createdAt: '2025-01-15',
    seller: '영월 농가직판',
    location: '강원 영월',
    image:
      'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fbp7xJC%2FbtsPMTEbeCo%2FAAAAAAAAAAAAAAAAAAAAAD949H71MXb5uhsvB7sDmwLT6H70RvdCj2Qpdp-eTHqV%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1756652399%26allow_ip%3D%26allow_referer%3D%26signature%3D6NZzfQ4bwYbQg9NctnrkLYFQ%252B7Q%253D',
    desc: '자연 숙성 토종꿀.',
    shipping: 'CJ대한통운 / 1~2일 / 3,000원',
    options: ['500g', '1kg'],
  },
  {
    id: 'citrus',
    name: '제주 감귤청 1L',
    price: 15000,
    rating: 4.6,
    reviews: 109,
    createdAt: '2024-12-10',
    seller: '제주 농가',
    location: '제주 서귀포',
    image:
      'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2F1n6oC%2FbtsPNiXY5nU%2FAAAAAAAAAAAAAAAAAAAAACMLvszx_0F83znqiBuuq-jWdTRFY6e19DJBojOul2YG%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1756652399%26allow_ip%3D%26allow_referer%3D%26signature%3D7dJ8l3qu%252B2URo5MtSTCdoZD0YWc%253D',
    desc: '상큼 달콤 천연 감귤청.',
    shipping: '우체국택배 / 2~3일 / 3,500원',
    options: ['1L'],
  },
];

const CATEGORY = 'market';
const getImageSource = (img) => (typeof img === 'string' ? { uri: img } : img);
const uniqLocations = [...new Set(PRODUCTS.map((p) => p.location))].sort();
const priceMinAll = Math.min(...PRODUCTS.map((p) => p.price));
const priceMaxAll = Math.max(...PRODUCTS.map((p) => p.price));

const SORTS = [
  { key: 'recommend', label: '추천순' },
  { key: 'popular', label: '인기순' },     // reviews DESC
  { key: 'new', label: '최신순' },         // createdAt DESC
  { key: 'reviews', label: '후기순' },     // reviews DESC
  { key: 'ratingDesc', label: '별점높은순' },
  { key: 'ratingAsc', label: '별점낮은순' },
  { key: 'priceAsc', label: '낮은 가격순' },
  { key: 'priceDesc', label: '높은 가격순' },
];

/* -------------------- helpers -------------------- */
function applyFilter(data, { min, max, locations }) {
  return data.filter((d) => {
    const priceOk = d.price >= min && d.price <= max;
    const locOk = !locations.length || locations.includes(d.location);
    return priceOk && locOk;
  });
}
function applySort(data, sortKey) {
  const arr = [...data];
  switch (sortKey) {
    case 'popular':
    case 'reviews':
      return arr.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    case 'new':
      return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'ratingDesc':
      return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'ratingAsc':
      return arr.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    case 'priceAsc':
      return arr.sort((a, b) => a.price - b.price);
    case 'priceDesc':
      return arr.sort((a, b) => b.price - a.price);
    // 추천순(임시): rating*reviews 가중치
    case 'recommend':
    default:
      return arr.sort(
        (a, b) => (b.rating || 0) * (b.reviews || 0) - (a.rating || 0) * (a.reviews || 0)
      );
  }
}

/* ======================= MarketHome ======================= */
function MarketHome({ navigation }) {
  // 찜 상태 변경에 따른 재그리기
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => subscribe(() => forceUpdate()), []);

  // 필터 상태(적용된 값)
  const [sortKey, setSortKey] = React.useState('recommend');
  const [minPrice, setMinPrice] = React.useState(priceMinAll);
  const [maxPrice, setMaxPrice] = React.useState(priceMaxAll);
  const [selLocations, setSelLocations] = React.useState([]);

  // 모달 & 드래프트 값
  const [open, setOpen] = React.useState(false);
  const [draftSort, setDraftSort] = React.useState(sortKey);
  const [draftMin, setDraftMin] = React.useState(minPrice.toString());
  const [draftMax, setDraftMax] = React.useState(maxPrice.toString());
  const [draftLocs, setDraftLocs] = React.useState(selLocations);

  // ✅ 안전영역 패딩용
  const insets = useSafeAreaInsets();

  const resetDraftFromState = () => {
    setDraftSort(sortKey);
    setDraftMin(String(minPrice));
    setDraftMax(String(maxPrice));
    setDraftLocs(selLocations);
  };
  const openModal = () => {
    resetDraftFromState();
    setOpen(true);
  };
  const applyDraft = () => {
    const min = Math.max(priceMinAll, parseInt(draftMin || `${priceMinAll}`, 10));
    const max = Math.min(priceMaxAll, parseInt(draftMax || `${priceMaxAll}`, 10));
    setSortKey(draftSort);
    setMinPrice(Math.min(min, max));
    setMaxPrice(Math.max(min, max));
    setSelLocations(draftLocs);
    setOpen(false);
  };
  const clearAll = () => {
    setSortKey('recommend');
    setMinPrice(priceMinAll);
    setMaxPrice(priceMaxAll);
    setSelLocations([]);
    resetDraftFromState();
  };

  const filtered = React.useMemo(() => {
    const f = applyFilter(PRODUCTS, { min: minPrice, max: maxPrice, locations: selLocations });
    return applySort(f, sortKey);
  }, [sortKey, minPrice, maxPrice, selLocations]);

  const resultCountIfApply = () => {
    const min = Math.max(priceMinAll, parseInt(draftMin || `${priceMinAll}`, 10));
    const max = Math.min(priceMaxAll, parseInt(draftMax || `${priceMaxAll}`, 10));
    return applyFilter(PRODUCTS, { min: Math.min(min, max), max: Math.max(min, max), locations: draftLocs }).length;
  };

  const onToggleLike = (item) => toggleFavorite(CATEGORY, item.id, item);

  const renderItem = ({ item }) => {
    const liked = isFavorite(CATEGORY, item.id);
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ProductDetail', { product: item })}>
        <Image source={getImageSource(item.image)} style={styles.thumbnail} />
        <View style={{ flex: 1, paddingRight: 30 }}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <View style={styles.row}>
            <Ionicons name="star" color="#f5a623" size={14} />
            <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.seller} numberOfLines={1}>{item.seller}</Text>
          </View>
          <Text style={styles.price}>{item.price.toLocaleString()}원</Text>
        </View>

        {/* 카드 우측 상단 하트 */}
        <TouchableOpacity
          onPress={() => onToggleLike(item)}
          style={styles.itemHeartBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? '#ff4d6d' : '#aaa'} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const sortLabel = SORTS.find((s) => s.key === sortKey)?.label ?? '정렬';

  return (
    <View style={styles.page}>
      <TopBackBar
        title="로컬 마켓"
        right={
          <TouchableOpacity onPress={() => navigation.navigate('찜')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="heart" size={22} color="#ff4d6d" />
          </TouchableOpacity>
        }
      />

      {/* 상단 필터 바 */}
      <View style={styles.filterBar}>
        <Pressable style={styles.filterChip} onPress={openModal}>
          <Ionicons name="funnel-outline" size={16} color="#111" />
          <Text style={styles.filterChipText}>{sortLabel}</Text>
        </Pressable>

        <Pressable style={styles.filterChip} onPress={openModal}>
          <Ionicons name="pricetag-outline" size={16} color="#111" />
          <Text style={styles.filterChipText}>
            {`${minPrice.toLocaleString()}원 ~ ${maxPrice.toLocaleString()}원`}
          </Text>
        </Pressable>

        <Pressable style={styles.filterChip} onPress={openModal}>
          <Ionicons name="location-outline" size={16} color="#111" />
          <Text style={styles.filterChipText}>
            {selLocations.length ? `${selLocations[0]}${selLocations.length > 1 ? ` 외 ${selLocations.length - 1}` : ''}` : '전체 지역'}
          </Text>
        </Pressable>

        <Pressable style={[styles.filterChip, styles.resetChip]} onPress={clearAll}>
          <Text style={[styles.filterChipText, { color: '#1f6feb' }]}>초기화</Text>
        </Pressable>
      </View>

      {/* 리스트 */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 16 }}
      />

      {/* ✅ 안전영역 반영한 필터 모달 */}
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalPage}>
          {/* 헤더 */}
          <View style={[styles.modalHeader, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity onPress={() => setOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#111" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>필터</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* 콘텐츠 */}
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 180 + insets.bottom }}>
            {/* 정렬 */}
            <Text style={styles.sectionLabel}>정렬</Text>
            <View style={styles.grid2}>
              {SORTS.map((s) => {
                const active = draftSort === s.key;
                return (
                  <TouchableOpacity
                    key={s.key}
                    style={[styles.sortBtn, active && styles.sortBtnActive]}
                    onPress={() => setDraftSort(s.key)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.radio, active && styles.radioActive]} />
                    <Text style={[styles.sortLabel, active && styles.sortLabelActive]}>{s.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 가격 */}
            <Text style={[styles.sectionLabel, { marginTop: 18 }]}>가격</Text>
            <View style={styles.priceRow}>
              <View style={styles.priceInputBox}>
                <TextInput
                  value={draftMin}
                  keyboardType="number-pad"
                  onChangeText={setDraftMin}
                  placeholder={`${priceMinAll}`}
                  style={styles.priceInput}
                />
                <Text style={styles.won}>원</Text>
              </View>
              <Text style={{ marginHorizontal: 8, color: '#666' }}>—</Text>
              <View style={styles.priceInputBox}>
                <TextInput
                  value={draftMax}
                  keyboardType="number-pad"
                  onChangeText={setDraftMax}
                  placeholder={`${priceMaxAll}`}
                  style={styles.priceInput}
                />
                <Text style={styles.won}>원</Text>
              </View>
            </View>

            {/* 지역 */}
            <Text style={[styles.sectionLabel, { marginTop: 18 }]}>지역</Text>
            <View style={styles.grid2}>
              {uniqLocations.map((loc) => {
                const active = draftLocs.includes(loc);
                return (
                  <TouchableOpacity
                    key={loc}
                    style={[styles.locBtn, active && styles.locBtnActive]}
                    onPress={() =>
                      setDraftLocs((cur) => (cur.includes(loc) ? cur.filter((l) => l !== loc) : [...cur, loc]))
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.locLabel, active && styles.locLabelActive]}>{loc}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={[styles.locBtn, !draftLocs.length && styles.locBtnActive]}
                onPress={() => setDraftLocs([])}
                activeOpacity={0.8}
              >
                <Text style={[styles.locLabel, !draftLocs.length && styles.locLabelActive]}>전체 지역</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* 하단 고정 버튼 */}
          <View style={[styles.bottomBar, { paddingBottom: 12 + insets.bottom }]}>
            <TouchableOpacity style={styles.resetBtn} onPress={clearAll}>
              <Text style={styles.resetText}>초기화</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={applyDraft} activeOpacity={0.9}>
              <Text style={styles.applyText}>{resultCountIfApply().toLocaleString()}개 결과보기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ======================= ProductDetail ======================= */
function ProductDetail({ route, navigation }) {
  const { product } = route.params;
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => subscribe(() => forceUpdate()), []);

  const liked = isFavorite(CATEGORY, product.id);

  return (
    <View style={styles.page}>
      <TopBackBar
        title="상품 상세"
        right={
          <TouchableOpacity onPress={() => navigation.navigate('찜')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="heart" size={22} color="#ff4d6d" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        <Image source={getImageSource(product.image)} style={styles.hero} />
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.detailName}>{product.name}</Text>
            <TouchableOpacity
              onPress={() => toggleFavorite(CATEGORY, product.id, product)}
              style={{ marginLeft: 10 }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? '#ff4d6d' : '#aaa'} />
            </TouchableOpacity>
          </View>

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
              <View key={op} style={styles.pill}>
                <Text style={styles.pillText}>{op}</Text>
              </View>
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

/* ======================= Navigator ======================= */
export default function MarketScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MarketHome" component={MarketHome} />
      <Stack.Screen name="ProductDetail" component={ProductDetail} />
    </Stack.Navigator>
  );
}

/* ======================= Styles ======================= */
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },

  /* list item */
  card: {
    position: 'relative',
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  itemHeartBtn: { position: 'absolute', top: 8, right: 8 },
  thumbnail: { width: 84, height: 84, borderRadius: 8, backgroundColor: '#f2f2f2', resizeMode: 'cover' },
  name: { fontWeight: '700', fontSize: 15, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rating: { color: '#333', fontWeight: '600' },
  dot: { color: '#aaa' },
  seller: { color: '#666', flexShrink: 1, maxWidth: 160 },
  price: { marginTop: 6, fontWeight: '800', color: '#1f6feb' },

  /* detail */
  hero: { width: '100%', height: 260, backgroundColor: '#eee', resizeMode: 'cover' },
  detailName: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  location: { color: '#444' },
  detailPrice: { fontSize: 20, fontWeight: '900', color: '#1f6feb', marginVertical: 8 },
  sectionTitle: { marginTop: 12, fontWeight: '700' },
  p: { marginTop: 6, color: '#555', lineHeight: 20 },
  optionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  pill: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#eef3ff', borderRadius: 999 },
  pillText: { color: '#1f6feb', fontWeight: '700' },

  /* filter bar */
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  filterChipText: { fontSize: 12.5, color: '#111' },
  resetChip: { borderColor: '#cfe2ff', backgroundColor: '#f5f9ff' },

  /* modal */
  modalPage: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111' },

  sectionLabel: { fontSize: 16, fontWeight: '800', marginBottom: 10, color: '#111' },

  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  sortBtn: {
    flexBasis: '48%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sortBtnActive: { borderColor: '#111' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#c9c9c9' },
  radioActive: { borderColor: '#111', backgroundColor: '#111' },
  sortLabel: { color: '#333', fontWeight: '600' },
  sortLabelActive: { color: '#111' },

  priceRow: { flexDirection: 'row', alignItems: 'center' },
  priceInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  priceInput: { flex: 1, fontSize: 14, padding: 0, color: '#111' },
  won: { fontSize: 13, color: '#666', marginLeft: 6 },

  locBtn: {
    flexBasis: '48%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    alignItems: 'center',
  },
  locBtnActive: { borderColor: '#111', backgroundColor: '#111' },
  locLabel: { color: '#333', fontWeight: '600' },
  locLabelActive: { color: '#fff' },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  resetText: { fontWeight: '700', color: '#111' },
  applyBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: { color: '#fff', fontWeight: '800' },
});