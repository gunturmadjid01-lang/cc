import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import AppBackdrop from '@/components/application/AppBackdrop';
import { useAuth } from '@/context/AuthContext';

export default function MenuScreen() {
  const { logout, user } = useAuth();
  const profile = user?.credit_card_profile;
  const profileReady = Boolean(profile?.status_profile);

  return (
    <View style={styles.page}>
      <AppBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Tetapan akaun</Text>
          <Text style={styles.title}>Menu</Text>
          <Text style={styles.subtitle}>Urus profil, PIN transaksi, bahasa, dan tetapan keselamatan anda di sini.</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons color="#FFFFFF" name="person-outline" size={26} />
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileLabel}>{profileReady ? 'Profil disahkan' : 'Verifikasi diperlukan'}</Text>
            <Text style={styles.profileName}>{user?.name ?? 'Nexa Prime Card'}</Text>
            <Text style={styles.profileSub}>
              {profileReady
                ? 'Semua tetapan penting berada di bawah akaun ini.'
                : 'Lengkapkan maklumat permohonan untuk meneruskan proses kad kredit.'}
            </Text>
          </View>
        </View>

        {!profileReady ? (
          <View style={styles.warnCard}>
            <Ionicons color="#0A3B97" name="document-text-outline" size={20} />
            <View style={styles.warnCopy}>
              <Text style={styles.warnTitle}>Maklumat permohonan belum lengkap</Text>
              <Text style={styles.warnText}>Sahkan data peribadi, pekerjaan, dan dokumen yang diperlukan sebelum permohonan dihantar untuk semakan.</Text>
            </View>
            <Pressable onPress={() => router.push({ pathname: '/register', params: { mode: 'profile' } })} style={styles.warnButton}>
              <Text style={styles.warnButtonText}>Lengkapkan profil</Text>
            </Pressable>
          </View>
        ) : null}

        <MenuItem icon="receipt-outline" onPress={() => router.push('/bills')} title="Bil dan penyata" />
        <MenuItem icon="analytics-outline" onPress={() => router.push('/score')} title="Laporan skor kredit" />
        <MenuItem icon="person-outline" onPress={() => router.push('/profile')} title="Maklumat akaun" />
        <MenuItem icon="keypad-outline" onPress={() => router.push('/pin')} title="Tukar PIN transaksi" />
        <MenuItem icon="language-outline" onPress={() => router.push('/language')} title="Bahasa" />

        <View style={styles.lockCard}>
          <View style={styles.lockIcon}>
            <Ionicons color="#FFFFFF" name="lock-closed-outline" size={20} />
          </View>
          <View style={styles.lockCopy}>
            <Text style={styles.lockTitle}>Kunci kad</Text>
            <Text style={styles.lockDesc}>Matikan kad sementara tanpa menutup akaun. Boleh dibuka semula bila-bila masa.</Text>
          </View>
          <Switch value={false} />
        </View>

        <MenuItem icon="card-outline" onPress={() => router.push('/physical-card')} title="Pesan kad fizikal" />
        <MenuItem icon="call-outline" onPress={() => router.push('/support')} title="Hubungi khidmat pelanggan" />

        <Pressable
          onPress={async () => {
            await logout();
            router.replace('/welcome');
          }}
          style={styles.logoutButton}
        >
          <Ionicons color="#D84F66" name="log-out-outline" size={18} />
          <Text style={styles.logoutText}>Log keluar</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function MenuItem({ icon, onPress, title }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; title: string }) {
  return (
    <Pressable onPress={onPress} style={styles.item}>
      <View style={styles.itemIcon}>
        <Ionicons color="#123DB8" name={icon} size={20} />
      </View>
      <Text style={styles.itemText}>{title}</Text>
      <Ionicons color="#8A93A7" name="chevron-forward" size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { gap: 12, paddingBottom: 120, paddingHorizontal: 20, paddingTop: 68 },
  header: { gap: 8, marginBottom: 4 },
  kicker: { color: '#9CCAFF', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#D7E5FF', fontSize: 13, lineHeight: 20 },
  profileCard: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 20, flexDirection: 'row', gap: 14, padding: 18 },
  avatar: { alignItems: 'center', backgroundColor: '#123DB8', borderRadius: 18, height: 54, justifyContent: 'center', width: 54 },
  profileCopy: { flex: 1 },
  profileLabel: { color: '#6A7385', fontSize: 12, fontWeight: '800' },
  profileName: { color: '#0D1836', fontSize: 16, fontWeight: '900', marginTop: 4 },
  profileSub: { color: '#667082', fontSize: 12, lineHeight: 18, marginTop: 4 },
  warnCard: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderColor: '#D9E4FF',
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  warnCopy: { flex: 1, gap: 4 },
  warnTitle: { color: '#0D1836', fontSize: 16, fontWeight: '900' },
  warnText: { color: '#667082', fontSize: 12, lineHeight: 18 },
  warnButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#123DB8',
    borderRadius: 999,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  warnButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  item: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 18, flexDirection: 'row', gap: 14, minHeight: 70, paddingHorizontal: 16 },
  itemIcon: { alignItems: 'center', backgroundColor: '#E9F0FF', borderRadius: 12, height: 36, justifyContent: 'center', width: 36 },
  itemText: { color: '#0D1836', flex: 1, fontSize: 14, fontWeight: '900' },
  lockCard: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 18, flexDirection: 'row', gap: 12, padding: 16 },
  lockIcon: { alignItems: 'center', backgroundColor: '#123DB8', borderRadius: 12, height: 36, justifyContent: 'center', width: 36 },
  lockCopy: { flex: 1 },
  lockTitle: { color: '#0D1836', fontSize: 14, fontWeight: '900' },
  lockDesc: { color: '#667082', fontSize: 12, lineHeight: 18, marginTop: 3 },
  logoutButton: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: 8, marginTop: 4, paddingVertical: 8 },
  logoutText: { color: '#D84F66', fontSize: 13, fontWeight: '900' },
});
