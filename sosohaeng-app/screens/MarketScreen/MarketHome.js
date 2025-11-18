// screens/MarketScreen/MarketHome.js
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { API_BASE_URL, SERVER_ROOT_URL } from '../../src/config/api';

import useFavoritesStore from '../stores/favoritesStore';
import useAuthStore from '../../src/stores/authStore'; 

const REGIONS = ['전체','서울','경기','강원','부산','대구','인천','광주','대전','울산','세종','충북','충남','전북','전남','경북','경남','제주'];
const SORT_LABELS = ['인기순','후기순','최신순'];

export default function MarketHome() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [region, setRegion] = useState('전체');
  const [sortKey, setSortKey] = useState('인기순');

  const [openRegionModal, setOpenRegionModal] = useState(false);
  const [openSortModal,   setOpenSortModal]   = useState(false);

  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const { isFavorite, fetchFavorites } = useFavoritesStore();
  const token = useAuthStore((state) => state.token);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const params = new URLSearchParams();
      if (q) params.append('q', q);
      params.append('region', region);
      params.append('sort', sortKey);
      params.append('size', 100);

      const res = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list = Array.isArray(json) ? json : (json.items ?? []);

      const now = Date.now();
      const enriched = list.map((it, idx) => ({
        ...it,
        _idx: idx,
        _createdAt: Number(it?.createdAt ?? it?.updatedAt ?? (now - idx * 1000)),
        rating: Number(it?.rating ?? 0),
        likes:  Number(it?.likes  ?? 0),
        price:  Number(it?.price  ?? 0),
      }));

      setItems(enriched);
    } catch (e) {
      setError(e.message || '네트워크 오류');
    } finally {
      setLoading(false);
    }
  }, [q, region, sortKey]); 

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
      fetchFavorites();
    }, [load, fetchFavorites])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      load(),
      fetchFavorites()
    ]);
    setRefreshing(false);
  }, [load, fetchFavorites]);

  const renderItem = ({ item }) => {
    const fav = isFavorite(String(item.id), 'PRODUCT');
    const likesShown = Number(item.likes); 
    
    let thumbnailUrl = item.image || null;
    
    if (thumbnailUrl && typeof thumbnailUrl === 'string') {
      const url = thumbnailUrl.trim();
      // 1. http 또는 https로 시작하는 절대 경로인 경우 그대로 사용
      if (url.startsWith('http://') || url.startsWith('https://')) {
        thumbnailUrl = url;
      } else {
        // 2. 상대 경로인 경우 (/static/uploads/...) SERVER_ROOT_URL을 앞에 붙임
        thumbnailUrl = `${SERVER_ROOT_URL || ''}${url}`;
      }
    }

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            pathname: '/market/product/[id]',
            params: { id: String(item.id), title: item.title },
          })
        }
      >
        <View style={styles.thumbWrap}>
          {thumbnailUrl ? ( 
            <Image source={{ uri: thumbnailUrl }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, { backgroundColor: '#dfe9ef' }]} />
          )}
        </View>
        <View style={{ flex: 1, paddingRight: 6 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.location} numberOfLines={1}>📍 {item.location}</Text>
          {!!item.summary && (<Text style={styles.desc} numberOfLines={2}>{item.summary}</Text>)}
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="star" size={14} color="#0f93a6" />
              <Text style={styles.metaText}>{Number(item.rating ?? 0).toFixed(1)}</Text>
            </View>
            <View style={[styles.metaChip, { marginLeft: 10 }]}>
              <Ionicons name={fav ? "heart" : "heart-outline"} size={14} color="#0f93a6" />
              <Text style={styles.metaText}>{likesShown}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Text style={styles.price}>₩{Number(item.price ?? 0).toLocaleString()}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !items.length) {
    return (
      <SafeAreaView style={styles.root}>
        <Header onBack={() => router.back()} onWishlist={() => router.push('/market/wishlist')} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  const handleProductCreatePress = () => {
    if (token) {
      router.push('/market/product/new');
    } else {
      Alert.alert(
        '로그인 필요',
        '상품을 등록하려면 로그인이 필요합니다.',
        [
          {
            text: '로그인하기',
            onPress: () => router.push('/login'), 
          },
          {
            text: '취소',
            style: 'cancel',
          },
        ]
      );
    }
  };

  return (
    <View style={styles.root}>
      <Header onBack={() => router.back()} onWishlist={() => router.push('/market/wishlist')} />
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#8aa0ad" />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="상품명 또는 설명으로 검색"
          placeholderTextColor="#9fb0bb"
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>
      <View style={styles.dropdownRow}>
        <View style={styles.dropdownCol}>
          <TouchableOpacity
            onPress={() => setOpenSortModal(true)}
            activeOpacity={0.9}
            style={styles.dropdownButton}
          >
            <Text style={styles.dropdownText}>정렬: {sortKey}</Text>
            <Ionicons name="chevron-down" size={18} color="#6b7a86" />
          </TouchableOpacity>
          <Modal
            visible={openSortModal}
            animationType="fade"
            transparent
            onRequestClose={() => setOpenSortModal(false)}
          >
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPressOut={() => setOpenSortModal(false)}
            >
              <View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>정렬 기준</Text>
                </View>
                <ScrollView>
                  {SORT_LABELS.map(label => (
                    <TouchableOpacity
                      key={label}
                      onPress={() => { setSortKey(label); setOpenSortModal(false); }}
                      style={[
                        styles.modalItem,
                        label === sortKey && { backgroundColor: '#f0fbfe' }
                      ]}
                    >
                      <Text style={[
                        styles.modalItemText,
                        label === sortKey && { fontWeight: '800' }
                      ]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
        <View style={styles.dropdownCol}>
          <TouchableOpacity
            onPress={() => setOpenRegionModal(true)}
            activeOpacity={0.9}
            style={styles.dropdownButton}
          >
            <Text style={styles.dropdownText}>
              {region === '전체' ? '지역: 전체' : `지역: ${region}`}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#6b7a86" />
          </TouchableOpacity>
          <Modal
            visible={openRegionModal}
            animationType="fade"
            transparent
            onRequestClose={() => setOpenRegionModal(false)}
          >
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPressOut={() => setOpenRegionModal(false)}
            >
              <View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>지역 선택</Text>
                </View>
                <ScrollView>
                  {REGIONS.map(r => (
                    <TouchableOpacity
                      key={r}
                      onPress={() => { setRegion(r); setOpenRegionModal(false); }}
                      style={[
                        styles.modalItem,
                        r === region && { backgroundColor: '#f0fbfe' }
                      ]}
                    >
                      <Text style={[
                        styles.modalItemText,
                        r === region && { fontWeight: '800' }
                      ]}>
                        {r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <View style={styles.dropdownCol}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.registerButton}
            onPress={handleProductCreatePress} 
          >
            <Text style={styles.registerText}>상품 등록</Text>
            <Ionicons name="add-circle-outline" size={18} color="#0f93a6" />
          </TouchableOpacity>
        </View>
      </View>

      {!!error && (
        <Text style={{ color: 'red', marginTop: 6, marginLeft: 16 }}>
          불러오기 실패: {error}
        </Text>
      )}
      <FlatList
        data={items}
        keyExtractor={(it, idx) => String(it.id ?? idx)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, paddingTop: 10 }}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading && (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: '#6b7a86' }}>조건에 맞는 상품이 없습니다.</Text>
            </View>
          )
        }
      />
    </View>
  );
}

function Header({ onBack, onWishlist }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="chevron-back" size={22} color="#0f3c45" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>로컬 특산물 구경하기</Text>

      <TouchableOpacity onPress={onWishlist} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="heart" size={22} color="#ff4d6d" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1f7fa', paddingTop: 0},
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#f1f7fa',
    justifyContent: 'space-between',
  },
  headerTitle: { textAlign: 'center', fontSize: 18, fontWeight: '800', color: '#0f3c45' },
  searchRow: {
    marginTop: 8,
    marginHorizontal: 16,
    backgroundColor: '#eaf0f4',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: { marginLeft: 8, flex: 1, color: '#0f3c45' },
  dropdownRow: {
    marginTop: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 10,
  },
  dropdownCol: { flex: 1 },
  dropdownButton: {
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#eff4f7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dropdownText: { fontWeight: '700', color: '#0f3c45' },
  registerButton: {
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#e8f5f8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  registerText: { fontWeight: '800', color: '#0f93a6' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', padding: 20 },
  modalSheet: { backgroundColor: '#fff', borderRadius: 14, maxHeight: '70%', overflow: 'hidden' },
  modalHeader: { padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#0f3c45' },
  modalItem: { paddingHorizontal: 16, paddingVertical: 14 },
  modalItemText: { color: '#0f3c45', fontWeight: '600' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  thumbWrap: { width: 96, height: 96, borderRadius: 12, overflow: 'hidden', marginRight: 12, backgroundColor: '#dfe9ef' },
  thumb: { width: '100%', height: '100%' },
  title: { fontSize: 20, fontWeight: '900', color: '#0f3c45' },
  location: { marginTop: 4, color: '#5b7280' },
  desc: { marginTop: 6, color: '#4b5d67' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f6f9',
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 24,
  },
  metaText: { marginLeft: 4, color: '#0f93a6', fontWeight: '800' },
  price: { fontSize: 16, fontWeight: '900', color: '#0f3c45' },
});