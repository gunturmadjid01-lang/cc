import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

export default function AppBackdrop() {
  return (
    <Svg height="100%" preserveAspectRatio="none" style={StyleSheet.absoluteFillObject} viewBox="0 0 430 932" width="100%">
      <Defs>
        <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="932" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#07194F" />
          <Stop offset="0.34" stopColor="#0B2C75" />
          <Stop offset="0.58" stopColor="#B8C7E0" />
          <Stop offset="0.75" stopColor="#EFF4FB" />
          <Stop offset="1" stopColor="#F8FAFD" />
        </LinearGradient>
        <LinearGradient id="topSheen" x1="0" y1="0" x2="430" y2="220" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#2E80FF" stopOpacity="0.16" />
          <Stop offset="0.7" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      <Rect fill="url(#bg)" height="932" width="430" />
      <Path d="M0 0H430V178C350 136 282 126 206 148C132 170 74 164 0 126V0Z" fill="url(#topSheen)" />
      <Path d="M0 568C92 528 176 522 260 548C328 570 374 570 430 542V932H0V568Z" fill="#FFFFFF" opacity="0.28" />
      <Path d="M0 660C104 628 194 626 280 650C342 668 386 666 430 640V932H0V660Z" fill="#FFFFFF" opacity="0.38" />
    </Svg>
  );
}
