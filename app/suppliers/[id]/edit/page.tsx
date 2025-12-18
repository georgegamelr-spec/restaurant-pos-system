'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SupplierForm } from '../../form';

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
}

export default function EditSupplierPage() {
  const params = useParams();
  const router = useRouter();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);

  const supplierId = params.id as string;

  useEffect(() => {
    if (supplierId) {
      fetchSupplier();
    }
  }, [supplierId]);

  const fetchSupplier = async () => {
    try {
      const response = await fetch(`/api/suppliers?id=${supplierId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch supplier');
      }
      const data = await response.json();
      setSupplier(data);
    } catch (error) {
      console.error('Error fetching supplier:', error);
      toast.error('Failed to load supplier details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading supplier details...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-red-800">Error</h2>
        <p className="text-red-700 mt-2">Could not load supplier data.</p>
      </div>
    );
  }

  return <SupplierForm initialData={supplier} isEditing={true} />;
}
