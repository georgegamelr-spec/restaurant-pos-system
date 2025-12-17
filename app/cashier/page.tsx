'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MenuItem {
  id: number;
  nameAr: string;
  nameEn: string;
  price: number;
  category: string;
}

interface OrderItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
}

interface Table {
  id: string;
  numberAr: string;
  numberEn: string;
  capacity: number;
}

export default function CashierPage() {
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [loading, setLoading] = useState(false);
  const [sampleMenuItems] = useState<MenuItem[]>([
    { id: 1, nameAr: 'كوفي إسبريسو', nameEn: 'Espresso Coffee', price: 25, category: 'مشروبات' },
    { id: 2, nameAr: 'قهوة تركية', nameEn: 'Turkish Coffee', price: 20, category: 'مشروبات' },
    { id: 3, nameAr: 'عصير برتقال', nameEn: 'Orange Juice', price: 15, category: 'عصائر' },
    { id: 4, nameAr: 'شاي بالنعناع', nameEn: 'Mint Tea', price: 12, category: 'مشروبات' },
    { id: 5, nameAr: 'ساندويتش الدجاج', nameEn: 'Chicken Sandwich', price: 45, category: 'ساندويتشات' },
    { id: 6, nameAr: 'ساندويتش الجبنة', nameEn: 'Cheese Sandwich', price: 30, category: 'ساندويتشات' },
  ]);

  // تحميل الترابيزات
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch('/api/tables');
        if (response.ok) {
          const data = await response.json();
          setTables(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    };
    fetchTables();
  }, []);

  const addItemToOrder = (item: MenuItem) => {
    const existingItem = orderItems.find(o => o.menuItemId === item.id);
    if (existingItem) {
      existingItem.quantity++;
      setOrderItems([...orderItems]);
    } else {
      setOrderItems([...orderItems, {
        menuItemId: item.id,
        name: language === 'ar' ? item.nameAr : item.nameEn,
        price: item.price,
        quantity: 1,
      }]);
    }
  };

  const removeItemFromOrder = (menuItemId: number) => {
    setOrderItems(orderItems.filter(o => o.menuItemId !== menuItemId));
  };

  const updateItemQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromOrder(menuItemId);
    } else {
      const item = orderItems.find(o => o.menuItemId === menuItemId);
      if (item) {
        item.quantity = quantity;
        setOrderItems([...orderItems]);
      }
    }
  };

  const getTotalPrice = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmitOrder = async () => {
    if (!selectedTableId || orderItems.length === 0) {
      alert(language === 'ar' ? 'الرجاء اختيار ترابيزة وإضافة عناصر' : 'Please select a table and add items');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: selectedTableId,
          items: orderItems,
        }),
      });

      if (response.ok) {
        alert(language === 'ar' ? 'تم إضافة الطلب بنجاح' : 'Order added successfully');
        setOrderItems([]);
        setSelectedTableId(null);
      }
    } catch (error) {
      alert(language === 'ar' ? 'خطأ في إرسال الطلب' : 'Error submitting order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* القائمة الجانبية - الترابيزات */}
      <div className="w-1/4 bg-white shadow-lg p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{language === 'ar' ? 'الترابيزات' : 'Tables'}</h2>
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
          >
            {language === 'ar' ? 'EN' : 'AR'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {tables.map(table => (
            <button
              key={table.id}
              onClick={() => setSelectedTableId(table.id)}
              className={`p-4 rounded-lg font-bold text-center transition ${
                selectedTableId === table.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              <div>{language === 'ar' ? table.numberAr : table.numberEn}</div>
              <div className="text-xs mt-1">{language === 'ar' ? 'أشخاص: ' : 'Seats: '}{table.capacity}</div>
            </button>
          ))}
        </div>
      </div>

      {/* المنتصف - القائمة والطلبات */}
      <div className="flex-1 flex flex-col">
        {/* القائمة */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-2xl font-bold mb-4">{language === 'ar' ? 'القائمة' : 'Menu'}</h3>
          <div className="grid grid-cols-3 gap-4">
            {sampleMenuItems.map(item => (
              <button
                key={item.id}
                onClick={() => addItemToOrder(item)}
                className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer text-center"
              >
                <div className="font-bold">{language === 'ar' ? item.nameAr : item.nameEn}</div>
                <div className="text-sm text-gray-600 mt-1">{item.category}</div>
                <div className="text-lg font-bold text-green-600 mt-2">{item.price} ر.س</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* اليمين - تفاصيل الطلب */}
      <div className="w-1/4 bg-white shadow-lg p-4 flex flex-col">
        <h3 className="text-xl font-bold mb-4">{language === 'ar' ? 'الطلب الحالي' : 'Current Order'}</h3>
        
        {selectedTableId ? (
          <div className="text-sm text-green-600 mb-4">
            {language === 'ar' ? 'الترابيزة: ' : 'Table: '}
            <span className="font-bold">{tables.find(t => t.id === selectedTableId)?.[language === 'ar' ? 'numberAr' : 'numberEn']}</span>
          </div>
        ) : (
          <div className="text-sm text-red-600 mb-4">{language === 'ar' ? 'لم تختر ترابيزة' : 'No table selected'}</div>
        )}

        <div className="flex-1 overflow-y-auto mb-4 border rounded p-2">
          {orderItems.length === 0 ? (
            <div className="text-gray-500 text-center">{language === 'ar' ? 'لا توجد عناصر' : 'No items'}</div>
          ) : (
            orderItems.map(item => (
              <div key={item.menuItemId} className="mb-3 pb-3 border-b">
                <div className="font-bold">{item.name}</div>
                <div className="text-sm text-gray-600">{item.price} ر.س × {item.quantity}</div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => updateItemQuantity(item.menuItemId, item.quantity - 1)}
                    className="flex-1 bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    -
                  </button>
                  <button
                    onClick={() => updateItemQuantity(item.menuItemId, item.quantity + 1)}
                    className="flex-1 bg-green-500 text-white px-2 py-1 rounded text-sm"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItemFromOrder(item.menuItemId)}
                    className="flex-1 bg-gray-500 text-white px-2 py-1 rounded text-sm"
                  >
                    X
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t pt-4">
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span>{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
              <span className="font-bold text-xl text-green-600">{getTotalPrice()} ر.س</span>
            </div>
          </div>
          <button
            onClick={handleSubmitOrder}
            disabled={loading || !selectedTableId || orderItems.length === 0}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (language === 'ar' ? 'جاري...' : 'Loading...') : (language === 'ar' ? 'تأكيد الطلب' : 'Confirm Order')}
          </button>
        </div>
      </div>
    </div>
  );
}
