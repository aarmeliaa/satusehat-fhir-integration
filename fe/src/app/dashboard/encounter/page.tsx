import { EncounterModule } from '@/components/modules/Encounter';

export const metadata = {
  title: 'Kunjungan Medis | SATUSEHAT Dashboard',
  description: 'Buat dan daftarkan kunjungan medis (Encounter) ke SATUSEHAT.',
};

export default function EncounterPage() {
  return <EncounterModule />;
}
