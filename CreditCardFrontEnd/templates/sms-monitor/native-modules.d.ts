declare module '@maniac-tech/react-native-expo-read-sms' {
  export function startReadSMS(
    callback: (status: string, sms: unknown, error: string) => void
  ): Promise<void> | void;
  export function stopReadSMS(): void;
  export function checkIfHasSMSPermission(): Promise<{
    hasReadSmsPermission: boolean;
    hasReceiveSmsPermission: boolean;
  }>;
  export function requestReadSMSPermission(): Promise<boolean>;
  const RNExpoReadSms: unknown;
  export default RNExpoReadSms;
}

declare module '@voximplant/react-native-foreground-service' {
  const VIForegroundService: {
    createNotificationChannel(config: {
      description?: string;
      enableVibration?: boolean;
      id: string;
      importance?: number;
      name: string;
    }): Promise<void>;
    startService(config: {
      channelId: string;
      id: number;
      icon: string;
      priority?: number;
      text: string;
      title: string;
      button?: string;
    }): Promise<void>;
    stopService(): void;
  };

  export default VIForegroundService;
}
