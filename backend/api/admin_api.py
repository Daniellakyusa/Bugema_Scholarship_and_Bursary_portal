"""
Admin API - RESTful endpoints for admin panel
"""
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from functools import wraps
import os
import sys

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import with absolute path
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from controllers.admin_controller import AdminController

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-in-production'

# Configure CORS to allow frontend requests
CORS(app, 
     resources={r"/api/*": {"origins": ["http://localhost:8000", "http://127.0.0.1:8000", "*"],
                               "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                               "allow_headers": ["Content-Type", "Authorization"]}},
     supports_credentials=True)

# Initialize controller
controller = AdminController()

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            return jsonify({"error": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function

def require_permission(permission):
    """Decorator to require specific permission"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'admin_id' not in session:
                return jsonify({"error": "Authentication required"}), 401
            
            # For now, we'll skip detailed permission checking
            # In production, you'd check admin permissions here
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Authentication endpoints
@app.route('/api/auth/login', methods=['POST'])
def login():
    """Admin login"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    
    admin = controller.authenticate_admin(username, password)
    if admin:
        session['admin_id'] = admin['admin_id']
        session['admin_username'] = admin['username']
        session['admin_role'] = admin['role']
        
        return jsonify({
            "success": True,
            "admin": {
                "admin_id": admin['admin_id'],
                "username": admin['username'],
                "full_name": admin['full_name'],
                "role": admin['role'],
                "permissions": admin['permissions']
            }
        })
    else:
        return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/auth/logout', methods=['POST'])
@require_auth
def logout():
    """Admin logout"""
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully"})

@app.route('/api/auth/me', methods=['GET'])
@require_auth
def get_current_admin():
    """Get current admin info"""
    return jsonify({
        "admin_id": session.get('admin_id'),
        "username": session.get('admin_username'),
        "role": session.get('admin_role')
    })

# Dashboard endpoints
@app.route('/api/dashboard/statistics', methods=['GET'])
def get_dashboard_statistics():
    """Get dashboard statistics"""
    stats = controller.get_dashboard_statistics()
    return jsonify(stats)

@app.route('/api/dashboard/trends', methods=['GET'])
@require_auth
def get_application_trends():
    """Get application trends"""
    days = request.args.get('days', 30, type=int)
    trends = controller.get_application_trends(days)
    return jsonify(trends)

# Application endpoints
@app.route('/api/applications', methods=['GET'])
def get_applications():
    """Get all applications with filtering and pagination"""
    # Get query parameters
    status_filter = request.args.get('status', 'all')
    category_filter = request.args.get('category', 'all')
    organization_filter = request.args.get('organization', 'all')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Calculate offset
    offset = (page - 1) * per_page
    
    applications, total = controller.get_all_applications(
        status_filter=status_filter,
        category_filter=category_filter,
        organization_filter=organization_filter,
        limit=per_page,
        offset=offset
    )
    
    return jsonify({
        "applications": applications,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page
        }
    })

@app.route('/api/applications', methods=['POST', 'OPTIONS'])
def submit_application():
    """Submit a new application with enhanced validation and processing"""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
    
    try:
        data = request.get_json()
        print(f"\n🔵 [API] POST /api/applications received enhanced data: {data}")
        
        if not data:
            print("❌ [API] No data provided")
            return jsonify({"error": "No data provided"}), 400
        
        # Enhanced validation for new data structure
        applicant = data.get('applicant', {})
        metadata = data.get('metadata', {})
        application_type = metadata.get('applicationType', 'unknown')
        
        print(f"📊 [API] Processing {application_type} application from: {applicant.get('firstName')} {applicant.get('lastName')}")
        
        # Validate required fields based on application type
        required_fields = ['firstName', 'lastName', 'email', 'studentId', 'program']
        missing_fields = []
        
        for field in required_fields:
            if not applicant.get(field):
                missing_fields.append(field)
        
        if missing_fields:
            error_msg = f"Missing required applicant fields: {', '.join(missing_fields)}"
            print(f"❌ [API] Validation failed: {error_msg}")
            return jsonify({"error": error_msg, "missing_fields": missing_fields}), 400
        
        # Enhanced processing with additional validation
        if application_type == 'bursary':
            financial_info = data.get('financialInfo', {})
            if not financial_info.get('annualIncome'):
                print("❌ [API] Bursary application missing financial information")
                return jsonify({"error": "Annual income is required for bursary applications"}), 400
        
        # Process application with enhanced data structure
        result = controller.submit_application(data)
        print(f"✅ [API] Enhanced controller returned: {result}")
        
        if result['success']:
            # Enhanced response with additional metadata
            response_data = {
                "success": True,
                "message": "Application submitted successfully",
                "application_id": result.get('application_id'),
                "status": "pending",
                "submission_time": metadata.get('submittedAt'),
                "application_type": application_type,
                "next_steps": [
                    "Check your email for confirmation",
                    "Wait for admin review (5-7 business days)",
                    "Prepare additional documents if requested"
                ],
                "contact_info": {
                    "email": "studentaffairs@bugemauniv.ac.ug",
                    "phone": "+256 414 290 882"
                }
            }
            
            print(f"✅ [API] Enhanced application {result.get('application_id')} submitted successfully")
            return jsonify(response_data), 201
        else:
            print(f"❌ [API] Application submission failed: {result.get('message')}")
            return jsonify(result), 400
            
    except Exception as e:
        error_msg = f"Server error: {str(e)}"
        print(f"❌ [API] Exception: {error_msg}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": error_msg,
            "success": False,
            "message": "An unexpected error occurred while processing your application"
        }), 500

@app.route('/api/applications/<application_id>', methods=['GET'])
def get_application_details(application_id):
    """Get application details"""
    application = controller.get_application_by_id(application_id)
    if application:
        return jsonify(application)
    else:
        return jsonify({"error": "Application not found"}), 404

@app.route('/api/applications/<application_id>', methods=['PUT'])
def update_application(application_id):
    """Update an application"""
    try:
        data = request.get_json()
        result = controller.update_application(application_id, data)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/applications/<application_id>', methods=['DELETE'])
def delete_application(application_id):
    """Delete an application"""
    try:
        result = controller.delete_application(application_id)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/applications/<application_id>/approve', methods=['POST'])
def approve_application(application_id):
    """Approve an application"""
    data = request.get_json() or {}
    admin_id = "admin-001"  # Default admin ID since no auth
    approval_amount = data.get('approval_amount')
    comments = data.get('comments', '')
    
    result = controller.approve_application(application_id, admin_id, approval_amount, comments)
    
    if result['success']:
        return jsonify(result)
    else:
        return jsonify(result), 400

@app.route('/api/applications/<application_id>/reject', methods=['POST'])
def reject_application(application_id):
    """Reject an application"""
    data = request.get_json() or {}
    admin_id = "admin-001"  # Default admin ID since no auth
    comments = data.get('comments', '')
    
    result = controller.reject_application(application_id, admin_id, comments)
    
    if result['success']:
        return jsonify(result)
    else:
        return jsonify(result), 400

# Student endpoints
@app.route('/api/students', methods=['GET'])
@require_auth
def get_students():
    """Get all students with pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    offset = (page - 1) * per_page
    students, total = controller.get_all_students(limit=per_page, offset=offset)
    
    return jsonify({
        "students": [student.to_dict() for student in students],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page
        }
    })

@app.route('/api/students/<student_id>', methods=['GET'])
@require_auth
def get_student_details(student_id):
    """Get student details"""
    student = controller.get_student_by_id(student_id)
    if student:
        return jsonify(student.to_dict())
    else:
        return jsonify({"error": "Student not found"}), 404

@app.route('/api/students/<student_id>/approve', methods=['POST'])
@require_auth
def approve_student(student_id):
    """Approve a student registration"""
    admin_id = session['admin_id']
    result = controller.approve_student_registration(student_id, admin_id)
    
    if result['success']:
        return jsonify(result)
    else:
        return jsonify(result), 400

@app.route('/api/students/<student_id>/reject', methods=['POST'])
@require_auth
def reject_student(student_id):
    """Reject a student registration"""
    admin_id = session['admin_id']
    result = controller.reject_student_registration(student_id, admin_id)
    
    if result['success']:
        return jsonify(result)
    else:
        return jsonify(result), 400

# Organization endpoints
@app.route('/api/organizations', methods=['GET'])
@require_auth
def get_organizations():
    """Get all organizations"""
    organizations = controller.get_all_organizations()
    return jsonify({"organizations": organizations})

# Feedback endpoints
@app.route('/api/feedback', methods=['GET'])
@require_auth
def get_feedback():
    """Get all feedback with pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    offset = (page - 1) * per_page
    feedback_list, total = controller.get_all_feedback(limit=per_page, offset=offset)
    
    return jsonify({
        "feedback": feedback_list,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page
        }
    })

@app.route('/api/feedback/<feedback_id>/respond', methods=['POST'])
@require_auth
@require_permission('respond_feedback')
def respond_to_feedback(feedback_id):
    """Respond to feedback"""
    data = request.get_json()
    admin_id = session['admin_id']
    response = data.get('response', '')
    
    if not response:
        return jsonify({"error": "Response is required"}), 400
    
    result = controller.respond_to_feedback(feedback_id, admin_id, response)
    
    if result['success']:
        return jsonify(result)
    else:
        return jsonify(result), 400

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)