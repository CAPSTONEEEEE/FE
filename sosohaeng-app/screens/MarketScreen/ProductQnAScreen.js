// screens/MarketScreen/ProductQnAScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { API_BASE_URL } from '../../src/config/api';

const SERVER_ROOT_URL = API_BASE_URL.replace('/api/v1', ''); // BE 루트로 정규화

export default function ProductQnAScreen() {
  const router = useRouter();

  // ✅ id 또는 productId 어느 쪽이 와도 대응
  const { id, productId, title } = useLocalSearchParams();
  const pid = (productId ?? id) ? String(productId ?? id) : undefined;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [qTitle, setQTitle] = useState('');
  const [qBody, setQBody] = useState('');

  const load = async () => {
    if (!pid) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const r = await fetch(`${SERVER_ROOT_URL}/products/${pid}/qna`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setItems(Array.isArray(j) ? j : j.items ?? []);
    } catch (e) {
      setItems([]);
      Alert.alert('불러오기 실패', '문의 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 의존성도 pid로 통일
  useEffect(() => { load(); }, [pid]);

  const submit = async () => {
    if (!qTitle || !qBody) {
      return Alert.alert('필수항목', '제목과 내용을 입력해주세요.');
    }
    if (!pid) {
      return Alert.alert('등록 실패', '상품 정보가 없습니다.');
    }
    try {
      const r = await fetch(`${SERVER_ROOT_URL}/products/${pid}/qna`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: 실제 로그인 토큰으로 교체
          'Authorization': 'Bearer <JWT>',
        },
        body: JSON.stringify({ title: qTitle, body: qBody }),
      });
      if (!r.ok) throw new Error();
      setOpen(false);
      setQTitle('');
      setQBody('');
      load();
    } catch (e) {
      Alert.alert('등록 실패', '권한/서버 오류를 확인해주세요.');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => {
        // TODO: 쓰레드 상세 라우트가 준비되면 연결
        // router.push({ pathname: '/market/product/[id]/qna/[threadId]', params: { id: pid, threadId: String(item.id) } });
      }}
    >
      <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.meta}>
        {(item.authorName ?? '익명')} · {new Date(item.createdAt ?? Date.now()).toLocaleString()}
      </Text>
      {!!item.body && <Text style={styles.snippet} numberOfLines={2}>{item.body}</Text>}
    </TouchableOpacity>
  );

  if (!pid) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#6b7a86' }}>상품 정보가 없어 문의 목록을 표시할 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* 간단 헤더 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={22} color="#0f3c45" />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'center', fontWeight: '900', color: '#0f3c45' }}>
          {title ? `${title} 문의` : '상품 문의'}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it, idx) => String(it.id ?? idx)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 14, paddingBottom: 120 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={() => (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ color: '#6b7a86' }}>아직 등록된 문의가 없습니다.</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setOpen(true)} activeOpacity={0.9}>
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>질문 작성</Text>
            <TextInput placeholder="제목" style={styles.input} value={qTitle} onChangeText={setQTitle} />
            <TextInput
              placeholder="내용"
              style={[styles.input, { height: 120 }]} // height 오타 수정
              value={qBody}
              onChangeText={setQBody}
              multiline
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#e5e7eb' }]} onPress={() => setOpen(false)}>
                <Text style={[styles.btnText, { color: '#0f3c45' }]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={submit}>
                <Text style={styles.btnText}>등록</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '800', color: '#0f3c45' },
  meta: { marginTop: 4, color: '#6b7a86' },
  snippet: { marginTop: 6, color: '#455e68' },
  fab: {
    position: 'absolute', right: 18, bottom: 22, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#0f93a6', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5
  },
  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14 },
  modalTitle: { fontWeight: '900', color: '#0f3c45', marginBottom: 10 },
  input: { backgroundColor: '#f3f6f8', borderRadius: 10, padding: 10, marginBottom: 10 },
  btn: { backgroundColor: '#0f93a6', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, flex: 1, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800' },
});
