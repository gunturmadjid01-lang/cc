import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import AppBackdrop from '@/components/application/AppBackdrop';
import CreditCardSvg from '@/components/application/CreditCardSvg';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const { refreshMe, user } = useAuth();
  const profile = user?.credit_card_profile;
  const approved = profile?.application_status === 'approved';
  const needsProfile = !profile?.status_profile;
  const unlocked = Boolean(profile?.credit_limit_unlocked_at);
  const limit = money(profile?.credit_limit ?? 0);
  const availableLimit = unlocked ? money(profile?.available_limit ?? profile?.credit_limit ?? 0) : 'RM 0.00';
  const cardNumber = profile?.card_number ? formatCardNumber(profile.card_number) : '•••• •••• •••• ••••';
  const cardExpiry = formatExpiry(profile?.card_expiry_month, profile?.card_expiry_year);
  const refreshed = useRef(false);

  useEffect(() => {
    if (refreshed.current || !user?.id) return;
    refreshed.current = true;
    refreshMe().catch(() => undefined);
  }, [refreshMe, user?.id]);

  return (
    <View style={styles.page}>
      <AppBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.topMetaRow}>
            <Text style={styles.kicker}>Nexa Prime Card</Text>
            <View style={[styles.statusChip, approved ? styles.approvedChip : styles.waitChip]}>
              <Ionicons color={approved ? '#1B7A3D' : '#9A6500'} name={approved ? 'checkmark-circle' : 'time-outline'} size={14} />
              <Text style={[styles.statusChipText, approved ? styles.approvedText : styles.waitText]}>
                {needsProfile ? 'Perlu verifikasi' : approved ? 'Diluluskan' : 'Menunggu pengesahan'}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>Selamat datang, {firstName(user?.name)}</Text>
          <Text style={styles.subtitle}>Semak kad, pembayaran, status permohonan, dan rewards anda dalam satu aplikasi.</Text>
        </View>

        {needsProfile ? (
          <View style={styles.profileBanner}>
            <View style={styles.profileBannerIcon}>
              <Ionicons color="#0B1E5B" name="document-text-outline" size={22} />
            </View>
            <View style={styles.profileBannerCopy}>
              <Text style={styles.profileBannerTitle}>Lengkapkan maklumat permohonan</Text>
              <Text style={styles.profileBannerText}>
                Sahkan maklumat peribadi dan pekerjaan anda untuk meneruskan permohonan Kad Kredit Nexa Prime.
              </Text>
            </View>
            <Pressable onPress={() => router.push({ pathname: '/register', params: { mode: 'profile' } })} style={styles.profileBannerButton}>
              <Text style={styles.profileBannerButtonText}>Lengkapkan profil</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.cardPanel}>
          <View style={styles.cardHeroWrap}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.cardLabel}>{approved ? 'Kad aktif anda' : 'Kad dalam semakan'}</Text>
                <Text style={styles.cardTitle}>{profile?.card_holder_name ?? 'NEXA PRIME'}</Text>
              </View>
              <View style={styles.cardFlag}>
                <Ionicons color="#F5C14F" name="shield-checkmark-outline" size={14} />
                <Text style={styles.cardFlagText}>{approved ? 'AKTIF' : 'SEMAKAN'}</Text>
              </View>
            </View>

            <View style={styles.cardFrame}>
              <CreditCardSvg />

              <View style={styles.cardOverlayContent}>
                <View style={styles.cardTopRow}>
                  <View style={styles.cardTopLeft}>
                    <Text style={styles.cardBrand}>NEXA BANK</Text>
                    <Text style={styles.cardTag}>{approved ? 'Kad aktif anda' : 'Kad sedang diproses'}</Text>
                  </View>
                  <View style={styles.cardTopBadge}>
                    <Ionicons color="#FFFFFF" name="wifi-outline" size={16} />
                  </View>
                </View>

                <View style={styles.cardNumberWrap}>
                  <Text style={styles.cardNumber}>{cardNumber}</Text>
                </View>

                <View style={styles.cardBottomRow}>
                  <View style={styles.cardBottomBlock}>
                    <Text style={styles.cardBottomLabel}>Tamat tempoh</Text>
                    <Text style={styles.cardBottomValue}>{cardExpiry}</Text>
                  </View>
                  <View style={[styles.cardBottomBlock, styles.cardBottomBlockRight]}>
                    <Text style={styles.cardBottomLabel}>CVV</Text>
                    <Text style={styles.cardBottomValue}>•••</Text>
                  </View>
                </View>

                <View style={styles.cardFooterRow}>
                  <Text style={styles.cardHolder}>{profile?.card_holder_name ?? 'NEXA PRIME'}</Text>
                  <Text style={styles.cardBadgeText}>{approved ? 'AKTIF' : 'SEMAKAN'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardMetaStrip}>
              <View style={styles.cardMetaItem}>
                <Text style={styles.cardMetaLabel}>Status kad</Text>
                <Text style={styles.cardMetaValue}>{unlocked ? 'Aktif' : 'Belum dibuka'}</Text>
              </View>
              <View style={styles.cardMetaDivider} />
              <View style={styles.cardMetaItem}>
                <Text style={styles.cardMetaLabel}>Had tersedia</Text>
                <Text style={styles.cardMetaStatus}>{availableLimit}</Text>
              </View>
            </View>
          </View>

          <View style={styles.quickRow}>
            <QuickCard icon="wallet-outline" label="Bayar" onPress={() => router.push('/bayar')} />
            <QuickCard icon="qr-code-outline" label="QRIS" onPress={() => router.push('/qris')} />
            <QuickCard icon="gift-outline" label="Rewards" onPress={() => router.push('/rewards')} />
          </View>
        </View>

        {!needsProfile ? (
          <View style={styles.limitCard}>
          <View style={styles.limitHeader}>
            <View style={styles.limitHeaderCopy}>
              <Text style={styles.limitKicker}>{approved ? 'Had akaun' : 'Status permohonan'}</Text>
              <Text style={styles.limitValue}>{limit}</Text>
              <Text style={styles.limitSub}>
                {approved
                  ? unlocked
                    ? 'Had kredit anda sudah aktif.'
                    : 'Silakan lakukan pembayaran saldo awal untuk aktifkan limit.'
                  : 'Pengajuan anda masih menunggu semakan admin.'}
              </Text>
            </View>
            <View style={styles.limitBadge}>
              <Ionicons color="#FFFFFF" name={unlocked ? 'checkmark-circle' : 'time-outline'} size={18} />
            </View>
          </View>

          <View style={styles.limitFooter}>
            <Pressable onPress={() => (approved ? router.push('/bayar') : router.push('/register'))} style={styles.limitButton}>
              <Ionicons color="#06154B" name={approved ? 'wallet-outline' : 'document-text-outline'} size={18} />
              <Text style={styles.limitButtonText}>{approved ? 'Bayar saldo awal' : 'Semak pengajuan'}</Text>
            </Pressable>
            <Text style={styles.limitHint}>
              {approved
                ? `Bayaran awal ${money(profile?.initial_deposit_amount)} diperlukan untuk membuka limit tersedia ${availableLimit}.`
                : 'Buka pengajuan untuk melihat nombor permohonan, dokumen, dan status terkini.'}
            </Text>
          </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function QuickCard({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.quickCard}>
      <View style={styles.quickIconWrap}>
        <Ionicons color="#123DB8" name={icon} size={24} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

function firstName(name?: string) {
  return name?.trim().split(/\s+/)[0] || 'Tuan';
}

function money(value?: number | string | null) {
  const amount = Number(value ?? 0);
  return `RM ${amount.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '');
  const last4 = digits.slice(-4).padStart(4, '•');
  return `•••• •••• •••• ${last4}`;
}

function formatExpiry(month?: string | null, year?: string | null) {
  const mm = month ? month.toString().padStart(2, '0').slice(-2) : '••';
  const yy = year ? year.toString().slice(-2) : '••';
  return `${mm}/${yy}`;
}

const styles = StyleSheet.create({
  page: { backgroundColor: '#06154B', flex: 1 },
  content: { gap: 18, paddingBottom: 126, paddingHorizontal: 12, paddingTop: 64 },
  topBar: { gap: 10, paddingHorizontal: 8 },
  topMetaRow: { alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  kicker: { color: '#92C8FF', flexShrink: 1, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', lineHeight: 34 },
  subtitle: { color: '#D5E5FF', fontSize: 13, lineHeight: 20, maxWidth: 330 },
  statusChip: { alignItems: 'center', borderRadius: 999, flexDirection: 'row', gap: 6, paddingHorizontal: 11, paddingVertical: 8 },
  waitChip: { backgroundColor: '#FFF4D8' },
  approvedChip: { backgroundColor: '#E8F8EE' },
  statusChipText: { fontSize: 12, fontWeight: '900' },
  waitText: { color: '#9A6500' },
  approvedText: { color: '#1B7A3D' },
  cardPanel: { gap: 14, marginTop: 8 },
  cardHeroWrap: { gap: 12 },
  cardHeaderRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cardLabel: { color: '#EAF2FF', fontSize: 12, fontWeight: '800' },
  cardTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginTop: 4 },
  cardFlag: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cardFlagText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  cardFrame: {
    aspectRatio: 1.54,
    borderRadius: 24,
    elevation: 8,
    overflow: 'hidden',
    shadowColor: '#031235',
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
  },
  cardOverlayContent: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 22,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  cardTopRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  cardTopLeft: { gap: 4 },
  cardBrand: { color: '#F4F8FF', fontSize: 18, fontWeight: '900' },
  cardTag: { color: '#AFC4F3', fontSize: 11, fontWeight: '800' },
  cardTopBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  cardNumberWrap: { marginTop: 6 },
  cardNumber: { color: '#F8FBFF', fontSize: 18, fontWeight: '900' },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  cardBottomBlock: { gap: 4 },
  cardBottomBlockRight: { alignItems: 'flex-end' },
  cardBottomLabel: { color: '#C7D7FF', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  cardBottomValue: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  cardFooterRow: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' },
  cardHolder: { color: '#FFFFFF', flex: 1, fontSize: 17, fontWeight: '900' },
  cardBadgeText: { color: '#D8E6FF', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  cardMetaStrip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: '#E3E7F0',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  cardMetaItem: { flex: 1 },
  cardMetaDivider: { backgroundColor: '#E7EBF3', height: 32, width: 1 },
  cardMetaLabel: { color: '#6B7182', fontSize: 11, fontWeight: '800' },
  cardMetaValue: { color: '#0D1836', fontSize: 16, fontWeight: '900', marginTop: 4 },
  cardMetaStatus: { color: '#123DB8', fontSize: 16, fontWeight: '900', marginTop: 4 },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderColor: '#E2E8F4',
    borderRadius: 16,
    borderWidth: 1,
    elevation: 3,
    flex: 1,
    gap: 9,
    justifyContent: 'center',
    minHeight: 92,
    shadowColor: '#06154B',
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  quickIconWrap: {
    alignItems: 'center',
    backgroundColor: '#EAF1FF',
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  quickLabel: { color: '#0D1836', fontSize: 12, fontWeight: '900' },
  profileBanner: {
    alignItems: 'flex-start',
    backgroundColor: '#F5F8FF',
    borderColor: '#D9E4FF',
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    marginHorizontal: 8,
    padding: 16,
  },
  profileBannerIcon: {
    alignItems: 'center',
    backgroundColor: '#DDE8FF',
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  profileBannerCopy: { flex: 1, gap: 4 },
  profileBannerTitle: { color: '#0D1836', fontSize: 15, fontWeight: '900' },
  profileBannerText: { color: '#5F6880', fontSize: 12, lineHeight: 18 },
  profileBannerButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#0A3B97',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 14,
  },
  profileBannerButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  limitCard: { backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 22, gap: 16, marginHorizontal: 8, padding: 18 },
  limitHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', gap: 14 },
  limitHeaderCopy: { flex: 1 },
  limitKicker: { color: '#5B42D6', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  limitValue: { color: '#0D1836', fontSize: 34, fontWeight: '900', marginTop: 6 },
  limitSub: { color: '#667082', fontSize: 13, lineHeight: 20, marginTop: 6 },
  limitBadge: { alignItems: 'center', backgroundColor: '#123DB8', borderRadius: 16, height: 44, justifyContent: 'center', width: 44 },
  limitFooter: { backgroundColor: '#F7F9FF', borderColor: '#E5E8F2', borderRadius: 18, borderWidth: 1, gap: 10, padding: 14 },
  limitButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#F5C14F', borderRadius: 999, flexDirection: 'row', gap: 8, minHeight: 44, paddingHorizontal: 16 },
  limitButtonText: { color: '#06154B', fontSize: 13, fontWeight: '900' },
  limitHint: { color: '#667082', fontSize: 12, lineHeight: 18 },
});
