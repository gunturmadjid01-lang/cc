import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import AppBackdrop from '@/components/application/AppBackdrop';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

type Reward = {
  description: string;
  id: string;
  minimum_points: number;
  title: string;
};

type ContactCard = {
  id: string;
  fullName: string;
  phone: string;
};

export default function RewardsScreen() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contacts, setContacts] = useState<ContactCard[]>([]);
  const [contactMessage, setContactMessage] = useState('');
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    if (!token) return;

    apiRequest<{ points: number; rewards: Reward[] }>('/rewards', { token })
      .then((payload) => {
        setPoints(payload.points);
        setRewards(payload.rewards);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const loadContacts = useCallback(async () => {
    setContactsLoading(true);
    setContactError('');
    setContactMessage('');

    try {
      const permission = await Contacts.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        setContactError('Izin kontak diperlukan untuk memaparkan senarai kenalan.');
        setContacts([]);
        return;
      }

      const response = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        sort: Contacts.SortTypes.FirstName,
        pageSize: 200,
      });

      const mapped = response.data
        .map((item: Contacts.Contact) => {
          const phone = item.phoneNumbers?.[0]?.number?.trim();
          const fullName = [item.firstName, item.lastName].filter(Boolean).join(' ').trim();
          if (!fullName || !phone) return null;
          return {
            id: item.id ?? fullName,
            fullName,
            phone,
          };
        })
        .filter((item: ContactCard | null): item is ContactCard => Boolean(item));

      setContacts(mapped);
      setContactMessage(`Ditemui ${mapped.length} kenalan yang boleh dijemput untuk naikkan limit.`);
    } catch (error) {
      setContactError(error instanceof Error ? error.message : 'Gagal memuatkan kontak.');
    } finally {
      setContactsLoading(false);
    }
  }, []);

  async function shareToContact(contact: ContactCard) {
    const referralText = [
      `Hai ${contact.fullName},`,
      '',
      `${user?.name ?? 'Saya'} menjemput anda untuk cuba Nexa Prime Card.`,
      'Sila buka aplikasi dan semak pengajuan anda di sana.',
      '',
      `Kontak: ${contact.phone}`,
    ].join('\n');

    await Share.share({
      message: referralText,
      title: 'Jemputan Nexa Prime Card',
    });
  }

  return (
    <View style={styles.page}>
      <AppBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Ganjaran kad</Text>
          <Text style={styles.title}>Rewards</Text>
          <Text style={styles.subtitle}>Tebus poin anda dan jemput kenalan untuk bantu naikkan limit akaun.</Text>
        </View>

        <View style={styles.pointsCard}>
          <View style={styles.pointsIcon}>
            <Ionicons color="#FFFFFF" name="gift-outline" size={24} />
          </View>
          <Text style={styles.pointsValue}>{points}</Text>
          <Text style={styles.pointsLabel}>Poin tersedia</Text>
        </View>

        <View style={styles.noticeCard}>
          <Ionicons color="#123DB8" name="information-circle-outline" size={18} />
          <Text style={styles.noticeText}>Poin akan tamat tempoh selepas 1 tahun dari tarikh diperoleh.</Text>
        </View>

        {loading ? <ActivityIndicator color="#FFFFFF" /> : null}

        {rewards.map((item) => (
          <View key={item.id} style={styles.rewardCard}>
            <View style={styles.rewardIcon}>
              <Ionicons color="#123DB8" name={iconFor(item.id)} size={24} />
            </View>
            <View style={styles.rewardCopy}>
              <Text style={styles.rewardTitle}>{item.title}</Text>
              <Text style={styles.rewardDesc}>{item.description}</Text>
              <Text style={styles.rewardMin}>Mulai {item.minimum_points.toLocaleString('id-ID')} poin</Text>
            </View>
            <Ionicons color="#8A93A7" name="chevron-forward" size={20} />
          </View>
        ))}

        <View style={styles.referralCard}>
          <View style={styles.referralHeader}>
            <View style={styles.referralTitleWrap}>
              <Text style={styles.referralKicker}>Jemput kenalan</Text>
              <Text style={styles.referralTitle}>Share ke contact</Text>
              <Text style={styles.referralDesc}>Muatkan senarai kontak, pilih kenalan, lalu kongsi jemputan dari aplikasi.</Text>
            </View>
            <Pressable onPress={loadContacts} style={styles.referralButton}>
              {contactsLoading ? <ActivityIndicator color="#06154B" /> : <Ionicons color="#06154B" name="people-outline" size={18} />}
              <Text style={styles.referralButtonText}>{contactsLoading ? 'Memuat...' : 'Muat kontak'}</Text>
            </Pressable>
          </View>

          {contactMessage ? <Text style={styles.referralMessage}>{contactMessage}</Text> : null}
          {contactError ? <Text style={styles.referralError}>{contactError}</Text> : null}

          {contacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactAvatar}>
                <Ionicons color="#FFFFFF" name="person-outline" size={18} />
              </View>
              <View style={styles.contactCopy}>
                <Text style={styles.contactName}>{contact.fullName}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
              <Pressable onPress={() => shareToContact(contact)} style={styles.shareButton}>
                <Ionicons color="#FFFFFF" name="share-social-outline" size={16} />
                <Text style={styles.shareButtonText}>Share</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function iconFor(id: string): keyof typeof Ionicons.glyphMap {
  if (id === 'cashback') return 'cash-outline';
  if (id === 'vouchers') return 'ticket-outline';
  if (id === 'pulsa-data') return 'phone-portrait-outline';
  return 'flash-outline';
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { gap: 14, paddingBottom: 120, paddingHorizontal: 20, paddingTop: 68 },
  header: { gap: 8 },
  kicker: { color: '#9CCAFF', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#D7E5FF', fontSize: 13, lineHeight: 20 },
  pointsCard: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 20, gap: 10, paddingVertical: 22 },
  pointsIcon: { alignItems: 'center', backgroundColor: '#123DB8', borderRadius: 999, height: 54, justifyContent: 'center', width: 54 },
  pointsValue: { color: '#123DB8', fontSize: 32, fontWeight: '900' },
  pointsLabel: { color: '#657084', fontSize: 14, fontWeight: '800' },
  noticeCard: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 16, flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  noticeText: { color: '#5C6476', flex: 1, fontSize: 12, lineHeight: 18 },
  rewardCard: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 18, flexDirection: 'row', gap: 14, minHeight: 96, padding: 16 },
  rewardIcon: { alignItems: 'center', backgroundColor: '#E9F0FF', borderRadius: 14, height: 44, justifyContent: 'center', width: 44 },
  rewardCopy: { flex: 1 },
  rewardTitle: { color: '#0D1836', fontSize: 15, fontWeight: '900' },
  rewardDesc: { color: '#667082', fontSize: 12, lineHeight: 18, marginTop: 4 },
  rewardMin: { color: '#123DB8', fontSize: 12, fontWeight: '900', marginTop: 7 },
  referralCard: { backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 20, gap: 14, padding: 18 },
  referralHeader: { gap: 12 },
  referralTitleWrap: { gap: 4 },
  referralKicker: { color: '#5B42D6', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  referralTitle: { color: '#0D1836', fontSize: 18, fontWeight: '900' },
  referralDesc: { color: '#667082', fontSize: 12, lineHeight: 18 },
  referralButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#F5C14F', borderRadius: 999, flexDirection: 'row', gap: 8, minHeight: 42, paddingHorizontal: 16 },
  referralButtonText: { color: '#06154B', fontSize: 13, fontWeight: '900' },
  referralMessage: { color: '#1B7A3D', fontSize: 12, fontWeight: '700', lineHeight: 18 },
  referralError: { color: '#C2413B', fontSize: 12, fontWeight: '700', lineHeight: 18 },
  contactCard: { alignItems: 'center', backgroundColor: '#F7F9FF', borderColor: '#E5E8F2', borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 12, padding: 14 },
  contactAvatar: { alignItems: 'center', backgroundColor: '#123DB8', borderRadius: 12, height: 38, justifyContent: 'center', width: 38 },
  contactCopy: { flex: 1 },
  contactName: { color: '#0D1836', fontSize: 14, fontWeight: '900' },
  contactPhone: { color: '#667082', fontSize: 12, marginTop: 4 },
  shareButton: { alignItems: 'center', backgroundColor: '#123DB8', borderRadius: 999, flexDirection: 'row', gap: 6, minHeight: 40, paddingHorizontal: 14 },
  shareButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
});
