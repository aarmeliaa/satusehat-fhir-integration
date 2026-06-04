import { PatientModule } from '@/components/modules/Patient';

export const metadata = {
  title: 'Pasien | SATUSEHAT Dashboard',
  description: 'Cari data pasien berdasarkan NIK melalui SATUSEHAT FHIR API.',
};

export default function PatientPage() {
  return <PatientModule />;
}
