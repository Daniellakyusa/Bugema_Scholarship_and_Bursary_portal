-- ============================================================================
-- Bugema University Scholarship & Bursary Management System
-- MySQL Database Schema
-- Version: 2.0
-- Created: 2024
-- ============================================================================

-- Drop database if exists (use with caution in production)
-- DROP DATABASE IF EXISTS bugema_scholarship;

-- Create database
CREATE DATABASE IF NOT EXISTS bugema_scholarship 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE bugema_scholarship;

-- ============================================================================
-- TABLE: users
-- Description: User authentication and authorization
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role ENUM('admin', 'staff', 'student') NOT NULL DEFAULT 'student',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: students
-- Description: Student profiles and academic information
-- ============================================================================
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NULL,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE NULL,
    gender VARCHAR(20) NULL,
    nationality VARCHAR(100) NULL,
    
    -- Address
    address TEXT NULL,
    city VARCHAR(100) NULL,
    district VARCHAR(100) NULL,
    country VARCHAR(100) DEFAULT 'Uganda',
    
    -- Academic Information
    program VARCHAR(200) NOT NULL,
    year_of_study INT NOT NULL,
    gpa DECIMAL(3,2) DEFAULT 0.00,
    enrollment_date DATE NULL,
    expected_graduation DATE NULL,
    
    -- Registration
    registration_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_by INT NULL,
    approval_date DATETIME NULL,
    
    -- Additional Information
    emergency_contact VARCHAR(200) NULL,
    emergency_phone VARCHAR(20) NULL,
    blood_type VARCHAR(5) NULL,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_student_id (student_id),
    INDEX idx_email (email),
    INDEX idx_registration_status (registration_status),
    INDEX idx_program (program),
    INDEX idx_year_of_study (year_of_study)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: organizations
-- Description: Scholarship and bursary sponsor organizations
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organization_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    contact_person VARCHAR(200) NULL,
    email VARCHAR(120) NULL,
    phone VARCHAR(20) NULL,
    website VARCHAR(200) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Funding Information
    total_funding DECIMAL(15,2) DEFAULT 0.00,
    available_funding DECIMAL(15,2) DEFAULT 0.00,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_organization_id (organization_id),
    INDEX idx_name (name),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: applications
