"""
Organization Model - Represents funding organizations and their criteria
"""
from datetime import datetime
from typing import Dict, Any, List
import uuid

class Organization:
    def __init__(self, organization_id: str = None, name: str = "", 
                 funding_type: str = "", description: str = "",
                 eligibility_criteria: Dict[str, Any] = None,
                 max_funding_amount: float = 0.0, available_slots: int = 0,
                 application_deadline: datetime = None, contact_email: str = "",
                 contact_phone: str = "", is_active: bool = True):
        
        self.organization_id = organization_id or str(uuid.uuid4())
        self.name = name
        self.funding_type = funding_type  # scholarship, bursary, both
        self.description = description
        self.eligibility_criteria = eligibility_criteria or {}
        self.max_funding_amount = max_funding_amount
        self.available_slots = available_slots
        self.application_deadline = application_deadline
        self.contact_email = contact_email
        self.contact_phone = contact_phone
        self.is_active = is_active
        
        # Statistics
        self.total_applications = 0
        self.approved_applications = 0
        self.total_funding_disbursed = 0.0
        
        # Timestamps
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert organization object to dictionary"""
        return {
            'organization_id': self.organization_id,
            'name': self.name,
            'funding_type': self.funding_type,
            'description': self.description,
            'eligibility_criteria': self.eligibility_criteria,
            'max_funding_amount': self.max_funding_amount,
            'available_slots': self.available_slots,
            'application_deadline': self.application_deadline.isoformat() if self.application_deadline else None,
            'contact_email': self.contact_email,
            'contact_phone': self.contact_phone,
            'is_active': self.is_active,
            'total_applications': self.total_applications,
            'approved_applications': self.approved_applications,
            'total_funding_disbursed': self.total_funding_disbursed,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Organization':
        """Create organization object from dictionary"""
        org = cls()
        org.organization_id = data.get('organization_id', str(uuid.uuid4()))
        org.name = data.get('name', '')
        org.funding_type = data.get('funding_type', '')
        org.description = data.get('description', '')
        org.eligibility_criteria = data.get('eligibility_criteria', {})
        org.max_funding_amount = data.get('max_funding_amount', 0.0)
        org.available_slots = data.get('available_slots', 0)
        org.contact_email = data.get('contact_email', '')
        org.contact_phone = data.get('contact_phone', '')
        org.is_active = data.get('is_active', True)
        
        # Statistics
        org.total_applications = data.get('total_applications', 0)
        org.approved_applications = data.get('approved_applications', 0)
        org.total_funding_disbursed = data.get('total_funding_disbursed', 0.0)
        
        # Handle datetime fields
        if data.get('application_deadline'):
            org.application_deadline = datetime.fromisoformat(data['application_deadline'])
        if data.get('created_at'):
            org.created_at = datetime.fromisoformat(data['created_at'])
        if data.get('updated_at'):
            org.updated_at = datetime.fromisoformat(data['updated_at'])
            
        return org
    
    def check_eligibility(self, student_data: Dict[str, Any]) -> Dict[str, bool]:
        """Check if student meets organization's eligibility criteria"""
        results = {}
        
        # Check GPA requirement
        if 'min_gpa' in self.eligibility_criteria:
            results['gpa_requirement'] = student_data.get('gpa', 0.0) >= self.eligibility_criteria['min_gpa']
        
        # Check year of study requirement
        if 'min_year' in self.eligibility_criteria:
            results['year_requirement'] = student_data.get('year_of_study', 0) >= self.eligibility_criteria['min_year']
        
        # Check income requirement (for bursaries)
        if 'max_household_income' in self.eligibility_criteria:
            results['income_requirement'] = student_data.get('household_income', 0) <= self.eligibility_criteria['max_household_income']
        
        # Check program requirement
        if 'allowed_programs' in self.eligibility_criteria:
            student_program = student_data.get('program', '').lower()
            allowed_programs = [p.lower() for p in self.eligibility_criteria['allowed_programs']]
            results['program_requirement'] = student_program in allowed_programs
        
        return results
    
    def has_available_slots(self) -> bool:
        """Check if organization has available funding slots"""
        return self.available_slots > 0
    
    def is_deadline_passed(self) -> bool:
        """Check if application deadline has passed"""
        if not self.application_deadline:
            return False
        return datetime.now() > self.application_deadline
    
    def update_statistics(self, approved: bool, funding_amount: float = 0.0):
        """Update organization statistics"""
        self.total_applications += 1
        if approved:
            self.approved_applications += 1
            self.total_funding_disbursed += funding_amount
            if self.available_slots > 0:
                self.available_slots -= 1
        self.updated_at = datetime.now()
    
    def get_success_rate(self) -> float:
        """Calculate approval success rate"""
        if self.total_applications == 0:
            return 0.0
        return (self.approved_applications / self.total_applications) * 100
    
    def validate(self) -> Dict[str, str]:
        """Validate organization data and return errors if any"""
        errors = {}
        
        if not self.name or len(self.name.strip()) < 2:
            errors['name'] = 'Organization name must be at least 2 characters long'
            
        if not self.funding_type or self.funding_type not in ['scholarship', 'bursary', 'both']:
            errors['funding_type'] = 'Funding type must be scholarship, bursary, or both'
            
        if self.max_funding_amount <= 0:
            errors['max_funding_amount'] = 'Maximum funding amount must be greater than 0'
            
        if self.available_slots < 0:
            errors['available_slots'] = 'Available slots cannot be negative'
            
        if self.contact_email and '@' not in self.contact_email:
            errors['contact_email'] = 'Valid email address is required'
            
        return errors

