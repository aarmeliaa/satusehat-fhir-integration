import { PractitionerModule } from '@/components/modules/Practitioner';

export const metadata = {
  title: 'Praktisi | SATUSEHAT Dashboard',
  description: 'Cari data tenaga kesehatan berdasarkan NIK atau nama.',
};

export default function PractitionerPage() {
  return <PractitionerModule />;
}
