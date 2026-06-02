'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, MapPin, X, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { FHIRLocation } from '@/types';
import { locationAPI } from '@/lib/api';
import { useFetch, useToast } from '@/hooks';
import { TableSkeleton } from '@/components/common/Loader';

// ─── Location Slide-over Form ──────────────────────────────────────────────────

interface LocationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<FHIRLocation>) => Promise<void>;
  isLoading: boolean;
}

const LocationForm: React.FC<LocationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'active',
    physicalType: '',
    identifierValue: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Partial<FHIRLocation> = {
      resourceType: 'Location',
      name: formData.name,
      status: formData.status as any,
      ...(formData.physicalType && {
        physicalType: { text: formData.physicalType },
      }),
      ...(formData.identifierValue && {
        identifier: [
          {
            system: 'https://fhir.kemkes.go.id/id/location-id',
            value: formData.identifierValue,
          },
        ],
      }),
    };

    await onSubmit(payload);
    setFormData({ name: '', status: 'active', physicalType: '', identifierValue: '' });
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
          {/* Panel Header */}
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

          {/* Panel Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tipe Fisik
              </label>
              <select
                id="select-location-physical-type"
                name="physicalType"
                value={formData.physicalType}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
              >
                <option value="">-- Pilih Tipe Fisik --</option>
                <option value="bu">Bangunan (bu)</option>
                <option value="wi">Sayap / Wing (wi)</option>
                <option value="wa">Bangsal / Ward (wa)</option>
                <option value="lvl">Level / Lantai (lvl)</option>
                <option value="ro">Ruangan (ro)</option>
                <option value="bd">Tempat Tidur (bd)</option>
                <option value="ve">Kendaraan (ve)</option>
                <option value="ho">Rumah (ho)</option>
                <option value="ca">Kabinet (ca)</option>
                <option value="rd">Jalan (rd)</option>
                <option value="area">Area</option>
                <option value="jdn">Taman (jdn)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ID Lokasi (Identifier)
              </label>
              <input
                id="input-location-identifier"
                type="text"
                name="identifierValue"
                value={formData.identifierValue}
                onChange={handleChange}
                placeholder="Kode unik lokasi (opsional)"
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Identifier internal untuk sistem Anda.
              </p>
            </div>
          </form>

          {/* Panel Footer */}
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
              form=""
              disabled={isLoading || !formData.name}
              onClick={(e) => {
                // Trigger form submit via the form element
                const form = document.querySelector<HTMLFormElement>('#location-form');
                if (form) form.requestSubmit();
              }}
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

export const LocationModule: React.FC = () => {
  const [locations, setLocations] = useState<FHIRLocation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const { isLoading: fetchLoading, error: fetchError, execute: executeFetch } = useFetch();
  const { isLoading: formLoading, execute: executeForm } = useFetch();
  const { toasts, addToast, removeToast } = useToast();

  const loadLocations = useCallback(async () => {
    await executeFetch(async () => {
      const result = await locationAPI.getAll();
      const list =
        result.entry
          ?.filter((e) => e.resource?.resourceType === 'Location')
          .map((e) => e.resource as FHIRLocation) ?? [];
      setLocations(list);
      setHasLoaded(true);
    });
  }, [executeFetch]);

  useEffect(() => {
    loadLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (data: Partial<FHIRLocation>) => {
    await executeForm(async () => {
      const newLoc = await locationAPI.create(data);
      setLocations((prev) => [...prev, newLoc]);
      setShowForm(false);
      addToast('Lokasi berhasil ditambahkan', 'success');
    });
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
        <div className="flex gap-2">
          <button
            id="btn-refresh-location"
            onClick={loadLocations}
            disabled={fetchLoading}
            title="Muat ulang"
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={16} className={fetchLoading ? 'animate-spin' : ''} />
          </button>
          <button
            id="btn-tambah-lokasi"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            Tambah Lokasi
          </button>
        </div>
      </div>

      {/* Stats */}
      {hasLoaded && (
        <div className="grid grid-cols-3 gap-4">
          {(['active', 'inactive', 'suspended'] as const).map((s) => {
            const count = locations.filter((l) => l.status === s).length;
            const cfg = STATUS_CONFIG[s];
            return (
              <div
                key={s}
                className="bg-white rounded-lg border border-gray-200 px-4 py-4 flex items-center gap-3 shadow-sm"
              >
                <div className={`p-2 rounded-lg ${cfg.cls}`}>{cfg.icon}</div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500">{cfg.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Error Display */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <p className="font-semibold">Terjadi Kesalahan:</p>
          <p className="mt-0.5">{fetchError}</p>
        </div>
      )}

      {/* Loading Skeleton */}
      {fetchLoading && <TableSkeleton rows={4} />}

      {/* Data Table */}
      {!fetchLoading && hasLoaded && locations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <MapPin size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">
              {locations.length} Lokasi Terdaftar
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama Lokasi</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipe Fisik</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">FHIR ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {locations.map((loc) => {
                  const statusCfg = getStatusConfig(loc.status);
                  return (
                    <tr key={loc.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{loc.name || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.cls}`}
                        >
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {loc.physicalType?.text ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">{loc.id}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!fetchLoading && hasLoaded && locations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="mx-auto w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MapPin size={24} className="text-gray-400" />
          </div>
          <p className="font-medium text-gray-700">Belum ada data lokasi</p>
          <p className="text-sm text-gray-500 mt-1">
            Tambahkan lokasi baru menggunakan tombol di kanan atas.
          </p>
        </div>
      )}

      {/* Slide-over Location Form */}
      <LocationForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
        isLoading={formLoading}
      />

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[60] space-y-2">
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
