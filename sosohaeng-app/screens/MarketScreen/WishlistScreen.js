//screens/MarketScreen/WishlistScreen.js
import { View, Text, FlatList } from "react-native";
import { useEffect, useState } from "react";
import api from "../../utils/apiClient";

export default function WishlistScreen() {
  const [list, setList] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/markets/wishlist", { params: { user_id: 1, page: 1, size: 50 } });
        setList(res.data?.items ?? []);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={22} color="#0f3c45" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>위시리스트</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={list}
        keyExtractor={(it, idx) => `${it.id ?? idx}`}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: "#eee" }}>
            <Text>{item.product_name}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>찜한 상품이 없습니다.</Text>}
      />
    </View>
  );
}
// screens/MarketScreen/WishlistScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useFavoritesStore from '../stores/favoritesStore';

export default function WishlistScreen() {
  const router = useRouter();
  const { favoritesArray, toggleFavorite, likeDelta, isFavorite } = useFavoritesStore();

  const renderItem = ({ item }) => {
    const liked = isFavorite(item.id);
    const likesShown = Number(item.likes ?? 0) + (likeDelta[item.id] ?? 0);
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: '/market/product/[id]', params: { id: String(item.id), title: item.title } })}
      >
        <View style={styles.thumbWrap}>
          {item.image ? <Image source={{ uri: item.image }} style={styles.thumb} /> : <View style={[styles.thumb, { backgroundColor: '#dfe9ef' }]} />}
        </View>
        <View style={{ flex: 1, paddingRight: 6 }}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          {!!item.location && <Text style={styles.location} numberOfLines={1}>📍 {item.location}</Text>}
          <View style={styles.row}>
            <View style={styles.metaChip}>
              <Ionicons name="heart" size={14} color="#0f93a6" />
              <Text style={styles.metaText}>{likesShown}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Text style={styles.price}>₩{Number(item.price ?? 0).toLocaleString()}</Text>
            <TouchableOpacity onPress={() => toggleFavorite(item)} style={{ marginLeft: 10 }}>
              <Ionicons name={liked ? "heart" : "heart-outline"} size={22} color={liked ? "#ff4d6d" : "#0f3c45"} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={22} color="#0f3c45" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>위시리스트</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={favoritesArray}
        keyExtractor={(it, idx) => String(it.id ?? idx)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ color: '#6b7a86' }}>아직 찜한 상품이 없어요.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1f7fa' },
  header: {
    height: 52, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, backgroundColor: '#f1f7fa', justifyContent: 'space-between'
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f3c45' },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  thumbWrap: { width: 86, height: 86, borderRadius: 10, overflow: 'hidden', marginRight: 12, backgroundColor: '#dfe9ef' },
  thumb: { width: '100%', height: '100%' },

  title: { fontSize: 18, fontWeight: '900', color: '#0f3c45' },
  location: { marginTop: 4, color: '#5b7280' },

  row: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  metaChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6f6f9', borderRadius: 10, paddingHorizontal: 8, height: 24 },
  metaText: { marginLeft: 4, color: '#0f93a6', fontWeight: '800' },
  price: { fontSize: 16, fontWeight: '900', color: '#0f3c45' },
});
