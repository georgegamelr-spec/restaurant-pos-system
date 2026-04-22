'use client';

import { useState, useEffect } from 'react';

interface InventoryItem {
  id: string;
  product_name: string;
  unit_of_measure: string;
  quantity_on_hand: number;
}

interface SubRecipe {
  id: string;
  parent_inventory_id: string;
  child_inventory_id: string;
  quantity_needed: number;
  unit: string;
  parent?: { product_name: string; unit_of_measure: string };
  child?: { product_name: string; unit_of_measure: string };
}

export default function SubRecipesPage() {
  const [subRecipes, setSubRecipes] = useState<SubRecipe[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    parent_inventory_id: '',
    child_inventory_id: '',
    quantity_needed: '',
    unit: 'g',
  });
  const [filterParentId, setFilterParentId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    const [subRes, invRes] = await Promise.all([
      fetch('/api/sub-recipes'),
      fetch('/api/inventory'),
    ]);
    const subData = await subRes.json();
    const invData = await invRes.json();
    setSubRecipes(subData.data || []);
    setInventory(invData.data || invData || []);
    setLoading(false);
  }

  async function fetchForParent(parentId: string) {
    if (!parentId) { fetchAll(); return; }
    setLoading(true);
    const res = await fetch(`/api/sub-recipes?parent_inventory_id=${parentId}`);
    const data = await res.json();
    setSubRecipes(data.data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/sub-recipes?id=${editingId}` : '/api/sub-recipes';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        quantity_needed: parseFloat(form.quantity_needed),
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(editingId ? 'تم التحديث بنجاح' : 'تم الإضافة بنجاح');
      setShowForm(false);
      setEditingId(null);
      setForm({ parent_inventory_id: '', child_inventory_id: '', quantity_needed: '', unit: 'g' });
      fetchAll();
    } else {
      setMessage(data.error || 'حدث خطأ');
    }
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleDelete(id: string) {
    if (!confirm('هل تريد حذف هذه الوصفة الفرعية؟')) return;
    const res = await fetch(`/api/sub-recipes?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMessage('تم الحذف بنجاح');
      fetchAll();
    }
    setTimeout(() => setMessage(''), 3000);
  }

  function startEdit(recipe: SubRecipe) {
    setEditingId(recipe.id);
    setForm({
      parent_inventory_id: recipe.parent_inventory_id,
      child_inventory_id: recipe.child_inventory_id,
      quantity_needed: recipe.quantity_needed.toString(),
      unit: recipe.unit,
    });
    setShowForm(true);
  }

  const filteredRecipes = filterParentId
    ? subRecipes.filter(r => r.parent_inventory_id === filterParentId)
    : subRecipes;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">وصفات فرعية (Sub-Recipes)</h1>
          <p className="text-sm text-gray-500 mt-1">مكونات المكونات المركبة - مثلاً: الصوص هو مكون من طماطم + ثوم + زيت</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ parent_inventory_id: '', child_inventory_id: '', quantity_needed: '', unit: 'g' }); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'إلغاء' : '+ إضافة وصفة فرعية'}
        </button>
      </d

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-center font-medium ${
          message.includes('خطأ') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>{message}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'تعديل وصفة فرعية' : 'إضافة وصفة فرعية جديدة'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المكون المركب (Parent)</label>
              <select
                value={form.parent_inventory_id}
                onChange={e => setForm({ ...form, parent_inventory_id: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">اختر المكون الأصلي</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>{item.product_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المكون الفرعي (Child)</label>
              <select
                value={form.child_inventory_id}
                onChange={e => setForm({ ...form, child_inventory_id: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">اختر المكون</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.product_name} ({item.quantity_on_hand} {item.unit_of_measure})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الكمية المطلوبة</label>
              <input
                type="number"
                step="0.01"
                value={form.quantity_needed}
                onChange={e => setForm({ ...form, quantity_needed: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="مثال: 150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الوحدة</label>
              <select
                value={form.unit}
                onChange={e => setForm({ ...form, unit: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="g">جرام (g)</option>
                <option value="kg">كيلو (kg)</option>
                <option value="ml">مليلتر (ml)</option>
                <option value="liter">لتر (liter)</option>
                <option value="piece">قطعة (piece)</option>
              </select>
            </div>
          </div>
          <button type="submit" className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            {editingId ? 'تحديث' : 'حفظ'}
          </button>
        </form>
      )}

      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mr-2">فلتر حسب المكون المركب:</label>
        <select
          value={filterParentId}
          onChange={e => { setFilterParentId(e.target.value); fetchForParent(e.target.value); }}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">كل المكونات</option>
          {inventory.map(item => (
            <option key={item.id} value={item.id}>{item.product_name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">جاري التحميل...</div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-10 text-gray-400">لا توجد وصفات فرعية مسجلة</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">المكون المركب</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">يتكون من</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الكمية</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الوحدة</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecipes.map(recipe => (
                <tr key={recipe.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                    {recipe.parent?.product_name || inventory.find(i => i.id === recipe.parent_inventory_id)?.product_name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {recipe.child?.product_name || inventory.find(i => i.id === recipe.child_inventory_id)?.product_name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">{recipe.quantity_needed}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{recipe.unit}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => startEdit(recipe)} className="text-blue-600 hover:text-blue-800 mr-3 text-sm">تعديل</button>
                    <button onClick={() => handleDelete(recipe.id)} className="text-red-600 hover:text-red-800 text-sm">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
iv>
