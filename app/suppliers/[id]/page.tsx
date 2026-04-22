'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import SupplierForm from '@/components/suppliers/form';
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
  totalOrders: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

export default function SupplierDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/suppliers?id=${supplierId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete supplier');
      }

      toast.success('Supplier deleted successfully');
      router.push('/suppliers');
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete supplier');
    } finally {
      setDeleting(false);
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
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800">Supplier Not Found</h2>
          <p className="text-red-700 mt-2">The supplier you're looking for doesn't exist or has been deleted.</p>
          <Link
            href="/suppliers"
            className="inline-block mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Back to Suppliers
          </Link>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setIsEditing(false)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Details
        </button>
        <SupplierForm initialData={supplier} isEditing={true} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    supplier.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : supplier.status === 'inactive'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
        </div>
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-base font-semibold text-gray-900">{supplier.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="text-base font-semibold text-gray-900">{supplier.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Category</p>
            <p className="text-base font-semibold text-gray-900">{supplier.category || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Address</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <p className="text-sm text-gray-600">Street Address</p>
            <p className="text-base font-semibold text-gray-900">{supplier.address || 'N/A'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">City</p>
              <p className="text-base font-semibold text-gray-900">{supplier.city || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Country</p>
              <p className="text-base font-semibold text-gray-900">{supplier.country || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Terms */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Business Terms</h2>
        </div>
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Payment Terms</p>
            <p className="text-base font-semibold text-gray-900">{supplier.paymentTerms || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Delivery Days</p>
            <p className="text-base font-semibold text-gray-900">{supplier.deliveryDays || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Minimum Order</p>
            <p className="text-base font-semibold text-gray-900">{supplier.minOrder || 0} units</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Performance Metrics</h2>
        </div>
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-blue-600">{supplier.totalOrders || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average Rating</p>
            <p className="text-2xl font-bold text-yellow-500">{supplier.averageRating ? supplier.averageRating.toFixed(2) : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {supplier.notes && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-700 whitespace-pre-wrap">{supplier.notes}</p>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Metadata</h2>
        </div>
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <p>Created: {new Date(supplier.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p>Last Updated: {new Date(supplier.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex gap-2 pt-4">
        <Link
          href="/suppliers"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back to Suppliers
        </Link>
      </div>
    </div>
  );
}
