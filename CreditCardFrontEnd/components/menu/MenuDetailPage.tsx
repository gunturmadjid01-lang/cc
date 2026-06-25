import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import AppBackdrop from '@/components/application/AppBackdrop';

export function MenuDetailPage({
  accent = '#123DB8',
  actionLabel,
  children,
  icon = 'shield-checkmark-outline',
  onActionPress,
  subtitle,
  title,
}: {
  accent?: string;
  actionLabel?: string;
  children?: React.ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  onActionPress?: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.page}>
      <AppBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: accent }]}>
            <Ionicons color="#FFFFFF" name={icon} size={26} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>

        {children}

        {onActionPress && actionLabel ? (
          <Pressable onPress={onActionPress} style={[styles.actionButton, { backgroundColor: accent }]}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

export function InfoCard({ title, value, icon, tone = 'default' }: { title: string; value: string; icon: keyof typeof Ionicons.glyphMap; tone?: 'default' | 'soft' }) {
  return (
    <View style={[styles.infoCard, tone === 'soft' && styles.infoCardSoft]}>
      <View style={styles.infoIcon}>
        <Ionicons color="#123DB8" name={icon} size={18} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export function ListCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.listCard}>{children}</View>;
}

export function ListRow({ icon, label, value, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string; onPress?: () => void }) {
  const Row = onPress ? Pressable : View;
  return (
    <Row onPress={onPress} style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons color="#123DB8" name={icon} size={18} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      </View>
      <Ionicons color="#8A93A7" name={onPress ? 'chevron-forward' : 'ellipse-outline'} size={18} />
    </Row>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { gap: 14, paddingBottom: 120, paddingHorizontal: 20, paddingTop: 68 },
  hero: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    gap: 14,
    padding: 18,
  },
  heroIcon: { alignItems: 'center', borderRadius: 18, height: 58, justifyContent: 'center', width: 58 },
  heroCopy: { flex: 1 },
  title: { color: '#0D1836', fontSize: 22, fontWeight: '900', lineHeight: 28 },
  subtitle: { color: '#667082', fontSize: 13, lineHeight: 20, marginTop: 4 },
  actionButton: { alignItems: 'center', borderRadius: 16, minHeight: 52, justifyContent: 'center', marginTop: 4 },
  actionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  infoCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  infoCardSoft: { backgroundColor: '#F7F9FF' },
  infoIcon: { alignItems: 'center', backgroundColor: '#E9F0FF', borderRadius: 12, height: 36, justifyContent: 'center', width: 36 },
  infoCopy: { flex: 1 },
  infoTitle: { color: '#6A7385', fontSize: 12, fontWeight: '800' },
  infoValue: { color: '#0D1836', fontSize: 15, fontWeight: '900', marginTop: 4 },
  listCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  row: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 70, paddingHorizontal: 16 },
  rowIcon: { alignItems: 'center', backgroundColor: '#E9F0FF', borderRadius: 12, height: 36, justifyContent: 'center', width: 36 },
  rowCopy: { flex: 1 },
  rowLabel: { color: '#0D1836', fontSize: 14, fontWeight: '900' },
  rowValue: { color: '#667082', fontSize: 12, marginTop: 2 },
});
