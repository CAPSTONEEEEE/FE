// components/Footer.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Footer() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.container}>
        <Text style={styles.text}>© SOSOHAENG — Local & Festival</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
  },
  container: {
    height: 34,                    // 실제 푸터 높이
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: '#888', fontSize: 12 },
});
