import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import AppBackdrop from '@/components/application/AppBackdrop';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

export default function PayScreen() {
  const { refreshMe, token, user } = useAuth();
  const profile = user?.credit_card_profile;
  const requiredAmount = Number(profile?.initial_deposit_amount ?? 0);
  const [amount, setAmount] = useState(requiredAmount ? String(requiredAmount) : '');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  async function startPayment() {
    if (!token) return;
    setLoading(true);
    setNotice('');

    try {
      const sanitizedAmount = Number(amount.replace(/\D/g, '')) || requiredAmount;
      const response = await apiRequest<{ message: string; redirect_url?: string | null }>('/payments/initial-deposit', {
        method: 'POST',
        token,
        body: { amount: sanitizedAmount },
      });

      setNotice(response.message);
      await refreshMe();

      if (response.redirect_url) {
        await WebBrowser.openBrowserAsync(response.redirect_url);
      }
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : 'Pembayaran gagal dibuat.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.page}>
      <AppBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Bayaran awal</Text>
        <Text style={styles.title}>Aktifkan had kredit anda</Text>
        <Text style={styles.subtitle}>Selesaikan bayaran permulaan yang ditetapkan oleh admin untuk membuka had penggunaan kad.</Text>

        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.heroIcon}>
              <Ionicons color="#FFFFFF" name="shield-checkmark-outline" size={24} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroLabel}>Jumlah perlu dibayar</Text>
              <Text style={styles.heroAmount}>{money(requiredAmount)}</Text>
            </View>
          </View>
          <Text style={styles.heroNote}>Pembayaran berjalan melalui Midtrans Sandbox dengan tetapan daripada admin.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formLabel}>Masukkan jumlah</Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={setAmount}
            placeholder={requiredAmount ? `Contoh: ${requiredAmount.toLocaleString('ms-MY')}` : 'Contoh: 250000'}
            placeholderTextColor="#97A0B2"
            style={styles.input}
            value={amount}
          />
          <Pressable disabled={loading} onPress={startPayment} style={styles.button}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons color="#FFFFFF" name="card-outline" size={20} />}
            <Text style={styles.buttonText}>Teruskan bayaran sandbox</Text>
          </Pressable>
        </View>

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </ScrollView>
    </View>
  );
}

function money(value: number) {
  return `RM ${value.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const styles = StyleSheet.create({
  page: { backgroundColor: '#06154B', flex: 1 },
  content: { gap: 16, paddingBottom: 120, paddingHorizontal: 20, paddingTop: 70 },
  kicker: { color: '#92C8FF', fontSize: 12, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', lineHeight: 32 },
  subtitle: { color: '#D7E5FF', fontSize: 13, lineHeight: 20 },
  heroCard: { backgroundColor: '#123DB8', borderRadius: 18, gap: 10, padding: 18 },
  heroRow: { alignItems: 'center', flexDirection: 'row', gap: 14 },
  heroIcon: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 14, height: 48, justifyContent: 'center', width: 48 },
  heroCopy: { flex: 1 },
  heroLabel: { color: '#DDEBFF', fontSize: 12, fontWeight: '800' },
  heroAmount: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', marginTop: 6 },
  heroNote: { color: '#DDEBFF', fontSize: 12, lineHeight: 18 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 18, gap: 14, padding: 18 },
  formLabel: { color: '#06154B', fontSize: 13, fontWeight: '900' },
  input: { borderColor: '#DDE3EF', borderRadius: 12, borderWidth: 1, color: '#06154B', fontSize: 16, height: 54, paddingHorizontal: 14 },
  button: { alignItems: 'center', backgroundColor: '#5B42D6', borderRadius: 12, flexDirection: 'row', gap: 8, height: 54, justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  notice: { color: '#DDEBFF', fontSize: 13, fontWeight: '700', lineHeight: 19, paddingHorizontal: 4 },
});
