import { useState, useEffect } from 'react';
import { usersApi } from '../api/endpoints';
import { DataTable, Pagination, Badge, Modal } from '../components/ui';
import { Plus, Search } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'STUDENT' });
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll({ page, limit: 10, search: search || undefined, role: roleFilter || undefined });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const openCreate = () => {
    setEditUser(null);
    setForm({ email: '', password: 'password123', firstName: '', lastName: '', role: 'STUDENT' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editUser) {
        const { password, ...data } = form;
        await usersApi.update(editUser.id, data);
      } else {
        await usersApi.create(form);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersApi.delete(id);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => `${row.firstName} ${row.lastName}` },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (row) => <Badge variant={row.role}>{row.role}</Badge> },
    { key: 'active', label: 'Status', render: (row) => (
      <Badge variant={row.active ? 'PRESENT' : 'ABSENT'}>{row.active ? 'Active' : 'Inactive'}</Badge>
    )},
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Edit</button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={18} /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">Search</button>
        </form>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="TEACHER">Teacher</option>
          <option value="STUDENT">Student</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={users} />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editUser ? 'Edit User' : 'Create User'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          {!editUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="ADMIN">Admin</option>
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{editUser ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
