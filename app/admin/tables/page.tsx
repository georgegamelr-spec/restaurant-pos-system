'use client';
import { useState, useEffect } from 'react';
import { Table } from '../../../lib/types/restaurant.ts';
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [formData, setFormData] = useState({ numberAr: '', numberEn: '', capacity: '' });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables');
      const data = await res.json();
      if (data.success) setTables(data.data);
    } catch (error) {
      console.error('خطأ في تحميل الترابيزات');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setTables([...tables, data.data]);
        setFormData({ numberAr: '', numberEn: '', capacity: '' });
        setShowForm(false);
      }
    } catch (error) {
      console.error('خطأ في إضافة الترابيزة');
    }
  };

  const handleDeleteTable = async (id: string) => {
    try {
      const res = await fetch(`/api/tables?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTables(tables.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('خطأ في حذف الترابيزة');
    }
  };

  const t = language === 'en' ? {
    title: 'Table Management',
    subtitle: 'Manage Restaurant Tables',
    addTable: 'Add New Table',
    tables: 'Tables',
    number: 'Number',
    capacity: 'Capacity',
    status: 'Status',
    actions: 'Actions',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    empty: 'Empty',
    noTables: 'No tables available',
  } : {
    title: 'إدارة الترابيزات',
    subtitle: 'إدارة ترابيزات المطعم',
    addTable: 'إضافة الترابيزة',
    tables: 'الترابيزات',
    number: 'رقم',
    capacity: 'السعة',
    status: 'الحالة',
    actions: 'الإجراءات',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    empty: 'فارغة',
    noTables: 'لا توجد ترابيزات',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">{t.title}</h1>
            <p className="text-gray-400 mt-2">{t.subtitle}</p>
          </div>
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
          >
            {language === 'en' ? 'عربي' : 'English'}
          </button>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
        >
          + {t.addTable}
        </button>

        {showForm && (
          <form onSubmit={handleAddTable} className="mb-6 p-6 bg-slate-800 rounded-lg">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder={t.number + ' (AR)'}
                value={formData.numberAr}
                onChange={(e) => setFormData({...formData, numberAr: e.target.value})}
                className="px-4 py-2 bg-slate-700 text-white rounded border border-slate-600"
                required
              />
              <input
                type="text"
                placeholder={t.number + ' (EN)'}
                value={formData.numberEn}
                onChange={(e) => setFormData({...formData, numberEn: e.target.value})}
                className="px-4 py-2 bg-slate-700 text-white rounded border border-slate-600"
                required
              />
              <input
                type="number"
                placeholder={t.capacity}
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                className="px-4 py-2 bg-slate-700 text-white rounded border border-slate-600"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">
                {t.save}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">
                {t.cancel}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-gray-400">بيانات...</p>
          ) : tables.length === 0 ? (
            <p className="text-gray-400">{t.noTables}</p>
          ) : (
            tables.map((table) => (
              <div key={table.id} className="p-6 bg-slate-800 rounded-lg border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-2">
                  {language === 'en' ? table.numberEn : table.numberAr}
                </h3>
                <p className="text-gray-400 mb-2">السعة: {table.capacity} أشخاص</p>
                <p className="text-gray-400 mb-4">الحالة: {t.empty}</p>
                <button
                  onClick={() => handleDeleteTable(table.id)}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  {t.delete}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
