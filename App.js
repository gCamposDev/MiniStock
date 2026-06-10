import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useRef } from 'react';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import Loading from './src/components/Loading';
import LoginScreen from './src/screens/LoginScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import ProductFormScreen from './src/screens/ProductFormScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import { setNavigationRef } from './src/services/api';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { signed, loading } = useAuth();
  if (loading) return <Loading message="Verificando sessao..." />;
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1a73e8' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        headerBackTitleVisible: false,
      }}
    >
      {!signed ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="ProductList" component={ProductListScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Detalhes do Produto' }} />
          <Stack.Screen
            name="ProductForm"
            component={ProductFormScreen}
            options={({ route }) => ({ title: route.params && route.params.product ? 'Editar Produto' : 'Novo Produto' })}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const navigationRef = useRef(null);
  return (
    <AuthProvider>
      <NavigationContainer ref={navigationRef} onReady={() => setNavigationRef(navigationRef.current)}>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
