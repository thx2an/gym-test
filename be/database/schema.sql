USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'GymManagement')
BEGIN
    CREATE DATABASE GymManagement;
END
GO

USE GymManagement;
GO

-- 4.3.1 users
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY IDENTITY(1,1),
    full_name NVARCHAR(150) NOT NULL,
    email NVARCHAR(150) NOT NULL UNIQUE,
    phone NVARCHAR(20) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    gender NVARCHAR(20) NULL,
    date_of_birth DATE NULL,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'locked')),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- 4.3.2 roles
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'roles')
CREATE TABLE roles (
    role_id INT PRIMARY KEY IDENTITY(1,1),
    code NVARCHAR(50) NOT NULL UNIQUE,
    name NVARCHAR(100) NOT NULL
);
GO

-- 4.3.3 user_roles
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_roles')
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);
GO

-- 4.3.4 branches
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'branches')
CREATE TABLE branches (
    branch_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(150) NOT NULL,
    address NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- 4.3.5 membership_packages
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'membership_packages')
CREATE TABLE membership_packages (
    package_id INT PRIMARY KEY IDENTITY(1,1),
    code NVARCHAR(50) NOT NULL UNIQUE,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX) NULL,
    duration_days INT NOT NULL,
    price DECIMAL(18, 2) NOT NULL,
    benefits NVARCHAR(MAX) NULL,
    is_active BIT NOT NULL DEFAULT 1
);
GO

-- 4.3.6 memberships
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'memberships')
CREATE TABLE memberships (
    membership_id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id BIGINT NOT NULL,
    package_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('pending', 'active', 'expired', 'canceled')),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (package_id) REFERENCES membership_packages(package_id)
);
GO

-- 4.3.7 user_branch
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_branch')
CREATE TABLE user_branch (
    user_id BIGINT NOT NULL,
    branch_id INT NOT NULL,
    primary_flag INT DEFAULT 0 NULL, -- "True" in doc usually means nullable, but description implies regex/logic. Assuming standard column.
    PRIMARY KEY (user_id, branch_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);
GO

-- 4.3.8 trainer_profiles
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'trainer_profiles')
CREATE TABLE trainer_profiles (
    trainer_id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id BIGINT NOT NULL UNIQUE,
    specialization NVARCHAR(200) NULL,
    bio NVARCHAR(MAX) NULL,
    experience_years INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
GO

-- 4.3.9 trainer_availability
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'trainer_availability')
CREATE TABLE trainer_availability (
    availability_id BIGINT PRIMARY KEY IDENTITY(1,1),
    trainer_id BIGINT NOT NULL,
    branch_id INT NOT NULL,
    date DATE NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BIT NOT NULL DEFAULT 0,
    day_of_week TINYINT NULL,
    is_blocked BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (trainer_id) REFERENCES trainer_profiles(trainer_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);
GO

-- 4.3.10 training_sessions
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'training_sessions')
CREATE TABLE training_sessions (
    session_id BIGINT PRIMARY KEY IDENTITY(1,1),
    member_id BIGINT NOT NULL,
    trainer_id BIGINT NOT NULL,
    branch_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('pending', 'confirmed', 'canceled', 'completed')),
    notes NVARCHAR(MAX) NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (member_id) REFERENCES users(user_id),
    FOREIGN KEY (trainer_id) REFERENCES trainer_profiles(trainer_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);
GO

-- 4.3.11 session_notes
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'session_notes')
CREATE TABLE session_notes (
    note_id BIGINT PRIMARY KEY IDENTITY(1,1),
    session_id BIGINT NOT NULL,
    trainer_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    notes NVARCHAR(MAX) NULL,
    metrics_json NVARCHAR(MAX) NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (session_id) REFERENCES training_sessions(session_id),
    FOREIGN KEY (trainer_id) REFERENCES trainer_profiles(trainer_id),
    FOREIGN KEY (member_id) REFERENCES users(user_id)
);
GO

-- 4.3.12 session_qr_tokens
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'session_qr_tokens')
CREATE TABLE session_qr_tokens (
    qr_id BIGINT PRIMARY KEY IDENTITY(1,1),
    session_id BIGINT NOT NULL,
    token NVARCHAR(255) NOT NULL UNIQUE,
    generated_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (session_id) REFERENCES training_sessions(session_id)
);
GO

