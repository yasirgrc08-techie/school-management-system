const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.attendance.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('password123', 10);

  // Create Admin users (2)
  const admins = await Promise.all(
    [
      { email: 'admin@school.com', firstName: 'Yasir', lastName: 'Sharfi' },
      { email: 'admin2@school.com', firstName: 'Priyank', lastName: 'Vyas' },
    ].map((u) =>
      prisma.user.create({ data: { ...u, password, role: 'ADMIN' } })
    )
  );
  console.log(`✅ Created ${admins.length} admins`);

  // Create Teacher users (8)
  const teacherData = [
    { email: 'teacher1@school.com', firstName: 'Priyanka', lastName: 'Vyas' },
    { email: 'teacher2@school.com', firstName: 'Anjali', lastName: 'Verma' },
    { email: 'teacher3@school.com', firstName: 'Suresh', lastName: 'Patel' },
    { email: 'teacher4@school.com', firstName: 'Deepika', lastName: 'Nair' },
    { email: 'teacher5@school.com', firstName: 'Vikram', lastName: 'Singh' },
    { email: 'teacher6@school.com', firstName: 'Kavita', lastName: 'Joshi' },
    { email: 'teacher7@school.com', firstName: 'Rajesh', lastName: 'Gupta' },
    { email: 'teacher8@school.com', firstName: 'Sunita', lastName: 'Reddy' },
  ];
  const teachers = await Promise.all(
    teacherData.map((u) =>
      prisma.user.create({ data: { ...u, password, role: 'TEACHER' } })
    )
  );
  console.log(`✅ Created ${teachers.length} teachers`);

  // Create Student users (40)
  const firstNames = ['Aarav', 'Aditi', 'Arjun', 'Ananya', 'Bhavesh', 'Chetna', 'Darshan', 'Diya', 'Eshan', 'Fatima',
    'Gaurav', 'Harini', 'Ishaan', 'Jhanvi', 'Karan', 'Lavanya', 'Manish', 'Neha', 'Om', 'Pooja',
    'Rishi', 'Sakshi', 'Tanmay', 'Uma', 'Varun', 'Wafa', 'Yash', 'Zoya', 'Aditya', 'Bhumi',
    'Chirag', 'Divya', 'Farhan', 'Gauri', 'Harsh', 'Isha', 'Kunal', 'Meera', 'Nikhil', 'Priya'];
  const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Verma', 'Jain', 'Reddy', 'Nair', 'Pillai',
    'Iyer', 'Bhat', 'Desai', 'Rao', 'Mishra', 'Chauhan', 'Pandey', 'Saxena', 'Agarwal', 'Tiwari',
    'Kulkarni', 'Joshi', 'Menon', 'Kapoor', 'Malhotra', 'Chowdhury', 'Banerjee', 'Mukherjee', 'Das', 'Bose',
    'Sinha', 'Rajan', 'Thakur', 'Chopra', 'Dhawan', 'Kohli', 'Sethi', 'Anand', 'Bajaj', 'Shetty'];

  const students = await Promise.all(
    firstNames.map((fn, i) =>
      prisma.user.create({
        data: {
          email: `student${i + 1}@school.com`,
          firstName: fn,
          lastName: lastNames[i],
          password,
          role: 'STUDENT',
        },
      })
    )
  );
  console.log(`✅ Created ${students.length} students`);

  // Create Subjects (8)
  const subjectsData = [
    { name: 'Mathematics', code: 'MATH101' },
    { name: 'Physics', code: 'PHY101' },
    { name: 'Chemistry', code: 'CHEM101' },
    { name: 'Biology', code: 'BIO101' },
    { name: 'English Literature', code: 'ENG101' },
    { name: 'Computer Science', code: 'CS101' },
    { name: 'History', code: 'HIST101' },
    { name: 'Geography', code: 'GEO101' },
  ];
  const subjects = await Promise.all(
    subjectsData.map((s) => prisma.subject.create({ data: s }))
  );
  console.log(`✅ Created ${subjects.length} subjects`);

  // Create Classes (8, one per subject-teacher pair)
  const classesData = [
    { name: 'Grade 10', section: 'A', teacherId: teachers[0].id, subjectId: subjects[0].id, schedule: 'Mon/Wed/Fri 9:00-10:00' },
    { name: 'Grade 10', section: 'B', teacherId: teachers[1].id, subjectId: subjects[1].id, schedule: 'Mon/Wed/Fri 10:00-11:00' },
    { name: 'Grade 11', section: 'A', teacherId: teachers[2].id, subjectId: subjects[2].id, schedule: 'Tue/Thu 9:00-10:30' },
    { name: 'Grade 11', section: 'B', teacherId: teachers[3].id, subjectId: subjects[3].id, schedule: 'Tue/Thu 10:30-12:00' },
    { name: 'Grade 12', section: 'A', teacherId: teachers[4].id, subjectId: subjects[4].id, schedule: 'Mon/Wed 11:00-12:30' },
    { name: 'Grade 12', section: 'B', teacherId: teachers[5].id, subjectId: subjects[5].id, schedule: 'Mon/Wed 14:00-15:30' },
    { name: 'Grade 10', section: 'C', teacherId: teachers[6].id, subjectId: subjects[6].id, schedule: 'Tue/Thu 14:00-15:30' },
    { name: 'Grade 11', section: 'C', teacherId: teachers[7].id, subjectId: subjects[7].id, schedule: 'Fri 11:00-13:00' },
  ];
  const classes = await Promise.all(
    classesData.map((c) => prisma.class.create({ data: c }))
  );
  console.log(`✅ Created ${classes.length} classes`);

  // Enroll students in classes (each student in 3-4 classes)
  const enrollments = [];
  students.forEach((student, i) => {
    const classIndices = [];
    // Each student gets 3-4 classes based on index
    for (let j = 0; j < 4; j++) {
      classIndices.push((i + j) % classes.length);
    }
    // Remove one to make some students have only 3 classes
    if (i % 3 === 0) classIndices.pop();

    const uniqueIndices = [...new Set(classIndices)];
    uniqueIndices.forEach((ci) => {
      enrollments.push({ studentId: student.id, classId: classes[ci].id });
    });
  });

  await Promise.all(
    enrollments.map((e) => prisma.enrollment.create({ data: e }))
  );
  console.log(`✅ Created ${enrollments.length} enrollments`);

  // Create attendance records (last 30 days)
  const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE']; // weighted towards PRESENT
  const attendanceRecords = [];
  const today = new Date();

  for (let dayOffset = 1; dayOffset <= 20; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    for (const cls of classes) {
      const classEnrollments = enrollments.filter((e) => e.classId === cls.id);
      for (const enrollment of classEnrollments) {
        attendanceRecords.push({
          studentId: enrollment.studentId,
          classId: cls.id,
          date,
          status: statuses[Math.floor(Math.random() * statuses.length)],
        });
      }
    }
  }

  // Batch create attendance in chunks of 100
  for (let i = 0; i < attendanceRecords.length; i += 100) {
    const chunk = attendanceRecords.slice(i, i + 100);
    await prisma.attendance.createMany({ data: chunk });
  }
  console.log(`✅ Created ${attendanceRecords.length} attendance records`);

  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Login credentials (all passwords: password123):');
  console.log('   Admin:   admin@school.com');
  console.log('   Teacher: teacher1@school.com');
  console.log('   Student: student1@school.com');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
