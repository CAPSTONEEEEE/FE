// screens/MarketScreen/ProductQnAScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// ▼▼▼ [수정 1] useNavigation 임포트 ▼▼▼
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { API_BASE_URL } from '../../src/config/api';
import useAuthStore from '../../src/stores/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProductQnAScreen() {
  const router = useRouter();

  // ▼▼▼ [수정 2] navigation 훅 사용 ▼▼▼
  const navigation = useNavigation();

  const { id, productId, title } = useLocalSearchParams();
  const pid = (productId ?? id) ? String(productId ?? id) : undefined;

  const token = useAuthStore((state) => state.token);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // 글쓰기 모달
  const [qTitle, setQTitle] = useState('');
  const [qBody, setQBody] = useState('');
  const [submitting, setSubmitting] = useState(false); // 제출 중 로딩

  // ▼▼▼ [수정 3] navigation.setOptions를 사용하여 기본 헤더 숨기기 (문제 1, 3 해결) ▼▼▼
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const load = useCallback(async () => {
    if (!pid) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const r = await fetch(`${API_BASE_URL}/products/${pid}/qna`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      const qnaList = Array.isArray(j) ? j : (j.items ?? []);
      
      qnaList.sort((a, b) => 
        new Date(b.created_at ?? b.createdAt) - new Date(a.created_at ?? a.createdAt)
      );

      setItems(qnaList);
    } catch (e) {
      setItems([]);
      console.error("문의 목록 로드 실패:", e);
      Alert.alert('불러오기 실패', '문의 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [pid]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!token) {
      Alert.alert(
        '로그인 필요',
        '문의를 등록하려면 로그인이 필요합니다.',
        [
          { text: '로그인하기', onPress: () => router.push('/login') },
          { text: '취소', style: 'cancel' },
        ]
      );
      return;
    }
    if (!qTitle || !qBody) {
      return Alert.alert('필수항목', '제목과 내용을 모두 입력해주세요.');
    }
    if (!pid) {
      return Alert.alert('등록 실패', '상품 정보가 없습니다.');
    }

    setSubmitting(true); 

    try {
      const r = await fetch(`${API_BASE_URL}/products/${pid}/qna`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: qTitle, body: qBody }),
      });

      if (!r.ok) {
        const errorData = await r.json().catch(() => ({ message: '서버 오류가 발생했습니다.' }));
        throw new Error(errorData.message || `HTTP ${r.status}`);
      }

      setOpen(false);
      setQTitle('');
      setQBody('');
      load(); 
      Alert.alert('성공', '문의가 성공적으로 등록되었습니다.');

    } catch (e) {
      console.error("문의 제출 실패:", e);
      Alert.alert('등록 실패', e.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Question Part */}
      <View style={styles.qnaBlock}>
        <View style={styles.qnaHeader}>
          <Text style={styles.qnaTagQ}>Q</Text>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        </View>
        <Text style={styles.meta}>
          {(item.author_name ?? item.authorName ?? '익명')} · {new Date(item.created_at ?? item.createdAt ?? Date.now()).toLocaleDateString()}
        </Text>
        {!!item.body && <Text style={styles.bodyText}>{item.body}</Text>}
      </View>

      {/* Answer Part */}
      {item.answer_body ? (
        <View style={[styles.qnaBlock, styles.answerBlock]}>
          <View style={styles.qnaHeader}>
            <Text style={styles.qnaTagA}>A</Text>
            <Text style={styles.answerTitle}>판매자 답변</Text>
          </View>
           <Text style={styles.meta}>
            {(item.seller_name ?? item.sellerName ?? '판매자')} · {new Date(item.answered_at ?? item.answeredAt ?? Date.now()).toLocaleDateString()}
           </Text>
          <Text style={styles.bodyText}>{item.answer_body}</Text>
        </View>
      ) : (
        <View style={[styles.qnaBlock, styles.answerBlock, { backgroundColor: '#f9f9f9' }]}>
          <Text style={styles.noAnswerText}>아직 답변이 등록되지 않았습니다.</Text>
        </View>
      )}
    </View>
  );

  // 이 pid 확인 로직은 커스텀 헤더를 포함하도록 SafeAreaView로 감싸줍니다.
  if (!pid) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={22} color="#0f3c45" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>상품 문의</Text>
          <View style={{ width: 22 }} />
        </View>
        {/* 본문 */}
        <View style={styles.center}>
          <Text style={{ color: '#6b7a86' }}>상품 정보가 없어 문의 목록을 표시할 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    // edges={['top']}을 사용하면 상단 노치 영역만 피하고, 하단은 탭바가 차지하도록 합니다.
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}> 
      {/* 이제 이 커스텀 헤더가 유일한 헤더가 됩니다. */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={22} color="#0f3c45" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title ? `${title} 문의` : '상품 문의'}
        </Text>
         <View style={{ width: 22 }} />
      </View>

      {/* 본문 (문의 목록) */}
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#0f93a6" /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it, idx) => String(it.id ?? idx)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 14, paddingBottom: 120 }} // 하단 FAB와 겹치지 않게 패딩
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={() => (
            <View style={{ alignItems: 'center', marginTop: 60, padding: 20 }}>
              <Ionicons name="chatbubbles-outline" size={40} color="#adb5bd" />
              <Text style={{ color: '#6b7a86', marginTop: 10, fontSize: 16 }}>아직 등록된 문의가 없습니다.</Text>
              <Text style={{ color: '#8aa0ad', marginTop: 4 }}>가장 먼저 질문을 등록해보세요!</Text>
            </View>
          )}
          onRefresh={load}
          refreshing={loading}
        />
      )}

      {/* 글쓰기 버튼 (FAB) */}
      <TouchableOpacity style={styles.fab} onPress={() => setOpen(true)} activeOpacity={0.9}>
        <Ionicons name="create-outline" size={26} color="#fff" />
      </TouchableOpacity>

      {/* 글쓰기 모달 */}
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} style={styles.modalBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>상품 문의하기</Text>
            <TextInput
              placeholder="제목"
              style={styles.input}
              value={qTitle}
              onChangeText={setQTitle}
              placeholderTextColor="#8aa0ad"
            />
            <TextInput
              placeholder="궁금한 점을 자세히 적어주세요."
              style={[styles.input, styles.textarea]} 
              value={qBody}
              onChangeText={setQBody}
              multiline
              textAlignVertical="top"
              placeholderTextColor="#8aa0ad"
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#e5e7eb' }]} onPress={() => setOpen(false)} disabled={submitting}>
                <Text style={[styles.btnText, { color: '#0f3c45' }]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={submit} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>등록</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f1f7fa' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e3e9ec',
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  headerTitle: { 
    flex: 1, 
    textAlign: 'center', 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#0f3c45',
    marginHorizontal: 16,
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    overflow: 'hidden',
  },
  qnaBlock: {
    padding: 14,
  },
  qnaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  qnaTagQ: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f93a6',
    marginRight: 8,
  },
  qnaTagA: {
    fontSize: 18,
    fontWeight: '900',
    color: '#E67E22',
    marginRight: 8,
  },
  title: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#0f3c45',
    flex: 1,
  },
  answerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333',
  },
  meta: { 
    color: '#6b7a86',
    fontSize: 12,
  },
  bodyText: { 
    marginTop: 10, 
    color: '#455e68',
    lineHeight: 20,
  },
  answerBlock: {
    backgroundColor: '#f8f9fa',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e9ecef',
    marginTop: 8,
  },
  noAnswerText: {
    color: '#8aa0ad',
    fontStyle: 'italic',
    fontSize: 13,
  },
  fab: {
    position: 'absolute', 
    right: 18, 
    // ▼▼▼ [수정 4] 탭바 위에 오도록 bottom 값 조정 (문제 4 해결) ▼▼▼
    bottom: 90, 
    width: 56, 
    height: 56, 
    borderRadius: 28,
    backgroundColor: '#0f93a6', 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000', 
    shadowOpacity: 0.2, 
    shadowRadius: 8, 
    shadowOffset: { width: 0, height: 4 }, 
    elevation: 5
  },
  // 모달 스타일
  modalBackdrop: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    padding: 16 
  },
  modalCard: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 16,
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 10, 
    elevation: 5,
    marginVertical: 50,
  },
  modalTitle: { 
    fontSize: 18,
    fontWeight: '900', 
    color: '#0f3c45', 
    marginBottom: 16,
    textAlign: 'center',
  },
  input: { 
    backgroundColor: '#f3f6f8', 
    borderRadius: 10, 
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 15,
    color: '#0f3c45',
  },
  textarea: {
    height: 140,
    paddingTop: 12,
  },
  btn: { 
    backgroundColor: '#0f93a6', 
    paddingHorizontal: 14, 
    paddingVertical: 14,
    borderRadius: 10, 
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  btnText: { 
    color: '#fff', 
    fontWeight: '800',
    fontSize: 16,
  },
});