-- 4.3.13 checkins
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'checkins')
CREATE TABLE checkins (
    checkin_id BIGINT PRIMARY KEY IDENTITY(1,1),
    session_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    scanned_at DATETIME NOT NULL DEFAULT GETDATE(),
    is_valid BIT NULL,
    FOREIGN KEY (session_id) REFERENCES training_sessions(session_id),
    FOREIGN KEY (member_id) REFERENCES users(user_id)
);
GO

-- 4.3.14 payments
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'payments')
CREATE TABLE payments (
    payment_id BIGINT PRIMARY KEY IDENTITY(1,1),
    member_id BIGINT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    currency NVARCHAR(10) NOT NULL,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    method NVARCHAR(50) NULL,
    gateway NVARCHAR(50) NULL,
    gateway_transaction_id NVARCHAR(255) NOT NULL,
    membership_id BIGINT NULL, -- Made nullable as it might be session payment
    session_id BIGINT NULL,    -- Made nullable as it might be membership payment
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (member_id) REFERENCES users(user_id),
    FOREIGN KEY (membership_id) REFERENCES memberships(membership_id),
    FOREIGN KEY (session_id) REFERENCES training_sessions(session_id)
);
GO

-- 4.3.15 invoices
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'invoices')
CREATE TABLE invoices (
    invoice_id BIGINT PRIMARY KEY IDENTITY(1,1),
    payment_id BIGINT NOT NULL,
    invoice_number NVARCHAR(100) NOT NULL UNIQUE,
    issued_at DATETIME NOT NULL,
    total_amount DECIMAL(18, 2) NOT NULL,
    file_path NVARCHAR(255) NULL,
    FOREIGN KEY (payment_id) REFERENCES payments(payment_id)
);
GO

-- 4.3.16 refund_requests
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'refund_requests')
CREATE TABLE refund_requests (
    refund_id BIGINT PRIMARY KEY IDENTITY(1,1),
    payment_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    reason NVARCHAR(MAX) NOT NULL,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
    requested_at DATETIME NOT NULL DEFAULT GETDATE(),
    processed_by BIGINT NULL, -- Null if not picked up yet
    processed_at DATETIME NULL, -- Null if not processed
    FOREIGN KEY (payment_id) REFERENCES payments(payment_id),
    FOREIGN KEY (member_id) REFERENCES users(user_id),
    FOREIGN KEY (processed_by) REFERENCES users(user_id)
);
GO

