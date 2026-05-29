"""
Admin Model - Represents admin users and their permissions
"""
from datetime import datetime
from typing import Dict, Any, List, Set
import uuid
import hashlib
from enum import Enum

class AdminRole(Enum):
    MAIN_ADMIN = "main_admin"
    SECONDARY_ADMIN = "secondary_admin"
    REVIEWER = "reviewer"
    READ_ONLY = "read_only"

class Permission(Enum):
    # Application permissions
    VIEW_APPLICATIONS = "view_applications"
    APPROVE_APPLICATIONS = "approve_applications"
    REJECT_APPLICATIONS = "reject_applications"
    EDIT_APPLICATIONS = "edit_applications"
    
    # Student permissions
    VIEW_STUDENTS = "view_students"
    EDIT_STUDENTS = "edit_students"
    
    # Organization permissions
    VIEW_ORGANIZATIONS = "view_organizations"
    MANAGE_ORGANIZATIONS = "manage_organizations"
    
    # Feedback permissions
    VIEW_FEEDBACK = "view_feedback"
    RESPOND_FEEDBACK = "respond_feedback"
    
    # Admin management
    MANAGE_ADMINS = "manage_admins"
    VIEW_ANALYTICS = "view_analytics"
    
    # System permissions
    SYSTEM_SETTINGS = "system_settings"
    EXPORT_DATA = "export_data"

