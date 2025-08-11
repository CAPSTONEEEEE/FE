// screens/FavoritesScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import TopBackBar from '../components/TopBackBar';
import { subscribe, getFavorites } from './stores/favoritesStore';

export default function FavoritesScreen() {
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    const unsub = subscribe(setItems);
    return unsub;
  }, []);

  const byCat = {
    recommend: items.filter((v) => v.category === 'recommend'),
    festival: items.filter((v) => v.category === 'festival'),
    market: items.filter((v) => v.category === 'market'),
  };

  const Section = ({ title, data }) => (
    <View style={{ marginBottom: 18 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {data.length === 0 ? (
        <Text style={styles.empty}>아직 찜한 항목이 없어요.</Text>
      ) : (
        data.map(({ id, category, data: it }) => (
          <View key={`${category}-${id}`} style={styles.itemRow}>
            {it?.image ? <Image source={typeof it.image === 'string' ? { uri: it.image } : it.image} style={styles.thumb} /> : <View style={[styles.thumb, { backgroundColor: '#eee' }]} />}
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName} numberOfLines={1}>{it?.name ?? String(id)}</Text>
              {it?.price != null && <Text style={styles.itemMeta}>{Number(it.price).toLocaleString()}원</Text>}
            </View>
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.page}>
      <TopBackBar title="찜 목록" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Section title="추천" data={byCat.recommend} />
        <Section title="축제" data={byCat.festival} />
        <Section title="마켓" data={byCat.market} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  empty: { color: '#999' },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  thumb: { width: 44, height: 44, borderRadius: 8, resizeMode: 'cover' },
  itemName: { fontSize: 15, fontWeight: '700' },
  itemMeta: { color: '#666', marginTop: 2 },
});
