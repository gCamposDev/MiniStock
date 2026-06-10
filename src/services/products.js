import { api } from './api';

export async function listProducts({ limit = 10, skip = 0 }) {
  const { data } = await api.get('/products', { params: { limit, skip } });
  return data;
}

export async function searchProducts(q) {
  const { data } = await api.get('/products/search', { params: { q } });
  return data;
}

export async function listCategories() {
  const { data } = await api.get('/products/category-list');
  return data;
}

export async function listProductsByCategory(slug) {
  const { data } = await api.get('/products/category/' + slug);
  return data;
}

export async function getProduct(id) {
  const { data } = await api.get('/products/' + id);
  return data;
}

export async function createProduct(payload) {
  const { data } = await api.post('/products/add', payload);
  return data;
}

export async function updateProduct(id, payload) {
  const { data } = await api.put('/products/' + id, payload);
  return data;
}

export async function deleteProduct(id) {
  const { data } = await api.delete('/products/' + id);
  return data;
}
