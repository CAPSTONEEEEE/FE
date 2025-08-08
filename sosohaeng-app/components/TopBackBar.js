// components/TopBackBar.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function TopBackBar({ title = '', right = null }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const onBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Main', { screen: '홈' });
  };

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 6 }]}>
      {/* Left: Back */}
      <View style={styles.side}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Center: Title (진짜 중앙) */}
      <View style={styles.center}>
        {!!title && (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>

      {/* Right: Action (찜 등) */}
      <View style={styles.side}>
        {right ? right : <View style={{ width: 24, height: 24 }} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  side: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',   // ← 중앙 정렬
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
});
