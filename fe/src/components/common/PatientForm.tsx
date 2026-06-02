'use client';

import React, { useState } from 'react';
import { FHIRPatient } from '@/types';
import { X } from 'lucide-react';

interface PatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<FHIRPatient>) => Promise<void>;
  isLoading: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    givenName: '',
    familyName: '',
    gender: 'unknown',
    birthDate: '',
    nik: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const patientPayload: Partial<FHIRPatient> = {
      resourceType: 'Patient',
      name: [
        {
          use: 'official',
          given: [formData.givenName],
          family: formData.familyName,
        },
      ],
      gender: formData.gender as any,
      birthDate: formData.birthDate,
      identifier: [
        {
          system: 'https://fhir.kemkes.go.id/id/nik',
          value: formData.nik,
        },
      ],
    };

    await onSubmit(patientPayload);

    setFormData({
      givenName: '',
      familyName: '',
      gender: 'unknown',
      birthDate: '',
      nik: '',
    });
  };

  if (!isOpen) return null;

  // Shared input class with proper contrast
  const inputCls =
    'w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Tambah Pasien Baru</h2>
          <button
            id="btn-close-patient-modal"
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              NIK <span className="text-gray-400 font-normal">(16 digit)</span>{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="input-patient-nik"
              type="text"
              name="nik"
              value={formData.nik}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                setFormData((p) => ({ ...p, nik: v }));
              }}
              placeholder="1234567890123456"
              maxLength={16}
              required
              className={`${inputCls} font-mono`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Depan <span className="text-red-500">*</span>
              </label>
              <input
                id="input-patient-given-name"
                type="text"
                name="givenName"
                value={formData.givenName}
                onChange={handleChange}
                placeholder="Budi"
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Keluarga
              </label>
              <input
                id="input-patient-family-name"
                type="text"
                name="familyName"
                value={formData.familyName}
                onChange={handleChange}
                placeholder="Santoso"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Jenis Kelamin
            </label>
            <select
              id="select-patient-gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={inputCls}
            >
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
              <option value="other">Lainnya</option>
              <option value="unknown">Tidak Diketahui</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tanggal Lahir
            </label>
            <input
              id="input-patient-birthdate"
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className={inputCls}
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
              id="btn-submit-patient"
              disabled={isLoading || !formData.givenName || formData.nik.length !== 16}
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
