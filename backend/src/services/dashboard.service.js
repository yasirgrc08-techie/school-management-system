const prisma = require('../config/database');

class DashboardService {
  async getAdminStats() {
    const [totalStudents, totalTeachers, totalClasses, totalSubjects, recentAttendance] =
      await Promise.all([
        prisma.user.count({ where: { role: 'STUDENT', active: true } }),
        prisma.user.count({ where: { role: 'TEACHER', active: true } }),
        prisma.class.count(),
        prisma.subject.count(),
        prisma.attendance.groupBy({
          by: ['status'],
          _count: true,
          where: {
            date: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) },
          },
        }),
      ]);

    const attendanceSummary = { present: 0, absent: 0, late: 0 };
    recentAttendance.forEach((r) => {
      attendanceSummary[r.status.toLowerCase()] = r._count;
    });
    const totalAttendance = attendanceSummary.present + attendanceSummary.absent + attendanceSummary.late;
    attendanceSummary.rate = totalAttendance > 0
      ? Math.round(((attendanceSummary.present + attendanceSummary.late) / totalAttendance) * 100)
      : 0;

    return { totalStudents, totalTeachers, totalClasses, totalSubjects, attendanceSummary };
  }

  async getTeacherStats(teacherId) {
    const classes = await prisma.class.findMany({
      where: { teacherId },
      include: {
        subject: true,
        _count: { select: { enrollments: true } },
      },
    });

    const totalStudents = classes.reduce((sum, c) => sum + c._count.enrollments, 0);

    const classIds = classes.map((c) => c.id);
    const recentAttendance = await prisma.attendance.groupBy({
      by: ['status'],
      _count: true,
      where: {
        classId: { in: classIds },
        date: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) },
      },
    });

    const attendanceSummary = { present: 0, absent: 0, late: 0 };
    recentAttendance.forEach((r) => {
      attendanceSummary[r.status.toLowerCase()] = r._count;
    });
    const totalAttendance = attendanceSummary.present + attendanceSummary.absent + attendanceSummary.late;
    attendanceSummary.rate = totalAttendance > 0
      ? Math.round(((attendanceSummary.present + attendanceSummary.late) / totalAttendance) * 100)
      : 0;

    return {
      totalClasses: classes.length,
      totalStudents,
      classes,
      attendanceSummary,
    };
  }

  async getStudentStats(studentId) {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        class: {
          include: {
            subject: true,
            teacher: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    const attendance = await prisma.attendance.groupBy({
      by: ['status'],
      _count: true,
      where: { studentId },
    });

    const attendanceSummary = { present: 0, absent: 0, late: 0 };
    attendance.forEach((r) => {
      attendanceSummary[r.status.toLowerCase()] = r._count;
    });
    const totalAttendance = attendanceSummary.present + attendanceSummary.absent + attendanceSummary.late;
    attendanceSummary.rate = totalAttendance > 0
      ? Math.round(((attendanceSummary.present + attendanceSummary.late) / totalAttendance) * 100)
      : 0;

    return {
      totalClasses: enrollments.length,
      classes: enrollments.map((e) => e.class),
      attendanceSummary,
    };
  }
}

module.exports = new DashboardService();
