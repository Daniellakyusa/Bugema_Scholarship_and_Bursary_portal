"""
Student Model - Represents student data and academic records
"""
from datetime import datetime
from typing import Optional, Dict, Any
import uuid

class Student:
    def __init__(self, student_id: str = None, name: str = "", email: str = "", 
                 contact: str = "", institution: str = "", program: str = "",
                 year_of_study: int = 1, gpa: float = 0.0, created_at: datetime = None):
        self.student_id = student_id or str(uuid.uuid4())
        self.name = name
        self.email = email
        self.contact = contact
        self.institution = institution
        self.program = program
        self.year_of_study = year_of_study
        self.gpa = gpa
        self.registration_status = "PENDING"
        self.created_at = created_at or datetime.now()
        self.updated_at = datetime.now()
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert student object to dictionary"""
        return {
            'student_id': self.student_id,
            'name': self.name,
            'email': self.email,
            'contact': self.contact,
            'institution': self.institution,
            'program': self.program,
            'year_of_study': self.year_of_study,
            'gpa': self.gpa,
            'registration_status': self.registration_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Student':
        """Create student object from dictionary"""
        student = cls()
        student.student_id = data.get('student_id', str(uuid.uuid4()))
        student.name = data.get('name', '')
        student.email = data.get('email', '')
        student.contact = data.get('contact', '')
        student.institution = data.get('institution', '')
        student.program = data.get('program', '')
        student.year_of_study = data.get('year_of_study', 1)
        student.gpa = data.get('gpa', 0.0)
        student.registration_status = data.get('registration_status', 'PENDING')
        
        # Handle datetime fields
        if data.get('created_at'):
            student.created_at = datetime.fromisoformat(data['created_at'])
        if data.get('updated_at'):
            student.updated_at = datetime.fromisoformat(data['updated_at'])
            
        return student
    
    def approve_registration(self):
        """Approve the student's registration"""
        self.registration_status = "APPROVED"
        self.updated_at = datetime.now()

    def reject_registration(self):
        """Reject the student's registration"""
        self.registration_status = "REJECTED"
        self.updated_at = datetime.now()
        
    def is_eligible_for_academic_scholarship(self) -> bool:
        """Check if student meets academic scholarship criteria"""
        return self.gpa >= 3.5 and self.year_of_study >= 2
    
    def is_eligible_for_need_based_bursary(self) -> bool:
        """Check basic eligibility for need-based bursary"""
        return self.year_of_study >= 1  # Basic eligibility check
    
    def validate(self) -> Dict[str, str]:
        """Validate student data and return errors if any"""
        errors = {}
        
        if not self.name or len(self.name.strip()) < 2:
            errors['name'] = 'Name must be at least 2 characters long'
            
        if not self.email or '@' not in self.email:
            errors['email'] = 'Valid email address is required'
            
        if not self.contact or len(self.contact.strip()) < 10:
            errors['contact'] = 'Valid contact number is required'
            
        if not self.institution or len(self.institution.strip()) < 2:
            errors['institution'] = 'Institution name is required'
            
        if not self.program or len(self.program.strip()) < 2:
            errors['program'] = 'Program of study is required'
            
        if self.year_of_study < 1 or self.year_of_study > 7:
            errors['year_of_study'] = 'Year of study must be between 1 and 7'
            
        if self.gpa < 0.0 or self.gpa > 4.0:
            errors['gpa'] = 'GPA must be between 0.0 and 4.0'
            
        return errors