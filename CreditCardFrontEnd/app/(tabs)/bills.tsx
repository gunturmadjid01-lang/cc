import { router } from 'expo-router';

import { InfoCard, ListCard, ListRow, MenuDetailPage } from '@/components/menu/MenuDetailPage';

export default function BillsScreen() {
  return (
    <MenuDetailPage
      accent="#5B42D6"
      actionLabel="Bayar sekarang"
      icon="receipt-outline"
      onActionPress={() => router.push('/bayar')}
      subtitle="Lihat ringkasan tagihan, pembayaran terkini, dan sejarah transaksi dalam satu tempat."
      title="Bil dan penyata"
    >
      <ListCard>
        <InfoCard icon="cash-outline" title="Jumlah perlu dibayar" value="RM 0.00" />
        <InfoCard icon="calendar-outline" title="Tarikh akhir" value="Tiada bil aktif" tone="soft" />
      </ListCard>
      <ListCard>
        <ListRow icon="document-text-outline" label="Penyata bulanan" value="Boleh dimuat turun" />
        <ListRow icon="wallet-outline" label="Pembayaran terkini" value="Tiada transaksi" />
      </ListCard>
    </MenuDetailPage>
  );
}
