import { useState, useEffect } from 'react';
import { subjectsApi } from '../api/endpoints';
import { DataTable, Pagination, Modal } from '../components/ui';
import { Plus, Search } from 'lucide-react';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [form, setForm] = useState({ name: '', code: '' });
  const [error, setError] = useState('');

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await subjectsApi.getAll({ page, limit: 10, search: search || undefined });
      setSubjects(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, [page]);

  const openCreate = () => {
    setEditSubject(null);
    setForm({ name: '', code: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (subject) => {
    setEditSubject(subject);
    setForm({ name: subject.name, code: subject.code });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editSubject) {
        await subjectsApi.update(editSubject.id, form);
      } else {
        await subjectsApi.create(form);
      }
      setShowModal(false);
      fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await subjectsApi.delete(id);
      fetchSubjects();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Subject Name' },
    { key: 'code', label: 'Code' },
    { key: 'classes', label: 'Classes', render: (row) => row._count?.classes || 0 },
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
        <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={18} /> Add Subject
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchSubjects(); }} className="flex gap-2">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search subjects..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <button type="submit" className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">Search</button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <>
          <DataTable columns={columns} data={subjects} />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editSubject ? 'Edit Subject' : 'Create Subject'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Mathematics" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required placeholder="e.g. MATH101" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{editSubject ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
