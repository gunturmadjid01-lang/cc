import { Platform } from 'react-native';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'android' ? 'http://10.0.2.2:8000/api' : 'http://localhost:8000/api');

export type VerificationDocument = {
  id: number;
  type: 'ktp' | 'npwp' | 'selfie' | 'salary_slip' | 'bank_statement';
  file_url: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string | null;
};

export type CreditCardProfile = {
  id: number;
  application_number?: string | null;
  application_status: 'draft' | 'otp_pending' | 'pending' | 'approved' | 'rejected';
  status_profile?: boolean;
  credit_limit?: string | null;
  card_number?: string | null;
  card_holder_name?: string | null;
  card_expiry_month?: string | null;
  card_expiry_year?: string | null;
  card_cvv?: string | null;
  available_limit?: string | null;
  initial_deposit_amount?: string | null;
  initial_deposit_status?: 'not_required' | 'pending' | 'paid' | 'failed' | string;
  credit_limit_unlocked_at?: string | null;
  nik?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  district?: string | null;
  locality?: string | null;
  postal_code?: string | null;
  occupation?: string | null;
  monthly_income?: string | null;
  company_name?: string | null;
  work_address?: string | null;
  work_city?: string | null;
  work_province?: string | null;
  work_district?: string | null;
  work_locality?: string | null;
  work_postal_code?: string | null;
  submitted_at?: string | null;
  otp_expires_at?: string | null;
  otp_verified_at?: string | null;
  admin_notes?: string | null;
};

export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  credit_card_profile?: CreditCardProfile | null;
  verification_documents?: VerificationDocument[];
};

export type AuthResponse = {
  message: string;
  token: string;
  user: User;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  token?: string | null;
  body?: Record<string, unknown> | FormData;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const requestBody: BodyInit | undefined = options.body
    ? isFormData
      ? (options.body as FormData)
      : JSON.stringify(options.body)
    : undefined;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: requestBody,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.message ??
      Object.values(payload?.errors ?? {})
        .flat()
        .join('\n') ??
      'Request gagal diproses.';
    throw new Error(message);
  }

  return payload as T;
}
