'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardPlus, Send, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { FHIREncounter, FHIRPatient, FHIRPractitioner, FHIRLocation } from '@/types';
import { encounterAPI, patientAPI, practitionerAPI, locationAPI } from '@/lib/api';
import { useFetch, useToast } from '@/hooks';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface EncounterFormState {
  patientId: string;
  patientNIK: string;
  practitionerId: string;
  locationId: string;
  status: string;
  serviceType: string;
  reasonText: string;
}

const INITIAL_FORM: EncounterFormState = {
  patientId: '',
  patientNIK: '',
  practitionerId: '',
  locationId: '',
  status: 'in-progress',
  serviceType: '',
  reasonText: '',
};

// ─── Helper ────────────────────────────────────────────────────────────────────

const formatName = (names?: Array<{ family?: string; given?: string[] }>) => {
  if (!names || names.length === 0) return 'Tanpa Nama';
  const n = names[0];
  return `${(n.given || []).join(' ')} ${n.family || ''}`.trim();
};

// ─── Encounter Module ──────────────────────────────────────────────────────────

export const EncounterModule: React.FC = () => {
  const [form, setForm] = useState<EncounterFormState>(INITIAL_FORM);
  const [nikInput, setNikInput] = useState('');
  const [foundPatient, setFoundPatient] = useState<FHIRPatient | null>(null);
  const [practitioners, setPractitioners] = useState<FHIRPractitioner[]>([]);
  const [locations, setLocations] = useState<FHIRLocation[]>([]);
  const [submittedEncounter, setSubmittedEncounter] = useState<FHIREncounter | null>(null);

  const { isLoading: searchLoading, execute: executeSearch } = useFetch();
  const { isLoading: loadLoading, execute: executeLoad } = useFetch();
  const { isLoading: submitLoading, error: submitError, execute: executeSubmit } = useFetch();
  const { toasts, addToast, removeToast } = useToast();

  // Load practitioners & locations on mount
  const loadDropdownData = useCallback(async () => {
    await executeLoad(async () => {
      const [practBundle, locBundle] = await Promise.all([
        practitionerAPI.getAll(),
        locationAPI.getAll(),
      ]);

      const practList =
        practBundle.entry
          ?.filter((e) => e.resource?.resourceType === 'Practitioner')
          .map((e) => e.resource as FHIRPractitioner) ?? [];

      const locList =
        locBundle.entry
          ?.filter((e) => e.resource?.resourceType === 'Location')
          .map((e) => e.resource as FHIRLocation) ?? [];

      setPractitioners(practList);
      setLocations(locList);
    });
  }, [executeLoad]);

  useEffect(() => {
    loadDropdownData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search patient by NIK
  const handleSearchPatient = async () => {
    if (!/^\d{16}$/.test(nikInput)) {
      addToast('NIK harus tepat 16 digit angka', 'error');
      return;
    }

    setFoundPatient(null);
    setForm((p) => ({ ...p, patientId: '', patientNIK: '' }));

    await executeSearch(async () => {
      const result = await patientAPI.searchByNIK(nikInput);
      const patient = result.entry?.find(
        (e) => e.resource?.resourceType === 'Patient'
      )?.resource as FHIRPatient | undefined;

      if (patient) {
        setFoundPatient(patient);
        setForm((p) => ({ ...p, patientId: patient.id, patientNIK: nikInput }));
        addToast(`Pasien ditemukan: ${formatName(patient.name)}`, 'success');
      } else {
        addToast('Pasien dengan NIK tersebut tidak ditemukan', 'error');
      }
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.patientId) {
      addToast('Pilih pasien terlebih dahulu', 'error');
      return;
    }
    if (!form.practitionerId) {
      addToast('Pilih praktisi terlebih dahulu', 'error');
      return;
    }
    if (!form.locationId) {
      addToast('Pilih lokasi terlebih dahulu', 'error');
      return;
    }

    await executeSubmit(async () => {
      const payload: Partial<FHIREncounter> = {
        resourceType: 'Encounter',
        status: form.status as any,
        subject: { reference: `Patient/${form.patientId}` },
        participant: [
          {
            individual: { reference: `Practitioner/${form.practitionerId}` },
          },
        ],
        location: [
          {
            location: { reference: `Location/${form.locationId}` },
          },
        ],
      };

      const result = await encounterAPI.create(payload);
      setSubmittedEncounter(result);
      addToast('Kunjungan medis berhasil dibuat', 'success');
      // Reset form
      setForm(INITIAL_FORM);
      setNikInput('');
      setFoundPatient(null);
    });
  };

  const isFormValid = form.patientId && form.practitionerId && form.locationId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Kunjungan Medis</h2>
        <button
          id="btn-refresh-encounter"
          onClick={loadDropdownData}
          disabled={loadLoading}
          title="Muat ulang data praktisi & lokasi"
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm"
        >
          <RefreshCw size={15} className={loadLoading ? 'animate-spin' : ''} />
          Muat Ulang
        </button>
      </div>

      {/* Success Banner */}
      {submittedEncounter && (
        <div className="flex items-start gap-4 bg-green-50 border border-green-200 rounded-lg px-5 py-4">
          <CheckCircle2 size={22} className="text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-green-800">Kunjungan Medis Berhasil Dibuat</p>
            <p className="text-sm text-green-700 mt-0.5">
              FHIR Encounter ID:{' '}
              <span className="font-mono bg-green-100 px-1.5 py-0.5 rounded text-xs">
                {submittedEncounter.id}
              </span>
            </p>
            <p className="text-sm text-green-700 mt-0.5">
              Status:{' '}
              <span className="font-medium capitalize">{submittedEncounter.status}</span>
            </p>
          </div>
          <button
            onClick={() => setSubmittedEncounter(null)}
            className="text-green-500 hover:text-green-700 text-lg font-bold leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Transactional Form */}
      <form
        id="encounter-form"
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
          <ClipboardPlus size={18} className="text-blue-600" />
          <h3 className="font-semibold text-gray-900">Form Kunjungan Baru</h3>
        </div>

        <div className="p-6 space-y-6">
          {/* ── STEP 1: Cari Pasien ──────────────────────────────────── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                1
              </span>
              <h4 className="font-semibold text-gray-800">Cari Pasien berdasarkan NIK</h4>
            </div>

            <div className="flex gap-2">
              <input
                id="input-encounter-nik"
                type="text"
                value={nikInput}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                  setNikInput(v);
                }}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchPatient())}
                placeholder="Masukkan NIK pasien (16 digit)"
                maxLength={16}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm font-mono"
              />
              <button
                type="button"
                id="btn-search-encounter-patient"
                onClick={handleSearchPatient}
                disabled={searchLoading || nikInput.length !== 16}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {searchLoading ? 'Mencari...' : 'Cari'}
              </button>
            </div>

            {/* Found Patient Card */}
            {foundPatient && (
              <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 font-bold text-sm">
                    {formatName(foundPatient.name).charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{formatName(foundPatient.name)}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    NIK: <span className="font-mono">{nikInput}</span> &bull;{' '}
                    {foundPatient.gender === 'male'
                      ? 'Laki-laki'
                      : foundPatient.gender === 'female'
                      ? 'Perempuan'
                      : foundPatient.gender ?? '—'}{' '}
                    &bull; Lahir: {foundPatient.birthDate ?? '—'}
                  </p>
                </div>
                <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
              </div>
            )}
          </section>

          <hr className="border-gray-100" />

          {/* ── STEP 2: Pilih Praktisi ───────────────────────────────── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                2
              </span>
              <h4 className="font-semibold text-gray-800">Pilih Praktisi</h4>
            </div>

            <select
              id="select-encounter-practitioner"
              name="practitionerId"
              value={form.practitionerId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
            >
              <option value="">-- Pilih Praktisi --</option>
              {loadLoading && <option disabled>Memuat data...</option>}
              {practitioners.map((p) => (
                <option key={p.id} value={p.id}>
                  {formatName(p.name)}
                  {p.qualification?.[0]?.code?.text
                    ? ` — ${p.qualification[0].code.text}`
                    : ''}
                </option>
              ))}
            </select>

            {practitioners.length === 0 && !loadLoading && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle size={12} />
                Belum ada data praktisi. Tambahkan terlebih dahulu di modul Praktisi.
              </p>
            )}
          </section>

          <hr className="border-gray-100" />

          {/* ── STEP 3: Pilih Lokasi ─────────────────────────────────── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                3
              </span>
              <h4 className="font-semibold text-gray-800">Pilih Lokasi</h4>
            </div>

            <select
              id="select-encounter-location"
              name="locationId"
              value={form.locationId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
            >
              <option value="">-- Pilih Lokasi --</option>
              {loadLoading && <option disabled>Memuat data...</option>}
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name ?? l.id}
                  {l.physicalType?.text ? ` (${l.physicalType.text})` : ''}
                </option>
              ))}
            </select>

            {locations.length === 0 && !loadLoading && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle size={12} />
                Belum ada data lokasi. Tambahkan terlebih dahulu di modul Lokasi.
              </p>
            )}
          </section>

          <hr className="border-gray-100" />

          {/* ── STEP 4: Detail Tambahan ──────────────────────────────── */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                4
              </span>
              <h4 className="font-semibold text-gray-800">Detail Tambahan</h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status Kunjungan
                </label>
                <select
                  id="select-encounter-status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                >
                  <option value="planned">Direncanakan</option>
                  <option value="arrived">Tiba</option>
                  <option value="triaged">Triase</option>
                  <option value="in-progress">Sedang Berlangsung</option>
                  <option value="onleave">Izin Keluar</option>
                  <option value="finished">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Jenis Layanan
                </label>
                <select
                  id="select-encounter-service-type"
                  name="serviceType"
                  value={form.serviceType}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                >
                  <option value="">-- Pilih Jenis Layanan --</option>
                  <option value="outpatient">Rawat Jalan</option>
                  <option value="inpatient">Rawat Inap</option>
                  <option value="emergency">Gawat Darurat</option>
                  <option value="observation">Observasi</option>
                  <option value="home-health">Kunjungan Rumah</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Alasan Kunjungan <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <textarea
                id="input-encounter-reason"
                name="reasonText"
                value={form.reasonText}
                onChange={handleChange}
                placeholder="Deskripsi singkat alasan kunjungan medis..."
                rows={3}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm resize-none"
              />
            </div>
          </section>
        </div>

        {/* Form Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {!isFormValid && (
              <span className="flex items-center gap-1 text-amber-600">
                <AlertCircle size={12} />
                Lengkapi Pasien, Praktisi, dan Lokasi untuk melanjutkan.
              </span>
            )}
            {isFormValid && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 size={12} />
                Form siap untuk dikirim.
              </span>
            )}
          </div>

          <button
            type="submit"
            id="btn-submit-encounter"
            disabled={submitLoading || !isFormValid}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Send size={16} />
            {submitLoading ? 'Mengirim...' : 'Kirim Kunjungan'}
          </button>
        </div>
      </form>

      {/* Submit Error */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <p className="font-semibold">Gagal membuat kunjungan:</p>
          <p className="mt-0.5">{submitError}</p>
        </div>
      )}

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3 min-w-[300px] ${
                toast.type === 'success'
                  ? 'bg-green-600 text-white'
                  : toast.type === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              <span className="text-sm font-medium">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/80 hover:text-white text-lg font-bold leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
