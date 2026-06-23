import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('customer@credit.test');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Login gagal.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.page}>
      <View style={styles.brand}>
        <Image source={require('../../assets/images/nexa-logo.png')} resizeMode="contain" style={styles.logo} />
        <Text style={styles.title}>Masuk ke Nexa Bank</Text>
        <Text style={styles.subtitle}>Semak status permohonan dan limit kad kredit anda.</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="nama@email.com"
            placeholderTextColor="#8A97A8"
            style={styles.input}
            value={email}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            onChangeText={setPassword}
            placeholder="Minimal 8 karakter"
            placeholderTextColor="#8A97A8"
            secureTextEntry
            style={styles.input}
            value={password}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable disabled={loading} onPress={handleLogin} style={styles.primaryButton}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons color="#FFFFFF" name="log-in-outline" size={20} />}
          <Text style={styles.primaryText}>Masuk</Text>
        </Pressable>

        <Link href="/register" style={styles.link}>
          Belum punya akaun? Daftar sekarang
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#F4F7FB',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brand: {
    marginBottom: 28,
  },
  logo: {
    height: 58,
    marginBottom: 24,
    width: 170,
  },
  title: {
    color: '#071A46',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0,
  },
  subtitle: {
    color: '#66758A',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: '#26384D',
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D8E0EA',
    borderRadius: 8,
    borderWidth: 1,
    color: '#102033',
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  error: {
    color: '#C2413B',
    fontSize: 13,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#062D9B',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 54,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  link: {
    color: '#0A3B97',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
