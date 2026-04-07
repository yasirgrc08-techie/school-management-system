import { useState, useEffect } from 'react';
import { classesApi, subjectsApi, usersApi } from '../api/endpoints';
import { DataTable, Pagination, Badge, Modal } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { Plus, Search } from 'lucide-react';

export default function ClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({ name: '', section: '', teacherId: '', subjectId: '', schedule: '' });
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search: search || undefined };
      if (user.role === 'TEACHER') params.teacherId = user.id;
      const res = await classesApi.getAll(params);
      setClasses(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, [page]);

  const loadFormData = async () => {
    try {
      const [t, s] = await Promise.all([
        usersApi.getAll({ role: 'TEACHER', limit: 100 }),
        subjectsApi.getAll({ limit: 100 }),
      ]);
      setTeachers(t.data.data);
      setSubjects(s.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openCreate = async () => {
    await loadFormData();
    setForm({ name: '', section: '', teacherId: '', subjectId: '', schedule: '' });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await classesApi.create(form);
      setShowModal(false);
      fetchClasses();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Operation failed');
    }
  };

  const viewDetail = async (cls) => {
    try {
      const res = await classesApi.getById(cls.id);
      setShowDetail(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { key: 'name', label: 'Class', render: (row) => `${row.name} - ${row.section}` },
    { key: 'subject', label: 'Subject', render: (row) => row.subject?.name || '-' },
    { key: 'teacher', label: 'Teacher', render: (row) => row.teacher ? `${row.teacher.firstName} ${row.teacher.lastName}` : '-' },
    { key: 'students', label: 'Students', render: (row) => <Badge variant="STUDENT">{row._count?.enrollments || 0}</Badge> },
    { key: 'schedule', label: 'Schedule', render: (row) => row.schedule || '-' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {user.role === 'TEACHER' ? 'My Classes' : 'Classes'}
        </h1>
        {user.role === 'ADMIN' && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus size={18} /> Add Class
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchClasses(); }} className="flex gap-2">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search classes..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <button type="submit" className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">Search</button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <>
          <DataTable columns={columns} data={classes} onRowClick={viewDetail} />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}

      {/* Create Class Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Class">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Grade 10" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} required placeholder="e.g. A" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
            <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select teacher</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select subject</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
            <input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="e.g. Mon/Wed/Fri 9:00-10:00" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create</button>
          </div>
        </form>
      </Modal>

      {/* Class Detail Modal */}
      <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail ? `${showDetail.name} - ${showDetail.section}` : ''}>
        {showDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Subject:</span> <span className="font-medium">{showDetail.subject?.name}</span></div>
              <div><span className="text-gray-500">Teacher:</span> <span className="font-medium">{showDetail.teacher?.firstName} {showDetail.teacher?.lastName}</span></div>
              <div><span className="text-gray-500">Schedule:</span> <span className="font-medium">{showDetail.schedule || 'Not set'}</span></div>
              <div><span className="text-gray-500">Students:</span> <span className="font-medium">{showDetail.enrollments?.length || 0}</span></div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Enrolled Students</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {showDetail.enrollments?.map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                    <span>{e.student.firstName} {e.student.lastName}</span>
                    <span className="text-gray-400">{e.student.email}</span>
                  </div>
                ))}
                {(!showDetail.enrollments || showDetail.enrollments.length === 0) && (
                  <p className="text-gray-400 text-sm">No students enrolled</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