# Predefined organizations
def get_default_organizations() -> List[Organization]:
    """Get list of default organizations"""
    organizations = []
    
    # PEAS Uganda
    peas = Organization(
        name="PEAS Uganda",
        funding_type="both",
        description="Promoting Equality in African Schools - Supporting education across Uganda",
        eligibility_criteria={
            "min_gpa": 3.0,
            "min_year": 1,
            "max_household_income": 5000000,
            "allowed_programs": ["Education", "Teaching", "Social Work"]
        },
        max_funding_amount=2000000,
        available_slots=50,
        contact_email="scholarships@peasuganda.org",
        contact_phone="+256700000001"
    )
    organizations.append(peas)
    
    # Lora Foundation
    lora = Organization(
        name="Lora Foundation",
        funding_type="scholarship",
        description="Academic excellence scholarships for outstanding students",
        eligibility_criteria={
            "min_gpa": 3.5,
            "min_year": 2,
            "allowed_programs": ["Engineering", "Medicine", "Computer Science", "Business"]
        },
        max_funding_amount=3000000,
        available_slots=25,
        contact_email="info@lorafoundation.org",
        contact_phone="+256700000002"
    )
    organizations.append(lora)
    
    # Holy Cross
    holy_cross = Organization(
        name="Holy Cross",
        funding_type="bursary",
        description="Faith-based bursaries for students in need",
        eligibility_criteria={
            "min_gpa": 2.5,
            "min_year": 1,
            "max_household_income": 3000000
        },
        max_funding_amount=1500000,
        available_slots=75,
        contact_email="bursaries@holycross.ug",
        contact_phone="+256700000003"
    )
    organizations.append(holy_cross)
    
    # Ssanyu Babies Home
    ssanyu = Organization(
        name="Ssanyu Babies Home",
        funding_type="both",
        description="Supporting orphaned and vulnerable children through education",
        eligibility_criteria={
            "min_gpa": 2.0,
            "min_year": 1,
            "max_household_income": 2000000
        },
        max_funding_amount=2500000,
        available_slots=40,
        contact_email="education@ssanyubabies.org",
        contact_phone="+256700000004"
    )
    organizations.append(ssanyu)
    
    return organizations