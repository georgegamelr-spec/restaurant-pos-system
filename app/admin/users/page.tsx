'use client';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { hasPermission } from '@/lib/rbac';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export default function UsersPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'cashier',
  });

  useEffect(() => {
    const checkPermissions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
              const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
              const hasAccess = profile ? hasPermission(profile.role as import('@/lib/rbac').UserRole, { resource: 'user', action: 'create' }) : false;
      if (!hasAccess) {
        router.push('/admin');
        return;
      }
      setCanManage(true);
      fetchUsers();
    };
    checkPermissions();
  }, [supabase, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users?limit=100');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setFormData({ email: '', password: '', fullName: '', role: 'cashier' });
        setShowForm(false);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await fetch(`/api/users?id=${userId}`, { method: 'DELETE' });
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!canManage) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">User Management</h1>
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {showForm ? 'Cancel' : 'Create New User'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="cashier">Cashier</option>
            <option value="kitchen">Kitchen Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Create User
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No users</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-sm">{user.full_name}</td>
                  <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{user.role}</span></td>
                  <td className="px-6 py-4 text-sm">{user.is_active ? '✓ Active' : '✗ Inactive'}</td>
                  <td className="px-6 py-4 text-sm">
                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
