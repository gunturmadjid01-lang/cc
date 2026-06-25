import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CountryFlag, StepIllustration } from '@/components/application/ApplicationSvgs';
import { useAuth } from '@/context/AuthContext';
import { apiRequest, CreditCardProfile } from '@/lib/api';

type CountryCode = 'BN' | 'ID' | 'MY' | 'SG';
type DocumentType = 'bank_statement' | 'ktp' | 'npwp' | 'salary_slip' | 'selfie';

type LocalDocument = {
  name: string;
  required: boolean;
  type: DocumentType;
  uri: string;
};

type ApplicationForm = {
  birthDate: string;
  birthPlace: string;
  company: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  gender: string;
  homeAddress: string;
  homeCity: string;
  homeDistrict: string;
  homeLocality: string;
  homePostalCode: string;
  homeState: string;
  identityNumber: string;
  income: string;
  job: string;
  name: string;
  password: string;
  phone: string;
  phoneCountry: CountryCode;
  phoneCode: string;
  status: string;
  workAddress: string;
  workCity: string;
  workDistrict: string;
  workLocality: string;
  workPostalCode: string;
  workState: string;
};

type AddressSuggestion = {
  city: string;
  district: string;
  displayName: string;
  locality: string;
  placeId: number;
  postalCode: string;
  state: string;
};

type Option<T extends string = string> = {
  label: string;
  value: T;
};

const countries: (Option<CountryCode> & { dialCode: string; hint: string })[] = [
  { dialCode: '+60', hint: 'Contoh 0123456789', label: 'Malaysia', value: 'MY' },
  { dialCode: '+62', hint: 'Contoh 085123456789', label: 'Indonesia', value: 'ID' },
  { dialCode: '+65', hint: 'Contoh 81234567', label: 'Singapura', value: 'SG' },
  { dialCode: '+673', hint: 'Contoh 7123456', label: 'Brunei', value: 'BN' },
];

const genderOptions: Option[] = [
  { label: 'Laki-laki', value: 'male' },
  { label: 'Perempuan', value: 'female' },
];

const employmentOptions: Option[] = [
  { label: 'Karyawan Swasta', value: 'Karyawan Swasta' },
  { label: 'Pegawai Negeri', value: 'Pegawai Negeri' },
  { label: 'Karyawan BUMN', value: 'Karyawan BUMN' },
  { label: 'Karyawan Kontrak', value: 'Karyawan Kontrak' },
  { label: 'Wiraswasta', value: 'Wiraswasta' },
  { label: 'Pemilik Usaha', value: 'Pemilik Usaha' },
  { label: 'Profesional', value: 'Profesional' },
  { label: 'Freelancer', value: 'Freelancer' },
  { label: 'Guru / Dosen', value: 'Guru / Dosen' },
  { label: 'Tenaga Kesehatan', value: 'Tenaga Kesehatan' },
  { label: 'Teknologi Informasi', value: 'Teknologi Informasi' },
  { label: 'Sales / Marketing', value: 'Sales / Marketing' },
  { label: 'Keuangan / Akuntansi', value: 'Keuangan / Akuntansi' },
  { label: 'Transportasi / Logistik', value: 'Transportasi / Logistik' },
  { label: 'Hospitality / F&B', value: 'Hospitality / F&B' },
  { label: 'Mahasiswa', value: 'Mahasiswa' },
  { label: 'Ibu Rumah Tangga', value: 'Ibu Rumah Tangga' },
  { label: 'Pensiunan', value: 'Pensiunan' },
];

const incomeOptions: Option[] = [
  { label: '< RM 1000', value: '999' },
  { label: 'RM 1.000 - RM 2.000', value: '1500' },
  { label: 'RM 2.000 - RM 5.000', value: '3500' },
  { label: '> RM 5000', value: '5001' },
];

const documentMeta: { description: string; name: string; required: boolean; type: DocumentType }[] = [
  { description: 'Foto KTP yang jelas dan seluruh data terbaca.', name: 'KTP', required: true, type: 'ktp' },
  { description: 'Foto NPWP atau dokumen pajak yang masih berlaku.', name: 'NPWP', required: true, type: 'npwp' },
  { description: 'Foto selfie wajah dari depan dengan pencahayaan cukup.', name: 'Foto Selfie', required: true, type: 'selfie' },
  { description: 'Opsional, slip gaji 3 bulan terakhir.', name: 'Slip Gaji', required: false, type: 'salary_slip' },
  { description: 'Opsional, rekening koran 3 bulan terakhir.', name: 'Rekening Koran', required: false, type: 'bank_statement' },
];

const initialForm: ApplicationForm = {
  birthDate: '',
  birthPlace: '',
  company: '',
  email: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  gender: '',
  homeAddress: '',
  homeCity: '',
  homeDistrict: '',
  homeLocality: '',
  homePostalCode: '',
  homeState: '',
  identityNumber: '',
  income: '',
  job: '',
  name: '',
  password: '',
  phone: '',
  phoneCountry: 'MY',
  phoneCode: '+60',
  status: '',
  workAddress: '',
  workCity: '',
  workDistrict: '',
  workLocality: '',
  workPostalCode: '',
  workState: '',
};

const stepMeta = [
  { icon: 'card-outline', subtitle: 'Pilih kartu dan mulai pengajuan.', title: 'Ajukan Kartu Kredit' },
  { icon: 'person-outline', subtitle: 'Isi data utama dan alamat rumah.', title: 'Data Pribadi' },
  { icon: 'briefcase-outline', subtitle: 'Lengkapi pekerjaan dan alamat kantor.', title: 'Pekerjaan' },
  { icon: 'document-text-outline', subtitle: 'Opsional, bantu percepat proses verifikasi.', title: 'Dokumen Pendukung' },
  { icon: 'clipboard-outline', subtitle: 'Periksa kembali data sebelum dikirim.', title: 'Review Pengajuan' },
  { icon: 'keypad-outline', subtitle: 'Masukkan kode OTP yang dikirim via WhatsApp.', title: 'Verifikasi OTP' },
  { icon: 'hourglass-outline', subtitle: 'Pengajuan Anda sedang diproses admin.', title: 'Review Pengajuan' },
] as const;