class Admin:
    def __init__(self, admin_id: str = None, username: str = "", email: str = "",
                 full_name: str = "", role: AdminRole = AdminRole.READ_ONLY,
                 password_hash: str = "", is_active: bool = True,
                 permissions: Set[Permission] = None, created_at: datetime = None):
        
        self.admin_id = admin_id or str(uuid.uuid4())
        self.username = username
        self.email = email
        self.full_name = full_name
        self.role = role
        self.password_hash = password_hash
        self.is_active = is_active
        self.permissions = permissions or self._get_default_permissions()
        
        # Activity tracking
        self.last_login = None
        self.login_count = 0
        self.applications_reviewed = 0
        self.feedbacks_responded = 0
        
        # Timestamps
        self.created_at = created_at or datetime.now()
        self.updated_at = datetime.now()
    
    def _get_default_permissions(self) -> Set[Permission]:
        """Get default permissions based on role"""
        if self.role == AdminRole.MAIN_ADMIN:
            return set(Permission)  # All permissions
        elif self.role == AdminRole.SECONDARY_ADMIN:
            return {
                Permission.VIEW_APPLICATIONS,
                Permission.APPROVE_APPLICATIONS,
                Permission.REJECT_APPLICATIONS,
                Permission.VIEW_STUDENTS,
                Permission.VIEW_ORGANIZATIONS,
                Permission.VIEW_FEEDBACK,
                Permission.RESPOND_FEEDBACK,
                Permission.VIEW_ANALYTICS
            }
        elif self.role == AdminRole.REVIEWER:
            return {
                Permission.VIEW_APPLICATIONS,
                Permission.VIEW_STUDENTS,
                Permission.VIEW_ORGANIZATIONS,
                Permission.VIEW_FEEDBACK,
                Permission.VIEW_ANALYTICS
            }
        else:  # READ_ONLY
            return {
                Permission.VIEW_APPLICATIONS,
                Permission.VIEW_STUDENTS,
                Permission.VIEW_ORGANIZATIONS,
                Permission.VIEW_FEEDBACK
            }
    
    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        """Convert admin object to dictionary"""
        data = {
            'admin_id': self.admin_id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role.value,
            'is_active': self.is_active,
            'permissions': [p.value for p in self.permissions],
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'login_count': self.login_count,
            'applications_reviewed': self.applications_reviewed,
            'feedbacks_responded': self.feedbacks_responded,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_sensitive:
            data['password_hash'] = self.password_hash
            
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Admin':
        """Create admin object from dictionary"""
        admin = cls()
        admin.admin_id = data.get('admin_id', str(uuid.uuid4()))
        admin.username = data.get('username', '')
        admin.email = data.get('email', '')
        admin.full_name = data.get('full_name', '')
        admin.role = AdminRole(data.get('role', 'read_only'))
        admin.password_hash = data.get('password_hash', '')
        admin.is_active = data.get('is_active', True)
        
        # Convert permissions
        perm_values = data.get('permissions', [])
        admin.permissions = {Permission(p) for p in perm_values if p in [perm.value for perm in Permission]}
        
        # Activity data
        admin.login_count = data.get('login_count', 0)
        admin.applications_reviewed = data.get('applications_reviewed', 0)
        admin.feedbacks_responded = data.get('feedbacks_responded', 0)
        
        # Handle datetime fields
        if data.get('last_login'):
            admin.last_login = datetime.fromisoformat(data['last_login'])
        if data.get('created_at'):
            admin.created_at = datetime.fromisoformat(data['created_at'])
        if data.get('updated_at'):
            admin.updated_at = datetime.fromisoformat(data['updated_at'])
            
        return admin
    
    def set_password(self, password: str):
        """Set password hash"""
        self.password_hash = hashlib.sha256(password.encode()).hexdigest()
        self.updated_at = datetime.now()
    
    def verify_password(self, password: str) -> bool:
        """Verify password against hash"""
        return self.password_hash == hashlib.sha256(password.encode()).hexdigest()
    
    def has_permission(self, permission: Permission) -> bool:
        """Check if admin has specific permission"""
        return permission in self.permissions and self.is_active
    
    def can_approve_applications(self) -> bool:
        """Check if admin can approve applications"""
        return self.has_permission(Permission.APPROVE_APPLICATIONS)
    
    def can_manage_admins(self) -> bool:
        """Check if admin can manage other admins"""
        return self.has_permission(Permission.MANAGE_ADMINS)
    
    def record_login(self):
        """Record admin login"""
        self.last_login = datetime.now()
        self.login_count += 1
        self.updated_at = datetime.now()
    
    def record_application_review(self):
        """Record application review activity"""
        self.applications_reviewed += 1
        self.updated_at = datetime.now()
    
    def record_feedback_response(self):
        """Record feedback response activity"""
        self.feedbacks_responded += 1
        self.updated_at = datetime.now()
    
    def add_permission(self, permission: Permission):
        """Add permission to admin"""
        self.permissions.add(permission)
        self.updated_at = datetime.now()
    
    def remove_permission(self, permission: Permission):
        """Remove permission from admin"""
        self.permissions.discard(permission)
        self.updated_at = datetime.now()
    
    def update_role(self, new_role: AdminRole):
        """Update admin role and reset permissions"""
        self.role = new_role
        self.permissions = self._get_default_permissions()
        self.updated_at = datetime.now()
    
    def deactivate(self):
        """Deactivate admin account"""
        self.is_active = False
        self.updated_at = datetime.now()
    
    def activate(self):
        """Activate admin account"""
        self.is_active = True
        self.updated_at = datetime.now()
    
    def validate(self) -> Dict[str, str]:
        """Validate admin data and return errors if any"""
        errors = {}
        
        if not self.username or len(self.username.strip()) < 3:
            errors['username'] = 'Username must be at least 3 characters long'
            
        if not self.email or '@' not in self.email:
            errors['email'] = 'Valid email address is required'
            
        if not self.full_name or len(self.full_name.strip()) < 2:
            errors['full_name'] = 'Full name must be at least 2 characters long'
            
        if not self.password_hash:
            errors['password'] = 'Password is required'
            
        return errors

def create_default_admin() -> Admin:
    """Create default main admin"""
    admin = Admin(
        username="admin",
        email="admin@bugemauniv.ac.ug",
        full_name="System Administrator",
        role=AdminRole.MAIN_ADMIN
    )
    admin.set_password("admin123")  # Default password - should be changed
    return admin