'use client';

import { useState, useEffect } from 'react';
import { Table } from '@/types/restaurant';
export default function TablesManagement() {
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

  const t = language === 'en'
    ? {
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
      }
    : {
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
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="text-slate-400">{t.subtitle}</p>
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
          <form onSubmit={handleAddTable} className="mb-6 p-4 bg-slate-800 rounded-lg">
            <input
              type="text"
              placeholder={`${t.number} (${t.addTable === 'Add New Table' ? 'Arabic' : 'عربي'})`}
              value={formData.numberAr}
              onChange={(e) => setFormData({...formData, numberAr: e.target.value})}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 mb-3"
              required
            />
            <input
              type="text"
              placeholder={`${t.number} (${t.addTable === 'Add New Table' ? 'English' : 'إنجليزي'})`}
              value={formData.numberEn}
              onChange={(e) => setFormData({...formData, numberEn: e.target.value})}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 mb-3"
              required
            />
            <input
              type="number"
              placeholder={t.capacity}
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: e.target.value})}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 mb-3"
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              {t.save}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded mt-2"
            >
              {t.cancel}
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p>بيانات...</p>
          ) : tables.length === 0 ? (
            <p>{t.noTables}</p>
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
