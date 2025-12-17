'use client';

import { useState, useEffect } from 'react';

interface OrderItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: 'open' | 'completed' | 'cancelled';
  createdAt: string;
}

export default function BillsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [loading, setLoading] = useState(false);
  const [splitMode, setSplitMode] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        if (response.ok) {
          const data = await response.json();
          setOrders(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    fetchOrders();
  }, []);

  const handleSplitBill = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const numPeople = prompt(language === 'ar' ? 'عدد الأشخاص:' : 'Number of people:');
    if (!numPeople || isNaN(parseInt(numPeople))) return;

    const personCount = parseInt(numPeople);
    const splitDetails = order.items.map((_, index) => ({
      personId: index % personCount,
      itemId: index,
    }));

    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          action: 'split',
          splitDetails,
        }),
      });

      if (response.ok) {
        alert(language === 'ar' ? 'تم تقسيم الفاتورة' : 'Bill split successfully');
      }
    } catch (error) {
      alert(language === 'ar' ? 'خطأ' : 'Error');
    }
  };

  const handleSettleBill = async (orderId: string) => {
    if (!confirm(language === 'ar' ? 'هل توافق على إغلاق هذه الفاتورة؟' : 'Are you sure you want to close this bill?')) return;

    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          action: 'settle',
        }),
      });

      if (response.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'completed' } : o));
        alert(language === 'ar' ? 'تم حل الفاتورة' : 'Bill settled');
      }
    } catch (error) {
      alert(language === 'ar' ? 'خطأ' : 'Error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{language === 'ar' ? 'إدارة الفواتير' : 'Bills Management'}</h1>
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {language === 'ar' ? 'EN' : 'AR'}
          </button>
        </div>

        <div className="grid gap-6">
          {orders.filter(o => o.status === 'open').length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
              {language === 'ar' ? 'لا توجد فواتير مفتوحة' : 'No open bills'}
            </div>
          ) : (
            orders.filter(o => o.status === 'open').map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600">{language === 'ar' ? 'رقم الفاتورة' : 'Bill #'}</div>
                    <div className="text-xl font-bold">{order.id.substring(0, 8)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{language === 'ar' ? 'الترابيزة' : 'Table'}</div>
                    <div className="text-xl font-bold">{order.tableId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{language === 'ar' ? 'عدد العناصر' : 'Items'}</div>
                    <div className="text-xl font-bold">{order.items.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{language === 'ar' ? 'الإجمالي' : 'Total'}</div>
                    <div className="text-xl font-bold text-green-600">{order.total} ر.س</div>
                  </div>
                </div>

                <div className="mb-4 border-t pt-4">
                  <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.name} ×{item.quantity}</span>
                        <span className="font-bold">{item.price * item.quantity} ر.س</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleSplitBill(order.id)}
                    className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                  >
                    {language === 'ar' ? 'تقسيم' : 'Split'}
                  </button>
                  <button
                    onClick={() => handleSettleBill(order.id)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                  >
                    {language === 'ar' ? 'دفع وإغلاق' : 'Pay & Close'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
