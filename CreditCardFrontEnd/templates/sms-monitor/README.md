# SMS Monitor Template

Drop-in template for Android SMS monitoring in a prebuilt Expo app.

Files:
- `SmsMonitorProvider.tsx`
- `native-modules.d.ts`

Usage:
1. Wrap the app under `SmsMonitorProvider`.
2. Add Android permissions for `READ_SMS`, `RECEIVE_SMS`, `FOREGROUND_SERVICE`, and `POST_NOTIFICATIONS`.
3. Rebuild the native app with `npm run android` or a dev client.
4. Show the logs from `useSmsMonitor()` in any screen.

Notes:
- Intended for user-consented SMS monitoring only.
- Works on Android only.
- Keep the folder intact if you want to copy it into another app later.
