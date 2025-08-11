import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';

export default function FestivalDetailScreen({ route }) {
  const { festival } = route.params ?? {};
  if (!festival) {
    return (
      <View style={styles.center}>
        <Text>축제 정보가 없습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 포스터 */}
      {festival.image ? (
        <Image source={{ uri: festival.image }} style={styles.poster} />
      ) : (
        <View style={[styles.poster, styles.posterPlaceholder]}>
          <Text style={styles.placeholderText}>No image</Text>
        </View>
      )}

      {/* 내용 */}
      <View style={styles.content}>
        <Text style={styles.name}>{festival.name}</Text>
        <Text style={styles.meta}>📍 {festival.address}</Text>
        <Text style={styles.meta}>🗓 {festival.date}</Text>

        <Text style={styles.sectionTitle}>소개</Text>
        <Text style={styles.description}>{festival.info ?? festival.description ?? '상세 정보가 없습니다.'}</Text>

        <Text style={styles.sectionTitle}>태그</Text>
        <View style={styles.tagsRow}>
          {(festival.tags || []).map((t, i) => (
            <Text key={i} style={styles.tag}>#{t}</Text>
          ))}
        </View>

        <View style={styles.extraRow}>
          <Text style={styles.likes}>♡ {festival.likes ?? 0}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { paddingBottom: 32 },
  poster: { width: '100%', height: 240, backgroundColor: '#eee' },
  posterPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: '#999' },
  content: { padding: 16 },
  name: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  meta: { fontSize: 14, color: '#555', marginBottom: 4 },
  sectionTitle: { marginTop: 12, fontSize: 16, fontWeight: '700' },
  description: { marginTop: 6, fontSize: 15, lineHeight: 22, color: '#333' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  tag: { marginRight: 8, color: '#007aff', fontSize: 13 },
  extraRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
  likes: { fontSize: 14, color: '#ff4d6d' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

