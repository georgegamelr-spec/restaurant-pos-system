'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Edit2, Trash2, Eye } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  payment_terms: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  total_orders: number;
  total_spent: number;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('active');

  useEffect(() => {
    fetchSuppliers();
  }, [statusFilter]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await fetch(`/api/suppliers${params}`);
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
        setError('');
      } else {
        setError('Failed to load suppliers');
      }
    } catch (err) {
      setError('Error fetching suppliers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (supplierId: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    
    try {
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSuppliers(suppliers.filter(s => s.id !== supplierId));
      } else {
        setError('Failed to delete supplier');
      }
    } catch (err) {
      setError('Error deleting supplier');
      console.error(err);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Suppliers Management</h1>
            <p className="mt-2 text-gray-600">Manage your supplier relationships and contracts</p>
          </div>
          <Link href="/suppliers/new" className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            <PlusCircle size={20} />
            Add New Supplier
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search suppliers by name, contact, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-600">Loading suppliers...</div>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No suppliers found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Company</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Phone</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Location</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Orders</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{supplier.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{supplier.contact_person}</td>
                      <td className="px-6 py-4 text-sm text-blue-600">{supplier.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{supplier.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{supplier.city}, {supplier.country}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>
                          {supplier.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{supplier.total_orders}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <Link href={`/suppliers/${supplier.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="View">
                            <Eye size={18} />
                          </Link>
                          <Link href={`/suppliers/${supplier.id}/edit`} className="p-2 text-orange-600 hover:bg-orange-50 rounded" title="Edit">
                            <Edit2 size={18} />
                          </Link>
                          <button onClick={() => handleDelete(supplier.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-blue-600 text-3xl font-bold">{suppliers.length}</div>
            <p className="text-gray-600 text-sm mt-2">Total Suppliers</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-green-600 text-3xl font-bold">{suppliers.filter(s => s.status === 'active').length}</div>
            <p className="text-gray-600 text-sm mt-2">Active</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-red-600 text-3xl font-bold">{suppliers.filter(s => s.status === 'suspended').length}</div>
            <p className="text-gray-600 text-sm mt-2">Suspended</p>
          </div>
        </div>
      </div>
    </div>
  );
}
