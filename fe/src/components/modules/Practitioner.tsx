'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Stethoscope, X, RefreshCw } from 'lucide-react';
import { FHIRPractitioner } from '@/types';
import { practitionerAPI } from '@/lib/api';
import { useFetch, useToast } from '@/hooks';
import { TableSkeleton } from '@/components/common/Loader';

// ─── Practitioner Form Modal ───────────────────────────────────────────────────

interface PractitionerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<FHIRPractitioner>) => Promise<void>;
  isLoading: boolean;
}

const PractitionerForm: React.FC<PractitionerFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    givenName: '',
    familyName: '',
    nik: '',
    nip: '',
    qualification: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Partial<FHIRPractitioner> = {
      resourceType: 'Practitioner',
      name: [
        {
          use: 'official',
          given: [formData.givenName],
          family: formData.familyName,
        },
      ],
      identifier: [
        ...(formData.nik
          ? [{ system: 'https://fhir.kemkes.go.id/id/nik', value: formData.nik }]
          : []),
        ...(formData.nip
          ? [{ system: 'https://fhir.kemkes.go.id/id/nip', value: formData.nip }]
          : []),
      ],
      qualification: formData.qualification
        ? [{ code: { text: formData.qualification } }]
        : [],
    };

    await onSubmit(payload);

    setFormData({ givenName: '', familyName: '', nik: '', nip: '', qualification: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Tambah Praktisi Baru</h2>
          <button
            id="btn-close-practitioner-modal"
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Depan <span className="text-red-500">*</span>
              </label>
              <input
                id="input-pract-given-name"
                type="text"
                name="givenName"
                value={formData.givenName}
                onChange={handleChange}
                placeholder="Budi"
                required
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Keluarga
              </label>
              <input
                id="input-pract-family-name"
                type="text"
                name="familyName"
                value={formData.familyName}
                onChange={handleChange}
                placeholder="Santoso"
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIK (16 digit)</label>
            <input
              id="input-pract-nik"
              type="text"
              name="nik"
              value={formData.nik}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                setFormData((p) => ({ ...p, nik: v }));
              }}
              placeholder="1234567890123456"
              maxLength={16}
              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
            <input
              id="input-pract-nip"
              type="text"
              name="nip"
              value={formData.nip}
              onChange={handleChange}
              placeholder="NIP Pegawai Negeri (opsional)"
              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kualifikasi / Spesialisasi</label>
            <input
              id="input-pract-qualification"
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              placeholder="cth: Dokter Umum, Dokter Spesialis Jantung"
              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.givenName}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Practitioner Module ──────────────────────────────────────────────────

export const PractitionerModule: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [practitioners, setPractitioners] = useState<FHIRPractitioner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const { isLoading: fetchLoading, error: fetchError, execute: executeFetch } = useFetch();
  const { isLoading: formLoading, execute: executeForm } = useFetch();
  const { toasts, addToast, removeToast } = useToast();

  const loadPractitioners = useCallback(
    async (query?: string) => {
      await executeFetch(async () => {
        const result = query
          ? await practitionerAPI.search(query)
          : await practitionerAPI.getAll();

        const list =
          result.entry
            ?.filter((e) => e.resource?.resourceType === 'Practitioner')
            .map((e) => e.resource as FHIRPractitioner) ?? [];

        setPractitioners(list);
        setHasLoaded(true);
        if (query && list.length === 0) {
          addToast('Praktisi tidak ditemukan', 'info');
        }
      });
    },
    [executeFetch, addToast]
  );

  // Load all on mount
  useEffect(() => {
    loadPractitioners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => loadPractitioners(searchQuery.trim() || undefined);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleCreate = async (data: Partial<FHIRPractitioner>) => {
    await executeForm(async () => {
      const newPract = await practitionerAPI.create(data);
      setPractitioners((prev) => [...prev, newPract]);
      setShowForm(false);
      addToast('Praktisi berhasil ditambahkan', 'success');
    });
  };

  const formatName = (names?: Array<{ family?: string; given?: string[] }>) => {
    if (!names || names.length === 0) return 'N/A';
    const n = names[0];
    return `${(n.given || []).join(' ')} ${n.family || ''}`.trim();
  };

  const getIdentifier = (
    identifiers?: Array<{ system?: string; value?: string }>,
    systemKey?: string
  ) => {
    if (!identifiers) return '—';
    const match = identifiers.find((id) => (systemKey ? id.system?.includes(systemKey) : true));
    return match?.value || '—';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Praktisi</h2>
        <button
          id="btn-tambah-praktisi"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Tambah Praktisi
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-sm">
        <div className="flex gap-2">
          <input
            id="input-search-practitioner"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cari berdasarkan nama praktisi..."
            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          <button
            id="btn-cari-praktisi"
            onClick={handleSearch}
            disabled={fetchLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Search size={18} />
            Cari
          </button>
          <button
            id="btn-refresh-praktisi"
            onClick={() => { setSearchQuery(''); loadPractitioners(); }}
            disabled={fetchLoading}
            title="Muat ulang semua data"
            className="flex items-center gap-2 px-3 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={16} className={fetchLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <p className="font-semibold">Terjadi Kesalahan:</p>
          <p className="mt-0.5">{fetchError}</p>
        </div>
      )}

      {/* Loading Skeleton */}
      {fetchLoading && <TableSkeleton rows={4} />}

      {/* Results Table */}
      {!fetchLoading && hasLoaded && practitioners.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <Stethoscope size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">
              {practitioners.length} Praktisi
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama Lengkap</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">NIK</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">NIP</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Kualifikasi</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">FHIR ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {practitioners.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatName(p.name)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {getIdentifier(p.identifier, 'nik')}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {getIdentifier(p.identifier, 'nip')}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {p.qualification?.[0]?.code?.text ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{p.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!fetchLoading && hasLoaded && practitioners.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="mx-auto w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Stethoscope size={24} className="text-gray-400" />
          </div>
          <p className="font-medium text-gray-700">Belum ada data praktisi</p>
          <p className="text-sm text-gray-500 mt-1">
            Tambahkan praktisi baru menggunakan tombol di atas.
          </p>
        </div>
      )}

      {/* Practitioner Form Modal */}
      <PractitionerForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
        isLoading={formLoading}
      />

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
