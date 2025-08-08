// File: src/features/market/MarketModule.tsx
// Expo + React Navigation 기반. 피그마 캡처를 1:1로 옮긴 로컬 특산물 마켓 파트 모듈입니다.
// 포함 화면: 마켓 홈(리스트) → 상품 상세 → 채팅하기(BOT) → 리뷰 유도, 판매자 주문서 모아보기
// 필요한 라이브러리: react, react-native, @react-navigation/native, @react-navigation/native-stack, @react-navigation/bottom-tabs, @expo/vector-icons

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

/*************************
 * 타입 및 목업 데이터
 *************************/
export type Product = {
  id: string;
  title: string;
  subtitle?: string;
  seller: string;
  region: string;
  rating: number; // 0~5
  likes: number;
  price: number; // 원화
  images: string[]; // require() 또는 URI
  shortDesc: string;
  longDesc: string;
  options?: { label: string; value: string }[];
  shipping: string[];
};

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=1600&auto=format&fit=crop';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'rice-10kg',
    title: '함평 나비쌀',
    subtitle: '전라남도 함평군',
    seller: '함평 고을농장',
    region: '전라남도 함평군',
    rating: 4.3,
    likes: 128,
    price: 32000,
    images: [PLACEHOLDER_IMG],
    shortDesc:
      '함평의 청정 자연에서 자란 고품질 쌀로, 찰기와 윤기가 뛰어나 밥맛이 좋기로 유명합니다. 친환경 재배 방식으로 생산됩니다.',
    longDesc:
      '청정한 함평 들녘에서 재배한 고품질 쌀! 햇살 가득한 자연 속에서 자란 함평 나비쌀은 찰기, 윤기, 풍미 모두 뛰어나 밥맛이 탁월합니다. 친환경 무농약 인증을 받은 농지에서 생산되어, 아이부터 어르신까지 안심하고 드실 수 있는 건강한 쌀입니다.',
    options: [
      { label: '1kg', value: '1kg' },
      { label: '10kg', value: '10kg' },
    ],
    shipping: [
      '전국 택배 배송 (2~3일 소요)',
      '제주/도서산간 지역 추가 배송비 있음',
    ],
  },
  {
    id: 'honey-1',
    title: '영월 토종꿀',
    subtitle: '강원도 영월군',
    seller: '영월 산벌꿀농원',
    region: '강원도 영월군',
    rating: 4.1,
    likes: 108,
    price: 15000,
    images: [PLACEHOLDER_IMG],
    shortDesc:
      '산간지대의 깨끗한 자연에서 채밀한 100% 자연 숙성 토종꿀로 향과 성분이 풍부합니다.',
    longDesc:
      '영월의 공기와 물이 빚어낸 진한 향의 토종꿀. 선물용으로도 인기 높습니다.',
    options: [
      { label: '500g', value: '500g' },
      { label: '1kg', value: '1kg' },
    ],
    shipping: ['전국 택배 배송', '파손 우려로 안전 포장 진행'],
  },
  {
    id: 'jeju-marmalade',
    title: '제주 감귤청',
    subtitle: '제주도',
    seller: '제주 감귤농가연합',
    region: '제주도',
    rating: 4.0,
    likes: 96,
    price: 12000,
    images: [PLACEHOLDER_IMG],
    shortDesc:
      '제주 감귤을 저온 숙성해 만든 천연 감귤청. 상큼달콤, 음료/요리 다용도!',
    longDesc:
      '제주 햇살을 머금은 감귤을 껍질째 저온 숙성해 향과 비타민을 살렸습니다.',
    options: [
      { label: '300ml', value: '300ml' },
      { label: '500ml', value: '500ml' },
    ],
    shipping: ['전국 택배 배송', '유리병 안전 포장'],
  },
];

/*************************
 * 네비게이션 선언
 *************************/
export type MarketStackParamList = {
  MarketHome: undefined;
  ProductDetail: { productId: string };
  ChatBot: { productId: string };
  ReviewNudge: { seller: string };
  OrdersForSeller: undefined;
};

