import { LocationModule } from '@/components/modules/Location';

export const metadata = {
  title: 'Lokasi | SATUSEHAT Dashboard',
  description: 'Daftarkan ruangan atau poli ke SATUSEHAT FHIR API.',
};

export default function LocationPage() {
  return <LocationModule />;
}
