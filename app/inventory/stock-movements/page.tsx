'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StockMovement {
  id: string;
  product_id: string;
  product_name: string;
  quantity_change: number;
  movement_type: 'inbound' | 'outbound' | 'adjustment';
  reference_id: string | null;
  notes: string;
  created_at: string;
  created_by: string;
}

interface Filters {
  movement_type: string;
  date_range: 'today' | 'week' | 'month' | 'all';
}

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    movement_type: 'all',
    date_range: 'week',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMovements();
  }, [filters]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.movement_type !== 'all') {
        params.append('type', filters.movement_type);
      }
      params.append('range', filters.date_range);

      const response = await fetch(`/api/inventory/stock-movements?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMovements(data);
        setError('');
      } else {
        setError('Failed to load stock movements');
      }
    } catch (err) {
      setError('Error fetching stock movements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMoveTypeColor = (type: string) => {
    switch (type) {
      case 'inbound':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'outbound':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'adjustment':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getMoveTypeLabel = (type: string) => {
    switch (type) {
      case 'inbound':
        return 'Inbound';
      case 'outbound':
        return 'Outbound';
      case 'adjustment':
        return 'Adjustment';
      default:
        return type;
    }
  };

  const getQuantityChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Stock Movements</h1>
          <p className="mt-2 text-gray-600">Track all inventory stock movements and adjustments</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Movement Type
              </label>
              <select
                value={filters.movement_type}
                onChange={(e) => setFilters(prev => ({ ...prev, movement_type: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={filters.date_range}
                onChange={(e) => setFilters(prev => ({ ...prev, date_range: e.target.value as any }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchMovements}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-600">Loading stock movements...</div>
          </div>
        ) : movements.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No stock movements found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Quantity</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Reference</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Notes</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {movements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {new Date(movement.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <Link href={`/inventory/products/${movement.product_id}`} className="text-blue-600 hover:underline">
                          {movement.product_name}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full border text-xs font-medium ${getMoveTypeColor(movement.movement_type)}`}>
                          {getMoveTypeLabel(movement.movement_type)}
                        </span>
                      </td>
                      <td className={`px-6 py-3 text-sm font-medium text-right ${getQuantityChangeColor(movement.quantity_change)}`}>
                        {movement.quantity_change > 0 ? '+' : ''}{movement.quantity_change}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {movement.reference_id || '-'}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {movement.notes || '-'}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {movement.created_by}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
