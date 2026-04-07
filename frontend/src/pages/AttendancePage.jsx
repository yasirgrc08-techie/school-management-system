import { useState, useEffect } from 'react';
import { attendanceApi, classesApi } from '../api/endpoints';
import { DataTable, Pagination, Badge } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function AttendancePage() {
  const { user } = useAuth();

  if (user.role === 'STUDENT') return <StudentAttendance studentId={user.id} />;
  return <TeacherAdminAttendance />;
}

function TeacherAdminAttendance() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = user.role === 'TEACHER' ? { teacherId: user.id, limit: 100 } : { limit: 100 };
    classesApi.getAll(params).then((res) => setClasses(res.data.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    Promise.all([
      classesApi.getById(selectedClass),
      attendanceApi.getByClass(selectedClass, { date, limit: 100 }),
      attendanceApi.getSummary(selectedClass),
    ]).then(([classRes, attendanceRes, summaryRes]) => {
      const enrolledStudents = classRes.data.enrollments?.map((e) => e.student) || [];
      setStudents(enrolledStudents);
      setSummary(summaryRes.data);

      const existingRecords = {};
      attendanceRes.data.data.forEach((r) => {
        existingRecords[r.student.id] = r.status;
      });
      // Default all to PRESENT if no existing records
      const newRecords = {};
      enrolledStudents.forEach((s) => {
        newRecords[s.id] = existingRecords[s.id] || 'PRESENT';
      });
      setRecords(newRecords);
    }).catch(console.error).finally(() => setLoading(false));
  }, [selectedClass, date]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const attendanceRecords = Object.entries(records).map(([studentId, status]) => ({
        studentId,
        status,
      }));
      await attendanceApi.mark({ classId: selectedClass, date, records: attendanceRecords });
      setMessage('Attendance saved successfully!');
      // Refresh summary
      const summaryRes = await attendanceApi.getSummary(selectedClass);
      setSummary(summaryRes.data);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const markAll = (status) => {
    const newRecords = {};
    students.forEach((s) => { newRecords[s.id] = status; });
    setRecords(newRecords);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Attendance</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="">Select a class</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name} - {c.section} ({c.subject?.name})</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {!selectedClass && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          Select a class to mark attendance
        </div>
      )}

      {selectedClass && loading && (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      )}

      {selectedClass && !loading && (
        <>
          {message && (
            <div className={`mb-4 p-3 text-sm rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <button onClick={() => markAll('PRESENT')} className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100">Mark All Present</button>
            <button onClick={() => markAll('ABSENT')} className="px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100">Mark All Absent</button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {['PRESENT', 'ABSENT', 'LATE'].map((status) => (
                          <button
                            key={status}
                            onClick={() => setRecords({ ...records, [student.id]: status })}
                            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                              records[student.id] === status
                                ? status === 'PRESENT' ? 'bg-green-600 text-white' :
                                  status === 'ABSENT' ? 'bg-red-600 text-white' :
                                  'bg-amber-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || students.length === 0}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>

          {/* Attendance Summary */}
          {summary && summary.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Summary</h3>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Late</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Absent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {summary.map((s) => (
                      <tr key={s.student.id}>
                        <td className="px-6 py-3 text-sm font-medium">{s.student.firstName} {s.student.lastName}</td>
                        <td className="px-6 py-3 text-sm text-green-600 font-medium">{s.present}</td>
                        <td className="px-6 py-3 text-sm text-amber-600 font-medium">{s.late}</td>
                        <td className="px-6 py-3 text-sm text-red-600 font-medium">{s.absent}</td>
                        <td className="px-6 py-3">
                          <Badge variant={s.attendanceRate >= 75 ? 'PRESENT' : s.attendanceRate >= 50 ? 'LATE' : 'ABSENT'}>
                            {s.attendanceRate}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StudentAttendance({ studentId }) {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceApi.getByStudent(studentId, { page, limit: 20 })
      .then((res) => {
        setRecords(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const columns = [
    { key: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'class', label: 'Class', render: (row) => `${row.class?.name} - ${row.class?.section || ''}` },
    { key: 'subject', label: 'Subject', render: (row) => row.class?.subject?.name || '-' },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status}>{row.status}</Badge> },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Attendance</h1>
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <>
          <DataTable columns={columns} data={records} />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
