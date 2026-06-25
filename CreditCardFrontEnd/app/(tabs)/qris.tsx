import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import AppBackdrop from '@/components/application/AppBackdrop';

export default function QrisScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [busyModalOpen, setBusyModalOpen] = useState(false);
  const [scannedValue, setScannedValue] = useState('');
  const [canScan, setCanScan] = useState(true);
  const scanPulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    if (!permission) {
      requestPermission().catch(() => undefined);
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanPulse, {
          duration: 760,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(scanPulse, {
          duration: 760,
          toValue: 0.35,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [scanPulse]);

  const statusText = useMemo(() => {
    if (!permission) return 'Meminta izin kamera...';
    if (!permission.granted) return 'Izin kamera diperlukan untuk membuka pemindai QRIS.';
    return 'Letakkan kod QR di dalam bingkai.';
  }, [permission]);

  function handleBarcodeScanned(data: string) {
    if (!canScan) return;
    setCanScan(false);
    setScannedValue(data);
    setBusyModalOpen(true);
  }

  return (
    <View style={styles.page}>
      <AppBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons color="#FFFFFF" name="qr-code-outline" size={24} />
          </View>
          <Text style={styles.kicker}>Bayaran QRIS</Text>
          <Text style={styles.title}>Imbas kod bayaran</Text>
          <Text style={styles.subtitle}>Gunakan kamera untuk membaca kod QR dan meneruskan bayaran dengan selamat.</Text>
        </View>

        <View style={styles.scannerCard}>
          <View style={styles.scannerTopRow}>
            <View>
              <Text style={styles.scannerTitle}>Pemindai aktif</Text>
              <Text style={styles.scannerSub}>Kamera belakang</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Sedia</Text>
            </View>
          </View>

          <View style={styles.cameraFrame}>
            {permission?.granted ? (
              <CameraView
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                enableTorch={false}
                facing="back"
                onBarcodeScanned={(event) => handleBarcodeScanned(event.data)}
                style={StyleSheet.absoluteFillObject}
              />
            ) : (
              <View style={styles.permissionState}>
                <Ionicons color="#FFFFFF" name="camera-outline" size={36} />
                <Text style={styles.permissionTitle}>Kamera belum diaktifkan</Text>
                <Text style={styles.permissionText}>Berikan izin kamera agar pemindai QRIS boleh digunakan.</Text>
                <Pressable onPress={() => requestPermission()} style={styles.permissionButton}>
                  <Text style={styles.permissionButtonText}>Aktifkan kamera</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.scanOverlay}>
              <View style={styles.scanWindow}>
                <View style={[styles.scanCorner, styles.scanCornerTopLeft]} />
                <View style={[styles.scanCorner, styles.scanCornerTopRight]} />
                <View style={[styles.scanCorner, styles.scanCornerBottomLeft]} />
                <View style={[styles.scanCorner, styles.scanCornerBottomRight]} />
                <Animated.View style={[styles.scanLine, { opacity: scanPulse }]} />
              </View>
              <Text style={styles.scanHint}>{statusText}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <InfoRow icon="shield-checkmark-outline" title="Semakan keselamatan" text="Pastikan jumlah dan tujuan bayaran benar sebelum meneruskan transaksi." />
          <InfoRow icon="time-outline" title="Perkhidmatan sementara" text="Jika kod berhasil dibaca, aplikasi akan memaparkan status sistem terkini." />
        </View>
      </ScrollView>

      <Modal animationType="fade" transparent visible={busyModalOpen} onRequestClose={() => setBusyModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons color="#FFFFFF" name="warning-outline" size={22} />
            </View>
            <Text style={styles.modalTitle}>Sistem sedang gangguan</Text>
            <Text style={styles.modalText}>Harap cuba lagi nanti. Kod yang anda imbas: {scannedValue || '-'}</Text>
            <Pressable
              onPress={() => {
                setBusyModalOpen(false);
                setCanScan(true);
                setScannedValue('');
              }}
              style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Tutup</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function InfoRow({ icon, title, text }: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons color="#FFFFFF" name={icon} size={18} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { gap: 10, paddingBottom: 136, paddingHorizontal: 16, paddingTop: 34 },
  header: { gap: 5, minHeight: 92, paddingRight: 64, position: 'relative' },
  headerIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 18,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: 42,
  },
  kicker: { color: '#9CCAFF', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: '#FFFFFF', fontSize: 25, fontWeight: '900', lineHeight: 31 },
  subtitle: { color: '#D7E5FF', fontSize: 12, lineHeight: 18, maxWidth: 340 },
  scannerCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E7F4',
    borderRadius: 26,
    borderWidth: 1,
    elevation: 8,
    gap: 14,
    marginTop: -2,
    padding: 14,
    shadowColor: '#06154B',
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
  },
  scannerTopRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  scannerTitle: { color: '#0D1836', fontSize: 15, fontWeight: '900' },
  scannerSub: { color: '#7A8294', fontSize: 12, fontWeight: '700', marginTop: 3 },
  liveBadge: {
    alignItems: 'center',
    backgroundColor: '#EEF5FF',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  liveDot: { backgroundColor: '#24B26B', borderRadius: 999, height: 7, width: 7 },
  liveText: { color: '#123DB8', fontSize: 11, fontWeight: '900' },
  cameraFrame: { aspectRatio: 0.92, backgroundColor: '#07112D', borderRadius: 22, overflow: 'hidden' },
  permissionState: { alignItems: 'center', backgroundColor: '#123DB8', flex: 1, gap: 10, justifyContent: 'center', padding: 24 },
  permissionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  permissionText: { color: '#D7E5FF', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  permissionButton: { alignItems: 'center', backgroundColor: '#F5C14F', borderRadius: 999, marginTop: 8, paddingHorizontal: 16, paddingVertical: 10 },
  permissionButtonText: { color: '#06154B', fontSize: 13, fontWeight: '900' },
  scanOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 18 },
  scanWindow: { height: '58%', position: 'relative', width: '74%' },
  scanCorner: { borderColor: 'rgba(255,255,255,0.5)', height: 42, position: 'absolute', width: 42 },
  scanCornerTopLeft: { borderLeftWidth: 4, borderTopLeftRadius: 18, borderTopWidth: 4, left: 0, top: 0 },
  scanCornerTopRight: { borderRightWidth: 4, borderTopRightRadius: 18, borderTopWidth: 4, right: 0, top: 0 },
  scanCornerBottomLeft: { borderBottomLeftRadius: 18, borderBottomWidth: 4, borderLeftWidth: 4, bottom: 0, left: 0 },
  scanCornerBottomRight: { borderBottomRightRadius: 18, borderBottomWidth: 4, borderRightWidth: 4, bottom: 0, right: 0 },
  scanLine: { backgroundColor: '#FFFFFF', borderRadius: 999, height: 2, left: 18, position: 'absolute', right: 18, top: '50%' },
  scanHint: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    color: '#0D1836',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 22,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 10,
    textAlign: 'center',
  },
  infoCard: { backgroundColor: 'rgba(255,255,255,0.96)', borderColor: '#E2E8F4', borderRadius: 22, borderWidth: 1, gap: 14, padding: 16 },
  infoRow: { flexDirection: 'row', gap: 12 },
  infoIcon: { alignItems: 'center', backgroundColor: '#123DB8', borderRadius: 14, height: 34, justifyContent: 'center', width: 34 },
  infoCopy: { flex: 1 },
  infoTitle: { color: '#0D1836', fontSize: 14, fontWeight: '900' },
  infoText: { color: '#667082', fontSize: 12, lineHeight: 18, marginTop: 4 },
  modalBackdrop: { alignItems: 'center', backgroundColor: 'rgba(6, 21, 75, 0.72)', flex: 1, justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 24, gap: 12, maxWidth: 320, padding: 22, width: '100%' },
  modalIcon: { alignItems: 'center', alignSelf: 'center', backgroundColor: '#D84F66', borderRadius: 999, height: 48, justifyContent: 'center', width: 48 },
  modalTitle: { color: '#0D1836', fontSize: 18, fontWeight: '900', textAlign: 'center' },
  modalText: { color: '#667082', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  modalButton: { alignItems: 'center', backgroundColor: '#123DB8', borderRadius: 12, minHeight: 46, justifyContent: 'center' },
  modalButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
});