const Stack = createNativeStackNavigator<MarketStackParamList>();
const Tabs = createBottomTabNavigator();

/*************************
 * 공통 유틸 컴포넌트
 *************************/
const RatingRow = ({ rating, likes }: { rating: number; likes: number }) => (
  <View style={styles.rowCenter}>
    <Ionicons name="star" size={16} />
    <Text style={styles.rateText}>{rating.toFixed(1)}</Text>
    <Ionicons name="heart" size={16} />
    <Text style={styles.rateText}>{likes}</Text>
  </View>
);

const Chip = ({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) => (
  <TouchableOpacity onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

/*************************
 * 1) 마켓 홈 (리스트)
 *************************/
export const MarketHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'인기순' | '후기순' | '최신순'>('인기순');

  const filtered = useMemo(() => {
    const base = MOCK_PRODUCTS.filter(p => p.title.includes(q) || p.shortDesc.includes(q) || p.region.includes(q));
    if (sort === '인기순') return base.sort((a, b) => b.likes - a.likes);
    if (sort === '후기순') return base.sort((a, b) => b.rating - a.rating);
    return base; // 최신순은 목업이라 그대로
  }, [q, sort]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>로컬 특산물 구경하기</Text>
        <Ionicons name="heart" size={20} />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={q}
          onChangeText={setQ}
        />
        <Ionicons name="mic" size={18} />
      </View>

      <View style={styles.rowStart}>
        {(['인기순', '후기순', '최신순'] as const).map(k => (
          <Chip key={k} label={k} active={sort === k} onPress={() => setSort(k)} />
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            style={styles.card}
          >
            <Image source={{ uri: item.images[0] }} style={styles.cardImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.rowStart}>
                <Ionicons name="location" size={16} />
                <Text style={styles.meta}>{item.region}</Text>
              </View>
              <Text numberOfLines={2} style={styles.desc}>{item.shortDesc}</Text>
              <RatingRow rating={item.rating} likes={item.likes} />
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

/*************************
 * 2) 상품 상세
 *************************/
export const ProductDetailScreen: React.FC<any> = ({ route, navigation }) => {
  const product = MOCK_PRODUCTS.find(p => p.id === route.params.productId)!;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>로컬 특산물 구경하기</Text>
        <Ionicons name="heart" size={20} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Image source={{ uri: product.images[0] }} style={styles.heroImage} />

        {/* 판매자 카드 */}
        <View style={styles.sellerCard}>
          <View>
            <Text style={styles.sellerName}>{product.seller}</Text>
            <View style={styles.rowStart}>
              <Ionicons name="location" size={16} />
              <Text style={styles.meta}>{product.region} 학교면 나비로 123</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('ChatBot', { productId: product.id })}
            style={styles.chatBtn}
          >
            <Text style={styles.chatBtnText}>채팅하기</Text>
          </TouchableOpacity>
        </View>

        {/* 상품 박스 */}
        <View style={styles.infoBox}>
          <Text style={styles.productTitle}>[친환경] {product.title} 10kg</Text>
          <RatingRow rating={product.rating} likes={product.likes} />

          <Text style={styles.sectionTitle}>상품 설명</Text>
          <Text style={styles.body}>{product.longDesc}</Text>

          <View style={{ height: 8 }} />
          <Text style={styles.bullet}>🌾 품종: 일품</Text>
          <Text style={styles.bullet}>🍓 재배 방식: 친환경 저농약</Text>
          <Text style={styles.bullet}>👩‍🌾 수확 시기: 2025년 10월</Text>
          <Text style={styles.bullet}>📦 용량: 10kg / 5kg 옵션 선택 가능</Text>

          <View style={{ height: 12 }} />
          <Text style={styles.sectionTitle}>가게 사장님 한마디</Text>
          <Text style={styles.quote}>
            “30년 농사 경험을 담았습니다. 매일 우리 가족이 먹는 마음으로 정성껏 짓은 쌀이에요.”
          </Text>

          <View style={{ height: 12 }} />
          <Text style={styles.sectionTitle}>판매가</Text>
          <Text style={styles.price}>￦{product.price.toLocaleString()} (배송비 무료)</Text>

          <View style={{ height: 12 }} />
          <Text style={styles.sectionTitle}>배송 정보</Text>
          {product.shipping.map((s, i) => (
            <Text key={i} style={styles.bullet}>• {s}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/*************************
 * 3) 채팅 BOT (간단 폼 흐름)
 *************************/
export const ChatBotScreen: React.FC<any> = ({ route, navigation }) => {
  const product = MOCK_PRODUCTS.find(p => p.id === route.params.productId)!;
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedOption, setSelectedOption] = useState<string | null>(product.options?.[0]?.value ?? null);
  const [qty, setQty] = useState<number>(1);
  const [pay, setPay] = useState<'카드' | '계좌이체' | '현금' | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const ask1 = (
    <View style={{ gap: 12 }}>
      <BotBubble title={`${product.seller} BOT`}>
        안녕하세요, 저희 가게에서 구매하고싶은 상품이 무엇인가요?{'\n'}
        {product.options?.map((o, idx) => `${idx + 1}. [친환경] ${product.title} ${o.label}`).join('\n')}
      </BotBubble>
      <OptionRow
        options={product.options?.map(o => o.label) ?? ['기본']}
        onPress={(label) => { setSelectedOption(label); setStep(2); }}
      />
    </View>
  );

  const ask2 = (
    <View style={{ gap: 12 }}>
      <UserBubble>{selectedOption ?? ''}</UserBubble>
      <BotBubble title={`${product.seller} BOT`}>
        희망 구매 수량을 알려주세요!{"\n"}(숫자만 입력하세요)
      </BotBubble>
      <OptionRow options={["1", "2", "3", "5"]} onPress={(v) => { setQty(Number(v)); setStep(3); }} />
    </View>
  );

  const ask3 = (
    <View style={{ gap: 12 }}>
      <UserBubble>{String(qty)}</UserBubble>
      <BotBubble title={`${product.seller} BOT`}>
        결제 방식을 선택해주세요!{"\n"}1. 신용/체크 카드{"
"}2. 계좌이체{"
"}3. 현금
      </BotBubble>
      <OptionRow options={["신용/체크카드", "계좌이체", "현금", "기타"]} onPress={(v) => { setPay(v.includes('계좌') ? '계좌이체' : v.includes('현금') ? '현금' : '카드'); setStep(4); }} />
    </View>
  );

  const ask4 = (
    <View style={{ gap: 12 }}>
      <UserBubble>{pay ?? ''}</UserBubble>
      <BotBubble title={`${product.seller} BOT`}>
        판매자와의 1대1 소통을 위해 성함과 연락 가능한 연락처(전화번호)를 남겨주세요!{"\n"}*기회 없이 숫자만 입력해주세요
      </BotBubble>
      <InputRow placeholder="성함 (예: 김이화)" value={name} onChangeText={setName} />
      <InputRow placeholder="연락처 (예: 01012345678)" value={phone} onChangeText={setPhone} keyboardType="number-pad" />
      <TouchableOpacity
        onPress={() => {
          if (!name || !phone) return Alert.alert('입력 확인', '성함과 연락처를 입력해주세요');
          Alert.alert('주문 접수', '응답해주신 주문서가 판매자에게 전달되었어요. 잠시만 기다려주세요!');
          navigation.navigate('ReviewNudge', { seller: product.seller });
        }}
        style={styles.submitBtn}
      >
        <Text style={styles.submitBtnText}>제출하기</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>채팅하기</Text>
        <Ionicons name="heart" size={20} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={styles.dateText}>2025년 8월 4일 월요일&gt;</Text>
        {step >= 1 && ask1}
        {step >= 2 && ask2}
        {step >= 3 && ask3}
        {step >= 4 && ask4}
      </ScrollView>
    </SafeAreaView>
  );
};

const BotBubble: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.botBubble}>
    <Text style={styles.botTitle}>{title}</Text>
    <Text style={styles.body}>{children as any}</Text>
  </View>
);
const UserBubble: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.userBubble}><Text style={{ color: '#000' }}>{children as any}</Text></View>
);

const OptionRow: React.FC<{ options: string[]; onPress: (v: string) => void }> = ({ options, onPress }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
    {options.map(o => (
      <TouchableOpacity key={o} style={styles.pill} onPress={() => onPress(o)}>
        <Text>{o}</Text>
      </TouchableOpacity>
    ))}
  </View>
);
const InputRow: React.FC<any> = (props) => (
  <View style={styles.inputRow}>
    <TextInput style={{ flex: 1 }} {...props} />
  </View>
);

/*************************
 * 4) 리뷰 유도 화면 (다음날)
 *************************/
export const ReviewNudgeScreen: React.FC<any> = ({ route }) => {
  const { seller } = route.params;
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity>
          <Text style={styles.backText}>back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>채팅하기</Text>
        <Ionicons name="heart" size={20} />
      </View>
      <View style={{ padding: 16 }}>
        <Text style={styles.dateText}>2025년 8월 5일 화요일&gt;</Text>
        <BotBubble title={`${seller} BOT`}>
          거래가 완료되었어요. {'\n'}‘{seller}’님과 거래는 어땠나요?{"\n"}거래가 만족스러웠다면 잠시 시간을 내어 따뜻한 한마디 부탁드려요 :)
        </BotBubble>
        <TouchableOpacity style={styles.reviewBtn} onPress={() => Alert.alert('후기', '후기 작성 화면으로 이동')}>
          <Text style={styles.reviewBtnText}>후기 작성하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

/*************************
 * 5) 판매자: 우리 매장 주문서 모아보기
 *************************/
export const OrdersForSellerScreen: React.FC = () => {
  const [orderBy, setOrderBy] = useState<'오래된순' | '최신순'>('오래된순');
  const orders = [
    {
      id: 'o1',
      productId: 'rice-10kg',
      productLabel: '[친환경] 함평 나비쌀 1kg',
      buyer: '김이화',
      phone: '010-1234-5678',
      qty: 1,
      pay: '계좌이체',
      orderedAt: '2025.08.04',
    },
  ];
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity>
          <Text style={styles.backText}>back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>우리 매장 주문서 모아보기</Text>
        <Ionicons name="heart" size={20} />
      </View>

      <View style={{ paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', gap: 8 }}>
        <Chip label="오래된순" active={orderBy === '오래된순'} onPress={() => setOrderBy('오래된순')} />
        <Chip label="최신순" active={orderBy === '최신순'} onPress={() => setOrderBy('최신순')} />
      </View>

      <FlatList
        data={orders}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <Image source={{ uri: PLACEHOLDER_IMG }} style={styles.orderImg} />
            <View style={{ flex: 1 }}>
              <Text style={styles.orderTitle}>{item.productLabel}</Text>
              <Text style={styles.meta}>구매자: {item.buyer}</Text>
              <Text style={styles.meta}>연락처: {item.phone}</Text>
              <Text style={styles.meta}>수량: {item.qty}</Text>
              <Text style={styles.meta}>결제방식: {item.pay}</Text>
              <Text style={styles.meta}>주문일자: {item.orderedAt}</Text>
            </View>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => Alert.alert('수락', '주문을 수락했습니다')}>
              <Text style={{ color: '#0B5', fontWeight: '600' }}>수락하기</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

/*************************
 * 내비게이션 컨테이너 (탭 포함) — 앱에 바로 붙여도 됨
 *************************/
export const MarketStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="MarketHome" component={MarketHomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ChatBot" component={ChatBotScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ReviewNudge" component={ReviewNudgeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="OrdersForSeller" component={OrdersForSellerScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export const RootTabsWithMarket = () => (
  <NavigationContainer>
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="추천" component={DummyScreen} options={{
        tabBarIcon: ({ size }) => <Ionicons name="train" size={size} />,
      }} />
      <Tabs.Screen name="축제" component={DummyScreen} options={{
        tabBarIcon: ({ size }) => <Ionicons name="location" size={size} />,
      }} />
      <Tabs.Screen name="마켓" component={MarketStackNavigator} options={{
        tabBarIcon: ({ size }) => <Ionicons name="basket" size={size} />,
      }} />
      <Tabs.Screen name="설정" component={DummyScreen} options={{
        tabBarIcon: ({ size }) => <Ionicons name="settings" size={size} />,
      }} />
    </Tabs.Navigator>
  </NavigationContainer>
);

const DummyScreen = () => (
  <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>준비 중…</Text>
  </SafeAreaView>
);

/*************************
 * 스타일
 *************************/
const styles = StyleSheet.create({
  headerRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backText: { color: '#3B82F6', fontSize: 16 },
  title: { fontSize: 22, fontWeight: '800' },

  searchBox: {
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16 },
  rowStart: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, marginBottom: 6 },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },

  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#E5E7EB', marginLeft: 12, },
  chipActive: { backgroundColor: '#DBECFF' },
  chipText: { color: '#374151' },
  chipTextActive: { color: '#1D4ED8', fontWeight: '700' },

  card: { flexDirection: 'row', backgroundColor: '#ECF7FB', borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  cardImage: { width: 110, height: 110, marginRight: 12 },
  cardTitle: { fontSize: 20, fontWeight: '800', marginTop: 8 },
  meta: { color: '#374151' },
  desc: { color: '#6B7280', marginTop: 4, marginBottom: 8 },
  rateText: { marginRight: 10, fontWeight: '600' },

  heroImage: { width: '100%', height: 220 },
  sellerCard: { margin: 16, padding: 16, backgroundColor: '#fff', borderRadius: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  sellerName: { fontSize: 22, fontWeight: '800' },
  chatBtn: { backgroundColor: '#E6F0FF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  chatBtnText: { color: '#1D4ED8', fontWeight: '700' },

  infoBox: { backgroundColor: '#EAF6FA', marginHorizontal: 16, padding: 16, borderRadius: 16 },
  productTitle: { fontSize: 22, fontWeight: '900', marginBottom: 6 },
  sectionTitle: { marginTop: 12, fontWeight: '700' },
  body: { color: '#374151', lineHeight: 20 },
  bullet: { color: '#374151', marginTop: 4 },
  quote: { color: '#374151', fontStyle: 'italic', marginTop: 6 },
  price: { fontSize: 18, fontWeight: '800', marginTop: 6 },

  dateText: { color: '#6B7280', alignSelf: 'center', marginVertical: 8 },
  botBubble: { backgroundColor: '#FFF', borderRadius: 12, padding: 12, alignSelf: 'flex-start', maxWidth: '90%' },
  botTitle: { fontWeight: '800', marginBottom: 6 },
  userBubble: { backgroundColor: '#C7F0FF', borderRadius: 12, padding: 10, alignSelf: 'flex-end' },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F3F4F6' },
  inputRow: { backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  submitBtn: { backgroundColor: '#1D4ED8', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700' },
  reviewBtn: { alignSelf: 'flex-end', backgroundColor: '#E6F0FF', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  reviewBtnText: { color: '#1D4ED8', fontWeight: '700' },

  orderCard: { flexDirection: 'row', gap: 12, backgroundColor: '#EAF6FA', borderRadius: 16, padding: 12, alignItems: 'center' },
  orderImg: { width: 96, height: 72, borderRadius: 8 },
  orderTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  acceptBtn: { borderWidth: 1, borderColor: '#0B5', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12 },
});

/*************************
 * 사용법
 *************************/
// 1) 파일을 src/features/market/MarketModule.tsx 로 저장
// 2) App.tsx에서 <RootTabsWithMarket />를 렌더링하거나, 기존 Tab Navigator에
//    <Tabs.Screen name="마켓" component={MarketStackNavigator} /> 추가
// 3) 실제 이미지가 있으면 images: [require('...')] 또는 CDN URI로 교체
// 4) 추후 API 연동 시 MOCK_PRODUCTS와 orders를 백엔드로 교체하면 됩니다.
