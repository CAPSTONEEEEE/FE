import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>© 2025 소소행</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    padding: 12,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    color: '#777',
  },
});
