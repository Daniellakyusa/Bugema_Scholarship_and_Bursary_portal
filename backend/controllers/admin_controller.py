"""
Admin Controller - Handles admin panel business logic
"""
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
import json
import os

from models.student import Student
from models.application import Application, ApplicationStatus, ApplicationCategory, ApplicationType
from models.organization import Organization, get_default_organizations
from models.feedback import Feedback, FeedbackAnalytics
from models.admin import Admin, Permission, create_default_admin

class AdminController:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self._ensure_data_directory()
        self._initialize_default_data()
    
    def _ensure_data_directory(self):
        """Ensure data directory exists"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
    
    def _initialize_default_data(self):
        """Initialize default data if files don't exist"""
        # Initialize organizations
        if not os.path.exists(os.path.join(self.data_dir, "organizations.json")):
            organizations = get_default_organizations()
            self._save_organizations(organizations)
        
        # Initialize default admin
        if not os.path.exists(os.path.join(self.data_dir, "admins.json")):
            admin = create_default_admin()
            self._save_admins([admin])
        
        # Initialize empty files for other data
        for filename in ["students.json", "applications.json", "feedback.json"]:
            filepath = os.path.join(self.data_dir, filename)
            if not os.path.exists(filepath):
                with open(filepath, 'w') as f:
                    json.dump([], f)
    
    # Data persistence methods
    def _load_data(self, filename: str) -> List[Dict]:
        """Load data from JSON file"""
        filepath = os.path.join(self.data_dir, filename)
        try:
            with open(filepath, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    def _save_data(self, filename: str, data: List[Dict]):
        """Save data to JSON file"""
        filepath = os.path.join(self.data_dir, filename)
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)
    
    # Student methods
    def _load_students(self) -> List[Student]:
        """Load students from file"""
        data = self._load_data("students.json")
        return [Student.from_dict(item) for item in data]
    
    def _save_students(self, students: List[Student]):
        """Save students to file"""
        data = [student.to_dict() for student in students]
        self._save_data("students.json", data)
    
    def get_student_by_id(self, student_id: str) -> Optional[Student]:
        """Get student by ID"""
        students = self._load_students()
        for student in students:
            if student.student_id == student_id:
                return student
        return None
    
    def get_all_students(self, limit: int = None, offset: int = 0) -> Tuple[List[Student], int]:
        """Get all students with pagination"""
        students = self._load_students()
        total = len(students)
        
        if limit:
            students = students[offset:offset + limit]
        
        return students, total
    
    def approve_student_registration(self, student_id: str, admin_id: str) -> Dict[str, Any]:
        """Approve a student's registration"""
        students = self._load_students()
        
        for i, student in enumerate(students):
            if student.student_id == student_id:
                if student.registration_status != "PENDING":
                    return {"success": False, "message": "Student registration is not pending"}
                
                student.approve_registration()
                students[i] = student
                self._save_students(students)
                
                return {"success": True, "message": "Student registration approved successfully"}
                
        return {"success": False, "message": "Student not found"}

    def reject_student_registration(self, student_id: str, admin_id: str) -> Dict[str, Any]:
        """Reject a student's registration"""
        students = self._load_students()
        
        for i, student in enumerate(students):
            if student.student_id == student_id:
                if student.registration_status != "PENDING":
                    return {"success": False, "message": "Student registration is not pending"}
                
                student.reject_registration()
                students[i] = student
                self._save_students(students)
                
                return {"success": True, "message": "Student registration rejected successfully"}
                
        return {"success": False, "message": "Student not found"}
    
    # Application methods
    def _load_applications(self) -> List[Application]:
        """Load applications from file"""
        data = self._load_data("applications.json")
        return [Application.from_dict(item) for item in data]
    
    def _save_applications(self, applications: List[Application]):
        """Save applications to file"""
        data = [app.to_dict() for app in applications]
        self._save_data("applications.json", data)
    
    def get_all_applications(self, status_filter: str = None, category_filter: str = None,
                           organization_filter: str = None, limit: int = None, 
                           offset: int = 0) -> Tuple[List[Dict], int]:
        """Get all applications with filtering and pagination"""
        applications = self._load_applications()
        students = self._load_students()
        organizations = self._load_organizations()
        
        # Create lookup dictionaries
        student_lookup = {s.student_id: s for s in students}
        org_lookup = {o.organization_id: o for o in organizations}
        
        # Apply filters
        if status_filter and status_filter != "all":
            applications = [app for app in applications if app.status.value == status_filter]
        
        if category_filter and category_filter != "all":
            applications = [app for app in applications if app.category.value == category_filter]
        
        if organization_filter and organization_filter != "all":
            applications = [app for app in applications if app.organization_id == organization_filter]
        
        # Sort by submission date (newest first)
        applications.sort(key=lambda x: x.submission_date, reverse=True)
        
        total = len(applications)
        
        # Apply pagination
        if limit:
            applications = applications[offset:offset + limit]
        
        # Enrich with student and organization data
        enriched_applications = []
        for app in applications:
            app_dict = app.to_dict()
            app_dict['student'] = student_lookup.get(app.student_id, {}).to_dict() if app.student_id in student_lookup else {}
            app_dict['organization'] = org_lookup.get(app.organization_id, {}).to_dict() if app.organization_id in org_lookup else {}
            app_dict['eligibility_score'] = app.calculate_eligibility_score(
                app_dict['student'].get('gpa', 0.0)
            )
            enriched_applications.append(app_dict)
        
        return enriched_applications, total
    
    def get_application_by_id(self, application_id: str) -> Optional[Dict]:
        """Get application by ID with enriched data"""
        applications = self._load_applications()
        students = self._load_students()
        organizations = self._load_organizations()
        
        # Find application
        app = None
        for application in applications:
            if application.application_id == application_id:
                app = application
                break
        
        if not app:
            return None
        
        # Enrich with student and organization data
        student_lookup = {s.student_id: s for s in students}
        org_lookup = {o.organization_id: o for o in organizations}
        
        app_dict = app.to_dict()
        app_dict['student'] = student_lookup.get(app.student_id, {}).to_dict() if app.student_id in student_lookup else {}
        app_dict['organization'] = org_lookup.get(app.organization_id, {}).to_dict() if app.organization_id in org_lookup else {}
        app_dict['eligibility_score'] = app.calculate_eligibility_score(
            app_dict['student'].get('gpa', 0.0)
        )
        
        return app_dict
    
    def update_application(self, application_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an application"""
        try:
            applications = self._load_applications()
            
            # Find and update application
            for i, app in enumerate(applications):
                if app.application_id == application_id:
                    # Update allowed fields
                    if 'personal_statement' in update_data:
                        app.personal_statement = update_data['personal_statement']
                    if 'household_income' in update_data:
                        app.household_income = float(update_data['household_income'])
                    if 'amount_requested' in update_data:
                        app.amount_requested = float(update_data['amount_requested'])
                    
                    app.updated_at = datetime.now()
                    applications[i] = app
                    
                    # Save applications
                    self._save_applications(applications)
                    
                    return {"success": True, "message": "Application updated successfully"}
            
            return {"success": False, "message": "Application not found"}
            
        except Exception as e:
            return {"success": False, "message": f"Failed to update application: {str(e)}"}
    
    def delete_application(self, application_id: str) -> Dict[str, Any]:
        """Delete an application"""
        try:
            applications = self._load_applications()
            
            # Find and remove application
            for i, app in enumerate(applications):
                if app.application_id == application_id:
                    applications.pop(i)
                    
                    # Save applications
                    self._save_applications(applications)
                    
                    return {"success": True, "message": "Application deleted successfully"}
            
            return {"success": False, "message": "Application not found"}
            
        except Exception as e:
            return {"success": False, "message": f"Failed to delete application: {str(e)}"}
    
    def approve_application(self, application_id: str, admin_id: str, 
                          approval_amount: float = None, comments: str = "") -> Dict[str, Any]:
        """Approve an application"""
        applications = self._load_applications()
        
        # Find and update application
        for i, app in enumerate(applications):
            if app.application_id == application_id:
                if app.status != ApplicationStatus.PENDING:
                    return {"success": False, "message": "Application is not pending"}
                
                app.approve(admin_id, approval_amount, comments)
                applications[i] = app
                
                # Update organization statistics
                organizations = self._load_organizations()
                for j, org in enumerate(organizations):
                    if org.organization_id == app.organization_id:
                        org.update_statistics(True, app.approval_amount)
                        organizations[j] = org
                        break
                
                # Save data
                self._save_applications(applications)
                self._save_organizations(organizations)
                
                # Update admin statistics
                self._update_admin_activity(admin_id, "application_review")
                
                return {"success": True, "message": "Application approved successfully"}
        
        return {"success": False, "message": "Application not found"}
    
    def reject_application(self, application_id: str, admin_id: str, 
                          comments: str = "") -> Dict[str, Any]:
        """Reject an application"""
        applications = self._load_applications()
        
        # Find and update application
        for i, app in enumerate(applications):
            if app.application_id == application_id:
                if app.status != ApplicationStatus.PENDING:
                    return {"success": False, "message": "Application is not pending"}
                
                app.reject(admin_id, comments)
                applications[i] = app
                
                # Update organization statistics
                organizations = self._load_organizations()
                for j, org in enumerate(organizations):
                    if org.organization_id == app.organization_id:
                        org.update_statistics(False, 0)
                        organizations[j] = org
                        break
                
                # Save data
                self._save_applications(applications)
                self._save_organizations(organizations)
                
                # Update admin statistics
                self._update_admin_activity(admin_id, "application_review")
                
                return {"success": True, "message": "Application rejected successfully"}
        
        return {"success": False, "message": "Application not found"}
    
    def submit_application(self, submission_data: Dict[str, Any]) -> Dict[str, Any]:
        """Submit a new application from student"""
        try:
            print(f"\n🔵 [Controller] submit_application called with data keys: {submission_data.keys()}")
            
            # Create student if doesn't exist
            student_data = submission_data.get('applicant', {})
            student_id = student_data.get('studentId', '')
            print(f"📌 [Controller] Processing student: {student_id}")
            
            # Check if student exists, if not create
            student = self.get_student_by_id(student_id)
            if not student:
                # Create new student
                from models.student import Student
                full_name = f"{student_data.get('firstName', '')} {student_data.get('lastName', '')}".strip()
                student = Student(
                    student_id=student_id,
                    name=full_name,
                    email=student_data.get('email', ''),
                    contact=student_data.get('phone', ''),
                    program=student_data.get('program', '')
                )
                students = self._load_students()
                students.append(student)
                self._save_students(students)
                print(f"✅ [Controller] Created new student: {student_id}")
            else:
                print(f"ℹ️ [Controller] Student already exists: {student_id}")
            
            # Create application
            category = ApplicationCategory.BURSARY if 'financialInfo' in submission_data else ApplicationCategory.SCHOLARSHIP
            application_type = ApplicationType.NEED_BASED if category == ApplicationCategory.BURSARY else ApplicationType.ACADEMIC
            
            print(f"📝 [Controller] Creating application - Category: {category.value}, Type: {application_type.value}")
            
            application = Application(
                student_id=student_id,
                category=category,
                application_type=application_type,
                organization_id="ORG001",  # Default organization
                personal_statement=submission_data.get('application', {}).get('reason', '') or submission_data.get('application', {}).get('personalStatement', ''),
                household_income=float(submission_data.get('financialInfo', {}).get('annualIncome', 0)),
                documents=[doc for doc in submission_data.get('documents', {}).values() if doc != 'Not uploaded']
            )
            
            print(f"💾 [Controller] Saving application {application.application_id}")
            
            # Save application
            applications = self._load_applications()
            applications.append(application)
            self._save_applications(applications)
            
            print(f"✅ [Controller] Application saved successfully: {application.application_id}")
            print(f"📊 [Controller] Total applications now: {len(applications)}")
            
            return {
                "success": True, 
                "message": "Application submitted successfully",
                "application_id": application.application_id
            }
            
        except Exception as e:
            error_msg = f"Failed to submit application: {str(e)}"
            print(f"❌ [Controller] Exception: {error_msg}")
            import traceback
            traceback.print_exc()
            return {"success": False, "message": error_msg}
    
    # Organization methods
    def _load_organizations(self) -> List[Organization]:
        """Load organizations from file"""
        data = self._load_data("organizations.json")
        return [Organization.from_dict(item) for item in data]
    
    def _save_organizations(self, organizations: List[Organization]):
        """Save organizations to file"""
        data = [org.to_dict() for org in organizations]
        self._save_data("organizations.json", data)
    
    def get_all_organizations(self) -> List[Dict]:
        """Get all organizations"""
        organizations = self._load_organizations()
        return [org.to_dict() for org in organizations]
    
    # Feedback methods
    def _load_feedback(self) -> List[Feedback]:
        """Load feedback from file"""
        data = self._load_data("feedback.json")
        return [Feedback.from_dict(item) for item in data]
    
    def _save_feedback(self, feedback_list: List[Feedback]):
        """Save feedback to file"""
        data = [fb.to_dict() for fb in feedback_list]
        self._save_data("feedback.json", data)
    
    def get_all_feedback(self, limit: int = None, offset: int = 0) -> Tuple[List[Dict], int]:
        """Get all feedback with pagination"""
        feedback_list = self._load_feedback()
        students = self._load_students()
        
        # Create student lookup
        student_lookup = {s.student_id: s for s in students}
        
        # Sort by creation date (newest first)
        feedback_list.sort(key=lambda x: x.created_at, reverse=True)
        
        total = len(feedback_list)
        
        # Apply pagination
        if limit:
            feedback_list = feedback_list[offset:offset + limit]
        
        # Enrich with student data
        enriched_feedback = []
        for fb in feedback_list:
            fb_dict = fb.to_dict()
            if fb.student_id != "anonymous":
                fb_dict['student'] = student_lookup.get(fb.student_id, {}).to_dict() if fb.student_id in student_lookup else {}
            else:
                fb_dict['student'] = {"name": "Anonymous User"}
            enriched_feedback.append(fb_dict)
        
        return enriched_feedback, total
    
    def respond_to_feedback(self, feedback_id: str, admin_id: str, response: str) -> Dict[str, Any]:
        """Respond to feedback"""
        feedback_list = self._load_feedback()
        
        # Find and update feedback
        for i, fb in enumerate(feedback_list):
            if fb.feedback_id == feedback_id:
                fb.respond(admin_id, response)
                feedback_list[i] = fb
                
                # Save data
                self._save_feedback(feedback_list)
                
                # Update admin statistics
                self._update_admin_activity(admin_id, "feedback_response")
                
                return {"success": True, "message": "Response added successfully"}
        
        return {"success": False, "message": "Feedback not found"}
    
    # Admin methods
    def _load_admins(self) -> List[Admin]:
        """Load admins from file"""
        data = self._load_data("admins.json")
        return [Admin.from_dict(item) for item in data]
    
    def _save_admins(self, admins: List[Admin]):
        """Save admins to file"""
        data = [admin.to_dict(include_sensitive=True) for admin in admins]
        self._save_data("admins.json", data)
    
    def authenticate_admin(self, username: str, password: str) -> Optional[Dict]:
        """Authenticate admin login"""
        admins = self._load_admins()
        
        for admin in admins:
            if admin.username == username and admin.verify_password(password) and admin.is_active:
                admin.record_login()
                
                # Save updated login info
                self._save_admins(admins)
                
                return admin.to_dict()
        
        return None
    
    def _update_admin_activity(self, admin_id: str, activity_type: str):
        """Update admin activity statistics"""
        admins = self._load_admins()
        
        for admin in admins:
            if admin.admin_id == admin_id:
                if activity_type == "application_review":
                    admin.record_application_review()
                elif activity_type == "feedback_response":
                    admin.record_feedback_response()
                break
        
        self._save_admins(admins)
    
    # Analytics methods
    def get_dashboard_statistics(self) -> Dict[str, Any]:
        """Get dashboard statistics"""
        applications = self._load_applications()
        students = self._load_students()
        feedback_list = self._load_feedback()
        organizations = self._load_organizations()
        
        # Application statistics
        total_applications = len(applications)
        pending_applications = len([app for app in applications if app.status == ApplicationStatus.PENDING])
        approved_applications = len([app for app in applications if app.status == ApplicationStatus.APPROVED])
        rejected_applications = len([app for app in applications if app.status == ApplicationStatus.REJECTED])
        
        # Recent applications (last 7 days)
        week_ago = datetime.now() - timedelta(days=7)
        recent_applications = len([app for app in applications if app.submission_date >= week_ago])
        
        # Category breakdown
        scholarships = len([app for app in applications if app.category == ApplicationCategory.SCHOLARSHIP])
        bursaries = len([app for app in applications if app.category == ApplicationCategory.BURSARY])
        
        # Feedback statistics
        total_feedback = len(feedback_list)
        unresolved_feedback = len([fb for fb in feedback_list if not fb.is_resolved])
        avg_rating = FeedbackAnalytics.calculate_average_rating(feedback_list)
        
        # Organization statistics
        active_organizations = len([org for org in organizations if org.is_active])
        total_funding_available = sum(org.max_funding_amount * org.available_slots for org in organizations if org.is_active)
        
        return {
            "applications": {
                "total": total_applications,
                "pending": pending_applications,
                "approved": approved_applications,
                "rejected": rejected_applications,
                "recent": recent_applications,
                "scholarships": scholarships,
                "bursaries": bursaries
            },
            "students": {
                "total": len(students)
            },
            "feedback": {
                "total": total_feedback,
                "unresolved": unresolved_feedback,
                "average_rating": round(avg_rating, 1)
            },
            "organizations": {
                "active": active_organizations,
                "total_funding": total_funding_available
            }
        }
    
    def get_application_trends(self, days: int = 30) -> Dict[str, Any]:
        """Get application trends over specified days"""
        applications = self._load_applications()
        
        # Filter applications from last N days
        cutoff_date = datetime.now() - timedelta(days=days)
        recent_apps = [app for app in applications if app.submission_date >= cutoff_date]
        
        # Group by date
        daily_counts = {}
        for app in recent_apps:
            date_key = app.submission_date.strftime('%Y-%m-%d')
            if date_key not in daily_counts:
                daily_counts[date_key] = {"total": 0, "scholarships": 0, "bursaries": 0}
            
            daily_counts[date_key]["total"] += 1
            if app.category == ApplicationCategory.SCHOLARSHIP:
                daily_counts[date_key]["scholarships"] += 1
            else:
                daily_counts[date_key]["bursaries"] += 1
        
        return daily_counts