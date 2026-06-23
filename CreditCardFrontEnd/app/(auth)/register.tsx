import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { apiRequest, CreditCardProfile } from '@/lib/api';

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

const initialForm: ApplicationForm = {
  birthDate: '15/08/1990',
  birthPlace: 'Kuala Lumpur',
  company: 'PT Maju Bersama',
  email: 'andi.pratama@email.com',
  emergencyContactName: 'Budi Pratama',
  emergencyContactPhone: '+60129876543',
  gender: 'male',
  homeAddress: 'Jalan Ampang, Kuala Lumpur',
  homeCity: 'Kuala Lumpur',
  homeDistrict: 'Kuala Lumpur',
  homeLocality: 'Ampang',
  homePostalCode: '50450',
  homeState: 'Wilayah Persekutuan Kuala Lumpur',
  identityNumber: '900815-14-5678',
  income: 'RM 4,500',
  job: 'Manajer Pemasaran',
  name: 'Andi Pratama',
  password: 'password123',
  phone: '123456789',
  phoneCode: '+60',
  status: 'Karyawan Swasta',
  workAddress: 'Menara Maybank, 100 Jalan Tun Perak',
  workCity: 'Kuala Lumpur',
  workDistrict: 'Kuala Lumpur',
  workLocality: 'Bukit Bintang',
  workPostalCode: '50050',
  workState: 'Wilayah Persekutuan Kuala Lumpur',
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
  const { isAuthenticated, register, refreshMe, token, user } = useAuth();
  const [form, setForm] = useState<ApplicationForm>(() => formFromProfile(user?.credit_card_profile, user));
  const [step, setStep] = useState(user?.credit_card_profile?.application_status === 'otp_pending' ? 6 : 1);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const profile = user?.credit_card_profile;
  const meta = stepMeta[step - 1];
  const submitted = profile?.application_status && !['draft', 'otp_pending'].includes(profile.application_status);

  useEffect(() => {
    if (profile?.application_status === 'otp_pending') setStep(6);
  }, [profile?.application_status]);

  if (submitted) {
    return <StatusScreen profile={profile} />;
  }

  function updateField(key: keyof ApplicationForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
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
      const otpResponse = await apiRequest<{ dev_otp?: string | null; message: string }>('/otp/send', {
        method: 'POST',
        token: activeToken,
      });
      setDevOtp(otpResponse.dev_otp ?? null);
      await refreshMe(activeToken);
      setStep(6);
      setNotice(otpResponse.message);
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : 'Pengajuan gagal dikirim.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!token) return;

    setLoading(true);
    setNotice('');

    try {
      await apiRequest('/otp/verify', { method: 'POST', token, body: { otp } });
      await refreshMe();
      setStep(7);
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : 'OTP gagal diverifikasi.');
    } finally {
      setLoading(false);
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
    <View style={styles.page}>
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
          <View style={styles.headerIcon}>
            <Ionicons color="#FFFFFF" name={meta.icon} size={22} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.stepText}>Langkah {step} dari 7</Text>
            <Text style={styles.title}>{meta.title}</Text>
          </View>
        </View>

        <Progress current={step} total={7} />
        <Text style={styles.subtitle}>{meta.subtitle}</Text>
      </View>

      <View style={styles.sheet}>
        <ScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {step === 1 ? <ApplyStep /> : null}
          {step === 2 ? <PersonalStep form={form} onAddressSelect={(address) => applyAddress('home', address)} updateField={updateField} /> : null}
          {step === 3 ? <WorkStep form={form} onAddressSelect={(address) => applyAddress('work', address)} updateField={updateField} /> : null}
          {step === 4 ? <DocumentsStep /> : null}
          {step === 5 ? <ReviewStep form={form} onEdit={setStep} /> : null}
          {step === 6 ? <OtpStep devOtp={devOtp} notice={notice} otp={otp} setOtp={setOtp} /> : null}
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
    </View>
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
  updateField,
}: {
  form: ApplicationForm;
  onAddressSelect: (address: AddressSuggestion) => void;
  updateField: (key: keyof ApplicationForm, value: string) => void;
}) {
  return (
    <View style={styles.form}>
      <Field label="Nama Lengkap" onChangeText={(value) => updateField('name', value)} value={form.name} valid />
      <Field label="Email" onChangeText={(value) => updateField('email', value)} value={form.email} valid />
      <Field label="Password" onChangeText={(value) => updateField('password', value)} secureTextEntry value={form.password} />
      <Field label="No. Identitas (MyKad/Paspor)" onChangeText={(value) => updateField('identityNumber', value)} value={form.identityNumber} valid />
      <Field label="Tempat Lahir" onChangeText={(value) => updateField('birthPlace', value)} value={form.birthPlace} />
      <Field icon="calendar-outline" label="Tanggal Lahir" onChangeText={(value) => updateField('birthDate', value)} value={form.birthDate} />
      <Field label="Gender (male/female)" onChangeText={(value) => updateField('gender', value)} value={form.gender} />
      <View style={styles.phoneRow}>
        <Field label="Kode" onChangeText={(value) => updateField('phoneCode', value)} value={form.phoneCode} />
        <Field keyboardType="phone-pad" label="Nomor HP" onChangeText={(value) => updateField('phone', value)} value={form.phone} valid />
      </View>
      <AddressSearch label="Cari Alamat Rumah di Malaysia" onSelect={onAddressSelect} placeholder="Contoh: Jalan Ampang Kuala Lumpur" />
      <Field label="Alamat Rumah" multiline onChangeText={(value) => updateField('homeAddress', value)} value={form.homeAddress} valid />
      <Field label="Provinsi/Negeri" onChangeText={(value) => updateField('homeState', value)} value={form.homeState} />
      <Field label="Kabupaten/Daerah" onChangeText={(value) => updateField('homeDistrict', value)} value={form.homeDistrict} />
      <Field label="Kecamatan/Mukim" onChangeText={(value) => updateField('homeLocality', value)} value={form.homeLocality} />
      <Field label="Kota" onChangeText={(value) => updateField('homeCity', value)} value={form.homeCity} />
      <Field keyboardType="number-pad" label="Kode Pos" onChangeText={(value) => updateField('homePostalCode', value)} value={form.homePostalCode} />
      <Field label="Nama Kontak Darurat" onChangeText={(value) => updateField('emergencyContactName', value)} value={form.emergencyContactName} />
      <Field keyboardType="phone-pad" label="Nomor Kontak Darurat" onChangeText={(value) => updateField('emergencyContactPhone', value)} value={form.emergencyContactPhone} />
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
      <Field label="Status Pekerjaan" onChangeText={(value) => updateField('status', value)} value={form.status} />
      <Field label="Nama Perusahaan" onChangeText={(value) => updateField('company', value)} value={form.company} />
      <Field label="Jabatan" onChangeText={(value) => updateField('job', value)} value={form.job} />
      <Field label="Penghasilan Bulanan" onChangeText={(value) => updateField('income', value)} value={form.income} />
      <AddressSearch label="Cari Alamat Kantor di Malaysia" onSelect={onAddressSelect} placeholder="Contoh: Menara Maybank Kuala Lumpur" />
      <Field label="Alamat Kantor" multiline onChangeText={(value) => updateField('workAddress', value)} value={form.workAddress} valid />
      <Field label="Provinsi/Negeri" onChangeText={(value) => updateField('workState', value)} value={form.workState} />
      <Field label="Kabupaten/Daerah" onChangeText={(value) => updateField('workDistrict', value)} value={form.workDistrict} />
      <Field label="Kecamatan/Mukim" onChangeText={(value) => updateField('workLocality', value)} value={form.workLocality} />
      <Field label="Kota" onChangeText={(value) => updateField('workCity', value)} value={form.workCity} />
      <Field keyboardType="number-pad" label="Kode Pos" onChangeText={(value) => updateField('workPostalCode', value)} value={form.workPostalCode} />
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

function DocumentsStep() {
  return (
    <View style={styles.documentList}>
      <DocumentCard title="Slip Gaji" description="Upload slip gaji 3 bulan terakhir" />
      <DocumentCard title="Rekening Koran" description="Upload rekening koran 3 bulan terakhir" />
    </View>
  );
}

function ReviewStep({ form, onEdit }: { form: ApplicationForm; onEdit: (step: number) => void }) {
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
        ['Penghasilan', form.income],
        ['Alamat Kantor', form.workAddress],
        ['Provinsi/Negeri', form.workState],
        ['Kabupaten/Daerah', form.workDistrict],
        ['Kecamatan/Mukim', form.workLocality],
        ['Kode Pos', form.workPostalCode],
      ]} title="Pekerjaan" />
      <ReviewCard onEdit={() => onEdit(4)} rows={[
        ['Slip Gaji', 'Tidak diunggah'],
        ['Rekening Koran', 'Tidak diunggah'],
      ]} title="Dokumen" />
    </View>
  );
}