-- 4.3.17 progress_records
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'progress_records')
CREATE TABLE progress_records (
    record_id BIGINT PRIMARY KEY IDENTITY(1,1),
    member_id BIGINT NOT NULL,
    record_date DATE NOT NULL,
    metric_type NVARCHAR(50) NOT NULL,
    value FLOAT NOT NULL,
    unit NVARCHAR(20) NULL,
    source NVARCHAR(50) NOT NULL,
    created_by BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (member_id) REFERENCES users(user_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);
GO

-- 4.3.18 ai_workout_plans
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ai_workout_plans')
CREATE TABLE ai_workout_plans (
    plan_id BIGINT PRIMARY KEY IDENTITY(1,1),
    member_id BIGINT NOT NULL,
    goal NVARCHAR(255) NULL,
    duration_weeks INT NULL,
    plan_json NVARCHAR(MAX) NULL,
    source NVARCHAR(20) NOT NULL CHECK (source IN ('ai', 'pt')),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    created_by BIGINT NULL,
    FOREIGN KEY (member_id) REFERENCES users(user_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);
GO

-- 4.3.19 ai_nutrition_plans
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ai_nutrition_plans')
CREATE TABLE ai_nutrition_plans (
    nutrition_id BIGINT PRIMARY KEY IDENTITY(1,1),
    member_id BIGINT NOT NULL,
    daily_calories INT NULL,
    macro_json NVARCHAR(MAX) NULL,
    plan_json NVARCHAR(MAX) NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    created_by BIGINT NULL,
    FOREIGN KEY (member_id) REFERENCES users(user_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);
GO

-- 4.3.20 pose_sessions
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pose_sessions')
CREATE TABLE pose_sessions (
    pose_id BIGINT PRIMARY KEY IDENTITY(1,1),
    member_id BIGINT NOT NULL,
    exercise_name NVARCHAR(255) NULL,
    started_at DATETIME NOT NULL,
    ended_at DATETIME NOT NULL,
    result_summary NVARCHAR(MAX) NULL,
    raw_data_ref NVARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (member_id) REFERENCES users(user_id)
);
GO

-- 4.3.21 pose_feedbacks
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pose_feedbacks')
CREATE TABLE pose_feedbacks (
    feedback_id BIGINT PRIMARY KEY IDENTITY(1,1),
    pose_id BIGINT NOT NULL,
    timestamp FLOAT NULL,
    feedback_type NVARCHAR(50) NULL,
    message NVARCHAR(MAX) NULL,
    FOREIGN KEY (pose_id) REFERENCES pose_sessions(pose_id)
);
GO

-- 4.3.22 injury_risk_analyses
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'injury_risk_analyses')
CREATE TABLE injury_risk_analyses (
    analysis_id BIGINT PRIMARY KEY IDENTITY(1,1),
    member_id BIGINT NOT NULL,
    analyzed_at DATETIME NOT NULL,
    risk_level NVARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    score FLOAT NULL,
    factors_json NVARCHAR(MAX) NULL,
    recommendations NVARCHAR(MAX) NULL,
    FOREIGN KEY (member_id) REFERENCES users(user_id)
);
GO

-- 4.3.23 support_tickets
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'support_tickets')
CREATE TABLE support_tickets (
    ticket_id BIGINT PRIMARY KEY IDENTITY(1,1),
    member_id BIGINT NOT NULL,
    subject NVARCHAR(255) NULL,
    category NVARCHAR(100) NULL,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
    priority NVARCHAR(20) NULL CHECK (priority IN ('low', 'medium', 'high')),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    assigned_to BIGINT NULL,
    FOREIGN KEY (member_id) REFERENCES users(user_id),
    FOREIGN KEY (assigned_to) REFERENCES users(user_id)
);
GO

-- 4.3.24 ticket_messages
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ticket_messages')
CREATE TABLE ticket_messages (
    msg_id BIGINT PRIMARY KEY IDENTITY(1,1),
    ticket_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    sender_role NVARCHAR(50) NULL,
    content NVARCHAR(MAX) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(ticket_id),
    FOREIGN KEY (sender_id) REFERENCES users(user_id)
);
GO

-- 4.3.25 chat_sessions
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'chat_sessions')
CREATE TABLE chat_sessions (
    chat_id BIGINT PRIMARY KEY IDENTITY(1,1),
    member_id BIGINT NOT NULL,
    support_staff_id BIGINT NOT NULL,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('open', 'closed', 'member_left')),
    started_at DATETIME NOT NULL DEFAULT GETDATE(),
    ended_at DATETIME NULL,
    FOREIGN KEY (member_id) REFERENCES users(user_id),
    FOREIGN KEY (support_staff_id) REFERENCES users(user_id)
);
GO

-- 4.3.26 chat_messages
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'chat_messages')
CREATE TABLE chat_messages (
    msg_id BIGINT PRIMARY KEY IDENTITY(1,1),
    chat_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    sender_role NVARCHAR(50) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (chat_id) REFERENCES chat_sessions(chat_id),
    FOREIGN KEY (sender_id) REFERENCES users(user_id)
);
GO

-- 4.3.27 knowledge_base_articles
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'knowledge_base_articles')
CREATE TABLE knowledge_base_articles (
    article_id BIGINT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX) NULL,
    category NVARCHAR(100) NULL,
    status NVARCHAR(20) NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
    created_by BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);
GO

-- 4.3.28 reports
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'reports')
CREATE TABLE reports (
    report_id BIGINT PRIMARY KEY IDENTITY(1,1),
    type NVARCHAR(100) NULL,
    parameters_json NVARCHAR(MAX) NULL,
    generated_by BIGINT NOT NULL,
    generated_at DATETIME NOT NULL DEFAULT GETDATE(),
    file_path NVARCHAR(255) NULL,
    FOREIGN KEY (generated_by) REFERENCES users(user_id)
);
GO

-- 4.3.29 audit_logs
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'audit_logs')
CREATE TABLE audit_logs (
    log_id BIGINT PRIMARY KEY IDENTITY(1,1),
    entity_type NVARCHAR(100) NULL,
    entity_id BIGINT NOT NULL,
    action NVARCHAR(100) NOT NULL,
    performed_by BIGINT NOT NULL,
    performed_at DATETIME NOT NULL DEFAULT GETDATE(),
    details NVARCHAR(MAX) NULL,
    FOREIGN KEY (performed_by) REFERENCES users(user_id)
);
GO
