import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProductCard({ product, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: product.thumbnail }} style={styles.image} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        <Text style={styles.category}>{product.category}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>R$ {Number(product.price).toFixed(2)}</Text>
          <Text style={[styles.stock, product.stock < 5 && styles.lowStock]}>
            Estoque: {product.stock}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  image: { width: 90, height: 90 },
  info: { flex: 1, padding: 10, justifyContent: 'space-between' },
  title: { fontSize: 14, fontWeight: '600', color: '#222' },
  category: { fontSize: 12, color: '#1a73e8', textTransform: 'capitalize', marginTop: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  price: { fontSize: 15, fontWeight: '700', color: '#2e7d32' },
  stock: { fontSize: 12, color: '#666' },
  lowStock: { color: '#c62828', fontWeight: '600' },
});
