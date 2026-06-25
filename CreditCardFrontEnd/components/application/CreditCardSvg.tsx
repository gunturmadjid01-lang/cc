import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

export default function CreditCardSvg() {
  return (
    <Svg viewBox="0 0 360 220" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="cardBase" x1="20" y1="10" x2="338" y2="216" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#174CBF" />
          <Stop offset="0.48" stopColor="#0B2E7D" />
          <Stop offset="1" stopColor="#061337" />
        </LinearGradient>
        <LinearGradient id="cardWave" x1="40" y1="16" x2="326" y2="176" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#74B7FF" stopOpacity="0.28" />
          <Stop offset="0.56" stopColor="#2C70E5" stopOpacity="0.13" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id="softBand" x1="0" y1="68" x2="360" y2="120" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#FFFFFF" stopOpacity="0" />
          <Stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.1" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      <Rect width="360" height="220" rx="26" fill="url(#cardBase)" />
      <Path d="M-12 70C50 42 98 34 150 48C205 63 237 104 292 106C326 107 348 97 378 80" fill="none" stroke="url(#cardWave)" strokeWidth="22" strokeLinecap="round" opacity="0.85" />
      <Path d="M-4 106C48 86 100 80 152 96C205 112 244 142 296 138C326 136 350 124 374 108" fill="none" stroke="url(#softBand)" strokeWidth="28" strokeLinecap="round" />
      <Path d="M46 156C84 138 122 134 160 148C204 165 238 190 312 168" fill="none" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="2" />
      <Path d="M48 170C94 150 132 150 174 166C216 181 254 194 320 176" fill="none" stroke="#FFFFFF" strokeOpacity="0.055" strokeWidth="2" />

      <Rect x="24" y="78" width="46" height="32" rx="10" fill="#FFFFFF" opacity="0.12" />
      <Path d="M36 78v32M24 90h46M24 100h46" stroke="#DDEAFF" strokeWidth="1.2" opacity="0.2" />

      <Path d="M313 37c4 3 6 7 6 12M309 33c7 5 10 11 10 19M305 29c10 7 15 15 15 25" stroke="#EAF2FF" strokeWidth="2.6" strokeLinecap="round" />
    </Svg>
  );
}
