import { router } from 'expo-router';

import { InfoCard, ListCard, ListRow, MenuDetailPage } from '@/components/menu/MenuDetailPage';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const { user } = useAuth();
  const profile = user?.credit_card_profile;
  const profileReady = Boolean(profile?.status_profile);

  return (
    <MenuDetailPage
      accent="#123DB8"
      actionLabel={profileReady ? 'Kemaskini data profil' : 'Lengkapkan profil'}
      icon="person-outline"
      onActionPress={() => router.push({ pathname: '/register', params: { mode: 'profile' } })}
      subtitle="Semak maklumat akaun dan data pengajuan yang digunakan untuk permohonan kad kredit."
      title="Maklumat akaun"
    >
      <ListCard>
        <InfoCard icon="person-outline" title="Nama pengguna" value={user?.name ?? '-'} />
        <InfoCard icon="mail-outline" title="Emel" value={user?.email ?? '-'} tone="soft" />
        <InfoCard icon="call-outline" title="Nombor telefon" value={user?.phone ?? '-'} />
      </ListCard>

      <ListCard>
        <ListRow icon="shield-checkmark-outline" label="Status profil" value={profileReady ? 'Lengkap' : 'Belum dilengkapkan'} />
        <ListRow icon="card-outline" label="Status permohonan" value={statusLabel(profile?.application_status ?? 'draft')} />
        <ListRow icon="briefcase-outline" label="Pekerjaan" value={profile?.occupation ?? 'Belum diisi'} />
        <ListRow icon="location-outline" label="Alamat" value={profile?.address ?? 'Belum diisi'} />
      </ListCard>
    </MenuDetailPage>
  );
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    approved: 'Diluluskan',
    draft: 'Belum diajukan',
    otp_pending: 'Menunggu OTP',
    pending: 'Menunggu semakan admin',
    rejected: 'Ditolak',
  };

  return labels[status] ?? status;
}