function OtpStep({ devOtp, notice, otp, setOtp }: { devOtp: string | null; notice: string; otp: string; setOtp: (value: string) => void }) {
  return (
    <View style={styles.otpWrap}>
      <TextInput keyboardType="number-pad" maxLength={6} onChangeText={setOtp} placeholder="Masukkan 6 digit OTP" placeholderTextColor="#91A0B8" style={styles.otpInput} value={otp} />
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
  secureTextEntry?: boolean;
  valid?: boolean;
  value: string;
}) {
  const { icon, label, multiline, valid, ...inputProps } = props;
  return (
    <View style={[styles.inputGroup, styles.fieldFlex]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.input, multiline && styles.textArea]}>
        <TextInput placeholderTextColor="#91A0B8" style={[styles.textInput, multiline && styles.textAreaInput]} multiline={multiline} {...inputProps} />
        {valid ? <Ionicons color="#16A34A" name="checkmark" size={18} /> : null}
        {icon ? <Ionicons color="#53627A" name={icon} size={18} /> : null}
      </View>
    </View>
  );
}

function DocumentCard({ description, title }: { description: string; title: string }) {
  return (
    <View style={styles.documentCard}>
      <View style={styles.docTop}>
        <View style={styles.docIcon}><Ionicons color="#065CE8" name="document-text-outline" size={24} /></View>
        <View style={styles.docCopy}>
          <Text style={styles.docTitle}>{title}</Text>
          <Text style={styles.docDesc}>{description}</Text>
        </View>
        <View style={styles.optionalBadge}><Text style={styles.optionalText}>Opsional</Text></View>
      </View>
      <Pressable style={styles.uploadButton}>
        <Ionicons color="#006BFF" name="cloud-upload-outline" size={20} />
        <Text style={styles.uploadText}>Upload Dokumen</Text>
      </Pressable>
    </View>
  );
}

