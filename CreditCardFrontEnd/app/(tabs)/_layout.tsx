import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#174DCE',
        tabBarInactiveTintColor: '#A4A8B4',
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="home-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="bayar"
        options={{
          title: 'Bayar',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="wallet-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="qris"
        options={{
          title: 'QRIS',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.qrisButton, focused && styles.qrisButtonActive]}>
              <Ionicons color="#FFFFFF" name="qr-code-outline" size={24} />
            </View>
          ),
          tabBarItemStyle: styles.qrisItem,
          tabBarLabel: ({ focused }) => <Text style={[styles.qrisLabel, focused && styles.qrisLabelActive]}>QRIS</Text>,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Rewards',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="gift-outline" size={size} />,
        }}
      />
      <Tabs.Screen name="menu" options={{ title: 'Menu', tabBarIcon: ({ color, size }) => <Ionicons color={color} name="menu-outline" size={size} /> }} />
      <Tabs.Screen name="verification" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="bills" options={{ href: null }} />
      <Tabs.Screen name="score" options={{ href: null }} />
      <Tabs.Screen name="pin" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="language" options={{ href: null }} />
      <Tabs.Screen name="physical-card" options={{ href: null }} />
      <Tabs.Screen name="support" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E8ECF4',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
    elevation: 14,
    height: 76,
    overflow: 'visible',
    paddingBottom: 10,
    paddingTop: 8,
    shadowColor: '#081A46',
    shadowOffset: { height: -6, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  qrisItem: {
    overflow: 'visible',
  },
  qrisButton: {
    alignItems: 'center',
    backgroundColor: '#174DCE',
    borderColor: '#FFFFFF',
    borderRadius: 32,
    borderWidth: 5,
    elevation: 12,
    height: 64,
    justifyContent: 'center',
    marginBottom: 26,
    shadowColor: '#174DCE',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    width: 64,
  },
  qrisButtonActive: {
    backgroundColor: '#0F3FB4',
  },
  qrisLabel: {
    color: '#8B92A3',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 18,
  },
  qrisLabelActive: {
    color: '#174DCE',
  },
});