-- Description: Scholarship and bursary applications
-- ============================================================================
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id VARCHAR(100) NOT NULL UNIQUE,
    
    -- Foreign Keys
    student_id INT NOT NULL,
    organization_id INT NOT NULL,
    
    -- Application Details
    category ENUM('scholarship', 'bursary') NOT NULL,
    application_type VARCHAR(50) NULL,
    status ENUM('pending', 'under_review', 'approved', 'rejected', 'withdrawn') NOT NULL DEFAULT 'pending',
    
    -- Financial Information
    amount_requested DECIMAL(15,2) NOT NULL,
    amount_approved DECIMAL(15,2) DEFAULT 0.00,
    household_income DECIMAL(15,2) NULL,
    monthly_expenses DECIMAL(15,2) NULL,
    dependents INT NULL,
    
    -- Application Content
    personal_statement TEXT NOT NULL,
    reason_for_application TEXT NULL,
    
    -- Documents (stored as JSON)
    documents JSON NULL,
    
    -- Academic Information
    current_gpa DECIMAL(3,2) NULL,
    academic_achievements TEXT NULL,
    
    -- Review Information
    reviewed_by INT NULL,
    review_date DATETIME NULL,
    review_comments TEXT NULL,
    eligibility_score DECIMAL(5,2) NULL,
    
    -- Dates
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    approval_date DATETIME NULL,
    rejection_date DATETIME NULL,
    
    -- Additional metadata (stored as JSON)
    metadata JSON NULL,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_application_id (application_id),
    INDEX idx_student_id (student_id),
    INDEX idx_organization_id (organization_id),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_submission_date (submission_date),
    INDEX idx_eligibility_score (eligibility_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: feedback
-- Description: User feedback and support tickets
-- ============================================================================
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(120) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    rating INT NULL CHECK (rating >= 1 AND rating <= 5),
    category VARCHAR(50) NULL,
    status VARCHAR(20) DEFAULT 'pending',
    response TEXT NULL,
    responded_by INT NULL,
    response_date DATETIME NULL,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: audit_logs
-- Description: System audit trail for tracking changes
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    changes JSON NULL,
    ip_address VARCHAR(50) NULL,
    user_agent VARCHAR(200) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity_type (entity_type),
    INDEX idx_entity_id (entity_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: registrations
-- Description: Student registration records
-- ============================================================================
CREATE TABLE IF NOT EXISTS registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_id VARCHAR(50) NOT NULL UNIQUE,
    
    -- Personal Information
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE NULL,
    gender VARCHAR(20) NULL,
    
    -- Address
    street VARCHAR(200) NULL,
    city VARCHAR(100) NULL,
    district VARCHAR(100) NULL,
    
    -- Academic Information
    student_id VARCHAR(50) NOT NULL,
    course VARCHAR(200) NOT NULL,
    program VARCHAR(200) NOT NULL,
    year INT NOT NULL,
    gpa DECIMAL(3,2) NULL,
    
    -- Document
    document VARCHAR(255) NULL,
    
    -- Status
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_date DATETIME NULL,
    approved_by INT NULL,
    rejection_reason TEXT NULL,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_registration_id (registration_id),
    INDEX idx_student_id (student_id),
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SAMPLE DATA INSERTION
-- ============================================================================

-- Insert default admin user
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (username, email, password_hash, full_name, role, is_active) VALUES
('admin', 'admin@bugemauniv.ac.ug', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYqYqYqYq', 'System Administrator', 'admin', TRUE),
('staff1', 'staff@bugemauniv.ac.ug', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYqYqYqYq', 'Staff Member', 'staff', TRUE);

-- Insert sample organizations
INSERT INTO organizations (organization_id, name, description, contact_person, email, phone, total_funding, available_funding, is_active) VALUES
('ORG001', 'PEAS Uganda', 'Promoting Equality in African Schools - Supporting education across Uganda', 'John Doe', 'contact@peas.org', '+256 414 290 881', 50000000.00, 30000000.00, TRUE),
('ORG002', 'Lora Foundation', 'Community development and education support foundation', 'Jane Smith', 'info@lorafoundation.org', '+256 414 290 882', 30000000.00, 20000000.00, TRUE),
('ORG003', 'Ssanyu Babies Home', 'Child welfare and education support organization', 'Mary Johnson', 'contact@ssanyu.org', '+256 414 290 883', 20000000.00, 15000000.00, TRUE),
('ORG004', 'Holy Cross Foundation', 'Religious studies and general education support', 'Peter Williams', 'info@holycross.org', '+256 414 290 884', 25000000.00, 18000000.00, TRUE),
('ORG005', 'Bugema University Internal Fund', 'University internal scholarship and bursary fund', 'Dr. Sarah Namukasa', 'scholarships@bugemauniv.ac.ug', '+256 414 290 885', 100000000.00, 75000000.00, TRUE);

-- Insert sample students
INSERT INTO students (student_id, first_name, last_name, email, phone, date_of_birth, gender, nationality, address, city, district, country, program, year_of_study, gpa, registration_status, emergency_contact, emergency_phone, blood_type) VALUES
('STU-2024-001', 'John', 'Smith', 'john.smith@student.bugemauniv.ac.ug', '700123456', '2000-01-15', 'Male', 'Ugandan', 'Plot 123, Kampala Road', 'Kampala', 'Kampala', 'Uganda', 'Computer Science', 3, 3.80, 'approved', 'Mary Smith', '700123457', 'O+'),
('STU-2024-002', 'Jane', 'Doe', 'jane.doe@student.bugemauniv.ac.ug', '700234567', '2001-03-20', 'Female', 'Ugandan', 'Plot 456, Entebbe Road', 'Entebbe', 'Wakiso', 'Uganda', 'Business Administration', 2, 3.50, 'approved', 'John Doe', '700234568', 'A+'),
('STU-2024-003', 'David', 'Kimani', 'david.kimani@student.bugemauniv.ac.ug', '700345678', '1999-07-10', 'Male', 'Kenyan', 'Plot 789, Jinja Road', 'Jinja', 'Jinja', 'Uganda', 'Engineering', 4, 3.90, 'approved', 'Sarah Kimani', '700345679', 'B+'),
('STU-2024-004', 'Mary', 'Johnson', 'mary.johnson@student.bugemauniv.ac.ug', '700456789', '2002-05-25', 'Female', 'Ugandan', 'Plot 321, Masaka Road', 'Masaka', 'Masaka', 'Uganda', 'Education', 1, 3.20, 'pending', 'Peter Johnson', '700456790', 'AB+'),
('STU-2024-005', 'Peter', 'Williams', 'peter.williams@student.bugemauniv.ac.ug', '700567890', '2000-11-30', 'Male', 'Ugandan', 'Plot 654, Mbarara Road', 'Mbarara', 'Mbarara', 'Uganda', 'Medicine', 2, 3.70, 'approved', 'Grace Williams', '700567891', 'O-');

-- Insert sample applications
INSERT INTO applications (application_id, student_id, organization_id, category, application_type, status, amount_requested, household_income, personal_statement, current_gpa, submission_date, eligibility_score) VALUES
('BURS-2024-001', 1, 1, 'bursary', 'need_based', 'pending', 1500000.00, 500000.00, 'I am writing to apply for a bursary to support my education at Bugema University. Coming from a low-income family, I face significant financial challenges in meeting my tuition and living expenses. Despite these challenges, I have maintained a strong academic record with a GPA of 3.8. This bursary would enable me to focus on my studies without the constant worry of financial constraints.', 3.80, NOW(), 85.50),
('SCHOL-2024-001', 3, 5, 'scholarship', 'academic', 'approved', 2000000.00, 3000000.00, 'I am honored to apply for an academic scholarship at Bugema University. Throughout my academic journey, I have consistently demonstrated excellence, maintaining a GPA of 3.9. I am passionate about engineering and aspire to contribute to technological advancement in Uganda. This scholarship would allow me to pursue my dreams and give back to the community.', 3.90, DATE_SUB(NOW(), INTERVAL 5 DAY), 92.00),
('BURS-2024-002', 2, 2, 'bursary', 'need_based', 'under_review', 1500000.00, 800000.00, 'I am applying for a bursary to help cover my educational expenses. My family struggles financially, and this support would make a significant difference in my ability to complete my degree in Business Administration. I am committed to my studies and maintaining good academic standing.', 3.50, DATE_SUB(NOW(), INTERVAL 3 DAY), 78.00),
('SCHOL-2024-002', 5, 4, 'scholarship', 'academic', 'pending', 2000000.00, 2500000.00, 'As a medical student with a strong academic record, I am applying for this scholarship to support my education. Medicine is my calling, and I am dedicated to serving the healthcare needs of our community. This scholarship would help me focus on my studies and clinical training.', 3.70, DATE_SUB(NOW(), INTERVAL 1 DAY), 88.00);

-- Insert sample feedback
INSERT INTO feedback (name, email, subject, message, rating, category, status) VALUES
('John Smith', 'john.smith@student.bugemauniv.ac.ug', 'Application Process', 'The application process was smooth and user-friendly. Thank you for making it easy to apply for financial aid.', 5, 'suggestion', 'resolved'),
('Jane Doe', 'jane.doe@student.bugemauniv.ac.ug', 'Website Improvement', 'It would be helpful to have more information about eligibility criteria on the main page.', 4, 'suggestion', 'pending'),
('David Kimani', 'david.kimani@student.bugemauniv.ac.ug', 'Thank You', 'I want to express my gratitude for the scholarship I received. It has made a huge difference in my life.', 5, 'compliment', 'resolved');

-- Insert sample registrations
INSERT INTO registrations (registration_id, full_name, email, phone, date_of_birth, gender, street, city, district, student_id, course, program, year, gpa, status) VALUES
('REG-2024-001', 'John Smith', 'john.smith@student.bugemauniv.ac.ug', '+256700123456', '2000-01-15', 'Male', 'Plot 123, Kampala Road', 'Kampala', 'Kampala', 'STU-2024-001', 'BSc Computer Science', 'Computer Science', 3, 3.80, 'approved'),
('REG-2024-002', 'Jane Doe', 'jane.doe@student.bugemauniv.ac.ug', '+256700234567', '2001-03-20', 'Female', 'Plot 456, Entebbe Road', 'Entebbe', 'Wakiso', 'STU-2024-002', 'BBA', 'Business Administration', 2, 3.50, 'approved'),
('REG-2024-003', 'Mary Johnson', 'mary.johnson@student.bugemauniv.ac.ug', '+256700456789', '2002-05-25', 'Female', 'Plot 321, Masaka Road', 'Masaka', 'Masaka', 'STU-2024-004', 'BEd', 'Education', 1, 3.20, 'pending');

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- View: Active Applications Summary
CREATE OR REPLACE VIEW v_active_applications AS
SELECT 
    a.id,
    a.application_id,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    s.student_id,
    s.email AS student_email,
    o.name AS organization_name,
    a.category,
    a.status,
    a.amount_requested,
    a.amount_approved,
    a.eligibility_score,
    a.submission_date,
    a.created_at
FROM applications a
JOIN students s ON a.student_id = s.id
JOIN organizations o ON a.organization_id = o.id
WHERE a.status IN ('pending', 'under_review');

-- View: Student Application History
CREATE OR REPLACE VIEW v_student_applications AS
SELECT 
    s.id AS student_id,
    s.student_id AS student_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    s.email,
    s.program,
    s.year_of_study,
    s.gpa,
    COUNT(a.id) AS total_applications,
    SUM(CASE WHEN a.status = 'approved' THEN 1 ELSE 0 END) AS approved_applications,
    SUM(CASE WHEN a.status = 'approved' THEN a.amount_approved ELSE 0 END) AS total_funding_received
FROM students s
LEFT JOIN applications a ON s.id = a.student_id
GROUP BY s.id, s.student_id, s.first_name, s.last_name, s.email, s.program, s.year_of_study, s.gpa;

-- View: Organization Funding Summary
CREATE OR REPLACE VIEW v_organization_funding AS
SELECT 
    o.id,
    o.organization_id,
    o.name,
    o.total_funding,
    o.available_funding,
    COUNT(a.id) AS total_applications,
    SUM(CASE WHEN a.status = 'approved' THEN 1 ELSE 0 END) AS approved_applications,
    SUM(CASE WHEN a.status = 'approved' THEN a.amount_approved ELSE 0 END) AS total_disbursed,
    o.total_funding - SUM(CASE WHEN a.status = 'approved' THEN a.amount_approved ELSE 0 END) AS remaining_funding
FROM organizations o
LEFT JOIN applications a ON o.id = a.organization_id
GROUP BY o.id, o.organization_id, o.name, o.total_funding, o.available_funding;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

DELIMITER //

-- Procedure: Approve Application
CREATE PROCEDURE sp_approve_application(
    IN p_application_id VARCHAR(100),
    IN p_reviewed_by INT,
    IN p_amount_approved DECIMAL(15,2),
    IN p_review_comments TEXT
)
BEGIN
    DECLARE v_student_id INT;
    DECLARE v_organization_id INT;
    
    -- Update application status
    UPDATE applications 
    SET 
        status = 'approved',
        amount_approved = p_amount_approved,
        reviewed_by = p_reviewed_by,
        review_date = NOW(),
        approval_date = NOW(),
        review_comments = p_review_comments,
        updated_at = NOW()
    WHERE application_id = p_application_id;
    
    -- Get student and organization IDs
    SELECT student_id, organization_id INTO v_student_id, v_organization_id
    FROM applications
    WHERE application_id = p_application_id;
    
    -- Update organization available funding
    UPDATE organizations
    SET available_funding = available_funding - p_amount_approved
    WHERE id = v_organization_id;
    
    -- Log the action
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes)
    VALUES (p_reviewed_by, 'APPROVE', 'Application', p_application_id, 
            JSON_OBJECT('amount_approved', p_amount_approved, 'status', 'approved'));
END //

-- Procedure: Reject Application
CREATE PROCEDURE sp_reject_application(
    IN p_application_id VARCHAR(100),
    IN p_reviewed_by INT,
    IN p_review_comments TEXT
)
BEGIN
    -- Update application status
    UPDATE applications 
    SET 
        status = 'rejected',
        reviewed_by = p_reviewed_by,
        review_date = NOW(),
        rejection_date = NOW(),
        review_comments = p_review_comments,
        updated_at = NOW()
    WHERE application_id = p_application_id;
    
    -- Log the action
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes)
    VALUES (p_reviewed_by, 'REJECT', 'Application', p_application_id, 
            JSON_OBJECT('status', 'rejected', 'reason', p_review_comments));
END //

-- Procedure: Calculate Application Statistics
CREATE PROCEDURE sp_get_application_statistics(
    OUT p_total_applications INT,
    OUT p_pending_applications INT,
    OUT p_approved_applications INT,
    OUT p_rejected_applications INT,
    OUT p_total_funding_requested DECIMAL(15,2),
    OUT p_total_funding_approved DECIMAL(15,2)
)
BEGIN
    SELECT 
        COUNT(*),
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END),
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END),
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END),
        SUM(amount_requested),
        SUM(CASE WHEN status = 'approved' THEN amount_approved ELSE 0 END)
    INTO 
        p_total_applications,
        p_pending_applications,
        p_approved_applications,
        p_rejected_applications,
        p_total_funding_requested,
        p_total_funding_approved
    FROM applications;
