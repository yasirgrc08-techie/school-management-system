const prisma = require('../config/database');

class AttendanceService {
  async markAttendance(classId, date, records) {
    const attendanceDate = new Date(date);
    const data = records.map((r) => ({
      classId,
      studentId: r.studentId,
      date: attendanceDate,
      status: r.status,
    }));

    // Upsert each record
    const results = await Promise.all(
      data.map((record) =>
        prisma.attendance.upsert({
          where: {
            studentId_classId_date: {
              studentId: record.studentId,
              classId: record.classId,
              date: record.date,
            },
          },
          update: { status: record.status },
          create: record,
        })
      )
    );

    return results;
  }

  async getByClass(classId, { page = 1, limit = 10, date, startDate, endDate }) {
    const where = { classId };
    if (date) {
      where.date = new Date(date);
    } else if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) };
    }

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          student: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ date: 'desc' }, { student: { lastName: 'asc' } }],
      }),
      prisma.attendance.count({ where }),
    ]);

    return {
      data: records,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getByStudent(studentId, { page = 1, limit = 10 }) {
    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where: { studentId },
        include: {
          class: { include: { subject: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.attendance.count({ where: { studentId } }),
    ]);

    return {
      data: records,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSummary(classId, startDate, endDate) {
    const where = { classId };
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) };
    }

    const records = await prisma.attendance.findMany({
      where,
      include: { student: { select: { id: true, firstName: true, lastName: true } } },
    });

    const summary = {};
    records.forEach((r) => {
      if (!summary[r.studentId]) {
        summary[r.studentId] = {
          student: r.student,
          present: 0,
          absent: 0,
          late: 0,
          total: 0,
        };
      }
      summary[r.studentId][r.status.toLowerCase()]++;
      summary[r.studentId].total++;
    });

    return Object.values(summary).map((s) => ({
      ...s,
      attendanceRate: s.total > 0 ? Math.round(((s.present + s.late) / s.total) * 100) : 0,
    }));
  }
}

module.exports = new AttendanceService();
