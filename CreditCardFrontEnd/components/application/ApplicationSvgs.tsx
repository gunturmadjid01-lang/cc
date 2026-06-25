import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

type StepIllustrationProps = {
  step: number;
};

type CountryFlagProps = {
  code: 'BN' | 'ID' | 'MY' | 'SG';
  size?: number;
};

export function StepIllustration({ step }: StepIllustrationProps) {
  if (step === 2) return <PersonalDataSvg />;
  if (step === 3) return <WorkSvg />;
  if (step === 4) return <DocumentSvg />;
  if (step === 5) return <ReviewSvg />;
  if (step === 6) return <OtpSvg />;
  if (step === 7) return <AdminReviewSvg />;
  return <ApplyCardSvg />;
}

export function CountryFlag({ code, size = 28 }: CountryFlagProps) {
  const height = Math.round(size * 0.68);

  if (code === 'ID') {
    return (
      <Svg width={size} height={height} viewBox="0 0 42 28">
        <Rect width="42" height="28" rx="6" fill="#fff" />
        <Path d="M0 6a6 6 0 016-6h30a6 6 0 016 6v8H0V6z" fill="#E12A3C" />
      </Svg>
    );
  }

  if (code === 'SG') {
    return (
      <Svg width={size} height={height} viewBox="0 0 42 28">
        <Rect width="42" height="28" rx="6" fill="#fff" />
        <Path d="M0 6a6 6 0 016-6h30a6 6 0 016 6v8H0V6z" fill="#E12A3C" />
        <Circle cx="12" cy="7" r="4" fill="#fff" />
        <Circle cx="14" cy="7" r="4" fill="#E12A3C" />
        <Circle cx="22" cy="7" r="1.2" fill="#fff" />
        <Circle cx="19" cy="5" r="1.2" fill="#fff" />
        <Circle cx="19" cy="9" r="1.2" fill="#fff" />
      </Svg>
    );
  }

  if (code === 'BN') {
    return (
      <Svg width={size} height={height} viewBox="0 0 42 28">
        <Rect width="42" height="28" rx="6" fill="#F7D44A" />
        <Path d="M-4 2l48 22" stroke="#fff" strokeWidth="8" />
        <Path d="M-4 6l48 22" stroke="#101820" strokeWidth="4" />
        <Circle cx="21" cy="14" r="4" fill="#D71920" />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={height} viewBox="0 0 42 28">
      <Rect width="42" height="28" rx="6" fill="#fff" />
      <Path d="M0 0h21v14H0z" fill="#123A8C" />
      <Path d="M0 14h42v2H0zm0 4h42v2H0zm0 4h42v2H0zM21 2h21v2H21zm0 4h21v2H21zm0 4h21v2H21z" fill="#D71920" />
      <Path d="M10 4a6 6 0 100 12 7 7 0 010-12z" fill="#F6D34A" />
      <Path d="M14 5l1 3 3-1-2 2 2 2-3-1-1 3-1-3-3 1 2-2-2-2 3 1 1-3z" fill="#F6D34A" />
    </Svg>
  );
}

function ApplyCardSvg() {
  return (
    <Svg width="132" height="92" viewBox="0 0 132 92" fill="none">
      <Defs>
        <LinearGradient id="applyCard" x1="23" y1="20" x2="110" y2="75" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#2F6BFF" />
          <Stop offset="1" stopColor="#061A57" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="68" cy="80" rx="48" ry="7" fill="#0A2B88" opacity=".18" />
      <Rect x="20" y="19" width="92" height="58" rx="13" fill="url(#applyCard)" />
      <Rect x="34" y="38" width="19" height="15" rx="4" fill="#F5B82E" />
      <Path d="M34 45h19M43 38v15" stroke="#8D600A" strokeWidth="1.2" opacity=".7" />
      <Path d="M35 62h44M90 60h13" stroke="#EAF0FF" strokeWidth="4" strokeLinecap="round" />
      <Rect x="96" y="10" width="22" height="22" rx="7" fill="#F5B82E" />
      <Path d="M107 10v22M98 20h18" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

function PersonalDataSvg() {
  return (
    <Svg width="132" height="92" viewBox="0 0 132 92" fill="none">
      <Rect x="31" y="11" width="70" height="70" rx="15" fill="#EEF4FF" />
      <Circle cx="58" cy="37" r="13" fill="#123DB8" />
      <Path d="M43 66c4-16 23-22 36-9 3 3 5 6 6 9" stroke="#123DB8" strokeWidth="8" strokeLinecap="round" />
      <Path d="M78 31h16M78 44h12M78 58h18" stroke="#5275D9" strokeWidth="5" strokeLinecap="round" />
      <Rect x="20" y="52" width="24" height="24" rx="8" fill="#F5B82E" />
      <Path d="M28 64l5 5 10-14" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function WorkSvg() {
  return (
    <Svg width="132" height="92" viewBox="0 0 132 92" fill="none">
      <Rect x="27" y="34" width="78" height="43" rx="12" fill="#082073" />
      <Path d="M47 34v-7c0-7 5-12 12-12h15c7 0 12 5 12 12v7" stroke="#2F6BFF" strokeWidth="8" strokeLinecap="round" />
      <Path d="M27 52h78" stroke="#4E78FF" strokeWidth="3" opacity=".5" />
      <Rect x="58" y="47" width="17" height="12" rx="4" fill="#F5B82E" />
      <Circle cx="102" cy="24" r="16" fill="#F5B82E" />
      <Path d="M102 15v18M96 21c2-4 12-4 13 0 2 5-2 8-9 8" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

function DocumentSvg() {
  return (
    <Svg width="132" height="92" viewBox="0 0 132 92" fill="none">
      <Path d="M25 30c0-7 6-13 13-13h21l8 10h31c7 0 13 6 13 13v27c0 7-6 13-13 13H38c-7 0-13-6-13-13V30z" fill="#123DB8" />
      <Rect x="50" y="12" width="42" height="61" rx="9" fill="#F7FAFF" />
      <Path d="M60 32h22M60 44h16M60 56h22" stroke="#5275D9" strokeWidth="5" strokeLinecap="round" />
      <Path d="M90 54l9 9 17-22" stroke="#F5B82E" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ReviewSvg() {
  return (
    <Svg width="132" height="92" viewBox="0 0 132 92" fill="none">
      <Rect x="34" y="10" width="62" height="72" rx="14" fill="#F7FAFF" />
      <Path d="M48 31h33M48 46h25M48 61h20" stroke="#5275D9" strokeWidth="5" strokeLinecap="round" />
      <Path d="M31 32l5 5 9-13M31 62l5 5 9-13" stroke="#123DB8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M87 61l22-22c4-4 10 2 6 6L93 67l-13 5 7-11z" fill="#F5B82E" />
      <Path d="M106 41l7 7" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

function OtpSvg() {
  return (
    <Svg width="132" height="92" viewBox="0 0 132 92" fill="none">
      <Rect x="45" y="8" width="45" height="76" rx="15" fill="#061A57" />
      <Rect x="53" y="21" width="29" height="48" rx="8" fill="#EEF4FF" />
      <Path d="M60 43h15M60 54h11" stroke="#5275D9" strokeWidth="5" strokeLinecap="round" />
      <Path d="M92 23h16c8 0 14 6 14 14s-6 14-14 14h-5l-10 8 2-9h-3c-8 0-14-6-14-14s6-13 14-13z" fill="#2F6BFF" />
      <Path d="M94 37h1M103 37h1M112 37h1" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
      <Rect x="19" y="48" width="28" height="28" rx="10" fill="#F5B82E" />
      <Path d="M27 62h12M33 56v12" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

function AdminReviewSvg() {
  return (
    <Svg width="132" height="92" viewBox="0 0 132 92" fill="none">
      <Rect x="24" y="16" width="84" height="64" rx="14" fill="#EEF4FF" />
      <Rect x="35" y="31" width="29" height="34" rx="9" fill="#123DB8" />
      <Path d="M43 43h13M43 53h10" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <Path d="M82 25l23 9v15c0 15-10 24-23 29-13-5-23-14-23-29V34l23-9z" fill="#123DB8" />
      <Path d="M71 50l8 8 16-21" stroke="#F5B82E" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
