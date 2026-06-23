import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';

export default function VerificationScreen() {
  const { user, refreshMe } = useAuth();
  const [message, setMessage] = useState('');
  const documents = user?.verification_documents ?? [];

  function statusFor(type: 'ktp' | 'face') {
    return documents.find((document) => document.type === type)?.status ?? 'belum_upload';
  }

  async function handlePlaceholderUpload(type: 'ktp' | 'face') {
    setMessage(
      type === 'ktp'
        ? 'Backend sudah siap menerima upload KTP di endpoint /api/verifications/ktp.'
        : 'Backend sudah siap menerima upload wajah di endpoint /api/verifications/face.'
    );
    await refreshMe();
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Verifikasi Identitas</Text>
      <Text style={styles.subtitle}>Verifikasi dilakukan setelah profil dibuat. Admin akan memeriksa berkas sebelum limit diberikan.</Text>

      <VerificationCard
        icon="card-outline"
        onPress={() => handlePlaceholderUpload('ktp')}
        status={statusFor('ktp')}
        title="Verifikasi KTP"
        description="Upload foto KTP yang jelas, tidak blur, dan seluruh informasi terbaca."
      />
      <VerificationCard
        icon="scan-outline"
        onPress={() => handlePlaceholderUpload('face')}
        status={statusFor('face')}
        title="Verifikasi Wajah"
        description="Ambil foto wajah dari depan dengan pencahayaan cukup untuk pencocokan manual admin."
      />

      {message ? (
        <View style={styles.messageBox}>
          <Ionicons color="#0F5E9C" name="information-circle-outline" size={20} />
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function VerificationCard({
  description,
  icon,
  onPress,
  status,
  title,
}: {
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  status: string;
  title: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconBox}>
          <Ionicons color="#0F5E9C" name={icon} size={24} />
        </View>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.statusText}>{statusLabel(status)}</Text>
        </View>
      </View>
      <Text style={styles.description}>{description}</Text>
      <Pressable onPress={onPress} style={styles.secondaryButton}>
        <Ionicons color="#0F2E4F" name="cloud-upload-outline" size={20} />
        <Text style={styles.secondaryText}>Pilih Berkas</Text>
      </Pressable>
    </View>
  );
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    approved: 'Disetujui admin',
    belum_upload: 'Belum diunggah',
    pending: 'Menunggu review',
    rejected: 'Ditolak admin',
  };

  return labels[status] ?? status;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#F6F8FB',
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 20,
    paddingBottom: 110,
    paddingTop: 64,
  },
  title: {
    color: '#102033',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0,
  },
  subtitle: {
    color: '#66758A',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E6EF',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: '#EAF2F8',
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  cardTitleWrap: {
    flex: 1,
  },
  cardTitle: {
    color: '#102033',
    fontSize: 16,
    fontWeight: '800',
  },
  statusText: {
    color: '#0F5E9C',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  description: {
    color: '#52657A',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#F5F9FC',
    borderColor: '#CFE0EE',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 48,
  },
  secondaryText: {
    color: '#0F2E4F',
    fontSize: 14,
    fontWeight: '800',
  },
  messageBox: {
    alignItems: 'flex-start',
    backgroundColor: '#EAF2F8',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  messageText: {
    color: '#26384D',
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});
