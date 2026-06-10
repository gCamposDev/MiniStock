import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { createProduct, updateProduct } from '../services/products';

export default function ProductFormScreen({ route, navigation }) {
  const existing = route.params && route.params.product ? route.params.product : null;
  const isEdit = !!existing;

  const [title, setTitle] = useState(existing ? existing.title : '');
  const [description, setDescription] = useState(existing ? existing.description : '');
  const [price, setPrice] = useState(existing ? String(existing.price) : '');
  const [category, setCategory] = useState(existing ? existing.category : '');
  const [stock, setStock] = useState(existing ? String(existing.stock) : '');
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!title.trim()) return 'O titulo e obrigatorio.';
    if (!description.trim()) return 'A descricao e obrigatoria.';
    if (!price.trim() || isNaN(Number(price))) return 'Informe um preco valido.';
    if (!category.trim()) return 'A categoria e obrigatoria.';
    if (!stock.trim() || isNaN(Number(stock))) return 'Informe um estoque valido.';
    return null;
  }

  async function handleSubmit() {
    const err = validate();
    if (err) { Alert.alert('Campos invalidos', err); return; }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      stock: Number(stock),
    };

    setLoading(true);
    try {
      if (isEdit) {
        const updated = await updateProduct(existing.id, payload);
        const merged = Object.assign({}, existing, payload, updated);
        Alert.alert('Sucesso', 'Produto atualizado!', [{
          text: 'OK',
          onPress: () => {
            navigation.navigate('ProductDetail', { productId: existing.id, updatedProduct: merged });
            navigation.navigate('ProductList', { updatedProduct: merged });
          },
        }]);
      } else {
        const created = await createProduct(payload);
        const merged = Object.assign({}, payload, created);
        Alert.alert('Sucesso', 'Produto cadastrado!', [{
          text: 'OK',
          onPress: () => navigation.navigate('ProductList', { newProduct: merged }),
        }]);
      }
    } catch (err) {
      Alert.alert('Erro', err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>{isEdit ? '✏️  Editar produto' : '➕  Novo produto'}</Text>

        <Text style={styles.label}>Titulo</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Nome do produto" placeholderTextColor="#bbb" editable={!loading} />

        <Text style={styles.label}>Descricao</Text>
        <TextInput style={[styles.input, styles.inputMulti]} value={description} onChangeText={setDescription} placeholder="Descreva o produto" placeholderTextColor="#bbb" multiline numberOfLines={4} textAlignVertical="top" editable={!loading} />

        <Text style={styles.label}>Preco (R$)</Text>
        <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="0.00" placeholderTextColor="#bbb" keyboardType="decimal-pad" editable={!loading} />

        <Text style={styles.label}>Categoria</Text>
        <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="Ex: smartphones" placeholderTextColor="#bbb" editable={!loading} />

        <Text style={styles.label}>Estoque</Text>
        <TextInput style={styles.input} value={stock} onChangeText={setStock} placeholder="0" placeholderTextColor="#bbb" keyboardType="numeric" editable={!loading} />

        <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitBtnText}>{loading ? 'Salvando...' : isEdit ? 'Salvar alteracoes' : 'Cadastrar produto'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} disabled={loading}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  content: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 20, fontWeight: '800', color: '#222', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222',
  },
  inputMulti: { height: 100, paddingTop: 12 },
  submitBtn: { backgroundColor: '#1a73e8', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { color: '#888', fontSize: 15, fontWeight: '600' },
});
