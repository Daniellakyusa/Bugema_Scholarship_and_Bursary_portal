# Bugema University Scholarship & Bursary Management System API

## Overview
This document provides comprehensive API documentation for the Scholarship & Bursary Management System. The API connects all frontend forms to the admin panel with full CRUD operations.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most admin endpoints require authentication. Use the login endpoint to get a session.

---

## 🔐 Authentication Endpoints

### POST /api/auth/login
**Description:** Admin login
**Access:** Public

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "admin": {
    "admin_id": "admin-001",
    "username": "admin",
    "full_name": "System Administrator",
    "role": "super_admin",
    "permissions": ["all"]
  }
}
```

**Response (Error):**
```json
{
  "error": "Invalid credentials"
}
```

### POST /api/auth/logout
**Description:** Admin logout
**Access:** Authenticated

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/me
**Description:** Get current admin info
**Access:** Authenticated

**Response:**
```json
{
  "admin_id": "admin-001",
  "username": "admin",
  "role": "super_admin"
}
```

---

## 📊 Dashboard Endpoints

### GET /api/dashboard/statistics
**Description:** Get dashboard statistics for admin panel
**Access:** Public (for demo purposes)

**Response:**
```json
{
  "applications": {
    "total": 45,
    "pending": 12,
    "approved": 28,
    "rejected": 5,
    "recent": 8,
    "scholarships": 20,
    "bursaries": 25
  },
  "students": {
    "total": 156
  },
  "feedback": {
    "total": 23,
    "unresolved": 3,
    "average_rating": 4.2
  },
  "organizations": {
    "active": 8,
    "total_funding": 50000000
  }
}
```

### GET /api/dashboard/trends
**Description:** Get application trends
**Access:** Authenticated
**Query Parameters:**
- `days` (optional): Number of days to analyze (default: 30)

**Response:**
```json
{
  "2024-01-15": {
    "total": 5,
    "scholarships": 2,
    "bursaries": 3
  },
  "2024-01-16": {
    "total": 3,
    "scholarships": 1,
    "bursaries": 2
  }
}
```

---

## 📝 Application Endpoints

### GET /api/applications
**Description:** Get all applications with filtering and pagination
**Access:** Public (for demo purposes)

**Query Parameters:**
- `status` (optional): Filter by status (all, pending, approved, rejected)
- `category` (optional): Filter by category (all, scholarship, bursary)
- `organization` (optional): Filter by organization ID
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)

**Response:**
```json
{
  "applications": [
    {
      "application_id": "APP-20240115-001",
      "student_id": "STU-001",
      "category": "scholarship",
      "application_type": "academic",
      "organization_id": "ORG001",
      "amount_requested": 1000000,
      "status": "pending",
      "submission_date": "2024-01-15T10:00:00",
      "personal_statement": "I am dedicated to academic excellence...",
      "household_income": 500000,
      "student": {
        "student_id": "STU-001",
        "name": "John Doe",
        "email": "john@example.com",
        "contact": "0700000000",
        "program": "Computer Science"
      },
      "organization": {
        "organization_id": "ORG001",
        "name": "PEAS Uganda",
        "type": "NGO"
      },
      "eligibility_score": 85.5
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 45,
    "pages": 3
  }
}
```

### POST /api/applications
**Description:** Submit a new application (used by scholarship and bursary forms)
**Access:** Public

**Request Body (Scholarship Application):**
```json
{
  "applicant": {
    "studentId": "STU-001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "0700000000",
    "program": "Computer Science"
  },
  "application": {
    "personalStatement": "I am dedicated to academic excellence...",
    "reason": "To support my education"
  },
  "documents": {
    "transcript": "transcript.pdf",
    "recommendation": "recommendation.pdf",
    "essay": "essay.pdf"
  }
}
```

**Request Body (Bursary Application):**
```json
{
  "applicant": {
    "studentId": "STU-002",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "0700000001",
    "program": "Business Administration"
  },
  "application": {
    "reason": "Financial hardship due to family circumstances"
  },
  "financialInfo": {
    "annualIncome": "500000",
    "dependents": "5",
    "expenses": "300000"
  },
  "documents": {
    "incomeStatement": "income.pdf",
    "bankStatement": "bank.pdf"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application_id": "APP-20240115-002"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Failed to submit application: Missing required fields"
}
```

### GET /api/applications/{application_id}
**Description:** Get application details
**Access:** Public

**Response:**
```json
{
  "application_id": "APP-20240115-001",
  "student_id": "STU-001",
  "category": "scholarship",
  "application_type": "academic",
  "organization_id": "ORG001",
  "amount_requested": 1000000,
  "status": "pending",
  "submission_date": "2024-01-15T10:00:00",
  "personal_statement": "I am dedicated to academic excellence...",
  "household_income": 500000,
  "documents": ["transcript.pdf", "recommendation.pdf"],
  "student": {
    "student_id": "STU-001",
    "name": "John Doe",
    "email": "john@example.com",
    "contact": "0700000000",
    "program": "Computer Science",
    "gpa": 3.8
  },
  "organization": {
    "organization_id": "ORG001",
    "name": "PEAS Uganda",
    "type": "NGO",
    "max_funding_amount": 2000000
  },
  "eligibility_score": 85.5
}
```

### PUT /api/applications/{application_id}
**Description:** Update an application
**Access:** Public

**Request Body:**
```json
{
  "personal_statement": "Updated personal statement...",
  "household_income": 600000,
  "amount_requested": 1200000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application updated successfully"
}
```

### DELETE /api/applications/{application_id}
**Description:** Delete an application
**Access:** Public

**Response:**
```json
{
  "success": true,
  "message": "Application deleted successfully"
}
```

### POST /api/applications/{application_id}/approve
**Description:** Approve an application (Admin action)
**Access:** Public (for demo)

**Request Body:**
```json
{
  "approval_amount": 1000000,
  "comments": "Excellent academic performance and financial need demonstrated"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application approved successfully"
}
```

### POST /api/applications/{application_id}/reject
**Description:** Reject an application (Admin action)
**Access:** Public (for demo)

**Request Body:**
```json
{
  "comments": "Does not meet minimum GPA requirements"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application rejected successfully"
}
```

---

## 👥 Student Endpoints

### GET /api/students
**Description:** Get all students with pagination
**Access:** Authenticated

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)

**Response:**
```json
{
  "students": [
    {
      "student_id": "STU-001",
      "name": "John Doe",
      "email": "john@example.com",
      "contact": "0700000000",
      "program": "Computer Science",
      "registration_status": "APPROVED",
      "gpa": 3.8,
      "created_at": "2024-01-10T08:00:00"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 156,
    "pages": 8
  }
}
```

### GET /api/students/{student_id}
**Description:** Get student details
**Access:** Authenticated

**Response:**
```json
{
  "student_id": "STU-001",
  "name": "John Doe",
  "email": "john@example.com",
  "contact": "0700000000",
  "program": "Computer Science",
  "registration_status": "APPROVED",
  "gpa": 3.8,
  "created_at": "2024-01-10T08:00:00",
  "updated_at": "2024-01-15T10:00:00"
}
```

### POST /api/students/{student_id}/approve
**Description:** Approve student registration
**Access:** Authenticated

**Response:**
```json
{
  "success": true,
  "message": "Student registration approved successfully"
}
```

### POST /api/students/{student_id}/reject
**Description:** Reject student registration
**Access:** Authenticated

**Response:**
```json
{
  "success": true,
  "message": "Student registration rejected successfully"
}
```

---

## 🏢 Organization Endpoints

### GET /api/organizations
**Description:** Get all organizations
**Access:** Authenticated

**Response:**
```json
{
  "organizations": [
    {
      "organization_id": "ORG001",
      "name": "PEAS Uganda",
      "type": "NGO",
      "contact_email": "info@peasuganda.org",
      "max_funding_amount": 2000000,
      "available_slots": 50,
      "is_active": true,
      "requirements": ["Academic Excellence", "Financial Need"],
      "application_deadline": "2024-06-30T23:59:59",
      "statistics": {
        "total_applications": 120,
        "approved_applications": 45,
        "total_funding_disbursed": 45000000
      }
    }
  ]
}
```

---

## 💬 Feedback Endpoints

### GET /api/feedback
**Description:** Get all feedback with pagination
**Access:** Authenticated

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)

**Response:**
```json
{
  "feedback": [
    {
      "feedback_id": "FB-001",
      "student_id": "STU-001",
      "rating": 5,
      "experience": "The application process was smooth and user-friendly",
      "suggestions": "Maybe add more payment options",
      "is_resolved": false,
      "created_at": "2024-01-15T14:30:00",
      "student": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 23,
    "pages": 2
  }
}
```

### POST /api/feedback/{feedback_id}/respond
**Description:** Respond to feedback
**Access:** Authenticated

**Request Body:**
```json
{
  "response": "Thank you for your feedback. We're working on adding more payment options."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Response added successfully"
}
```

---

## 🔄 How Forms Connect to Admin Panel

### 1. Student Registration Form
**File:** `frontend/pages/register.html`
**JavaScript:** `frontend/js/register.js`

**Flow:**
1. Student fills registration form
2. Form submits to `/api/students` (creates student record)
3. Admin sees new registration in "Registrations" tab
4. Admin can approve/reject via `/api/students/{id}/approve` or `/api/students/{id}/reject`

### 2. Scholarship Application Form
**File:** `frontend/pages/scholarship-application-minimal.html`
**JavaScript:** `frontend/js/scholarship-application.js`

**Flow:**
1. Student fills scholarship form
2. Form submits to `/api/applications` with category="scholarship"
3. Admin sees new application in "Applications" tab
4. Admin can view, approve, reject, or delete via respective endpoints

### 3. Bursary Application Form
**File:** `frontend/pages/bursary-application-minimal.html`
**JavaScript:** `frontend/js/bursary-application.js`

**Flow:**
1. Student fills bursary form
2. Form submits to `/api/applications` with category="bursary"
3. Admin sees new application in "Applications" tab
4. Admin can perform CRUD operations via API endpoints

### 4. Feedback Form
**File:** `frontend/pages/feedback.html`
**JavaScript:** `frontend/js/feedback.js`

**Flow:**
1. Student submits feedback
2. Form submits to `/api/feedback`
3. Admin sees feedback in "Feedback" tab
4. Admin can respond via `/api/feedback/{id}/respond`

---

## 🚀 Running the System

### Backend Server
```bash
cd backend
python run_server.py
# Server runs on http://localhost:5000
```

### Frontend Server
```bash
# Serve frontend files (use any HTTP server)
python -m http.server 8000
# Or use Live Server extension in VS Code
```

### Admin Panel Access
1. Navigate to `http://localhost:8000/frontend/pages/admin-panel.html`
2. Login with credentials: `admin` / `admin123`
3. View all submitted applications, registrations, and feedback

---

## 🔧 API Testing

### Using curl
```bash
# Get dashboard statistics
curl http://localhost:5000/api/dashboard/statistics

# Get all applications
curl http://localhost:5000/api/applications

# Submit a scholarship application
curl -X POST http://localhost:5000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "applicant": {
      "studentId": "STU-TEST",
      "firstName": "Test",
      "lastName": "User",
      "email": "test@example.com",
      "phone": "0700000000",
      "program": "Test Program"
    },
    "application": {
      "personalStatement": "Test application"
    }
  }'

# Approve an application
curl -X POST http://localhost:5000/api/applications/APP-ID/approve \
  -H "Content-Type: application/json" \
  -d '{"approval_amount": 1000000, "comments": "Approved for testing"}'
```

---

## 📋 Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE" // Optional
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

---

## 🔒 Security Notes

1. **CORS**: Configured to allow frontend requests
2. **Session Management**: Uses Flask sessions for admin authentication
3. **Input Validation**: All endpoints validate required fields
4. **Error Handling**: Comprehensive error handling prevents crashes
5. **Data Persistence**: All data stored in JSON files for simplicity

---

## 📈 Future Enhancements

1. **Database Integration**: Replace JSON files with PostgreSQL/MySQL
2. **JWT Authentication**: Replace sessions with JWT tokens
3. **File Upload**: Implement actual file upload for documents
4. **Email Notifications**: Send emails for application status changes
5. **Advanced Filtering**: Add more sophisticated search and filter options
6. **Audit Logging**: Track all admin actions for compliance
7. **API Rate Limiting**: Prevent abuse with rate limiting
8. **Data Validation**: Add comprehensive input validation and sanitization

---

This API provides a complete backend for the Scholarship & Bursary Management System, connecting all frontend forms to the admin panel with full CRUD operations and real-time data synchronization.