END //

DELIMITER ;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DELIMITER //

-- Trigger: Update student GPA when application is created
CREATE TRIGGER trg_update_student_gpa_on_application
BEFORE INSERT ON applications
FOR EACH ROW
BEGIN
    DECLARE v_student_gpa DECIMAL(3,2);
    
    SELECT gpa INTO v_student_gpa
    FROM students
    WHERE id = NEW.student_id;
    
    SET NEW.current_gpa = v_student_gpa;
END //

-- Trigger: Log application status changes
CREATE TRIGGER trg_log_application_status_change
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes)
        VALUES (NEW.reviewed_by, 'STATUS_CHANGE', 'Application', NEW.application_id,
                JSON_OBJECT('old_status', OLD.status, 'new_status', NEW.status));
    END IF;
END //

DELIMITER ;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_applications_student_status ON applications(student_id, status);
CREATE INDEX idx_applications_org_status ON applications(organization_id, status);
CREATE INDEX idx_applications_category_status ON applications(category, status);
CREATE INDEX idx_students_program_year ON students(program, year_of_study);
CREATE INDEX idx_students_status_gpa ON students(registration_status, gpa);

-- ============================================================================
-- GRANTS AND PERMISSIONS (Optional - adjust as needed)
-- ============================================================================

-- Create application user (uncomment and modify as needed)
-- CREATE USER IF NOT EXISTS 'bugema_app'@'localhost' IDENTIFIED BY 'your_secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON bugema_scholarship.* TO 'bugema_app'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================================================
-- DATABASE INFORMATION
-- ============================================================================

SELECT 
    'Database created successfully!' AS message,
    DATABASE() AS database_name,
    VERSION() AS mysql_version,
    NOW() AS created_at;

-- Show table statistics
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'bugema_scholarship'
ORDER BY TABLE_NAME;

-- ============================================================================
-- END OF SQL SCRIPT
-- ============================================================================
