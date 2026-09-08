CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE students (
    id              SERIAL PRIMARY KEY,
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    roll_no         VARCHAR(30) UNIQUE NOT NULL,
    program         VARCHAR(100) NOT NULL,
    section         VARCHAR(20),
    phone           VARCHAR(20),
    address         TEXT,
    date_of_birth   DATE,
    blood_group     VARCHAR(5),
    profile_photo_url TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE otp_verifications (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER REFERENCES students(id) ON DELETE CASCADE,
    otp_code        VARCHAR(6) NOT NULL,
    purpose         VARCHAR(30) NOT NULL,
    expires_at      TIMESTAMP NOT NULL,
    is_used         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE faculty (
    id              SERIAL PRIMARY KEY,
    full_name       VARCHAR(150) NOT NULL,
    title           VARCHAR(100),
    department      VARCHAR(100),
    email           VARCHAR(150),
    office          VARCHAR(100),
    photo_url       TEXT
);

CREATE TABLE courses (
    id              SERIAL PRIMARY KEY,
    course_code     VARCHAR(20) UNIQUE NOT NULL,
    title           VARCHAR(150) NOT NULL,
    description     TEXT,
    learning_objectives TEXT,
    credit_hours    INTEGER NOT NULL DEFAULT 3,
    faculty_id      INTEGER REFERENCES faculty(id),
    semester_label  VARCHAR(30)
);

CREATE TABLE enrollments (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER REFERENCES students(id) ON DELETE CASCADE,
    course_id       INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    attendance_pct  NUMERIC(5,2) DEFAULT 0,
    current_grade   VARCHAR(5),
    UNIQUE(student_id, course_id)
);

CREATE TABLE schedule_slots (
    id              SERIAL PRIMARY KEY,
    course_id       INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    day_of_week     VARCHAR(10) NOT NULL,
    session_type    VARCHAR(20) NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    room            VARCHAR(50)
);

CREATE TABLE gpa_records (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER REFERENCES students(id) ON DELETE CASCADE,
    semester_label  VARCHAR(30) NOT NULL,
    semester_gpa    NUMERIC(3,2) NOT NULL,
    cumulative_gpa  NUMERIC(3,2) NOT NULL,
    recorded_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE fee_records (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER REFERENCES students(id) ON DELETE CASCADE,
    fee_type        VARCHAR(50) NOT NULL,
    amount_due      NUMERIC(10,2) NOT NULL,
    amount_paid     NUMERIC(10,2) DEFAULT 0,
    due_date        DATE,
    status          VARCHAR(20) DEFAULT 'pending',
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE events (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(150) NOT NULL,
    description     TEXT,
    event_date      DATE NOT NULL,
    start_time      TIME,
    location        VARCHAR(150),
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notices (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    body            TEXT,
    category        VARCHAR(50),
    posted_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE campus_buildings (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    map_x           NUMERIC(6,2),
    map_y           NUMERIC(6,2)
);

CREATE TABLE web_pairing_sessions (
    session_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status          VARCHAR(20) DEFAULT 'pending',
    student_id      INTEGER REFERENCES students(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT NOW(),
    expires_at      TIMESTAMP NOT NULL
);

CREATE TABLE student_settings (
    student_id      INTEGER PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
    push_notifications BOOLEAN DEFAULT TRUE,
    class_reminders    BOOLEAN DEFAULT TRUE,
    assignment_deadline_alerts BOOLEAN DEFAULT TRUE,
    fee_payment_alerts BOOLEAN DEFAULT TRUE,
    theme_preference   VARCHAR(20) DEFAULT 'light'
);
