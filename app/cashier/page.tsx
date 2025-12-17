'use client';

export default function CashierPage() {
  return (
    <div className="flex h-screen bg-gray-900 text-white" dir="rtl">
      <nav className="w-64 bg-gray-800 p-4">
        <h1 className="text-2xl font-bold mb-6">نظام الكاشير</h1>
        <ul className="space-y-2">
          <li><a href="/" className="hover:text-blue-400">الرئيسية</a></li>
          <li><a href="/cashier" className="hover:text-blue-400">الكاشير</a></li>
          <li><a href="/menu" className="hover:text-blue-400">القائمة</a></li>
        </ul>
      </nav>
      <main className="flex-1 p-8">
        <h2 className="text-3xl font-bold mb-6">مرحباً بك في نظام الكاشير</h2>
        <p className="text-lg">هذا هو نظام الكاشير للمطعم</p>
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">الطلبات</h3>
            <p>إدارة الطلبات الحالية</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">المبيعات</h3>
            <p>عرض إحصائيات المبيعات</p>
          </div>
        </div>
      </main>
    </div>
  );
}
