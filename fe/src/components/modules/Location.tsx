'use client';

import React, { useState } from 'react';
import { Plus, MapPin, X, CheckCircle2, XCircle, Copy, CheckCheck } from 'lucide-react';
import { FHIRLocation } from '@/types';
import { locationAPI } from '@/lib/api';
import { useFetch, useToast } from '@/hooks';

// ─── Status Config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  active: {
    label: 'Aktif',
    cls: 'bg-green-100 text-green-800',
    icon: <CheckCircle2 size={12} className="text-green-600" />,
  },
  inactive: {
    label: 'Tidak Aktif',
    cls: 'bg-gray-100 text-gray-700',
    icon: <XCircle size={12} className="text-gray-500" />,
  },
  suspended: {
    label: 'Ditangguhkan',
    cls: 'bg-yellow-100 text-yellow-800',
    icon: <XCircle size={12} className="text-yellow-600" />,
  },
};

// ─── Location Form (Slide-over) ────────────────────────────────────────────────

interface LocationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<FHIRLocation>) => Promise<void>;
  isLoading: boolean;
  orgId: string;
  setOrgId: (v: string) => void;
}

const LocationForm: React.FC<LocationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  orgId,
  setOrgId,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'active',
    physicalTypeCode: 'ro',
    physicalTypeDisplay: 'Room',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhysicalTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    const displayMap: Record<string, string> = {
      bu: 'Building', wi: 'Wing', wa: 'Ward', lvl: 'Level', ro: 'Room',
      bd: 'Bed', ve: 'Vehicle', ho: 'House', ca: 'Cabinet', rd: 'Road',
      area: 'Area', jdn: 'Garden',
    };
    setFormData((prev) => ({
      ...prev,
      physicalTypeCode: selected,
      physicalTypeDisplay: displayMap[selected] ?? selected,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Partial<FHIRLocation> = {
      resourceType: 'Location',
      status: formData.status as any,
      name: formData.name,
      description: formData.description || undefined,
      mode: 'instance',
      physicalType: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/location-physical-type',
            code: formData.physicalTypeCode,
            display: formData.physicalTypeDisplay,
          },
        ],
      },
      managingOrganization: { reference: `Organization/${orgId}` },
    };

    await onSubmit(payload);
    setFormData({ name: '', status: 'active', physicalTypeCode: 'ro', physicalTypeDisplay: 'Room', description: '' });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin size={18} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Tambah Lokasi Baru</h2>
            </div>
            <button
              id="btn-close-location-panel"
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <form id="location-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Org ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Organization ID (UUID) <span className="text-red-500">*</span>
              </label>
              <input
                id="input-location-org-id"
                type="text"
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                placeholder="UUID organisasi dari SSP portal"
                required
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Diisi otomatis jika pernah diisi sebelumnya.
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Lokasi <span className="text-red-500">*</span>
              </label>
              <input
                id="input-location-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="cth: Poli Umum, Ruang Rawat Inap A"
                required
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Deskripsi <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <textarea
                id="input-location-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Deskripsi singkat ruangan..."
                rows={2}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm resize-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="select-location-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
              >
                <option value="active">Aktif</option>
                <option value="suspended">Ditangguhkan</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>

            {/* Physical Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe Fisik</label>
              <select
                id="select-location-physical-type"
                value={formData.physicalTypeCode}
                onChange={handlePhysicalTypeChange}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
              >
                <option value="bu">Bangunan (bu)</option>
                <option value="wi">Sayap / Wing (wi)</option>
                <option value="wa">Bangsal / Ward (wa)</option>
                <option value="lvl">Level / Lantai (lvl)</option>
                <option value="ro">Ruangan (ro)</option>
                <option value="bd">Tempat Tidur (bd)</option>
                <option value="ve">Kendaraan (ve)</option>
                <option value="ho">Rumah (ho)</option>
                <option value="area">Area</option>
              </select>
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-white disabled:opacity-50 transition-colors text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              form="location-form"
              disabled={isLoading || !formData.name || !orgId}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Lokasi'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Main Location Module ──────────────────────────────────────────────────────

export const LocationModule: React.FC = () => {
  const [locations, setLocations] = useState<FHIRLocation[]>([]);
  const [showForm, setShowForm] = useState(false);
  // Persist org ID across form opens so user doesn't retype it each time
  const [orgId, setOrgId] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { isLoading: formLoading, error: formError, execute: executeForm } = useFetch();
  const { toasts, addToast, removeToast } = useToast();

  const handleCreate = async (data: Partial<FHIRLocation>) => {
    await executeForm(async () => {
      const newLoc = await locationAPI.create(data);
      setLocations((prev) => [...prev, newLoc]);
      setShowForm(false);
      addToast(`Lokasi "${newLoc.name}" berhasil dibuat! ID: ${newLoc.id}`, 'success', 6000);
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusConfig = (status?: string) =>
    STATUS_CONFIG[status ?? ''] ?? {
      label: status ?? '—',
      cls: 'bg-gray-100 text-gray-700',
      icon: null,
    };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Lokasi</h2>
        <button
          id="btn-tambah-lokasi"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Tambah Lokasi
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
        <p className="font-semibold mb-1">Cara Kerja Modul Lokasi</p>
        <p className="text-blue-700 text-xs leading-relaxed">
          Klik <strong>Tambah Lokasi</strong> untuk mendaftarkan ruangan (misalnya Poli Umum) ke SATUSEHAT.
          Setelah berhasil (201 Created), catat <strong>FHIR ID / Location UUID</strong> yang muncul
          di tabel di bawah — ID ini dibutuhkan saat membuat Encounter.
        </p>
      </div>

      {/* Error Display */}
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <p className="font-semibold">Gagal Membuat Lokasi:</p>
          <p className="mt-0.5">{formError}</p>
        </div>
      )}

      {/* Data Table */}
      {locations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <MapPin size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">
              {locations.length} Lokasi Berhasil Didaftarkan
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama Lokasi</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipe Fisik</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    FHIR ID (Location UUID)
                    <span className="ml-1 text-xs font-normal text-gray-400">— salin untuk Encounter</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {locations.map((loc) => {
                  const statusCfg = getStatusConfig(loc.status);
                  return (
                    <tr key={loc.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{loc.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.cls}`}
                        >
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {(loc.physicalType as any)?.coding?.[0]?.display ??
                          (loc.physicalType as any)?.text ??
                          '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono">
                            {loc.id}
                          </code>
                          <button
                            onClick={() => copyToClipboard(loc.id!)}
                            title="Salin Location ID"
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            {copiedId === loc.id ? (
                              <CheckCheck size={14} className="text-green-500" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State (no locations created yet) */}
      {locations.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
          <div className="mx-auto w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MapPin size={24} className="text-gray-400" />
          </div>
          <p className="font-medium text-gray-700">Belum ada lokasi yang didaftarkan</p>
          <p className="text-sm text-gray-500 mt-1">
            Klik tombol <strong>Tambah Lokasi</strong> untuk mendaftarkan ruangan ke SATUSEHAT.
          </p>
        </div>
      )}

      {/* Slide-over Form */}
      <LocationForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
        isLoading={formLoading}
        orgId={orgId}
        setOrgId={setOrgId}
      />

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[60] space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3 min-w-[320px] ${
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
                className="text-white/80 hover:text-white text-lg font-bold leading-none flex-shrink-0"
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
