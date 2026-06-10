import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import {
  listCategories,
  listProducts,
  listProductsByCategory,
  searchProducts,
} from '../services/products';

const LIMIT = 10;

export default function ProductListScreen({ navigation }) {
  const { logout, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const skipRef = useRef(0);

  useEffect(() => {
    listCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    skipRef.current = 0;
    setHasMore(true);
    fetchProducts(true);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      const state = navigation.getState();
      const route = state && state.routes && state.routes.find(r => r.name === 'ProductList');
      const params = route && route.params;
      if (params) {
        if (params.updatedProduct) {
          setProducts(prev => prev.map(p => p.id === params.updatedProduct.id ? params.updatedProduct : p));
          navigation.setParams({ updatedProduct: null });
        }
        if (params.newProduct) {
          setProducts(prev => [params.newProduct, ...prev]);
          navigation.setParams({ newProduct: null });
        }
        if (params.deletedId) {
          setProducts(prev => prev.filter(p => p.id !== params.deletedId));
          navigation.setParams({ deletedId: null });
        }
      }
    });
    return unsub;
  }, [navigation]);

  async function fetchProducts(reset) {
    if (reset) { setLoading(true); setError(null); }
    try {
      let result;
      if (searchQuery.trim()) {
        result = await searchProducts(searchQuery.trim());
        setProducts(result.products);
        setHasMore(false);
      } else if (selectedCategory) {
        result = await listProductsByCategory(selectedCategory);
        setProducts(result.products);
        setHasMore(false);
      } else {
        result = await listProducts({ limit: LIMIT, skip: skipRef.current });
        if (reset) {
          setProducts(result.products);
        } else {
          setProducts(prev => [...prev, ...result.products]);
        }
        skipRef.current += result.products.length;
        setHasMore(skipRef.current < result.total);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    skipRef.current = 0;
    setHasMore(true);
    fetchProducts(true);
  }

  function handleEndReached() {
    if (!hasMore || loadingMore || loading || searchQuery || selectedCategory) return;
    setLoadingMore(true);
    fetchProducts(false);
  }

  function handleCategorySelect(slug) {
    setSelectedCategory(prev => prev === slug ? null : slug);
    setSearchQuery('');
  }

  function handleLogout() {
    Alert.alert('Sair', 'Deseja encerrar a sessao?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  if (loading && products.length === 0) return <Loading />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>MiniStock 📦</Text>
          <Text style={styles.headerSub}>Ola, {user && user.firstName ? user.firstName : 'usuario'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produto..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>

      {categories.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
              onPress={() => handleCategorySelect(cat)}
            >
              <Text style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={() => fetchProducts(true)}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={products}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          />
        )}
        ListEmptyComponent={!loading && !error ? <EmptyState message="Nenhum produto encontrado." /> : null}
        ListFooterComponent={loadingMore ? (
          <View style={styles.footerLoader}><Text style={styles.footerLoaderText}>Carregando mais...</Text></View>
        ) : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#1a73e8']} tintColor="#1a73e8" />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ProductForm', {})}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  header: {
    backgroundColor: '#1a73e8',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  searchRow: { paddingHorizontal: 16, paddingVertical: 12 },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#222',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  categoriesRow: { paddingHorizontal: 12, paddingBottom: 10, flexDirection: 'row', gap: 8 },
  catChip: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1.5, borderColor: '#e0e0e0' },
  catChipActive: { backgroundColor: '#1a73e8', borderColor: '#1a73e8' },
  catChipText: { fontSize: 12, color: '#555', textTransform: 'capitalize' },
  catChipTextActive: { color: '#fff', fontWeight: '700' },
  errorBanner: {
    backgroundColor: '#fdecea',
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: { color: '#c62828', fontSize: 13, flex: 1 },
  retryText: { color: '#1a73e8', fontWeight: '600', fontSize: 13 },
  footerLoader: { padding: 16, alignItems: 'center' },
  footerLoaderText: { color: '#888', fontSize: 13 },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    backgroundColor: '#1a73e8',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabText: { color: '#fff', fontSize: 32, lineHeight: 38, fontWeight: '300' },
});
