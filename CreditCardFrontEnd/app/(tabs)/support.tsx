import { Linking } from 'react-native';

import { ListCard, ListRow, MenuDetailPage } from '@/components/menu/MenuDetailPage';

export default function SupportScreen() {
  return (
    <MenuDetailPage
      accent="#0A3B97"
      actionLabel="Hubungi pusat bantuan"
      icon="call-outline"
      onActionPress={() => Linking.openURL('tel:+60300000000').catch(() => undefined)}
      subtitle="Dapatkan bantuan untuk kad, pembayaran, PIN transaksi, dan status permohonan."
      title="Hubungi kami"
    >
      <ListCard>
        <ListRow icon="call-outline" label="Talian khidmat pelanggan" value="+60 3 0000 0000" />
        <ListRow icon="mail-outline" label="Emel sokongan" value="support@nexabank.test" />
        <ListRow icon="time-outline" label="Waktu operasi" value="Isnin-Jumaat, 9.00 pagi-6.00 petang" />
      </ListCard>
    </MenuDetailPage>
  );
}
