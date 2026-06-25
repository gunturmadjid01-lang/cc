import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, ImageBackground, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';

const splashBackground = require('@/assets/images/background_splashscreen.jpeg');
const platinumCard = require('@/assets/images/mockups/credit-card-platinum.png');
const percentIcon = require('@/assets/images/mockups/icon-percent.png');
const giftIcon = require('@/assets/images/mockups/icon-gift.png');
const bagIcon = require('@/assets/images/mockups/icon-shopping-bag.png');

export default function SplashScreen() {
  const { isAuthenticated, isReady } = useAuth();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        duration: 850,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        duration: 850,
        easing: Easing.out(Easing.cubic),
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        duration: 1450,
        easing: Easing.inOut(Easing.cubic),
        toValue: 1,
        useNativeDriver: false,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      if (!isReady) return;

      router.replace(isAuthenticated ? '/(tabs)' : '/welcome');
    }, 1700);

    return () => clearTimeout(timeout);
  }, [fade, isAuthenticated, isReady, progress, slide]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <ImageBackground source={splashBackground} resizeMode="cover" style={styles.container}>
      <View style={styles.overlay} />
      <View style={styles.glow} />

      <Animated.Image
        source={platinumCard}
        style={[styles.cardLayer, { opacity: fade, transform: [{ translateY: slide }, { rotate: '-11deg' }] }]}
      />
      <Animated.Image source={percentIcon} style={[styles.percentLayer, { opacity: fade }]} />
      <Animated.Image source={giftIcon} style={[styles.giftLayer, { opacity: fade }]} />
      <Animated.Image source={bagIcon} style={[styles.bagLayer, { opacity: fade }]} />

      <Animated.View style={[styles.content, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <Text style={styles.eyebrow}>NEXA BANK</Text>
        <Text style={styles.title}>Kredit lebih mudah, hidup lebih tenang.</Text>
        <Text style={styles.subtitle}>Permohonan kad, semakan status dan kawalan limit dalam satu aplikasi.</Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fade }]}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.loadingText}>Menyiapkan pengalaman anda...</Text>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#06185F',
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 58,
    paddingHorizontal: 28,
    paddingTop: 92,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 12, 54, 0.38)',
  },
  glow: {
    backgroundColor: 'rgba(45, 134, 255, 0.16)',
    borderRadius: 140,
    bottom: 150,
    height: 280,
    position: 'absolute',
    right: -120,
    width: 280,
  },
  cardLayer: {
    bottom: 168,
    height: 140,
    position: 'absolute',
    right: -24,
    width: 238,
  },
  percentLayer: {
    bottom: 333,
    height: 48,
    position: 'absolute',
    right: 102,
    width: 48,
  },
  giftLayer: {
    bottom: 394,
    height: 50,
    position: 'absolute',
    right: 28,
    transform: [{ rotate: '12deg' }],
    width: 50,
  },
  bagLayer: {
    bottom: 262,
    height: 48,
    position: 'absolute',
    right: 26,
    transform: [{ rotate: '10deg' }],
    width: 48,
  },
  content: {
    maxWidth: 330,
  },
  eyebrow: {
    color: '#8EC5FF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 18,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 35,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 43,
  },
  subtitle: {
    color: '#C7DAFF',
    fontSize: 15,
    lineHeight: 24,
    marginTop: 16,
  },
  footer: {
    gap: 12,
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    height: 5,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: '100%',
  },
  loadingText: {
    color: '#D9E8FF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
