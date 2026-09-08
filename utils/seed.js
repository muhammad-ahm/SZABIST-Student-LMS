import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import pool from '../config/db.js';

dotenv.config();

async function seed() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const studentResult = await pool.query(
    `INSERT INTO students (full_name, email, password_hash, roll_no, program, section)
     VALUES ('Muhammad Huzaifa Imran', 'huzaifa.demo@szabist.pk', $1, '2412115', 'Computer Science', '4A')
     RETURNING id`,
    [passwordHash]
  );
  const studentId = studentResult.rows[0].id;

  const facultyResult = await pool.query(
    `INSERT INTO faculty (full_name, title, department, email, office)
     VALUES
     ('Syed Muhammad Hassan', 'Senior Lecturer', 'Computer Science', 'smhassan@szabist.pk', 'Room 601'),
     ('Owais Moccasi', 'Program Manager', 'Computer Science', 'omoccasi@szabist.pk', 'Room 401'),
     ('Faiza Jameel', 'Lecturer', 'Computer Science', 'fjameel@szabist.pk', 'Room 308')
     RETURNING id`
  );
  const [faculty1, faculty2] = facultyResult.rows;

  const coursesResult = await pool.query(
    `INSERT INTO courses (course_code, title, description, learning_objectives, credit_hours, faculty_id, semester_label)
     VALUES
     ('CSC3301', 'Data Structures And Algorithm',
      'This course covers efficient data organization and processing algorithms, teaching students to build and analyze scalable software structures.',
      'Understand and implement fundamental data structures.',
      3, $1, 'Fall Semester 2025'),
     ('CSC3302', 'Web Development',
      'Covers front-end and back-end web development fundamentals.',
      'Build full-stack web applications.',
      3, $2, 'Fall Semester 2025')
     RETURNING id`,
    [faculty1.id, faculty2.id]
  );
  const [course1, course2] = coursesResult.rows;

  await pool.query(
    `INSERT INTO enrollments (student_id, course_id, attendance_pct, current_grade)
     VALUES ($1, $2, 84, 'A-'), ($1, $3, 90, 'A')`,
    [studentId, course1.id, course2.id]
  );

  await pool.query(
    `INSERT INTO schedule_slots (course_id, day_of_week, session_type, start_time, end_time, room)
     VALUES
     ($1, 'Monday', 'Lecture', '10:00', '11:30', 'Room 305'),
     ($2, 'Monday', 'Lecture', '13:00', '14:30', 'CS Lab 4'),
     ($1, 'Tuesday', 'Lab', '10:00', '11:30', 'Room 305'),
     ($2, 'Tuesday', 'Lab', '13:00', '14:30', 'CS Lab 4')`,
    [course1.id, course2.id]
  );

  await pool.query(
    `INSERT INTO gpa_records (student_id, semester_label, semester_gpa, cumulative_gpa)
     VALUES ($1, 'Fall 2025', 3.85, 3.80)`,
    [studentId]
  );

  await pool.query(
    `INSERT INTO fee_records (student_id, fee_type, amount_due, amount_paid, due_date, status)
     VALUES
     ($1, 'Tuition Fee', 35000, 30000, '2025-12-30', 'pending'),
     ($1, 'Library Fee', 1000, 0, '2025-12-15', 'pending')`,
    [studentId]
  );

  await pool.query(
    `INSERT INTO notices (title, body, category)
     VALUES
     ('Classes moved online this Monday', 'Due to weather conditions.', 'Classes'),
     ('HCI and CC Theory quiz rescheduled', 'New date to be announced.', 'Exams')`
  );

  await pool.query(
    `INSERT INTO events (title, description, event_date, location)
     VALUES ('CS+ Hangout', 'Casual networking event for CS students.', '2025-12-22', 'SZABIST Auditorium')`
  );

  console.log('Seed complete.');
  console.log('Test login -> email: huzaifa.demo@szabist.pk, password: password123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
