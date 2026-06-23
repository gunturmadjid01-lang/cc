import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

export default function ProfileScreen() {
  const { logout, refreshMe, token, user } = useAuth();
  const profile = user?.credit_card_profile;
  const [form, setForm] = useState({
    nik: profile?.nik ?? '',
    birth_place: '',
    birth_date: '',
    gender: 'male',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    occupation: profile?.occupation ?? '',
    monthly_income: profile?.monthly_income ?? '',
    company_name: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitProfile() {
    if (!token) return;
    setNotice('');
    setLoading(true);
    try {
      await apiRequest('/profile', { method: 'PUT', token, body: form });
      await refreshMe();
      setNotice('Profil berhasil disimpan. Status pengajuan masuk ke review admin.');
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : 'Profil gagal disimpan.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Profil Pengajuan</Text>
          <Text style={styles.subtitle}>Lengkapi data seperti proses pendaftaran kartu kredit.</Text>
        </View>
        <Pressable onPress={logout} style={styles.logoutButton}>
          <Ionicons color="#C2413B" name="log-out-outline" size={22} />
        </Pressable>
      </View>

      <View style={styles.summaryBand}>
        <Text style={styles.summaryLabel}>Status aplikasi</Text>
        <Text style={styles.summaryValue}>{statusLabel(profile?.application_status ?? 'draft')}</Text>
      </View>

      <View style={styles.form}>
        <Field label="NIK" onChangeText={(value) => updateField('nik', value)} value={form.nik} />
        <Field label="Tempat lahir" onChangeText={(value) => updateField('birth_place', value)} value={form.birth_place} />
        <Field label="Tanggal lahir (YYYY-MM-DD)" onChangeText={(value) => updateField('birth_date', value)} value={form.birth_date} />
        <Field label="Gender (male/female)" onChangeText={(value) => updateField('gender', value)} value={form.gender} />
        <Field label="Alamat lengkap" multiline onChangeText={(value) => updateField('address', value)} value={form.address} />
        <Field label="Kota" onChangeText={(value) => updateField('city', value)} value={form.city} />
        <Field label="Provinsi" onChangeText={(value) => updateField('province', value)} value={form.province} />
        <Field label="Kode pos" onChangeText={(value) => updateField('postal_code', value)} value={form.postal_code} />
        <Field label="Pekerjaan" onChangeText={(value) => updateField('occupation', value)} value={form.occupation} />
        <Field
          keyboardType="numeric"
          label="Penghasilan bulanan"
          onChangeText={(value) => updateField('monthly_income', value)}
          value={form.monthly_income}
        />
        <Field label="Nama perusahaan" onChangeText={(value) => updateField('company_name', value)} value={form.company_name} />
        <Field
          label="Kontak darurat"
          onChangeText={(value) => updateField('emergency_contact_name', value)}
          value={form.emergency_contact_name}
        />
        <Field
          keyboardType="phone-pad"
          label="Nomor kontak darurat"
          onChangeText={(value) => updateField('emergency_contact_phone', value)}
          value={form.emergency_contact_phone}
        />
      </View>

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      <Pressable disabled={loading} onPress={submitProfile} style={styles.primaryButton}>
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons color="#FFFFFF" name="save-outline" size={20} />}
        <Text style={styles.primaryText}>Simpan Profil</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  multiline?: boolean;
}) {
  const { label, multiline, ...inputProps } = props;

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        multiline={multiline}
        placeholderTextColor="#8A97A8"
        style={[styles.input, multiline && styles.textArea]}
        {...inputProps}
      />
    </View>
  );
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    approved: 'Disetujui',
    draft: 'Draft',
    pending: 'Menunggu review admin',
    rejected: 'Ditolak',
  };

  return labels[status] ?? status;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#F6F8FB',
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
    paddingTop: 64,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  title: {
    color: '#102033',
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0,
  },
  subtitle: {
    color: '#66758A',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#FCEFEF',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  summaryBand: {
    backgroundColor: '#EAF2F8',
    borderRadius: 8,
    marginTop: 22,
    padding: 16,
  },
  summaryLabel: {
    color: '#52657A',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryValue: {
    color: '#102033',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  form: {
    gap: 14,
    marginTop: 18,
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
    minHeight: 50,
    paddingHorizontal: 14,
  },
  textArea: {
    minHeight: 88,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  notice: {
    color: '#0F5E9C',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 16,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#0F2E4F',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 54,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
