import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function EmptyState({ message = 'Nenhum item encontrado.' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📦</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  icon: { fontSize: 48, marginBottom: 10 },
  text: { fontSize: 15, color: '#888', textAlign: 'center' },
});
