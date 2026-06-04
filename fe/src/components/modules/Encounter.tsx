'use client';

import React, { useState } from 'react';
import { ClipboardPlus, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { FHIREncounter } from '@/types';
import { encounterAPI, patientAPI } from '@/lib/api';
import { useFetch, useToast } from '@/hooks';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface EncounterFormState {
  // Patient
  patientNIK: string;
  patientIHS: string;
  patientName: string;
  // Practitioner
  practitionerIHS: string;
  // Location
  locationId: string;
  // Encounter details
  orgId: string;
  status: string;
}

const INITIAL_FORM: EncounterFormState = {
  patientNIK: '',
  patientIHS: '',
  patientName: '',
  practitionerIHS: '',
  locationId: '',
  orgId: '',
  status: 'arrived',
};

// ─── Encounter Module ──────────────────────────────────────────────────────────

export const EncounterModule: React.FC = () => {
  const [form, setForm] = useState<EncounterFormState>(INITIAL_FORM);
  const [nikInput, setNikInput] = useState('');
  const [patientVerified, setPatientVerified] = useState(false);
  const [submittedEncounter, setSubmittedEncounter] = useState<FHIREncounter | null>(null);

  const { isLoading: searchLoading, execute: executeSearch } = useFetch();
  const { isLoading: submitLoading, error: submitError, execute: executeSubmit } = useFetch();
  const { toasts, addToast, removeToast } = useToast();

  // ── Patient lookup ──────────────────────────────────────────────────────────

  const handleSearchPatient = async () => {
    if (!/^\d{16}$/.test(nikInput)) {
      addToast('NIK harus tepat 16 digit angka', 'error');
      return;
    }

    setPatientVerified(false);
    setForm((p) => ({ ...p, patientIHS: '', patientName: '', patientNIK: '' }));

    await executeSearch(async () => {
      const bundle = await patientAPI.searchByNIK(nikInput);
      const entry = (bundle.entry ?? []).find(
        (e) => e.resource?.resourceType === 'Patient'
      );
      const patient = entry?.resource as any;

      if (patient?.id) {
        const name = formatName(patient.name);
        setPatientVerified(true);
        setForm((p) => ({
          ...p,
          patientIHS: patient.id,
          patientName: name,
          patientNIK: nikInput,
        }));
        addToast(`Pasien ditemukan: ${name}`, 'success');
      } else {
        addToast('Pasien tidak ditemukan di SATUSEHAT', 'error');
      }
    });
  };

  // ── Encounter submit ────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.patientIHS) {
      addToast('Verifikasi pasien terlebih dahulu', 'error');
      return;
    }
    if (!form.practitionerIHS.trim()) {
      addToast('Masukkan IHS Number praktisi', 'error');
      return;
    }
    if (!form.locationId.trim()) {
      addToast('Masukkan Location ID', 'error');
      return;
    }
    if (!form.orgId.trim()) {
      addToast('Masukkan Organization ID', 'error');
      return;
    }

    await executeSubmit(async () => {
      const now = new Date().toISOString();

      const payload: Partial<FHIREncounter> = {
        resourceType: 'Encounter',
        identifier: [
          {
            system: `http://sys-ids.kemkes.go.id/encounter/${form.orgId.trim()}`,
            value: `enc-${Date.now()}`,
          },
        ],
        status: form.status as any,
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'AMB',
          display: 'ambulatory',
        },
        subject: {
          reference: `Patient/${form.patientIHS}`,
          display: form.patientName,
        },
        participant: [
          {
            type: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'ATND',
                    display: 'attender',
                  },
                ],
              },
            ],
            individual: { reference: `Practitioner/${form.practitionerIHS.trim()}` },
          },
        ],
        period: { start: now },
        location: [{ location: { reference: `Location/${form.locationId.trim()}` } }],
        statusHistory: [{ status: form.status as any, period: { start: now } }],
        serviceProvider: { reference: `Organization/${form.orgId.trim()}` },
      };

      const result = await encounterAPI.create(payload);
      setSubmittedEncounter(result);
      addToast('Kunjungan medis berhasil dibuat! 🎉', 'success', 6000);
      setForm(INITIAL_FORM);
      setNikInput('');
      setPatientVerified(false);
    });
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const formatName = (names?: Array<{ family?: string; given?: string[] }>) => {
    if (!names || names.length === 0) return 'Tanpa Nama';
    const n = names[0];
    return `${(n.given ?? []).join(' ')} ${n.family ?? ''}`.trim();
  };

  const isFormValid =
    patientVerified && form.practitionerIHS.trim() && form.locationId.trim() && form.orgId.trim();

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Kunjungan Medis</h2>
      </div>

      {/* Success Banner */}
      {submittedEncounter && (
        <div className="flex items-start gap-4 bg-green-50 border border-green-200 rounded-lg px-5 py-4">
          <CheckCircle2 size={22} className="text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-green-800">Kunjungan Medis Berhasil Dibuat! 🎉</p>
            <p className="text-sm text-green-700 mt-1">
              Encounter ID:{' '}
              <code className="font-mono bg-green-100 px-1.5 py-0.5 rounded text-xs">
                {submittedEncounter.id}
              </code>
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

      {/* Form */}
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
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                1
              </span>
              <h4 className="font-semibold text-gray-800">Cari & Verifikasi Pasien</h4>
            </div>

            <div className="flex gap-2">
              <input
                id="input-encounter-nik"
                type="text"
                value={nikInput}
                onChange={(e) => {
                  setNikInput(e.target.value.replace(/\D/g, '').slice(0, 16));
                  setPatientVerified(false);
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
                {searchLoading ? 'Mencari...' : 'Verifikasi'}
              </button>
            </div>

            {/* Verified patient card */}
            {patientVerified && form.patientIHS && (
              <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 font-bold text-sm">
                    {form.patientName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{form.patientName}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    NIK: <span className="font-mono">{form.patientNIK}</span>
                    {' · '}
                    IHS:{' '}
                    <code className="font-mono bg-blue-100 px-1 py-0.5 rounded text-xs">
                      {form.patientIHS}
                    </code>
                  </p>
                </div>
                <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
              </div>
            )}
          </section>

          <hr className="border-gray-100" />

          {/* ── STEP 2: Practitioner IHS ─────────────────────────────── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                2
              </span>
              <h4 className="font-semibold text-gray-800">IHS Number Praktisi</h4>
            </div>

            <input
              id="input-encounter-practitioner-ihs"
              type="text"
              name="practitionerIHS"
              value={form.practitionerIHS}
              onChange={handleChange}
              placeholder="Contoh: 10009880728 (dari modul Praktisi)"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm font-mono"
            />
            <p className="text-xs text-gray-500">
              Salin IHS Number dari tabel hasil pencarian di modul Praktisi.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* ── STEP 3: Location ID ───────────────────────────────────── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                3
              </span>
              <h4 className="font-semibold text-gray-800">Location ID (UUID)</h4>
            </div>

            <input
              id="input-encounter-location-id"
              type="text"
              name="locationId"
              value={form.locationId}
              onChange={handleChange}
              placeholder="Contoh: 4079d4e0-bf66-43f7-96b4-8e814a654511 (dari modul Lokasi)"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm font-mono"
            />
            <p className="text-xs text-gray-500">
              Salin Location UUID dari tabel di modul Lokasi setelah berhasil membuat lokasi.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* ── STEP 4: Org & Status ──────────────────────────────────── */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                4
              </span>
              <h4 className="font-semibold text-gray-800">Detail Kunjungan</h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Organization ID (UUID) <span className="text-red-500">*</span>
              </label>
              <input
                id="input-encounter-org-id"
                type="text"
                name="orgId"
                value={form.orgId}
                onChange={handleChange}
                placeholder="UUID organisasi dari SSP portal SATUSEHAT"
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Harus sesuai dengan akun yang memiliki CLIENT_ID dan CLIENT_SECRET.
              </p>
            </div>

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
                <option value="planned">Direncanakan (planned)</option>
                <option value="arrived">Tiba (arrived)</option>
                <option value="triaged">Triase (triaged)</option>
                <option value="in-progress">Sedang Berlangsung (in-progress)</option>
                <option value="finished">Selesai (finished)</option>
                <option value="cancelled">Dibatalkan (cancelled)</option>
              </select>
            </div>
          </section>
        </div>

        {/* Form Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs">
            {!isFormValid ? (
              <span className="flex items-center gap-1 text-amber-600">
                <AlertCircle size={12} />
                Lengkapi semua field yang diperlukan.
              </span>
            ) : (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 size={12} />
                Form siap dikirim ke SATUSEHAT.
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
