'use client';

import React, { useState } from 'react';
import { Search, Plus, User } from 'lucide-react';
import { FHIRPatient } from '@/types';
import { patientAPI } from '@/lib/api';
import { useFetch, useToast } from '@/hooks';
import { TableSkeleton } from '@/components/common/Loader';
import { PatientForm } from '@/components/common/PatientForm';

export const PatientModule: React.FC = () => {
  const [searchNIK, setSearchNIK] = useState('');
  const [patients, setPatients] = useState<FHIRPatient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { isLoading: fetchLoading, error: fetchError, execute: executeFetch } = useFetch();
  const { isLoading: formLoading, execute: executeForm } = useFetch();
  const { toasts, addToast, removeToast } = useToast();

  const handleSearch = async () => {
    const nikTrimmed = searchNIK.trim();
    if (!/^\d{16}$/.test(nikTrimmed)) {
      addToast('NIK harus tepat 16 digit angka', 'error');
      return;
    }

    await executeFetch(async () => {
      const result = await patientAPI.searchByNIK(nikTrimmed);
      if (result.entry && result.entry.length > 0) {
        const patientsList = result.entry
          .filter((e) => e.resource?.resourceType === 'Patient')
          .map((e) => e.resource as FHIRPatient);
        setPatients(patientsList);
        addToast(`Ditemukan ${patientsList.length} pasien`, 'success');
      } else {
        setPatients([]);
        addToast('Pasien tidak ditemukan', 'info');
      }
      setHasSearched(true);
    });
  };

  const handleCreatePatient = async (patientData: Partial<FHIRPatient>) => {
    await executeForm(async () => {
      const newPatient = await patientAPI.create(patientData);
      setPatients((prev) => [...prev, newPatient]);
      setShowForm(false);
      addToast('Pasien berhasil ditambahkan', 'success');
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const formatName = (names?: Array<{ family?: string; given?: string[] }>) => {
    if (!names || names.length === 0) return 'N/A';
    const name = names[0];
    return `${(name.given || []).join(' ')} ${name.family || ''}`.trim();
  };

  const getNIK = (identifiers?: Array<{ system?: string; value?: string }>) => {
    if (!identifiers) return 'N/A';
    const nik = identifiers.find((id) => id.system?.includes('fhir.kemkes.go.id/id/nik'));
    return nik?.value || 'N/A';
  };

  const formatGender = (gender?: string) => {
    if (gender === 'male') return { label: 'Laki-laki', cls: 'bg-blue-100 text-blue-800' };
    if (gender === 'female') return { label: 'Perempuan', cls: 'bg-pink-100 text-pink-800' };
    return { label: gender || 'N/A', cls: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Pasien</h2>
        <button
          id="btn-tambah-pasien"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Tambah Pasien
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-sm">
        <div className="flex gap-2">
          <input
            id="input-search-nik"
            type="text"
            value={searchNIK}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 16);
              setSearchNIK(value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Masukkan NIK (16 digit)"
            maxLength={16}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          <button
            id="btn-cari-pasien"
            onClick={handleSearch}
            disabled={fetchLoading || searchNIK.length !== 16}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Search size={18} />
            Cari
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Masukkan 16 digit NIK tanpa spasi atau karakter khusus.{' '}
          <span className={searchNIK.length > 0 ? 'font-medium text-gray-700' : 'text-gray-400'}>
            {searchNIK.length}/16 karakter
          </span>
        </p>
      </div>

      {/* Error Display */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold text-sm">Terjadi Kesalahan:</p>
          <p className="text-sm mt-0.5">{fetchError}</p>
        </div>
      )}

      {/* Loading State */}
      {fetchLoading && <TableSkeleton rows={3} />}

      {/* Results Table */}
      {!fetchLoading && hasSearched && patients.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <User size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">
              {patients.length} Pasien Ditemukan
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">NIK</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama Lengkap</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Jenis Kelamin</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Tanggal Lahir</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">FHIR ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.map((patient) => {
                  const gender = formatGender(patient.gender);
                  return (
                    <tr key={patient.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-gray-900 text-xs tracking-wide">
                        {getNIK(patient.identifier)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {formatName(patient.name)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${gender.cls}`}
                        >
                          {gender.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {patient.birthDate
                          ? new Date(patient.birthDate).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">{patient.id}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!fetchLoading && hasSearched && patients.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="mx-auto w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <User size={24} className="text-gray-400" />
          </div>
          <p className="font-medium text-gray-700">Pasien tidak ditemukan</p>
          <p className="text-sm text-gray-500 mt-1">
            Coba cari dengan NIK lain atau tambahkan pasien baru.
          </p>
        </div>
      )}

      {/* Patient Form Modal */}
      <PatientForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreatePatient}
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
