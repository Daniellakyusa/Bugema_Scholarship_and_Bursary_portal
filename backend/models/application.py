"""
Application Model - Represents scholarship and bursary applications
"""
from datetime import datetime
from typing import Optional, Dict, Any, List
import uuid
from enum import Enum

class ApplicationStatus(Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    UNDER_REVIEW = "under_review"

class ApplicationCategory(Enum):
    SCHOLARSHIP = "scholarship"
    BURSARY = "bursary"

class ApplicationType(Enum):
    ACADEMIC = "academic"
    SPORTS = "sports"
    WORK_PROGRAM = "work_program"
    NEED_BASED = "need_based"

class Application:
    def __init__(self, application_id: str = None, student_id: str = "", 
                 category: ApplicationCategory = ApplicationCategory.SCHOLARSHIP,
                 application_type: ApplicationType = ApplicationType.ACADEMIC,
                 organization_id: str = "", status: ApplicationStatus = ApplicationStatus.PENDING,
                 submission_date: datetime = None, amount_requested: float = 0.0,
                 personal_statement: str = "", documents: List[str] = None,
                 household_income: float = 0.0, task_completion_status: Dict[str, bool] = None):
        
        self.application_id = application_id or str(uuid.uuid4())
        self.student_id = student_id
        self.category = category
        self.application_type = application_type
        self.organization_id = organization_id
        self.status = status
        self.submission_date = submission_date or datetime.now()
        self.amount_requested = amount_requested
        self.personal_statement = personal_statement
        self.documents = documents or []
        self.household_income = household_income
        self.task_completion_status = task_completion_status or {}
        
        # Admin fields
        self.reviewed_by = None
        self.review_date = None
        self.review_comments = ""
        self.approval_amount = 0.0
        
        # Timestamps
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert application object to dictionary"""
        return {
            'application_id': self.application_id,
            'student_id': self.student_id,
            'category': self.category.value,
            'application_type': self.application_type.value,
            'organization_id': self.organization_id,
            'status': self.status.value,
            'submission_date': self.submission_date.isoformat() if self.submission_date else None,
            'amount_requested': self.amount_requested,
            'personal_statement': self.personal_statement,
            'documents': self.documents,
            'household_income': self.household_income,
            'task_completion_status': self.task_completion_status,
            'reviewed_by': self.reviewed_by,
            'review_date': self.review_date.isoformat() if self.review_date else None,
            'review_comments': self.review_comments,
            'approval_amount': self.approval_amount,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Application':
        """Create application object from dictionary"""
        app = cls()
        app.application_id = data.get('application_id', str(uuid.uuid4()))
        app.student_id = data.get('student_id', '')
        
        # Handle enums
        app.category = ApplicationCategory(data.get('category', 'scholarship'))
        app.application_type = ApplicationType(data.get('application_type', 'academic'))
        app.status = ApplicationStatus(data.get('status', 'pending'))
        
        app.organization_id = data.get('organization_id', '')
        app.amount_requested = data.get('amount_requested', 0.0)
        app.personal_statement = data.get('personal_statement', '')
        app.documents = data.get('documents', [])
        app.household_income = data.get('household_income', 0.0)
        app.task_completion_status = data.get('task_completion_status', {})
        
        # Admin fields
        app.reviewed_by = data.get('reviewed_by')
        app.review_comments = data.get('review_comments', '')
        app.approval_amount = data.get('approval_amount', 0.0)
        
        # Handle datetime fields
        if data.get('submission_date'):
            app.submission_date = datetime.fromisoformat(data['submission_date'])
        if data.get('review_date'):
            app.review_date = datetime.fromisoformat(data['review_date'])
        if data.get('created_at'):
            app.created_at = datetime.fromisoformat(data['created_at'])
        if data.get('updated_at'):
            app.updated_at = datetime.fromisoformat(data['updated_at'])
            
        return app
    
    def approve(self, admin_id: str, approval_amount: float = None, comments: str = ""):
        """Approve the application"""
        self.status = ApplicationStatus.APPROVED
        self.reviewed_by = admin_id
        self.review_date = datetime.now()
        self.review_comments = comments
        self.approval_amount = approval_amount or self.amount_requested
        self.updated_at = datetime.now()
    
    def reject(self, admin_id: str, comments: str = ""):
        """Reject the application"""
        self.status = ApplicationStatus.REJECTED
        self.reviewed_by = admin_id
        self.review_date = datetime.now()
        self.review_comments = comments
        self.approval_amount = 0.0
        self.updated_at = datetime.now()
    
    def set_under_review(self, admin_id: str):
        """Set application status to under review"""
        self.status = ApplicationStatus.UNDER_REVIEW
        self.reviewed_by = admin_id
        self.updated_at = datetime.now()
    
    def calculate_eligibility_score(self, student_gpa: float = 0.0) -> float:
        """Calculate eligibility score based on various factors"""
        score = 0.0
        
        # Academic performance (40% weight)
        if student_gpa >= 3.8:
            score += 40
        elif student_gpa >= 3.5:
            score += 30
        elif student_gpa >= 3.0:
            score += 20
        elif student_gpa >= 2.5:
            score += 10
        
        # Financial need (30% weight) - lower income = higher score
        if self.household_income > 0:
            if self.household_income < 1000000:  # Very low income
                score += 30
            elif self.household_income < 2000000:  # Low income
                score += 25
            elif self.household_income < 5000000:  # Medium income
                score += 15
            elif self.household_income < 10000000:  # Higher income
                score += 5
        
        # Task completion (20% weight)
        if self.task_completion_status:
            completion_rate = sum(self.task_completion_status.values()) / len(self.task_completion_status)
            score += completion_rate * 20
        
        # Personal statement quality (10% weight)
        if len(self.personal_statement) > 200:
            score += 10
        elif len(self.personal_statement) > 100:
            score += 5
        
        return min(score, 100.0)  # Cap at 100
    
    def validate(self) -> Dict[str, str]:
        """Validate application data and return errors if any"""
        errors = {}
        
        if not self.student_id:
            errors['student_id'] = 'Student ID is required'
            
        if not self.organization_id:
            errors['organization_id'] = 'Organization selection is required'
            
        if self.amount_requested <= 0:
            errors['amount_requested'] = 'Amount requested must be greater than 0'
            
        if not self.personal_statement or len(self.personal_statement.strip()) < 50:
            errors['personal_statement'] = 'Personal statement must be at least 50 characters'
            
        if self.category == ApplicationCategory.BURSARY and self.household_income <= 0:
            errors['household_income'] = 'Household income is required for bursary applications'
            
        if not self.documents or len(self.documents) == 0:
            errors['documents'] = 'At least one document must be uploaded'
            
        return errors