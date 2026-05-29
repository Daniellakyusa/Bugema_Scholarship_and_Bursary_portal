# Scholarship & Bursary Management System - Admin Panel

A comprehensive admin panel for managing scholarship and bursary applications following the MVT (Model-View-Template) architecture pattern.

## 🎯 System Overview

This admin panel provides a centralized interface for administrators to:
- **View and manage student applications** for scholarships and bursaries
- **Approve or reject applications** based on defined criteria
- **Monitor task participation** (sports, work programs, etc.)
- **Review and analyze student feedback**
- **Ensure transparency and accountability** in decision-making

## 🏗️ Architecture (MVT Pattern)

### Model Layer (`backend/models/`)
- **Student Model**: Student data and academic records
- **Application Model**: Scholarship/bursary applications with status tracking
- **Organization Model**: Funding organizations (PEAS Uganda, Lora Foundation, etc.)
- **Feedback Model**: Student feedback on application process
- **Admin Model**: Admin users with role-based permissions

### View Layer (`backend/controllers/`)
- **AdminController**: Business logic for all admin operations
- Handles data processing, filtering, and business rules
- Manages authentication and authorization

### Template Layer (`frontend/`)
- **Clean, minimal admin interface** with focused functionality
- **Responsive design** that works on all devices
- **Real-time data updates** and interactive components

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- Modern web browser

### 1. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Generate sample data (optional but recommended for demo)
python generate_sample_data.py

# Start the server
python run_server.py
```

The server will start on `http://localhost:5000`

### 2. Access Admin Panel

1. Open your web browser
2. Navigate to `frontend/pages/admin-panel.html`
3. Login with default credentials:
   - **Username**: `admin`
   - **Password**: `admin123`

## 📊 Features

### Dashboard Statistics
- **Total Applications**: Overview of all submitted applications
- **Pending Review**: Applications requiring immediate attention
- **Approval Rate**: Success rate statistics
- **Student Count**: Total registered students
- **Organization Status**: Active funding partners
- **Feedback Rating**: Average user satisfaction

### Application Management
- **Real-time application listing** with filtering options
- **Status-based filtering**: Pending, Approved, Rejected
- **Category filtering**: Scholarships vs Bursaries
- **Detailed application view** with student information
- **One-click approval/rejection** with comments
- **Eligibility scoring** based on multiple criteria

### Student Management
- **Complete student profiles** with academic records
- **GPA tracking** and eligibility assessment
- **Contact information** and program details
- **Registration timeline** tracking

### Organization Management
- **Funding partner overview** (PEAS Uganda, Lora Foundation, etc.)
- **Available funding slots** and amounts
- **Success rate tracking** per organization
- **Eligibility criteria** management

### Feedback System
- **Student feedback collection** on application process
- **Rating system** (1-5 stars) with detailed comments
- **Admin response capability** for feedback resolution
- **Feedback analytics** and trend analysis

## 🔐 Security Features

- **Session-based authentication** with secure login
- **Role-based access control** (Main Admin, Secondary Admin, etc.)
- **Permission-based operations** for different admin levels
- **Secure password hashing** for admin accounts
- **Input validation** and sanitization

## 📱 Responsive Design

The admin panel is fully responsive and works seamlessly on:
- **Desktop computers** (1200px+)
- **Tablets** (768px - 1199px)
- **Mobile devices** (320px - 767px)

## 🎨 Design Principles

### ✅ Simplicity
- Clean, uncluttered interface
- Only essential features displayed
- Minimal navigation complexity

### ✅ Efficiency
- **Single-screen operations** - most tasks completed without page switching
- **Fast load times** with optimized queries
- **Bulk operations** for managing multiple applications

### ✅ Consistency
- Uniform layout and interaction patterns
- Consistent color scheme and typography
- Standardized button styles and behaviors

### ✅ Feedback
- Immediate system responses for all actions
- Clear success/error messages
- Real-time status updates

## 📈 Performance Optimization

- **Pagination** for large datasets (20 items per page)
- **Efficient filtering** with minimal server requests
- **Caching** of frequently accessed data
- **Lazy loading** of detailed information
- **Optimized database queries** to reduce load times

## 🔧 Configuration

### Default Organizations
The system comes pre-configured with these funding organizations:

1. **PEAS Uganda**
   - Type: Both scholarships and bursaries
   - Focus: Education and teaching programs
   - Max funding: 2,000,000 UGX

2. **Lora Foundation**
   - Type: Academic scholarships
   - Focus: Engineering, Medicine, Computer Science
   - Max funding: 3,000,000 UGX

3. **Holy Cross**
   - Type: Need-based bursaries
   - Focus: Faith-based support
   - Max funding: 1,500,000 UGX

4. **Ssanyu Babies Home**
   - Type: Both scholarships and bursaries
   - Focus: Orphaned and vulnerable children
   - Max funding: 2,500,000 UGX

### Admin Roles
- **Main Admin**: Full system access and admin management
- **Secondary Admin**: Application management and feedback response
- **Reviewer**: Read-only access with basic analytics
- **Read-Only**: View-only access to all sections

## 📊 Sample Data

The system includes a sample data generator that creates:
- **50 sample students** with realistic academic profiles
- **100 sample applications** across different categories
- **30 feedback entries** with various ratings and comments
- **4 funding organizations** with different criteria
- **1 default admin account** for immediate access

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current admin info

### Dashboard
- `GET /api/dashboard/statistics` - Get dashboard stats
- `GET /api/dashboard/trends` - Get application trends

### Applications
- `GET /api/applications` - List applications with filtering
- `GET /api/applications/{id}` - Get application details
- `POST /api/applications/{id}/approve` - Approve application
- `POST /api/applications/{id}/reject` - Reject application

### Students
- `GET /api/students` - List students with pagination
- `GET /api/students/{id}` - Get student details

### Organizations
- `GET /api/organizations` - List all organizations

### Feedback
- `GET /api/feedback` - List feedback with pagination
- `POST /api/feedback/{id}/respond` - Respond to feedback

## 🚨 Important Notes

### Production Deployment
Before deploying to production:

1. **Change default admin password**
2. **Update secret key** in `admin_api.py`
3. **Configure proper database** (currently uses JSON files)
4. **Set up HTTPS** for secure communication
5. **Configure proper CORS** settings
6. **Set up proper logging** and monitoring

### Data Storage
Currently uses JSON files for simplicity. For production:
- Consider using **PostgreSQL** or **MySQL**
- Implement proper **database migrations**
- Set up **regular backups**
- Configure **connection pooling**

## 🤝 Contributing

1. Follow the **MVT architecture** pattern
2. Maintain **clean separation** of concerns
3. Write **comprehensive tests** for new features
4. Follow **consistent coding** standards
5. Update **documentation** for any changes

## 📞 Support

For technical support or questions:
- **Email**: admin@bugemauniv.ac.ug
- **Documentation**: Check this README and code comments
- **Issues**: Report bugs through the appropriate channels

---

**Built with ❤️ for Bugema University**

*"Training the head, the heart, and the hands"*