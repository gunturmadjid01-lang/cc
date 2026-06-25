import { MenuDetailPage, InfoCard, ListCard, ListRow } from '@/components/menu/MenuDetailPage';

export default function ScoreScreen() {
  return (
    <MenuDetailPage
      accent="#123DB8"
      icon="analytics-outline"
      subtitle="Pantau ringkasan skor kredit dan faktor yang biasanya mempengaruhi kelulusan."
      title="Laporan skor kredit"
    >
      <ListCard>
        <InfoCard icon="speedometer-outline" title="Skor semasa" value="Belum tersedia" />
        <InfoCard icon="shield-outline" title="Status profil" value="Sila lengkapkan profil dahulu" tone="soft" />
      </ListCard>
      <ListCard>
        <ListRow icon="trending-up-outline" label="Faktor positif" value="Bayaran tepat masa" />
        <ListRow icon="warning-outline" label="Faktor perlu diberi perhatian" value="Penggunaan tinggi" />
      </ListCard>
    </MenuDetailPage>
  );
}