function ReviewCard({ onEdit, rows, title }: { onEdit: () => void; rows: string[][]; title: string }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewTitle}>{title}</Text>
        <Pressable onPress={onEdit} style={styles.editBadge}><Text style={styles.editText}>Edit</Text></Pressable>
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
    phone: user?.phone?.replace(/^60/, '') ?? initialForm.phone,
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
  return `${form.phoneCode}${form.phone}`.replace(/\D/g, '');
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

const styles = StyleSheet.create({
  page: { backgroundColor: '#06185F', flex: 1 },
  header: { backgroundColor: '#06185F', minHeight: 242, paddingHorizontal: 22, paddingTop: 54 },
  headerTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  backButton: { alignItems: 'center', height: 34, justifyContent: 'center', width: 34 },
  headerBadge: { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.18)', borderRadius: 8, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 7 },
  headerBadgeText: { color: '#D9E8FF', fontSize: 12, fontWeight: '900' },
  headerInfo: { alignItems: 'center', flexDirection: 'row', gap: 14, marginBottom: 18 },
  headerIcon: { alignItems: 'center', backgroundColor: 'rgba(10,153,255,0.22)', borderRadius: 8, height: 46, justifyContent: 'center', width: 46 },
  headerCopy: { flex: 1 },
  stepText: { color: '#9CCAFF', fontSize: 12, fontWeight: '900', marginBottom: 5 },
  title: { color: '#FFFFFF', fontSize: 25, fontWeight: '900', lineHeight: 31 },
  subtitle: { color: '#D9E6FF', fontSize: 13, lineHeight: 20, marginTop: 13 },
  progressRow: { flexDirection: 'row' },
  progressItem: { alignItems: 'center', flex: 1, flexDirection: 'row' },
  progressLine: { backgroundColor: 'rgba(255,255,255,0.28)', flex: 1, height: 3 },
  progressLineActive: { backgroundColor: '#0A99FF' },
  progressDot: { backgroundColor: 'rgba(255,255,255,0.34)', borderRadius: 6, height: 12, marginLeft: -2, width: 12 },
  progressDotActive: { backgroundColor: '#0A99FF' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, flex: 1, marginTop: -18, overflow: 'hidden' },
  sheetContent: { padding: 22, paddingBottom: 122 },
  form: { gap: 17 },
  inputGroup: { gap: 8 },
  fieldFlex: { flex: 1 },
  label: { color: '#10275D', fontSize: 12, fontWeight: '800' },
  input: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#DCE4EF', borderRadius: 8, borderWidth: 1, flexDirection: 'row', minHeight: 52, paddingHorizontal: 13 },
  textInput: { color: '#10275D', flex: 1, fontSize: 14, minHeight: 36, padding: 0 },
  textArea: { alignItems: 'flex-start', minHeight: 78, paddingVertical: 10 },
  textAreaInput: { minHeight: 56, textAlignVertical: 'top' },
  phoneRow: { flexDirection: 'row', gap: 10 },
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
  otpWrap: { gap: 20, paddingTop: 10 },
  otpInput: { borderColor: '#B9CEF1', borderRadius: 8, borderWidth: 1.5, color: '#061946', fontSize: 22, fontWeight: '900', height: 58, letterSpacing: 8, textAlign: 'center' },
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
});
