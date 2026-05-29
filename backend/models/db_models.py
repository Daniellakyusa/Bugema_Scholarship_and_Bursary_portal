"""
SQLAlchemy Database Models
"""
from database import db, TimestampMixin, JSONEncodedDict
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import enum


# Enums
class UserRole(enum.Enum):
    ADMIN = 'admin'
    STAFF = 'staff'
    STUDENT = 'student'


class ApplicationStatus(enum.Enum):
    PENDING = 'pending'
    UNDER_REVIEW = 'under_review'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    WITHDRAWN = 'withdrawn'


class ApplicationCategory(enum.Enum):
    SCHOLARSHIP = 'scholarship'
    BURSARY = 'bursary'


class RegistrationStatus(enum.Enum):
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'


# Models
class User(db.Model, TimestampMixin):
    """User model for authentication"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(200), nullable=False)
    role = db.Column(db.Enum(UserRole), nullable=False, default=UserRole.STUDENT)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    applications = db.relationship('Application', backref='user', lazy='dynamic', foreign_keys='Application.student_id')
    reviewed_applications = db.relationship('Application', backref='reviewer', lazy='dynamic', foreign_keys='Application.reviewed_by')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if password matches"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self, include_sensitive=False):
        """Convert to dictionary"""
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role.value,
            'is_active': self.is_active,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        if include_sensitive:
            data['password_hash'] = self.password_hash
        return data
    
    def __repr__(self):
        return f'<User {self.username}>'


class Student(db.Model, TimestampMixin):
    """Student model"""
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Personal Information
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=False)
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(20))
    nationality = db.Column(db.String(100))
    
    # Address
    address = db.Column(db.Text)
    city = db.Column(db.String(100))
    district = db.Column(db.String(100))
    country = db.Column(db.String(100), default='Uganda')
    
    # Academic Information
    program = db.Column(db.String(200), nullable=False)
    year_of_study = db.Column(db.Integer, nullable=False)
    gpa = db.Column(db.Float, default=0.0)
    enrollment_date = db.Column(db.Date)
    expected_graduation = db.Column(db.Date)
    
    # Registration
    registration_status = db.Column(db.Enum(RegistrationStatus), default=RegistrationStatus.PENDING)
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    approval_date = db.Column(db.DateTime)
    
    # Additional Information
    emergency_contact = db.Column(db.String(200))
    emergency_phone = db.Column(db.String(20))
    blood_type = db.Column(db.String(5))
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='student_profile')
    applications = db.relationship('Application', backref='student', lazy='dynamic')
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'student_id': self.student_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name,
            'email': self.email,
            'phone': self.phone,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'nationality': self.nationality,
            'address': self.address,
            'city': self.city,
            'district': self.district,
            'country': self.country,
            'program': self.program,
            'year_of_study': self.year_of_study,
            'gpa': self.gpa,
            'enrollment_date': self.enrollment_date.isoformat() if self.enrollment_date else None,
            'expected_graduation': self.expected_graduation.isoformat() if self.expected_graduation else None,
            'registration_status': self.registration_status.value,
            'registration_date': self.registration_date.isoformat() if self.registration_date else None,
            'approval_date': self.approval_date.isoformat() if self.approval_date else None,
            'emergency_contact': self.emergency_contact,
            'emergency_phone': self.emergency_phone,
            'blood_type': self.blood_type,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Student {self.student_id}: {self.full_name}>'


class Organization(db.Model, TimestampMixin):
    """Organization/Sponsor model"""
    __tablename__ = 'organizations'
    
    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    contact_person = db.Column(db.String(200))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    website = db.Column(db.String(200))
    is_active = db.Column(db.Boolean, default=True)
    
    # Funding Information
    total_funding = db.Column(db.Float, default=0.0)
    available_funding = db.Column(db.Float, default=0.0)
    
    # Relationships
    applications = db.relationship('Application', backref='organization', lazy='dynamic')
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'organization_id': self.organization_id,
            'name': self.name,
            'description': self.description,
            'contact_person': self.contact_person,
            'email': self.email,
            'phone': self.phone,
            'website': self.website,
            'is_active': self.is_active,
            'total_funding': self.total_funding,
            'available_funding': self.available_funding,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Organization {self.name}>'


class Application(db.Model, TimestampMixin):
    """Application model for scholarships and bursaries"""
    __tablename__ = 'applications'
    
    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.String(100), unique=True, nullable=False, index=True)
    
    # Foreign Keys
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    
    # Application Details
    category = db.Column(db.Enum(ApplicationCategory), nullable=False)
    application_type = db.Column(db.String(50))  # academic, sports, need_based, etc.
    status = db.Column(db.Enum(ApplicationStatus), default=ApplicationStatus.PENDING, nullable=False)
    
    # Financial Information
    amount_requested = db.Column(db.Float, nullable=False)
    amount_approved = db.Column(db.Float, default=0.0)
    household_income = db.Column(db.Float)
    monthly_expenses = db.Column(db.Float)
    dependents = db.Column(db.Integer)
    
    # Application Content
    personal_statement = db.Column(db.Text, nullable=False)
    reason_for_application = db.Column(db.Text)
    
    # Documents (stored as JSON)
    documents = db.Column(JSONEncodedDict)
    
    # Academic Information
    current_gpa = db.Column(db.Float)
    academic_achievements = db.Column(db.Text)
    
    # Review Information
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    review_date = db.Column(db.DateTime)
    review_comments = db.Column(db.Text)
    eligibility_score = db.Column(db.Float)
    
    # Dates
    submission_date = db.Column(db.DateTime, default=datetime.utcnow)
    approval_date = db.Column(db.DateTime)
    rejection_date = db.Column(db.DateTime)
    
    # Additional metadata
    metadata = db.Column(JSONEncodedDict)
    
    def calculate_eligibility_score(self):
        """Calculate eligibility score"""
        score = 0.0
        
        # Academic performance (40%)
        if self.current_gpa:
            if self.current_gpa >= 3.8:
                score += 40
            elif self.current_gpa >= 3.5:
                score += 30
            elif self.current_gpa >= 3.0:
                score += 20
            elif self.current_gpa >= 2.5:
                score += 10
        
        # Financial need (30%) - for bursaries
        if self.category == ApplicationCategory.BURSARY and self.household_income:
            if self.household_income < 1000000:
                score += 30
            elif self.household_income < 2000000:
                score += 25
            elif self.household_income < 5000000:
                score += 15
            elif self.household_income < 10000000:
                score += 5
        
        # Personal statement quality (20%)
        if self.personal_statement and len(self.personal_statement) > 200:
            score += 20
        elif self.personal_statement and len(self.personal_statement) > 100:
            score += 10
        
        # Document completeness (10%)
        if self.documents:
            doc_count = len([v for v in self.documents.values() if v])
            score += min(doc_count * 2, 10)
        
        self.eligibility_score = min(score, 100.0)
        return self.eligibility_score
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'application_id': self.application_id,
            'student_id': self.student_id,
            'organization_id': self.organization_id,
            'category': self.category.value,
            'application_type': self.application_type,
            'status': self.status.value,
            'amount_requested': self.amount_requested,
            'amount_approved': self.amount_approved,
            'household_income': self.household_income,
            'monthly_expenses': self.monthly_expenses,
            'dependents': self.dependents,
            'personal_statement': self.personal_statement,
            'reason_for_application': self.reason_for_application,
            'documents': self.documents,
            'current_gpa': self.current_gpa,
            'academic_achievements': self.academic_achievements,
            'reviewed_by': self.reviewed_by,
            'review_date': self.review_date.isoformat() if self.review_date else None,
            'review_comments': self.review_comments,
            'eligibility_score': self.eligibility_score,
            'submission_date': self.submission_date.isoformat() if self.submission_date else None,
            'approval_date': self.approval_date.isoformat() if self.approval_date else None,
            'rejection_date': self.rejection_date.isoformat() if self.rejection_date else None,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Application {self.application_id}: {self.category.value}>'


class Feedback(db.Model, TimestampMixin):
    """Feedback model"""
    __tablename__ = 'feedback'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer)  # 1-5 stars
    category = db.Column(db.String(50))  # bug, suggestion, complaint, etc.
    status = db.Column(db.String(20), default='pending')  # pending, resolved, closed
    response = db.Column(db.Text)
    responded_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    response_date = db.Column(db.DateTime)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='feedback_submitted')
    responder = db.relationship('User', foreign_keys=[responded_by], backref='feedback_responded')
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'email': self.email,
            'subject': self.subject,
            'message': self.message,
            'rating': self.rating,
            'category': self.category,
            'status': self.status,
            'response': self.response,
            'responded_by': self.responded_by,
            'response_date': self.response_date.isoformat() if self.response_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Feedback {self.id}: {self.subject}>'


class AuditLog(db.Model, TimestampMixin):
    """Audit log for tracking changes"""
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    action = db.Column(db.String(100), nullable=False)  # CREATE, UPDATE, DELETE, etc.
    entity_type = db.Column(db.String(100), nullable=False)  # Application, Student, etc.
    entity_id = db.Column(db.String(100), nullable=False)
    changes = db.Column(JSONEncodedDict)  # Store what changed
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.String(200))
    
    # Relationships
    user = db.relationship('User', backref='audit_logs')
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'changes': self.changes,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'created_at': self.created_at.isoformat()
        }
    
    def __repr__(self):
        return f'<AuditLog {self.id}: {self.action} on {self.entity_type}>'
