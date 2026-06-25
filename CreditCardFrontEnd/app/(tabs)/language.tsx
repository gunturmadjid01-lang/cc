import { ListCard, ListRow, MenuDetailPage } from '@/components/menu/MenuDetailPage';

export default function LanguageScreen() {
  return (
    <MenuDetailPage
      accent="#123DB8"
      icon="language-outline"
      subtitle="Tetapkan bahasa paparan aplikasi mengikut keperluan anda."
      title="Bahasa"
    >
      <ListCard>
        <ListRow icon="checkmark-circle-outline" label="Bahasa Melayu" value="Aktif" />
        <ListRow icon="ellipse-outline" label="Bahasa Indonesia" value="Tersedia" />
        <ListRow icon="ellipse-outline" label="English" value="Tersedia" />
      </ListCard>
    </MenuDetailPage>
  );
}
