// components/Header.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function Header({ title = '', right = null }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const canGoBack = navigation.canGoBack();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        <View style={styles.left}>
          {canGoBack ? (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color="#1f6feb" />
            </TouchableOpacity>
          ) : (
            <Text style={styles.brand}>소소행</Text>
          )}
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.right}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  container: {
    height: 56,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { width: 90, justifyContent: 'center' },
  backButton: { paddingVertical: 4 },
  brand: { fontWeight: '700', color: '#1f6feb', fontSize: 16 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  right: { width: 90, alignItems: 'flex-end' },
});
