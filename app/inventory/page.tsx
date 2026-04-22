'use client';

interface InventoryItem {
  id: string;
  product_name: string;
  product_code: string;
  quantity_on_hand: number;
}

import { useState, useEffect } from 'react';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>جاري تحميل المخزون...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">إدارة المخزون</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">إجمالي المنتجات</p>
            <p className="text-3xl font-bold text-gray-900">{inventory.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-right">اسم المنتج</th>
                <th className="px-6 py-3 text-right">الكود</th>
                <th className="px-6 py-3 text-right">الكمية المتاحة</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="px-6 py-4">{item.product_name}</td>
                  <td className="px-6 py-4">{item.product_code}</td>
                  <td className="px-6 py-4">{item.quantity_on_hand}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
