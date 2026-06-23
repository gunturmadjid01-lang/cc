import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const heroBackground = require('@/assets/images/background_splashscreen.jpeg');
const platinumCard = require('@/assets/images/mockups/credit-card-platinum.png');
const percentIcon = require('@/assets/images/mockups/icon-percent.png');
const giftIcon = require('@/assets/images/mockups/icon-gift.png');
const bagIcon = require('@/assets/images/mockups/icon-shopping-bag.png');

export default function WelcomeScreen() {
  return (
    <View style={styles.page}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ImageBackground source={heroBackground} resizeMode="cover" style={styles.hero}>
          <View style={styles.heroShade} />
          <View style={styles.statusBarSpace} />

          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <Text style={styles.greeting}>Hi, Selamat datang!</Text>
              <Text style={styles.heroTitle}>Ajukan Kartu Kredit dengan mudah</Text>
              <Text style={styles.heroSubtitle}>Pilih kartu sesuai kebutuhan dan gaya hidup Anda.</Text>
            </View>

            <View style={styles.bell}>
              <Ionicons color="#FFFFFF" name="notifications-outline" size={22} />
              <View style={styles.dot} />
            </View>
          </View>

          <Image source={percentIcon} style={styles.percentFloat} />
          <Image source={giftIcon} style={styles.giftFloat} />
          <Image source={bagIcon} style={styles.bagFloat} />
          <Image source={platinumCard} style={styles.heroCard} />
        </ImageBackground>

        <View style={styles.whitePanel}>
          <Text style={styles.sectionTitle}>Keuntungan Kartu Kredit</Text>

          <View style={styles.benefitGrid}>
            <Benefit icon="sync-circle-outline" title="Cicilan 0%" subtitle="Hingga 24 bulan" />
            <Benefit icon="star-outline" title="Reward Points" subtitle="Setiap transaksi" />
            <Benefit icon="briefcase-outline" title="Cashback" subtitle="Berbagai merchant" />
            <Benefit icon="shield-checkmark-outline" title="Aman & Nyaman" subtitle="Transaksi terlindungi" />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pilih Kartu Kredit</Text>
            <Text style={styles.seeAll}>Lihat semua</Text>
          </View>

          <View style={styles.cardOption}>
            <Image source={platinumCard} resizeMode="contain" style={styles.smallCard} />
            <View style={styles.cardText}>
              <Text style={styles.cardName}>Prime Card</Text>
              <Text style={styles.cardDesc}>Cocok untuk kebutuhan sehari-hari</Text>
              <Text style={styles.feeLabel}>Annual Fee</Text>
              <Text style={styles.feeValue}>Rp 250.000</Text>
            </View>
          </View>

          <Pressable onPress={() => router.push('/register')} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Ajukan Kartu Kredit</Text>
          </Pressable>

          <Pressable onPress={() => router.push('/login')} style={styles.loginButton}>
            <Text style={styles.loginText}>Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Benefit({ icon, title, subtitle }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string }) {
  return (
    <View style={styles.benefitCard}>
      <View style={styles.benefitIcon}>
        <Ionicons color="#0A3B97" name={icon} size={20} />
      </View>
      <View style={styles.benefitText}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#F6F8FC',
    flex: 1,
  },
  content: {
    paddingBottom: 28,
  },
  hero: {
    backgroundColor: '#06185F',
    minHeight: 420,
    overflow: 'hidden',
    paddingHorizontal: 24,
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 12, 54, 0.36)',
  },
  statusBarSpace: {
    height: 48,
  },
  heroTop: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
  },
  heroCopy: {
    flex: 1,
    maxWidth: 292,
  },
  greeting: {
    color: '#E7F0FF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 14,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '900',
    lineHeight: 37,
  },
  heroSubtitle: {
    color: '#DDEBFF',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 13,
    maxWidth: 260,
  },
  bell: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    position: 'relative',
    width: 38,
  },
  dot: {
    backgroundColor: '#FF4C61',
    borderColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1,
    height: 10,
    position: 'absolute',
    right: 7,
    top: 6,
    width: 10,
  },
  heroCard: {
    bottom: 48,
    height: 162,
    left: 38,
    position: 'absolute',
    width: 268,
  },
  percentFloat: {
    bottom: 180,
    height: 45,
    position: 'absolute',
    right: 106,
    transform: [{ rotate: '-9deg' }],
    width: 45,
  },
  giftFloat: {
    bottom: 221,
    height: 48,
    position: 'absolute',
    right: 42,
    transform: [{ rotate: '12deg' }],
    width: 48,
  },
  bagFloat: {
    bottom: 105,
    height: 45,
    position: 'absolute',
    right: 30,
    transform: [{ rotate: '8deg' }],
    width: 45,
  },
  whitePanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -26,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  sectionTitle: {
    color: '#061946',
    fontSize: 17,
    fontWeight: '900',
  },
  seeAll: {
    color: '#006BFF',
    fontSize: 13,
    fontWeight: '800',
  },
  benefitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  benefitCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E7EDF7',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    minHeight: 70,
    padding: 10,
    width: '48.4%',
  },
  benefitIcon: {
    alignItems: 'center',
    backgroundColor: '#EAF2FF',
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    color: '#061946',
    fontSize: 12,
    fontWeight: '900',
  },
  benefitSubtitle: {
    color: '#738096',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 3,
  },
  cardOption: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
    marginTop: 16,
  },
  smallCard: {
    height: 82,
    width: 125,
  },
  cardText: {
    flex: 1,
  },
  cardName: {
    color: '#061946',
    fontSize: 16,
    fontWeight: '900',
  },
  cardDesc: {
    color: '#61708A',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },
  feeLabel: {
    color: '#8B97AA',
    fontSize: 11,
    marginTop: 12,
  },
  feeValue: {
    color: '#061946',
    fontSize: 13,
    fontWeight: '900',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#061E64',
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  loginButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
  },
  loginText: {
    color: '#006BFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
