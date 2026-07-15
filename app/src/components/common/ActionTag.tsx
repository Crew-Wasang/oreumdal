import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  action: '매수' | '매도';
}

export default function ActionTag({ action }: Props) {
  const isBuy = action === '매수';
  return (
    <View style={styles.container}>
      <View style={[styles.dot, isBuy ? styles.dotBuy : styles.dotSell]} />
      <Text style={styles.text}>{action}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#F4F4F5',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 20,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotBuy: { backgroundColor: '#F43F5E' },
  dotSell: { backgroundColor: '#6366F1' },
  text: { fontSize: 10, lineHeight: 15, color: '#3F3F46', fontFamily: 'A2Z-Medium', fontWeight: '500' },
});