export default function RegisterScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const profileMode = mode === 'profile';
  const { isAuthenticated, register, refreshMe, token, user } = useAuth();
  const [form, setForm] = useState<ApplicationForm>(() => formFromProfile(user?.credit_card_profile, user));
  const [step, setStep] = useState(user?.credit_card_profile?.application_status === 'otp_pending' ? 6 : 1);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(user?.credit_card_profile?.otp_expires_at ?? null);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpRemaining, setOtpRemaining] = useState(0);
  const [documents, setDocuments] = useState<Partial<Record<DocumentType, LocalDocument>>>({});
  const profile = user?.credit_card_profile;
  const meta = stepMeta[step - 1];
  const submitted = profile?.application_status && !['draft', 'otp_pending'].includes(profile.application_status);

  useEffect(() => {
    if (profile?.application_status === 'otp_pending') setStep(6);
    if (profile?.otp_expires_at) setOtpExpiresAt(profile.otp_expires_at);
  }, [profile?.application_status, profile?.otp_expires_at]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step > 1 && !submitted) {
        setStep((current) => Math.max(1, current - 1));
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [step, submitted]);

  useEffect(() => {
    if (!otpExpiresAt || step !== 6) {
      setOtpRemaining(0);
      return;
    }

    const tick = () => {
      setOtpRemaining(Math.max(0, Math.ceil((new Date(otpExpiresAt).getTime() - Date.now()) / 1000)));
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [otpExpiresAt, step]);

  if (!profileMode) {
    return <AccountOnlyRegisterScreen />;
  }

  if (submitted) {
    return <StatusScreen profile={profile} />;
  }

  function updateField(key: keyof ApplicationForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updatePhone(value: string) {
    const detectedCountry = detectCountry(value);
    setForm((current) => ({
      ...current,
      phone: value,
      ...(detectedCountry
        ? {
            phoneCode: countryByCode(detectedCountry).dialCode,
            phoneCountry: detectedCountry,
          }
        : {}),
    }));
  }

  function updateCountry(country: CountryCode) {
    const selectedCountry = countryByCode(country);
    setForm((current) => ({
      ...current,
      phoneCode: selectedCountry.dialCode,
      phoneCountry: country,
    }));
  }

  function applyAddress(kind: 'home' | 'work', address: AddressSuggestion) {
    setForm((current) => ({
      ...current,
      [`${kind}Address`]: address.displayName,
      [`${kind}City`]: address.city || current[`${kind}City`],
      [`${kind}District`]: address.district || current[`${kind}District`],
      [`${kind}Locality`]: address.locality || current[`${kind}Locality`],
      [`${kind}PostalCode`]: address.postalCode || current[`${kind}PostalCode`],
      [`${kind}State`]: address.state || current[`${kind}State`],
    }));
  }

  async function submitReview() {
    const missingDocument = documentMeta.find((item) => item.required && !documents[item.type]);

    if (missingDocument) {
      setNotice(`Lengkapi dokumen wajib: ${missingDocument.name}.`);
      setStep(4);
      return;
    }

    setLoading(true);
    setNotice('');

    try {
      let activeToken = token;

      if (!isAuthenticated) {
        const auth = await register({
          email: form.email,
          name: form.name,
          password: form.password,
          phone: normalizedPhone(form),
        });
        activeToken = auth.token;
      }

      if (!activeToken) {
        throw new Error('Sesi login belum siap. Silakan login ulang.');
      }

      await apiRequest('/profile', { method: 'PUT', token: activeToken, body: profilePayload(form) });
      await uploadDocuments(activeToken);
      const otpResponse = await apiRequest<{ dev_otp?: string | null; expires_at?: string | null; message: string }>('/otp/send', {
        method: 'POST',
        token: activeToken,
      });
      setDevOtp(otpResponse.dev_otp ?? null);
      setOtpExpiresAt(otpResponse.expires_at ?? null);
      await refreshMe(activeToken);
      setStep(6);
      setNotice(otpResponse.message);
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : 'Pengajuan gagal dikirim.');
    } finally {
      setLoading(false);
    }
  }

  async function uploadDocuments(activeToken: string) {
    for (const item of Object.values(documents)) {
      if (!item) continue;

      const body = new FormData();
      body.append('file', {
        name: item.name,
        type: mimeFromUri(item.uri),
        uri: item.uri,
      } as unknown as Blob);

      await apiRequest(`/verifications/${item.type}`, {
        method: 'POST',
        token: activeToken,
        body,
      });
    }
  }

  async function verifyOtp() {
    if (!token) return;
    if (otp.length !== 6) {
      setNotice('Masukkan 6 angka OTP.');
      return;
    }

    setLoading(true);
    setNotice('');

    try {
      await apiRequest('/otp/verify', { method: 'POST', token, body: { otp } });
      await refreshMe();
      router.replace('/(tabs)');
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : 'OTP gagal diverifikasi.');
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    if (!token) {
      setNotice('Sesi login belum siap. Silakan login ulang.');
      return;
    }

    setResendLoading(true);
    setNotice('');

    try {
      const otpResponse = await apiRequest<{ dev_otp?: string | null; expires_at?: string | null; message: string }>('/otp/send', {
        method: 'POST',
        token,
      });
      setOtp('');
      setDevOtp(otpResponse.dev_otp ?? null);
      setOtpExpiresAt(otpResponse.expires_at ?? null);
      await refreshMe();
      setNotice(otpResponse.message);
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : 'OTP gagal dikirim ulang.');
    } finally {
      setResendLoading(false);
    }
  }

  function nextStep() {
    if (step < 5) {
      setStep((current) => current + 1);
      return;
    }

    if (step === 5) submitReview();
    if (step === 6) verifyOtp();
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0} style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => (step === 1 ? router.back() : setStep((current) => current - 1))} style={styles.backButton}>
            <Ionicons color="#FFFFFF" name="arrow-back" size={22} />
          </Pressable>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>Prime Card</Text>
          </View>
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.headerCopy}>
            <Text style={styles.stepText}>Langkah {step} dari 7</Text>
            <Text style={styles.title}>{meta.title}</Text>
          </View>
          <View style={styles.stepIllustration}>
            <StepIllustration step={step} />
          </View>
        </View>

        <Progress current={step} total={7} />
        <Text style={styles.subtitle}>{meta.subtitle}</Text>
      </View>

      <View style={styles.sheet}>
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.sheetContent}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 ? <ApplyStep /> : null}
          {step === 2 ? (
            <PersonalStep
              form={form}
              onAddressSelect={(address) => applyAddress('home', address)}
              onCountryChange={updateCountry}
              updateField={updateField}
              updatePhone={updatePhone}
            />
          ) : null}
          {step === 3 ? <WorkStep form={form} onAddressSelect={(address) => applyAddress('work', address)} updateField={updateField} /> : null}
          {step === 4 ? <DocumentsStep documents={documents} setDocuments={setDocuments} /> : null}
          {step === 5 ? <ReviewStep documents={documents} form={form} onEdit={setStep} /> : null}
          {step === 6 ? (
            <OtpStep
              devOtp={devOtp}
              notice={notice}
              onResend={resendOtp}
              otp={otp}
              remainingSeconds={otpRemaining}
              resendLoading={resendLoading}
              setOtp={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
            />
          ) : null}
          {step === 7 ? <StatusScreen profile={profile} /> : null}
          {notice && step !== 6 ? <Text style={styles.notice}>{notice}</Text> : null}
        </ScrollView>
      </View>

      {step < 7 ? (
        <View style={styles.bottomBar}>
          <Pressable disabled={loading} onPress={nextStep} style={styles.primaryButton}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>{buttonLabel(step)}</Text>}
          </Pressable>
          {step === 4 ? (
            <Pressable onPress={() => setStep(5)} style={styles.skipButton}>
              <Text style={styles.skipText}>Lewati dulu</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

function AccountOnlyRegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: '',
    name: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  function updateField(key: 'email' | 'name' | 'password' | 'phone', value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim() || !form.phone.trim()) {
      setNotice('Sila lengkapkan nama, emel, nombor telefon, dan kata laluan.');
      return;
    }

    setLoading(true);
    setNotice('');

    try {
      await register({
        email: form.email.trim(),
        name: form.name.trim(),
        password: form.password,
        phone: normalizedPhone({
          phone: form.phone,
          phoneCode: '+60',
          phoneCountry: 'MY',
        } as ApplicationForm),
      });
      router.replace('/(tabs)');
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : 'Pendaftaran akaun gagal.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.accountPage}>
      <ScrollView contentContainerStyle={styles.accountContent} keyboardShouldPersistTaps="handled">
        <View style={styles.accountHero}>
          <View style={styles.accountBadge}>
            <Text style={styles.accountBadgeText}>Daftar Akaun</Text>
          </View>
          <Text style={styles.accountTitle}>Buka akaun dahulu, lengkapkan profil kemudian.</Text>
          <Text style={styles.accountSubtitle}>
            Cukup bina akaun anda sekarang. Selepas log masuk, anda akan terus masuk ke halaman beranda dan boleh sambung isi maklumat permohonan pada bila-bila masa.
          </Text>
        </View>

        <View style={styles.accountCard}>
          <Field label="Nama Penuh" onChangeText={(value) => updateField('name', value)} placeholder="Nama mengikut kad pengenalan" value={form.name} />
          <Field keyboardType="email-address" label="Emel" onChangeText={(value) => updateField('email', value)} placeholder="nama@contoh.com" value={form.email} />
          <Field keyboardType="phone-pad" label="No. Telefon" onChangeText={(value) => updateField('phone', value)} placeholder="Contoh 0123456789" value={form.phone} />
          <Field label="Kata Laluan" onChangeText={(value) => updateField('password', value)} placeholder="Sekurang-kurangnya 8 aksara" secureTextEntry value={form.password} />

          {notice ? <Text style={styles.accountNotice}>{notice}</Text> : null}

          <Pressable disabled={loading} onPress={submit} style={styles.accountPrimaryButton}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.accountPrimaryText}>Daftar Akaun</Text>}
          </Pressable>

          <Pressable onPress={() => router.push('/login')} style={styles.accountSecondaryButton}>
            <Text style={styles.accountSecondaryText}>Saya sudah ada akaun</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ApplyStep() {
  return (
    <View style={styles.applyCard}>
      <View style={styles.cardChip}>
        <Text style={styles.cardChipText}>NEXA PRIME</Text>
      </View>
      <Text style={styles.applyTitle}>Prime Card</Text>
      <Text style={styles.applySubtitle}>Cocok untuk kebutuhan sehari-hari, cicilan 0%, reward points, cashback, dan perlindungan transaksi.</Text>
      <View style={styles.applyGrid}>
        <MiniBenefit icon="sync-circle-outline" text="Cicilan 0%" />
        <MiniBenefit icon="star-outline" text="Reward Points" />
        <MiniBenefit icon="briefcase-outline" text="Cashback" />
        <MiniBenefit icon="shield-checkmark-outline" text="Aman" />
      </View>
    </View>
  );
}

function MiniBenefit({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.miniBenefit}>
      <Ionicons color="#0A3B97" name={icon} size={18} />
      <Text style={styles.miniBenefitText}>{text}</Text>
    </View>
  );
}

function PersonalStep({
  form,
  onAddressSelect,
  onCountryChange,
  updateField,
  updatePhone,
}: {
  form: ApplicationForm;
  onAddressSelect: (address: AddressSuggestion) => void;
  onCountryChange: (country: CountryCode) => void;
  updateField: (key: keyof ApplicationForm, value: string) => void;
  updatePhone: (value: string) => void;
}) {
  return (
    <View style={styles.form}>
      <Field label="Nama Lengkap" onChangeText={(value) => updateField('name', value)} placeholder="Masukkan nama sesuai identitas" value={form.name} valid />
      <Field keyboardType="email-address" label="Email" onChangeText={(value) => updateField('email', value)} placeholder="nama@email.com" value={form.email} valid />
      <Field label="Password" onChangeText={(value) => updateField('password', value)} placeholder="Minimal 8 karakter" secureTextEntry value={form.password} />
      <Field label="No. Identitas (MyKad/Paspor)" onChangeText={(value) => updateField('identityNumber', value)} placeholder="Masukkan nomor identitas" value={form.identityNumber} valid />
      <Field label="Tempat Lahir" onChangeText={(value) => updateField('birthPlace', value)} placeholder="Contoh: Kuala Lumpur" value={form.birthPlace} />
      <DateField label="Tanggal Lahir" onChange={(value) => updateField('birthDate', value)} value={form.birthDate} />
      <SelectField label="Jenis Kelamin" onChange={(value) => updateField('gender', value)} options={genderOptions} placeholder="Pilih jenis kelamin" value={form.gender} />
      <View style={styles.phoneRow}>
        <CountryCodeField country={form.phoneCountry} onChange={onCountryChange} />
        <Field
          keyboardType="phone-pad"
          label="Nomor HP"
          onChangeText={updatePhone}
          placeholder={countryByCode(form.phoneCountry).hint}
          value={form.phone}
          valid={Boolean(form.phone)}
        />
      </View>
      <AddressSearch label="Cari Alamat Rumah di Malaysia" onSelect={onAddressSelect} placeholder="Contoh: Jalan Ampang Kuala Lumpur" />
      <Field label="Alamat Rumah" multiline onChangeText={(value) => updateField('homeAddress', value)} placeholder="Masukkan alamat lengkap rumah" value={form.homeAddress} valid />
      <Field label="Provinsi/Negeri" onChangeText={(value) => updateField('homeState', value)} placeholder="Contoh: Selangor" value={form.homeState} />
      <Field label="Kabupaten/Daerah" onChangeText={(value) => updateField('homeDistrict', value)} placeholder="Contoh: Petaling" value={form.homeDistrict} />
      <Field label="Kecamatan/Mukim" onChangeText={(value) => updateField('homeLocality', value)} placeholder="Contoh: Damansara" value={form.homeLocality} />
      <Field label="Kota" onChangeText={(value) => updateField('homeCity', value)} placeholder="Contoh: Petaling Jaya" value={form.homeCity} />
      <Field keyboardType="number-pad" label="Kode Pos" onChangeText={(value) => updateField('homePostalCode', value)} placeholder="Contoh: 47800" value={form.homePostalCode} />
      <Field label="Nama Kontak Darurat" onChangeText={(value) => updateField('emergencyContactName', value)} placeholder="Nama keluarga/kerabat" value={form.emergencyContactName} />
      <Field keyboardType="phone-pad" label="Nomor Kontak Darurat" onChangeText={(value) => updateField('emergencyContactPhone', value)} placeholder="Contoh: 0123456789" value={form.emergencyContactPhone} />
    </View>
  );
}

function WorkStep({
  form,
  onAddressSelect,
  updateField,
}: {
  form: ApplicationForm;
  onAddressSelect: (address: AddressSuggestion) => void;
  updateField: (key: keyof ApplicationForm, value: string) => void;
}) {
  return (
    <View style={styles.form}>
      <SelectField label="Status Pekerjaan" onChange={(value) => updateField('status', value)} options={employmentOptions} placeholder="Pilih status pekerjaan" value={form.status} />
      <Field label="Nama Perusahaan" onChangeText={(value) => updateField('company', value)} placeholder="Contoh: Nexa Sdn Bhd" value={form.company} />
      <Field label="Jabatan" onChangeText={(value) => updateField('job', value)} placeholder="Contoh: Staff Operasional" value={form.job} />
      <SelectField label="Penghasilan Bulanan" onChange={(value) => updateField('income', value)} options={incomeOptions} placeholder="Pilih rentang penghasilan" value={form.income} />
      <AddressSearch label="Cari Alamat Kantor di Malaysia" onSelect={onAddressSelect} placeholder="Contoh: Menara Maybank Kuala Lumpur" />
      <Field label="Alamat Kantor" multiline onChangeText={(value) => updateField('workAddress', value)} placeholder="Masukkan alamat lengkap kantor" value={form.workAddress} valid />
      <Field label="Provinsi/Negeri" onChangeText={(value) => updateField('workState', value)} placeholder="Contoh: Wilayah Persekutuan" value={form.workState} />
      <Field label="Kabupaten/Daerah" onChangeText={(value) => updateField('workDistrict', value)} placeholder="Contoh: Kuala Lumpur" value={form.workDistrict} />
      <Field label="Kecamatan/Mukim" onChangeText={(value) => updateField('workLocality', value)} placeholder="Contoh: Bukit Bintang" value={form.workLocality} />
      <Field label="Kota" onChangeText={(value) => updateField('workCity', value)} placeholder="Contoh: Kuala Lumpur" value={form.workCity} />
      <Field keyboardType="number-pad" label="Kode Pos" onChangeText={(value) => updateField('workPostalCode', value)} placeholder="Contoh: 50050" value={form.workPostalCode} />
    </View>
  );
}

function AddressSearch({ label, onSelect, placeholder }: { label: string; onSelect: (address: AddressSuggestion) => void; placeholder: string }) {
  const [cache, setCache] = useState<Record<string, AddressSuggestion[]>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AddressSuggestion[]>([]);

  async function searchAddress() {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 4) {
      setError('Masukkan minimal 4 karakter alamat.');
      setResults([]);
      return;
    }
    if (cache[normalizedQuery]) {
      setResults(cache[normalizedQuery]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = await apiRequest<{ results: AddressSuggestion[] }>(`/addresses/search?${new URLSearchParams({ q: normalizedQuery }).toString()}`);
      setCache((current) => ({ ...current, [normalizedQuery]: payload.results }));
      setResults(payload.results);
      setError(payload.results.length ? '' : 'Alamat tidak ditemukan. Anda tetap bisa isi manual.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Pencarian alamat gagal. Anda tetap bisa isi manual.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.addressSearch}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.searchRow}>
        <View style={[styles.input, styles.searchInput]}>
          <Ionicons color="#66758A" name="search-outline" size={18} />
          <TextInput onChangeText={setQuery} onSubmitEditing={searchAddress} placeholder={placeholder} placeholderTextColor="#91A0B8" returnKeyType="search" style={styles.textInput} value={query} />
        </View>
        <Pressable disabled={loading} onPress={searchAddress} style={styles.searchButton}>
          {loading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.searchButtonText}>Cari</Text>}
        </Pressable>
      </View>
      {error ? <Text style={styles.searchError}>{error}</Text> : null}
      {results.map((item) => (
        <Pressable key={item.placeId} onPress={() => onSelect(item)} style={styles.resultItem}>
          <Ionicons color="#006BFF" name="location-outline" size={18} />
          <View style={styles.resultCopy}>
            <Text numberOfLines={2} style={styles.resultTitle}>{item.displayName}</Text>
            <Text style={styles.resultMeta}>{[item.state, item.district, item.postalCode].filter(Boolean).join(' - ') || 'Pilih untuk mengisi detail'}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function DocumentsStep({
  documents,
  setDocuments,
}: {
  documents: Partial<Record<DocumentType, LocalDocument>>;
  setDocuments: (documents: Partial<Record<DocumentType, LocalDocument>>) => void;
}) {
  async function pickDocument(item: (typeof documentMeta)[number]) {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.82,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setDocuments({
      ...documents,
      [item.type]: {
        name: asset.fileName ?? `${item.type}.jpg`,
        required: item.required,
        type: item.type,
        uri: asset.uri,
      },
    });
  }

  return (
    <View style={styles.documentList}>
      {documentMeta.map((item) => (
        <DocumentCard
          description={item.description}
          document={documents[item.type]}
          key={item.type}
          onPress={() => pickDocument(item)}
          required={item.required}
          title={item.name}
        />
      ))}
    </View>
  );
}

function ReviewStep({
  documents,
  form,
  onEdit,
}: {
  documents: Partial<Record<DocumentType, LocalDocument>>;
  form: ApplicationForm;
  onEdit: (step: number) => void;
}) {
  return (
    <View style={styles.reviewList}>
      <ReviewCard onEdit={() => onEdit(2)} rows={[
        ['Nama', form.name],
        ['No. Identitas', form.identityNumber],
        ['Tanggal Lahir', form.birthDate],
        ['Nomor HP', normalizedPhone(form)],
        ['Email', form.email],
        ['Alamat Rumah', form.homeAddress],
        ['Provinsi/Negeri', form.homeState],
        ['Kabupaten/Daerah', form.homeDistrict],
        ['Kecamatan/Mukim', form.homeLocality],
        ['Kode Pos', form.homePostalCode],
      ]} title="Data Pribadi" />
      <ReviewCard onEdit={() => onEdit(3)} rows={[
        ['Perusahaan', form.company],
        ['Jabatan', form.job],
        ['Penghasilan', incomeLabel(form.income)],
        ['Alamat Kantor', form.workAddress],
        ['Provinsi/Negeri', form.workState],
        ['Kabupaten/Daerah', form.workDistrict],
        ['Kecamatan/Mukim', form.workLocality],
        ['Kode Pos', form.workPostalCode],
      ]} title="Pekerjaan" />
      <ReviewCard onEdit={() => onEdit(4)} rows={[
        ['KTP', documents.ktp ? 'Sudah diunggah' : 'Belum diunggah'],
        ['NPWP', documents.npwp ? 'Sudah diunggah' : 'Belum diunggah'],
        ['Foto Selfie', documents.selfie ? 'Sudah diunggah' : 'Belum diunggah'],
        ['Slip Gaji', documents.salary_slip ? 'Sudah diunggah' : 'Opsional'],
        ['Rekening Koran', documents.bank_statement ? 'Sudah diunggah' : 'Opsional'],
      ]} title="Dokumen" />
      <View style={styles.previewGrid}>
        {documentMeta.map((item) => {
          const uploaded = documents[item.type];
          if (!uploaded) return null;

          return (
            <View key={item.type} style={styles.reviewPreview}>
              <Image source={{ uri: uploaded.uri }} style={styles.reviewPreviewImage} />
              <Text style={styles.reviewPreviewText}>{item.name}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function OtpStep({
  devOtp,
  notice,
  onResend,
  otp,
  remainingSeconds,
  resendLoading,
  setOtp,
}: {
  devOtp: string | null;
  notice: string;
  onResend: () => void;
  otp: string;
  remainingSeconds: number;
  resendLoading: boolean;
  setOtp: (value: string) => void;
}) {
  return (
    <View style={styles.otpWrap}>
      <TextInput keyboardType="number-pad" maxLength={6} onChangeText={setOtp} placeholder="000000" placeholderTextColor="#91A0B8" style={styles.otpInput} value={otp} />
      <View style={styles.otpMetaRow}>
        <Text style={styles.otpTimer}>
          {remainingSeconds > 0 ? `Berlaku ${formatCountdown(remainingSeconds)}` : 'OTP sudah kedaluwarsa'}
        </Text>
        <Pressable disabled={resendLoading || remainingSeconds > 240} onPress={onResend} style={styles.resendButton}>
          {resendLoading ? <ActivityIndicator color="#006BFF" size="small" /> : <Text style={styles.resendText}>Kirim ulang</Text>}
        </Pressable>
      </View>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {devOtp ? <Text style={styles.notice}>Kode development: {devOtp}</Text> : null}
      <View style={styles.otpNotice}>
        <Ionicons color="#0877FF" name="shield-checkmark-outline" size={22} />
        <Text style={styles.otpNoticeText}>Kode OTP bersifat rahasia. Jangan bagikan kepada siapa pun.</Text>
      </View>
    </View>
  );
}

function StatusScreen({ profile }: { profile?: CreditCardProfile | null }) {
  const status = profile?.application_status ?? 'pending';
  return (
    <ScrollView style={styles.submittedPage} contentContainerStyle={styles.statusContent}>
      <View style={styles.hourglassCircle}>
        <Ionicons color="#FFFFFF" name={status === 'approved' ? 'checkmark' : status === 'rejected' ? 'close' : 'hourglass-outline'} size={54} />
      </View>
      <Text style={styles.submittedTitleDark}>Review Pengajuan</Text>
      <View style={styles.pendingBadge}>
        <Text style={styles.pendingText}>{statusLabel(status)}</Text>
      </View>
      <Text style={styles.submittedSubtitleDark}>Pengajuan Anda sudah diterima dan sedang dalam proses verifikasi admin.</Text>
      <View style={styles.statusSheetInline}>
        <StatusRow label="Nomor Pengajuan" value={profile?.application_number ?? '-'} />
        <StatusRow label="Kartu" value="Prime Card" />
        <StatusRow checked label="Data Pribadi" value="Lengkap" />
        <StatusRow checked label="Pekerjaan" value="Lengkap" />
        <StatusRow label="Dokumen" value="Opsional" />
      </View>
    </ScrollView>
  );
}

function Progress({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: total }).map((_, index) => {
        const active = index + 1 <= current;
        return (
          <View key={index} style={styles.progressItem}>
            <View style={[styles.progressLine, active && styles.progressLineActive]} />
            <View style={[styles.progressDot, active && styles.progressDotActive]} />
          </View>
        );
      })}
    </View>
  );
}

function Field(props: {
  icon?: keyof typeof Ionicons.glyphMap;
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
  label: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  valid?: boolean;
  value: string;
}) {
  const { icon, label, multiline, placeholder, valid, ...inputProps } = props;
  return (
    <View style={[styles.inputGroup, styles.fieldFlex]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.input, multiline && styles.textArea]}>
        <TextInput
          multiline={multiline}
          placeholder={placeholder ?? label}
          placeholderTextColor="#91A0B8"
          style={[styles.textInput, multiline && styles.textAreaInput]}
          {...inputProps}
        />
        {valid ? <Ionicons color="#16A34A" name="checkmark" size={18} /> : null}
        {icon ? <Ionicons color="#53627A" name={icon} size={18} /> : null}
      </View>
    </View>
  );
}

function DateField({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  const [visible, setVisible] = useState(false);
  const parsed = parseDisplayDate(value);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={() => setVisible(true)} style={styles.input}>
        <Text style={[styles.selectValue, !value && styles.placeholderText]}>{value || 'Pilih tanggal lahir'}</Text>
        <Ionicons color="#53627A" name="calendar-outline" size={18} />
      </Pressable>
      {visible ? (
        <DateTimePicker
          display="default"
          maximumDate={new Date()}
          mode="date"
          onChange={(_, date) => {
            setVisible(false);
            if (date) onChange(formatDisplayDate(date));
          }}
          value={parsed ?? new Date(1995, 0, 1)}
        />
      ) : null}
    </View>
  );
}

function SelectField({
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  value: string;
}) {
  const [visible, setVisible] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={() => setVisible(true)} style={styles.input}>
        <Text style={[styles.selectValue, !selected && styles.placeholderText]}>{selected?.label ?? placeholder}</Text>
        <Ionicons color="#53627A" name="chevron-down" size={18} />
      </Pressable>
      <OptionModal
        onClose={() => setVisible(false)}
        onSelect={(nextValue) => {
          onChange(nextValue);
          setVisible(false);
        }}
        options={options}
        selectedValue={value}
        title={label}
        visible={visible}
      />
    </View>
  );
}

function CountryCodeField({ country, onChange }: { country: CountryCode; onChange: (country: CountryCode) => void }) {
  const [visible, setVisible] = useState(false);
  const selected = countryByCode(country);

  return (
    <View style={[styles.inputGroup, styles.countryField]}>
      <Text style={styles.label}>Kode</Text>
      <Pressable onPress={() => setVisible(true)} style={[styles.input, styles.countryInput]}>
        <CountryFlag code={selected.value} />
        <Text style={styles.countryCodeText}>{selected.dialCode}</Text>
        <Ionicons color="#53627A" name="chevron-down" size={16} />
      </Pressable>
      <Modal animationType="fade" onRequestClose={() => setVisible(false)} transparent visible={visible}>
        <Pressable onPress={() => setVisible(false)} style={styles.modalBackdrop}>
          <Pressable style={styles.optionSheet}>
            <Text style={styles.optionTitle}>Pilih Negara</Text>
            {countries.map((item) => (
              <Pressable
                key={item.value}
                onPress={() => {
                  onChange(item.value);
                  setVisible(false);
                }}
                style={[styles.countryOption, item.value === country && styles.optionActive]}
              >
                <CountryFlag code={item.value} />
                <View style={styles.countryOptionCopy}>
                  <Text style={styles.optionLabel}>{item.label}</Text>
                  <Text style={styles.optionHint}>{item.hint}</Text>
                </View>
                <Text style={styles.optionValue}>{item.dialCode}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function OptionModal({
  onClose,
  onSelect,
  options,
  selectedValue,
  title,
  visible,
}: {
  onClose: () => void;
  onSelect: (value: string) => void;
  options: Option[];
  selectedValue: string;
  title: string;
  visible: boolean;
}) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.modalBackdrop}>
        <Pressable style={styles.optionSheet}>
          <Text style={styles.optionTitle}>{title}</Text>
          <ScrollView style={styles.optionList} showsVerticalScrollIndicator={false}>
            {options.map((item) => (
              <Pressable key={item.value} onPress={() => onSelect(item.value)} style={[styles.optionRow, item.value === selectedValue && styles.optionActive]}>
                <Text style={styles.optionLabel}>{item.label}</Text>
                {item.value === selectedValue ? <Ionicons color="#006BFF" name="checkmark-circle" size={22} /> : null}
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DocumentCard({
  description,
  document,
  onPress,
  required,
  title,
}: {
  description: string;
  document?: LocalDocument;
  onPress: () => void;
  required: boolean;
  title: string;
}) {
  return (
    <View style={styles.documentCard}>
      <View style={styles.docTop}>
        <View style={styles.docIcon}><Ionicons color="#065CE8" name="document-text-outline" size={24} /></View>
        <View style={styles.docCopy}>
          <Text style={styles.docTitle}>{title}</Text>
          <Text style={styles.docDesc}>{description}</Text>
        </View>
        <View style={[styles.optionalBadge, required && styles.requiredBadge]}>
          <Text style={[styles.optionalText, required && styles.requiredText]}>{required ? 'Wajib' : 'Opsional'}</Text>
        </View>
      </View>
      {document ? (
        <Image source={{ uri: document.uri }} style={styles.documentPreview} />
      ) : null}
      <Pressable onPress={onPress} style={styles.uploadButton}>
        <Ionicons color="#006BFF" name="cloud-upload-outline" size={20} />
        <Text style={styles.uploadText}>{document ? 'Ganti Dokumen' : 'Upload Dokumen'}</Text>
      </Pressable>
    </View>
  );
}

function ReviewCard({ onEdit, rows, title }: { onEdit: () => void; rows: string[][]; title: string }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewTitle}>{title}</Text>
        <Pressable onPress={onEdit} style={styles.editBadge}><Text style={styles.editText}>Edit data kembali</Text></Pressable>
      </View>
      {rows.map(([label, value]) => (
        <View key={label} style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>{label}</Text>
          <Text style={styles.reviewValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function StatusRow({ checked, label, value }: { checked?: boolean; label: string; value: string }) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <View style={styles.statusValueWrap}>
        <Text style={styles.statusValue}>{value}</Text>
        {checked ? <Ionicons color="#16A34A" name="checkmark-circle-outline" size={18} /> : null}
      </View>
    </View>
  );
}

function buttonLabel(step: number) {
  if (step === 5) return 'Kirim Pengajuan';
  if (step === 6) return 'Verifikasi OTP';
  return 'Simpan & Lanjut';
}

function formFromProfile(profile?: CreditCardProfile | null, user?: { name: string; email: string; phone?: string } | null): ApplicationForm {
  const detectedCountry = detectCountry(user?.phone ?? '') ?? 'MY';
  const selectedCountry = countryByCode(detectedCountry);

  return {
    ...initialForm,
    email: user?.email ?? initialForm.email,
    homeAddress: profile?.address ?? initialForm.homeAddress,
    homeCity: profile?.city ?? initialForm.homeCity,
    homeDistrict: profile?.district ?? initialForm.homeDistrict,
    homeLocality: profile?.locality ?? initialForm.homeLocality,
    homePostalCode: profile?.postal_code ?? initialForm.homePostalCode,
    homeState: profile?.province ?? initialForm.homeState,
    identityNumber: profile?.nik ?? initialForm.identityNumber,
    income: profile?.monthly_income ?? initialForm.income,
    job: profile?.occupation ?? initialForm.job,
    name: user?.name ?? initialForm.name,
    password: '',
    phone: user?.phone ? stripDialCode(user.phone, detectedCountry) : initialForm.phone,
    phoneCode: selectedCountry.dialCode,
    phoneCountry: detectedCountry,
    workAddress: profile?.work_address ?? initialForm.workAddress,
    workCity: profile?.work_city ?? initialForm.workCity,
    workDistrict: profile?.work_district ?? initialForm.workDistrict,
    workLocality: profile?.work_locality ?? initialForm.workLocality,
    workPostalCode: profile?.work_postal_code ?? initialForm.workPostalCode,
    workState: profile?.work_province ?? initialForm.workState,
  };
}

function profilePayload(form: ApplicationForm) {
  return {
    address: form.homeAddress,
    birth_date: toApiDate(form.birthDate),
    birth_place: form.birthPlace,
    city: form.homeCity,
    company_name: form.company,
    district: form.homeDistrict,
    emergency_contact_name: form.emergencyContactName,
    emergency_contact_phone: form.emergencyContactPhone,
    gender: form.gender,
    locality: form.homeLocality,
    monthly_income: numericAmount(form.income),
    nik: form.identityNumber,
    occupation: form.job,
    postal_code: form.homePostalCode,
    province: form.homeState,
    work_address: form.workAddress,
    work_city: form.workCity,
    work_district: form.workDistrict,
    work_locality: form.workLocality,
    work_postal_code: form.workPostalCode,
    work_province: form.workState,
  };
}

function normalizedPhone(form: ApplicationForm) {
  const country = countryByCode(form.phoneCountry);
  const dialCode = country.dialCode.replace(/\D/g, '');
  let phone = form.phone.replace(/\D/g, '');

  if (phone.startsWith(dialCode)) {
    phone = phone.slice(dialCode.length);
  }

  phone = phone.replace(/^0+/, '');

  return `${dialCode}${phone}`;
}

function numericAmount(value: string) {
  return Number(value.replace(/[^\d]/g, '') || 0);
}

function toApiDate(value: string) {
  const [day, month, year] = value.split(/[/-]/);
  return year && month && day ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : value;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    approved: 'Disetujui Admin',
    otp_pending: 'Menunggu OTP',
    pending: 'Menunggu Verifikasi Admin',
    rejected: 'Ditolak Admin',
  };
  return labels[status] ?? status;
}

function countryByCode(code: CountryCode) {
  return countries.find((country) => country.value === code) ?? countries[0];
}

function detectCountry(value: string): CountryCode | null {
  const digits = value.replace(/\D/g, '');

  if (!digits) return null;
  if (digits.startsWith('08') || digits.startsWith('62')) return 'ID';
  if (digits.startsWith('01') || digits.startsWith('60')) return 'MY';
  if (digits.startsWith('65')) return 'SG';
  if (digits.startsWith('673')) return 'BN';

  return null;
}

function stripDialCode(value: string, country: CountryCode) {
  const dialCode = countryByCode(country).dialCode.replace(/\D/g, '');
  const digits = value.replace(/\D/g, '');

  return digits.startsWith(dialCode) ? digits.slice(dialCode.length) : digits;
}

function parseDisplayDate(value: string) {
  const [day, month, year] = value.split(/[/-]/).map(Number);

  if (!day || !month || !year) return null;

  return new Date(year, month - 1, day);
}

function formatDisplayDate(value: Date) {
  const day = String(value.getDate()).padStart(2, '0');
  const month = String(value.getMonth() + 1).padStart(2, '0');

  return `${day}/${month}/${value.getFullYear()}`;
}

function incomeLabel(value: string) {
  return incomeOptions.find((option) => option.value === value)?.label ?? value;
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function mimeFromUri(uri: string) {
  const extension = uri.split('.').pop()?.toLowerCase();

  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';

  return 'image/jpeg';
}

const styles = StyleSheet.create({
  page: { backgroundColor: '#06185F', flex: 1 },
  header: { backgroundColor: '#06185F', minHeight: 214, paddingHorizontal: 22, paddingTop: 50 },
  headerTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  backButton: { alignItems: 'center', height: 34, justifyContent: 'center', width: 34 },
  headerBadge: { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.18)', borderRadius: 8, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 7 },
  headerBadgeText: { color: '#D9E8FF', fontSize: 12, fontWeight: '900' },
  headerInfo: { alignItems: 'center', flexDirection: 'row', gap: 10, marginBottom: 14 },
  headerCopy: { flex: 1 },
  stepIllustration: { alignItems: 'center', height: 72, justifyContent: 'center', overflow: 'hidden', width: 92 },
  stepText: { color: '#9CCAFF', fontSize: 12, fontWeight: '900', marginBottom: 5 },
  title: { color: '#FFFFFF', fontSize: 21, fontWeight: '900', lineHeight: 26 },
  subtitle: { color: '#D9E6FF', fontSize: 12, lineHeight: 18, marginTop: 10 },
  progressRow: { flexDirection: 'row' },
  progressItem: { alignItems: 'center', flex: 1, flexDirection: 'row' },
  progressLine: { backgroundColor: 'rgba(255,255,255,0.28)', flex: 1, height: 3 },
  progressLineActive: { backgroundColor: '#0A99FF' },
  progressDot: { backgroundColor: 'rgba(255,255,255,0.34)', borderRadius: 6, height: 12, marginLeft: -2, width: 12 },
  progressDotActive: { backgroundColor: '#0A99FF' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, flex: 1, marginTop: -18, overflow: 'hidden' },
  sheetContent: { padding: 22, paddingBottom: 190 },
  form: { gap: 17 },
  inputGroup: { gap: 8 },
  fieldFlex: { flex: 1 },
  label: { color: '#10275D', fontSize: 12, fontWeight: '800' },
  input: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#DCE4EF', borderRadius: 8, borderWidth: 1, flexDirection: 'row', minHeight: 52, paddingHorizontal: 13 },
  textInput: { color: '#10275D', flex: 1, fontSize: 14, minHeight: 36, padding: 0 },
  textArea: { alignItems: 'flex-start', minHeight: 78, paddingVertical: 10 },
  textAreaInput: { minHeight: 56, textAlignVertical: 'top' },
  phoneRow: { flexDirection: 'row', gap: 10 },
  countryField: { width: 116 },
  countryInput: { gap: 7, paddingHorizontal: 10 },
  countryCodeText: { color: '#10275D', fontSize: 13, fontWeight: '900' },
  selectValue: { color: '#10275D', flex: 1, fontSize: 14, fontWeight: '700' },
  placeholderText: { color: '#91A0B8', fontWeight: '500' },
  modalBackdrop: { alignItems: 'center', backgroundColor: 'rgba(4,13,35,0.38)', flex: 1, justifyContent: 'flex-end', padding: 18 },
  optionSheet: { backgroundColor: '#FFFFFF', borderRadius: 14, gap: 8, padding: 16, width: '100%' },
  optionList: { maxHeight: 430 },
  optionTitle: { color: '#061946', fontSize: 17, fontWeight: '900', marginBottom: 6 },
  optionRow: { alignItems: 'center', borderColor: '#E8EEF7', borderRadius: 8, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, minHeight: 52, paddingHorizontal: 14 },
  optionActive: { backgroundColor: '#EEF5FF', borderColor: '#AFCBFF' },
  optionLabel: { color: '#10275D', fontSize: 14, fontWeight: '800' },
  countryOption: { alignItems: 'center', borderColor: '#E8EEF7', borderRadius: 8, borderWidth: 1, flexDirection: 'row', gap: 12, minHeight: 62, paddingHorizontal: 14 },
  countryOptionCopy: { flex: 1 },
  optionHint: { color: '#6D7A92', fontSize: 11, marginTop: 3 },
  optionValue: { color: '#006BFF', fontSize: 13, fontWeight: '900' },
  addressSearch: { backgroundColor: '#F7FAFF', borderColor: '#DCE7F5', borderRadius: 8, borderWidth: 1, gap: 10, padding: 12 },
  searchRow: { flexDirection: 'row', gap: 10 },
  searchInput: { flex: 1, gap: 8 },
  searchButton: { alignItems: 'center', backgroundColor: '#061E64', borderRadius: 8, justifyContent: 'center', minHeight: 52, width: 66 },
  searchButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  searchError: { color: '#B42318', fontSize: 12, lineHeight: 17 },
  resultItem: { backgroundColor: '#FFFFFF', borderColor: '#E4EBF5', borderRadius: 8, borderWidth: 1, flexDirection: 'row', gap: 10, padding: 11 },
  resultCopy: { flex: 1 },
  resultTitle: { color: '#10275D', fontSize: 12, fontWeight: '800', lineHeight: 17 },
  resultMeta: { color: '#697790', fontSize: 11, marginTop: 4 },
  applyCard: { backgroundColor: '#F7FAFF', borderColor: '#E3EBF7', borderRadius: 8, borderWidth: 1, padding: 18 },
  cardChip: { alignSelf: 'flex-start', backgroundColor: '#061E64', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  cardChipText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  applyTitle: { color: '#061946', fontSize: 24, fontWeight: '900', marginTop: 18 },
  applySubtitle: { color: '#61708A', fontSize: 13, lineHeight: 20, marginTop: 8 },
  applyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 },
  miniBenefit: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#E4EBF5', borderRadius: 8, borderWidth: 1, flexDirection: 'row', gap: 8, padding: 10, width: '48%' },
  miniBenefitText: { color: '#10275D', fontSize: 12, fontWeight: '800' },
  documentList: { gap: 18 },
  documentCard: { backgroundColor: '#FFFFFF', borderColor: '#EEF2F7', borderRadius: 10, borderWidth: 1, padding: 16 },
  docTop: { alignItems: 'flex-start', flexDirection: 'row', gap: 13 },
  docIcon: { alignItems: 'center', backgroundColor: '#EEF5FF', borderRadius: 8, height: 48, justifyContent: 'center', width: 48 },
  docCopy: { flex: 1 },
  docTitle: { color: '#061946', fontSize: 15, fontWeight: '900' },
  docDesc: { color: '#6D7A92', fontSize: 12, lineHeight: 18, marginTop: 6 },
  optionalBadge: { backgroundColor: '#EAF2FF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5 },
  optionalText: { color: '#1677FF', fontSize: 11, fontWeight: '900' },
  requiredBadge: { backgroundColor: '#FFF1E6' },
  requiredText: { color: '#B45309' },
  documentPreview: { backgroundColor: '#EEF2F7', borderRadius: 8, height: 150, marginTop: 14, width: '100%' },
  uploadButton: { alignItems: 'center', borderColor: '#D6E0EF', borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, flexDirection: 'row', gap: 8, height: 58, justifyContent: 'center', marginTop: 20 },
  uploadText: { color: '#006BFF', fontSize: 14, fontWeight: '900' },
  reviewList: { gap: 16 },
  reviewCard: { backgroundColor: '#FFFFFF', borderColor: '#EEF2F7', borderRadius: 10, borderWidth: 1, padding: 16 },
  reviewHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  reviewTitle: { color: '#061946', fontSize: 14, fontWeight: '900' },
  editBadge: { backgroundColor: '#EAF2FF', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  editText: { color: '#1677FF', fontSize: 12, fontWeight: '900' },
  reviewRow: { flexDirection: 'row', gap: 16, justifyContent: 'space-between', paddingVertical: 6 },
  reviewLabel: { color: '#6C7890', fontSize: 12 },
  reviewValue: { color: '#10275D', flex: 1, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  previewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  reviewPreview: { backgroundColor: '#F7FAFF', borderColor: '#E4EBF5', borderRadius: 8, borderWidth: 1, overflow: 'hidden', width: '48%' },
  reviewPreviewImage: { backgroundColor: '#EEF2F7', height: 104, width: '100%' },
  reviewPreviewText: { color: '#10275D', fontSize: 11, fontWeight: '900', padding: 9 },
  otpWrap: { gap: 20, paddingTop: 10 },
  otpInput: { borderColor: '#B9CEF1', borderRadius: 8, borderWidth: 1.5, color: '#061946', fontSize: 22, fontWeight: '900', height: 58, letterSpacing: 8, textAlign: 'center' },
  otpMetaRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  otpTimer: { color: '#61708A', fontSize: 12, fontWeight: '800' },
  resendButton: { alignItems: 'center', minHeight: 34, justifyContent: 'center', paddingHorizontal: 8 },
  resendText: { color: '#006BFF', fontSize: 13, fontWeight: '900' },
  otpNotice: { alignItems: 'center', backgroundColor: '#F1F6FF', borderRadius: 8, flexDirection: 'row', gap: 12, padding: 16 },
  otpNoticeText: { color: '#5C6B84', flex: 1, fontSize: 12, lineHeight: 17 },
  notice: { color: '#0F5E9C', fontSize: 13, fontWeight: '700', lineHeight: 19 },
  bottomBar: { backgroundColor: '#FFFFFF', bottom: 0, left: 0, paddingBottom: 24, paddingHorizontal: 22, paddingTop: 12, position: 'absolute', right: 0 },
  primaryButton: { alignItems: 'center', backgroundColor: '#061E64', borderRadius: 8, height: 54, justifyContent: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  skipButton: { alignItems: 'center', height: 42, justifyContent: 'center' },
  skipText: { color: '#006BFF', fontSize: 14, fontWeight: '900' },
  submittedPage: { backgroundColor: '#FFFFFF', flex: 1 },
  statusContent: { alignItems: 'center', padding: 22, paddingBottom: 120, paddingTop: 80 },
  hourglassCircle: { alignItems: 'center', backgroundColor: '#123A80', borderColor: 'rgba(15,92,232,0.2)', borderRadius: 48, borderWidth: 12, height: 96, justifyContent: 'center', width: 96 },
  submittedTitleDark: { color: '#061946', fontSize: 25, fontWeight: '900', marginTop: 24 },
  pendingBadge: { backgroundColor: '#A66B00', borderRadius: 8, marginTop: 12, paddingHorizontal: 12, paddingVertical: 8 },
  pendingText: { color: '#FFD45A', fontSize: 12, fontWeight: '900' },
  submittedSubtitleDark: { color: '#61708A', fontSize: 13, lineHeight: 20, marginTop: 20, textAlign: 'center' },
  statusSheetInline: { alignSelf: 'stretch', backgroundColor: '#FFFFFF', borderColor: '#EEF2F7', borderRadius: 10, borderWidth: 1, marginTop: 24, paddingHorizontal: 16 },
  statusRow: { alignItems: 'center', borderBottomColor: '#EEF2F7', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 45 },
  statusLabel: { color: '#61708A', fontSize: 13 },
  statusValueWrap: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  statusValue: { color: '#061946', fontSize: 13, fontWeight: '900' },
  accountPage: { backgroundColor: '#06185F', flex: 1 },
  accountContent: { padding: 22, paddingBottom: 48, paddingTop: 68 },
  accountHero: { gap: 10, marginBottom: 18 },
  accountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  accountBadgeText: { color: '#D9E8FF', fontSize: 12, fontWeight: '900' },
  accountTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', lineHeight: 34 },
  accountSubtitle: { color: '#D9E6FF', fontSize: 13, lineHeight: 20 },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    gap: 16,
    padding: 18,
  },
  accountNotice: { color: '#B42318', fontSize: 12, lineHeight: 18 },
  accountPrimaryButton: {
    alignItems: 'center',
    backgroundColor: '#0A3B97',
    borderRadius: 14,
    minHeight: 50,
    justifyContent: 'center',
  },
  accountPrimaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  accountSecondaryButton: {
    alignItems: 'center',
    borderColor: '#DCE4EF',
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  accountSecondaryText: { color: '#10275D', fontSize: 13, fontWeight: '800' },
});
