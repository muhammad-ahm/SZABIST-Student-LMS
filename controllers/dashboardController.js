import pool from '../config/db.js';

export async function getDashboard(req, res) {
  try {
    const studentId = req.studentId;

    const studentResult = await pool.query(
      'SELECT full_name, program FROM students WHERE id = $1',
      [studentId]
    );

    const noticesResult = await pool.query(
      'SELECT id, title, category, posted_at FROM notices ORDER BY posted_at DESC LIMIT 5'
    );

    const todayScheduleResult = await pool.query(
      `SELECT s.day_of_week, s.session_type, s.start_time, s.end_time, s.room,
              c.title AS course_title, c.course_code
       FROM schedule_slots s
       JOIN courses c ON c.id = s.course_id
       JOIN enrollments e ON e.course_id = c.id
       WHERE e.student_id = $1
       AND s.day_of_week = TO_CHAR(NOW(), 'FMDay')
       ORDER BY s.start_time`,
      [studentId]
    );

    res.json({
      student: studentResult.rows[0] || null,
      notices: noticesResult.rows,
      todaySchedule: todayScheduleResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching dashboard' });
  }
}
