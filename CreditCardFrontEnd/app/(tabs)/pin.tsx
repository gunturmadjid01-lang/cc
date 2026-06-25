import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import AppBackdrop from '@/components/application/AppBackdrop';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

type PinPhase = 'create' | 'confirm';

const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

export default function PinScreen() {
  const { token } = useAuth();
  const [phase, setPhase] = useState<PinPhase>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [visibleIndex, setVisibleIndex] = useState<number | null>(null);
  const [confirmVisibleIndex, setConfirmVisibleIndex] = useState<number | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const createTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeValue = phase === 'create' ? pin : confirmPin;
  const title = phase === 'create' ? 'Buat PIN transaksi' : 'Konfirmasi PIN';
  const subtitle =
    phase === 'create'
      ? 'Masukkan 6 angka PIN yang akan digunakan untuk transaksi.'
      : 'Masukkan kembali PIN yang sama untuk mengaktifkan keamanan transaksi.';

  useEffect(() => {
    return () => {
      if (createTimer.current) clearTimeout(createTimer.current);
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
    };
  }, []);

  function revealDigit(index: number) {
    if (phase === 'create') {
      if (createTimer.current) clearTimeout(createTimer.current);
      setVisibleIndex(index);
      createTimer.current = setTimeout(() => setVisibleIndex(null), 3000);
      return;
    }

    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    setConfirmVisibleIndex(index);
    confirmTimer.current = setTimeout(() => setConfirmVisibleIndex(null), 3000);
  }

  function pressDigit(value: string) {
    setNotice('');

    if (phase === 'create') {
      if (pin.length >= 6) return;
      const next = `${pin}${value}`;
      setPin(next);
      revealDigit(next.length - 1);
      if (next.length === 6) setConfirmModalVisible(true);
      return;
    }

    if (confirmPin.length >= 6) return;
    const next = `${confirmPin}${value}`;
    setConfirmPin(next);
    revealDigit(next.length - 1);
    if (next.length === 6) {
      setTimeout(() => submitConfirmation(next), 150);
    }
  }

  function backspace() {
    setNotice('');

    if (phase === 'create') {
      setPin((current) => current.slice(0, -1));
      setVisibleIndex(null);
      return;
    }

    setConfirmPin((current) => current.slice(0, -1));
    setConfirmVisibleIndex(null);
  }

  function cancelCreatedPin() {
    setConfirmModalVisible(false);
    setPin('');
    setVisibleIndex(null);
  }

  function continueToConfirm() {
    setConfirmModalVisible(false);
    setPhase('confirm');
    setConfirmPin('');
    setConfirmVisibleIndex(null);
  }

  async function submitConfirmation(value: string) {
    if (!token || loading) return;

    if (value !== pin) {
      setNotice('PIN konfirmasi tidak sama. Sila cuba sekali lagi.');
      setConfirmPin('');
      setConfirmVisibleIndex(null);
      return;
    }

    setLoading(true);
    setNotice('');

    try {
      await apiRequest('/security/transaction-pin', {
        body: { confirm_pin: value, pin },
        method: 'PUT',
        token,
      });
      router.back();
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : 'PIN gagal disimpan.');
      setConfirmPin('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.page}>
      <AppBackdrop />
      <View style={styles.content}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons color="#FFFFFF" name="chevron-back" size={24} />
          </Pressable>
          <Text style={styles.topTitle}>Keamanan transaksi</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons color="#FFFFFF" name="keypad-outline" size={28} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.pinPanel}>
          <Text style={styles.phaseLabel}>{phase === 'create' ? 'PIN baru' : 'Konfirmasi PIN'}</Text>

          <PinDots
            value={activeValue}
            visibleIndex={phase === 'create' ? visibleIndex : confirmVisibleIndex}
          />

          {notice ? <Text style={styles.notice}>{notice}</Text> : <Text style={styles.helperText}>Jangan gunakan tanggal lahir atau angka berurutan.</Text>}
        </View>

        <View style={styles.keypad}>
          {keypad.map((item, index) => {
            if (!item) return <View key={`empty-${index}`} style={styles.keyButton} />;

            if (item === 'delete') {
              return (
                <Pressable key={item} onPress={backspace} style={styles.keyButton}>
                  <Ionicons color="#FFFFFF" name="backspace-outline" size={24} />
                </Pressable>
              );
            }

            return (
              <Pressable key={item} onPress={() => pressDigit(item)} style={styles.keyButton}>
                <Text style={styles.keyText}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Modal animationType="fade" transparent visible={confirmModalVisible} onRequestClose={cancelCreatedPin}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons color="#123DB8" name="shield-checkmark-outline" size={28} />
            </View>
            <Text style={styles.modalTitle}>Gunakan PIN ini?</Text>
            <Text style={styles.modalText}>Pastikan PIN mudah anda ingat tetapi tidak mudah ditebak oleh orang lain.</Text>
            <View style={styles.modalActions}>
              <Pressable onPress={cancelCreatedPin} style={[styles.modalButton, styles.modalButtonGhost]}>
                <Text style={styles.modalGhostText}>Batal</Text>
              </Pressable>
              <Pressable onPress={continueToConfirm} style={[styles.modalButton, styles.modalButtonPrimary]}>
                <Text style={styles.modalPrimaryText}>Yakin</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#FFFFFF" size="large" />
          <Text style={styles.loadingText}>Menyimpan PIN...</Text>
        </View>
      ) : null}
    </View>
  );
}

function PinDots({ value, visibleIndex }: { value: string; visibleIndex: number | null }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: 6 }).map((_, index) => {
        const digit = value[index];
        const visible = digit && visibleIndex === index;

        return (
          <View key={index} style={[styles.dotBox, digit && styles.dotBoxFilled]}>
            <Text style={[styles.dotText, visible && styles.dotTextVisible]}>{digit ? (visible ? digit : '•') : ''}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: '#06154B', flex: 1 },
  content: { flex: 1, justifyContent: 'space-between', paddingBottom: 24, paddingHorizontal: 20, paddingTop: 52 },
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  backButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  backButtonPlaceholder: { height: 44, width: 44 },
  topTitle: { color: '#D8E6FF', fontSize: 13, fontWeight: '900', textTransform: 'uppercase' },
  header: { alignItems: 'center', gap: 8, marginTop: 4 },
  iconWrap: { alignItems: 'center', backgroundColor: '#123DB8', borderRadius: 16, height: 52, justifyContent: 'center', width: 52 },
  title: { color: '#FFFFFF', fontSize: 25, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: '#D5E5FF', fontSize: 13, lineHeight: 19, maxWidth: 310, textAlign: 'center' },
  pinPanel: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 22,
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  phaseLabel: { color: '#0D1836', fontSize: 15, fontWeight: '900', textAlign: 'center' },
  dotsRow: { flexDirection: 'row', gap: 7, justifyContent: 'center' },
  dotBox: {
    alignItems: 'center',
    backgroundColor: '#F1F5FF',
    borderColor: '#DCE5F6',
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 38,
  },
  dotBoxFilled: { backgroundColor: '#FFFFFF', borderColor: '#123DB8' },
  dotText: { color: '#0D1836', fontSize: 24, fontWeight: '900', lineHeight: 28 },
  dotTextVisible: { fontSize: 20 },
  helperText: { color: '#667082', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  notice: { color: '#B42318', fontSize: 12, fontWeight: '800', lineHeight: 18, textAlign: 'center' },
  keypad: {
    backgroundColor: 'rgba(3, 14, 55, 0.58)',
    borderRadius: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 8,
    rowGap: 4,
  },
  keyButton: { alignItems: 'center', height: 58, justifyContent: 'center', width: '33.333%' },
  keyText: { color: '#FFFFFF', fontSize: 30, fontWeight: '900' },
  modalBackdrop: { alignItems: 'center', backgroundColor: 'rgba(3, 9, 31, 0.58)', flex: 1, justifyContent: 'center', padding: 24 },
  modalCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, gap: 12, padding: 22, width: '100%' },
  modalIcon: { alignItems: 'center', backgroundColor: '#EAF2FF', borderRadius: 18, height: 58, justifyContent: 'center', width: 58 },
  modalTitle: { color: '#0D1836', fontSize: 20, fontWeight: '900' },
  modalText: { color: '#667082', fontSize: 13, lineHeight: 20, textAlign: 'center' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8, width: '100%' },
  modalButton: { alignItems: 'center', borderRadius: 14, flex: 1, minHeight: 50, justifyContent: 'center' },
  modalButtonGhost: { backgroundColor: '#F1F4FA' },
  modalButtonPrimary: { backgroundColor: '#123DB8' },
  modalGhostText: { color: '#0D1836', fontSize: 14, fontWeight: '900' },
  modalPrimaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(3, 9, 31, 0.62)',
    gap: 12,
    justifyContent: 'center',
  },
  loadingText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
});
