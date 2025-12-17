'use client';

import { useState } from 'react';
import Link from 'next/link';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
}

const mockMenu: MenuItem[] = [
  { id: 1, name: 'فراخ مشوي', price: 85, category: 'أطباق رئيسية' },
  { id: 2, name: 'سمك مشوي', price: 95, category: 'أطباق رئيسية' },
  { id: 3, name: 'كفتة', price: 75, category: 'أطباق رئيسية' },
  { id: 4, name: 'كنافة', price: 35, category: 'حلويات' },
  { id: 5, name: 'عصير برتقال', price: 15, category: 'المشروبات' },
  { id: 6, name: 'قهوة', price: 12, category: 'المشروبات' },
];

export default function CashierPage() {
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [total, setTotal] = useState(0);

  const addToCart = (item: MenuItem) => {
    const newCart = [...cart, item];
    setCart(newCart);
    setTotal(total + item.price);
  };

  const removeFromCart = (index: number) => {
    const item = cart[index];
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    setTotal(total - item.price);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* الرأس العلوي */}
      <div className="w-full">
        <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">نظام الكاشير</h1>
          <div className="flex gap-4">
            <Link href="/" className="hover:bg-blue-700 px-4 py-2 rounded">الرئيسية</Link>
            <Link href="/menu" className="hover:bg-blue-700 px-4 py-2 rounded">المنيو</Link>
            <Link href="/tables" className="hover:bg-blue-700 px-4 py-2 rounded">الطاولات</Link>
            <Link href="/reports" className="hover:bg-blue-700 px-4 py-2 rounded">التقارير</Link>
          </div>
        </nav>

        <div className="flex h-[calc(100vh-70px)]">
          {/* قائمة المنتجات */}
          <div className="flex-1 p-6 overflow-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">المنتجات المتاحة</h2>
            <div className="grid grid-cols-3 gap-4">
              {mockMenu.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
                  <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{item.category}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">{item.price} ج.م</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                    >
                      إضافة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* السلة */}
          <div className="w-80 bg-white shadow-lg p-6 border-l-4 border-blue-600">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">السلة</h2>
            <div className="flex-1 overflow-auto mb-4 max-h-[calc(100vh-350px)]">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center">السلة فارغة</p>
              ) : (
                <div className="space-y-2">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-green-600">{item.price} ج.م</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t-2 pt-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">الإجمالي:</span>
                <span className="text-2xl font-bold text-green-600">{total} ج.م</span>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition text-lg">
                دفع الآن
              </button>
              <button className="w-full bg-gray-500 text-white py-2 rounded-lg font-bold hover:bg-gray-600 transition mt-2">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
