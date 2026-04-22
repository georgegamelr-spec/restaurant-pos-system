'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  category: string;
  paymentTerms: string;
  deliveryDays: number;
  minOrder: number;
  notes: string;
  status: 'active' | 'inactive' | 'suspended';
  [key: string]: unknown;
}

interface SupplierFormProps {
  initialData?: Supplier | null;
  isEditing?: boolean;
}

export default function SupplierForm({ initialData, isEditing = false }: SupplierFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    country: initialData?.country || '',
    category: initialData?.category || '',
    paymentTerms: initialData?.paymentTerms || '',
    deliveryDays: initialData?.deliveryDays || 0,
    minOrder: initialData?.minOrder || 0,
    notes: initialData?.notes || '',
    status: (initialData?.status || 'active') as 'active' | 'inactive' | 'suspended',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEditing && initialData ? `/api/suppliers?id=${initialData.id}` : '/api/suppliers';
      const method = isEditing ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to save supplier');
      router.push('/suppliers');
    } catch (error) {
      console.error('Error saving supplier:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">اسم المورد</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
        <input
          type="text"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'جاري الحفظ...' : isEditing ? 'تحديث' : 'إضافة'}
        </button>
      </div>
    </form>
  );
}
