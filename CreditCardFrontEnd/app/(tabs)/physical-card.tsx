import { router } from 'expo-router';

import { InfoCard, ListCard, ListRow, MenuDetailPage } from '@/components/menu/MenuDetailPage';
import { useAuth } from '@/context/AuthContext';

export default function PhysicalCardScreen() {
  const { user } = useAuth();
  const profile = user?.credit_card_profile;
  const approved = profile?.application_status === 'approved';

  return (
    <MenuDetailPage
      accent="#123DB8"
      actionLabel={approved ? 'Sahkan alamat penghantaran' : 'Semak status permohonan'}
      icon="card-outline"
      onActionPress={() => router.push(approved ? '/profile' : '/register')}
      subtitle="Pesan kad fizikal Nexa Prime selepas permohonan diluluskan dan alamat penghantaran disahkan."
      title="Pesan kad fizikal"
    >
      <ListCard>
        <InfoCard icon="card-outline" title="Status kad" value={approved ? 'Layak dipesan' : 'Menunggu kelulusan'} />
        <InfoCard icon="location-outline" title="Alamat penghantaran" value={profile?.address ?? 'Belum disahkan'} tone="soft" />
      </ListCard>
      <ListCard>
        <ListRow icon="time-outline" label="Anggaran penghantaran" value="5-10 hari bekerja selepas disahkan" />
        <ListRow icon="shield-checkmark-outline" label="Keselamatan" value="Kad perlu diaktifkan dalam aplikasi" />
      </ListCard>
    </MenuDetailPage>
  );
}
