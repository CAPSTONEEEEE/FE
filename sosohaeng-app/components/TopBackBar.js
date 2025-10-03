// components/TopBackBar.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TopBackBar({ title = '', right = null }) {
  const router = useRouter();

  const onBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/home');
    }
  };

  return (
    <View style={styles.wrap}>
      {/* Left: Back */}
      <View style={styles.side}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Center: Title */}
      <View style={styles.center}>
        {!!title && (
          <Text style={styles.title} numberOfLines={1}>{title}
          </Text>
        )}
      </View>

      {/* Right: Action */}
      <View style={styles.side}>
        {right ? right : <View />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    minHeight: 56, // 헤더 최소 높이
  },
  side: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  iconBtn: {
    padding: 8,
  },
});