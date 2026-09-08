import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

function signToken(studentId) {
  return jwt.sign({ studentId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM students WHERE email = $1', [email]);
    const student = result.rows[0];

    if (!student) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, student.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(student.id);

    res.json({
      token,
      student: {
        id: student.id,
        fullName: student.full_name,
        email: student.email,
        rollNo: student.roll_no,
        program: student.program,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
}

export async function requestPasswordReset(req, res) {
  const { email } = req.body;

  try {
    const result = await pool.query('SELECT id FROM students WHERE email = $1', [email]);
    const student = result.rows[0];

    if (!student) {
      return res.json({ message: 'If that account exists, an OTP has been sent.' });
    }

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      `INSERT INTO otp_verifications (student_id, otp_code, purpose, expires_at)
       VALUES ($1, $2, 'password_reset', $3)`,
      [student.id, otpCode, expiresAt]
    );

    console.log(`[DEV ONLY] OTP for ${email}: ${otpCode}`);

    res.json({ message: 'If that account exists, an OTP has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error requesting password reset' });
  }
}

export async function verifyOtp(req, res) {
  const { email, otp } = req.body;

  try {
    const studentResult = await pool.query('SELECT id FROM students WHERE email = $1', [email]);
    const student = studentResult.rows[0];
    if (!student) return res.status(400).json({ error: 'Invalid request' });

    const otpResult = await pool.query(
      `SELECT * FROM otp_verifications
       WHERE student_id = $1 AND otp_code = $2 AND purpose = 'password_reset'
       AND is_used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [student.id, otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await pool.query('UPDATE otp_verifications SET is_used = TRUE WHERE id = $1', [otpResult.rows[0].id]);

    const resetToken = jwt.sign(
      { studentId: student.id, purpose: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.json({ resetToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error verifying OTP' });
  }
}

export async function resetPassword(req, res) {
  const { resetToken, newPassword } = req.body;

  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE students SET password_hash = $1 WHERE id = $2', [
      passwordHash,
      decoded.studentId,
    ]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid or expired reset token' });
  }
}

export async function getCurrentStudent(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, roll_no, program, section, phone, address,
              date_of_birth, blood_group, profile_photo_url
       FROM students WHERE id = $1`,
      [req.studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
}
