const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

const patches = [
  {
    file: 'node_modules/react-native-reanimated/android/src/main/cpp/worklets/CMakeLists.txt',
    from: 'target_link_libraries(worklets log ReactAndroid::jsi fbjni::fbjni)',
    to: 'target_link_libraries(worklets log c++_shared ReactAndroid::jsi fbjni::fbjni)',
  },
  {
    file: 'node_modules/react-native-reanimated/android/src/main/cpp/reanimated/CMakeLists.txt',
    from: 'target_link_libraries(reanimated worklets android)',
    to: 'target_link_libraries(reanimated worklets android c++_shared)',
  },
  {
    file: 'node_modules/expo-modules-core/android/CMakeLists.txt',
    from: [
      '  CommonSettings',
      '  ${LOG_LIB}',
      '  fbjni::fbjni',
    ].join('\n'),
    to: [
      '  CommonSettings',
      '  ${LOG_LIB}',
      '  c++_shared',
      '  fbjni::fbjni',
    ].join('\n'),
  },
  {
    file: 'node_modules/react-native-screens/android/CMakeLists.txt',
    from: [
      '            ReactAndroid::jsi',
      '            fbjni::fbjni',
      '            android',
      '        )',
    ].join('\n'),
    to: [
      '            ReactAndroid::jsi',
      '            fbjni::fbjni',
      '            android',
      '            c++_shared',
      '        )',
    ].join('\n'),
  },
  {
    file: 'node_modules/react-native-screens/android/CMakeLists.txt',
    from: [
      '                fbjni::fbjni',
      '                android',
      '        )',
    ].join('\n'),
    to: [
      '                fbjni::fbjni',
      '                android',
      '                c++_shared',
      '        )',
    ].join('\n'),
  },
  {
    file: 'node_modules/react-native-screens/android/CMakeLists.txt',
    from: [
      '        ReactAndroid::jsi',
      '        android',
      '    )',
    ].join('\n'),
    to: [
      '        ReactAndroid::jsi',
      '        android',
      '        c++_shared',
      '    )',
    ].join('\n'),
  },
];

let changed = false;

for (const patch of patches) {
  const filePath = path.join(projectRoot, patch.file);

  if (!fs.existsSync(filePath)) {
    console.warn(`[native-linking] Skip missing file: ${patch.file}`);
    continue;
  }

  const original = fs.readFileSync(filePath, 'utf8');

  if (original.includes(patch.to)) {
    continue;
  }

  if (!original.includes(patch.from)) {
    console.warn(`[native-linking] Pattern not found: ${patch.file}`);
    continue;
  }

  fs.writeFileSync(filePath, original.replace(patch.from, patch.to));
  changed = true;
  console.log(`[native-linking] Patched ${patch.file}`);
}

if (!changed) {
  console.log('[native-linking] Native C++ linker patches already applied.');
}
