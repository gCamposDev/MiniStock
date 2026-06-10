import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Loading from '../components/Loading';
import { deleteProduct, getProduct } from '../services/products';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProduct(productId);
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      const params = route.params;
      if (params && params.updatedProduct) {
        setProduct(params.updatedProduct);
        navigation.setParams({ updatedProduct: null });
      }
    });
    return unsub;
  }, [navigation, route.params]);

  function confirmDelete() {
    Alert.alert(
      'Remover produto',
      'Deseja remover "' + (product && product.title) + '"?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: handleDelete },
      ]
    );
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteProduct(product.id);
      navigation.navigate('ProductList', { deletedId: product.id });
    } catch (err) {
      Alert.alert('Erro', err.message);
      setDeleting(false);
    }
  }

  if (loading) return <Loading message="Carregando produto..." />;

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Image source={{ uri: product.thumbnail }} style={styles.image} resizeMode="cover" />

      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{product.category}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.infoGrid}>
          <View style={[styles.infoCard, { backgroundColor: '#e8f5e9' }]}>
            <Text style={styles.infoLabel}>PRECO</Text>
            <Text style={[styles.infoValue, { color: '#2e7d32' }]}>R$ {Number(product.price).toFixed(2)}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>ESTOQUE</Text>
            <Text style={[styles.infoValue, product.stock < 5 && { color: '#c62828' }]}>{product.stock}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>AVALIACAO</Text>
            <Text style={styles.infoValue}>⭐ {product.rating}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>SKU</Text>
            <Text style={styles.infoValue}>{product.sku || '—'}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('ProductForm', { product })}
          >
            <Text style={styles.editBtnText}>✏️  Editar produto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete} disabled={deleting}>
            <Text style={styles.deleteBtnText}>{deleting ? 'Removendo...' : '🗑️  Remover produto'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  image: { width: '100%', height: 260 },
  badgeRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12 },
  badge: { backgroundColor: '#e8f0fe', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, color: '#1a73e8', fontWeight: '600', textTransform: 'capitalize' },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  brand: { fontSize: 13, color: '#888', marginBottom: 10 },
  description: { fontSize: 14, color: '#555', lineHeight: 21, marginBottom: 20 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flex: 1,
    minWidth: '44%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  infoLabel: { fontSize: 11, color: '#999', marginBottom: 4 },
  infoValue: { fontSize: 17, fontWeight: '700', color: '#333' },
  actions: { gap: 12, marginTop: 20, paddingBottom: 30 },
  editBtn: { backgroundColor: '#1a73e8', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  editBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  deleteBtn: { backgroundColor: '#fdecea', borderRadius: 14, paddingVertical: 15, alignItems: 'center', borderWidth: 1.5, borderColor: '#ef9a9a' },
  deleteBtnText: { color: '#c62828', fontSize: 15, fontWeight: '700' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorIcon: { fontSize: 48, marginBottom: 12 },
  errorText: { fontSize: 15, color: '#c62828', textAlign: 'center', marginBottom: 16 },
  backBtn: { backgroundColor: '#1a73e8', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
  backBtnText: { color: '#fff', fontWeight: '600' },
});
