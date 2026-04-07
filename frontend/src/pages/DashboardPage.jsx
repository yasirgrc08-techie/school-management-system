import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api/endpoints';
import { StatCard, Badge } from '../components/ui';
import { Users, GraduationCap, BookOpen, ClipboardList, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!stats) return <div className="text-gray-500">Failed to load dashboard data.</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here's what's happening in your school today.
        </p>
      </div>

      {user.role === 'ADMIN' && <AdminDashboard stats={stats} />}
      {user.role === 'TEACHER' && <TeacherDashboard stats={stats} />}
      {user.role === 'STUDENT' && <StudentDashboard stats={stats} />}
    </div>
  );
}

function AdminDashboard({ stats }) {
  const attendanceData = [
    { name: 'Present', value: stats.attendanceSummary.present, color: '#22c55e' },
    { name: 'Absent', value: stats.attendanceSummary.absent, color: '#ef4444' },
    { name: 'Late', value: stats.attendanceSummary.late, color: '#f59e0b' },
  ].filter((d) => d.value > 0);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="indigo" />
        <StatCard title="Total Teachers" value={stats.totalTeachers} icon={GraduationCap} color="green" />
        <StatCard title="Total Classes" value={stats.totalClasses} icon={BookOpen} color="blue" />
        <StatCard title="Total Subjects" value={stats.totalSubjects} icon={ClipboardList} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview (Last 30 Days)</h3>
          <div className="flex items-center justify-center">
            {attendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={attendanceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {attendanceData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 py-12">No attendance data yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-700">Attendance Rate</span>
              <span className="text-2xl font-bold text-green-700">{stats.attendanceSummary.rate}%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
              <span className="text-sm font-medium text-indigo-700">Students per Class (avg)</span>
              <span className="text-2xl font-bold text-indigo-700">
                {stats.totalClasses > 0 ? Math.round(stats.totalStudents / stats.totalClasses) : 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
              <span className="text-sm font-medium text-amber-700">Teacher to Student Ratio</span>
              <span className="text-2xl font-bold text-amber-700">
                1:{stats.totalTeachers > 0 ? Math.round(stats.totalStudents / stats.totalTeachers) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TeacherDashboard({ stats }) {
  const classData = stats.classes?.map((c) => ({
    name: `${c.name} ${c.section}`,
    students: c._count?.enrollments || 0,
  })) || [];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard title="My Classes" value={stats.totalClasses} icon={BookOpen} color="blue" />
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="indigo" />
        <StatCard title="Attendance Rate" value={`${stats.attendanceSummary.rate}%`} icon={TrendingUp} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Students per Class</h3>
          {classData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={classData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 py-12 text-center">No class data</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Classes</h3>
          <div className="space-y-3">
            {stats.classes?.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{c.name} - {c.section}</p>
                  <p className="text-sm text-gray-500">{c.subject?.name}</p>
                </div>
                <Badge variant="TEACHER">{c._count?.enrollments || 0} students</Badge>
              </div>
            )) || <p className="text-gray-400">No classes assigned</p>}
          </div>
        </div>
      </div>
    </>
  );
}

function StudentDashboard({ stats }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard title="Enrolled Classes" value={stats.totalClasses} icon={BookOpen} color="blue" />
        <StatCard title="Attendance Rate" value={`${stats.attendanceSummary.rate}%`} icon={TrendingUp} color="green" />
        <StatCard title="Classes Attended" value={stats.attendanceSummary.present + stats.attendanceSummary.late} icon={ClipboardList} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Classes</h3>
          <div className="space-y-3">
            {stats.classes?.map((c) => (
              <div key={c.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{c.name} - {c.section}</p>
                    <p className="text-sm text-gray-500">{c.subject?.name}</p>
                  </div>
                  {c.schedule && <p className="text-xs text-gray-400">{c.schedule}</p>}
                </div>
                {c.teacher && (
                  <p className="text-sm text-gray-500 mt-2">
                    Teacher: {c.teacher.firstName} {c.teacher.lastName}
                  </p>
                )}
              </div>
            )) || <p className="text-gray-400">Not enrolled in any classes</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-700">Present</span>
              <span className="text-xl font-bold text-green-700">{stats.attendanceSummary.present}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
              <span className="text-sm font-medium text-amber-700">Late</span>
              <span className="text-xl font-bold text-amber-700">{stats.attendanceSummary.late}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-red-700">Absent</span>
              <span className="text-xl font-bold text-red-700">{stats.attendanceSummary.absent}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
