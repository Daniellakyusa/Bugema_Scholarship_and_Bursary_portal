"""
Feedback Model - Represents student feedback on application process and tasks
"""
from datetime import datetime
from typing import Dict, Any, Optional
import uuid
from enum import Enum

class FeedbackType(Enum):
    APPLICATION_PROCESS = "application_process"
    TASK_EXPERIENCE = "task_experience"
    SYSTEM_USABILITY = "system_usability"
    GENERAL = "general"

class FeedbackRating(Enum):
    EXCELLENT = 5
    GOOD = 4
    AVERAGE = 3
    POOR = 2
    VERY_POOR = 1

class Feedback:
    def __init__(self, feedback_id: str = None, student_id: str = "",
                 application_id: str = "", feedback_type: FeedbackType = FeedbackType.GENERAL,
                 rating: FeedbackRating = FeedbackRating.AVERAGE, title: str = "",
                 message: str = "", suggestions: str = "", is_anonymous: bool = False,
                 created_at: datetime = None):
        
        self.feedback_id = feedback_id or str(uuid.uuid4())
        self.student_id = student_id if not is_anonymous else "anonymous"
        self.application_id = application_id
        self.feedback_type = feedback_type
        self.rating = rating
        self.title = title
        self.message = message
        self.suggestions = suggestions
        self.is_anonymous = is_anonymous
        
        # Admin response
        self.admin_response = ""
        self.responded_by = None
        self.response_date = None
        self.is_resolved = False
        
        # Timestamps
        self.created_at = created_at or datetime.now()
        self.updated_at = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert feedback object to dictionary"""
        return {
            'feedback_id': self.feedback_id,
            'student_id': self.student_id,
            'application_id': self.application_id,
            'feedback_type': self.feedback_type.value,
            'rating': self.rating.value,
            'title': self.title,
            'message': self.message,
            'suggestions': self.suggestions,
            'is_anonymous': self.is_anonymous,
            'admin_response': self.admin_response,
            'responded_by': self.responded_by,
            'response_date': self.response_date.isoformat() if self.response_date else None,
            'is_resolved': self.is_resolved,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Feedback':
        """Create feedback object from dictionary"""
        feedback = cls()
        feedback.feedback_id = data.get('feedback_id', str(uuid.uuid4()))
        feedback.student_id = data.get('student_id', '')
        feedback.application_id = data.get('application_id', '')
        
        # Handle enums
        feedback.feedback_type = FeedbackType(data.get('feedback_type', 'general'))
        feedback.rating = FeedbackRating(data.get('rating', 3))
        
        feedback.title = data.get('title', '')
        feedback.message = data.get('message', '')
        feedback.suggestions = data.get('suggestions', '')
        feedback.is_anonymous = data.get('is_anonymous', False)
        
        # Admin response fields
        feedback.admin_response = data.get('admin_response', '')
        feedback.responded_by = data.get('responded_by')
        feedback.is_resolved = data.get('is_resolved', False)
        
        # Handle datetime fields
        if data.get('response_date'):
            feedback.response_date = datetime.fromisoformat(data['response_date'])
        if data.get('created_at'):
            feedback.created_at = datetime.fromisoformat(data['created_at'])
        if data.get('updated_at'):
            feedback.updated_at = datetime.fromisoformat(data['updated_at'])
            
        return feedback
    
    def respond(self, admin_id: str, response: str):
        """Add admin response to feedback"""
        self.admin_response = response
        self.responded_by = admin_id
        self.response_date = datetime.now()
        self.is_resolved = True
        self.updated_at = datetime.now()
    
    def get_rating_text(self) -> str:
        """Get text representation of rating"""
        rating_map = {
            FeedbackRating.EXCELLENT: "Excellent",
            FeedbackRating.GOOD: "Good",
            FeedbackRating.AVERAGE: "Average",
            FeedbackRating.POOR: "Poor",
            FeedbackRating.VERY_POOR: "Very Poor"
        }
        return rating_map.get(self.rating, "Unknown")
    
    def get_type_text(self) -> str:
        """Get text representation of feedback type"""
        type_map = {
            FeedbackType.APPLICATION_PROCESS: "Application Process",
            FeedbackType.TASK_EXPERIENCE: "Task Experience",
            FeedbackType.SYSTEM_USABILITY: "System Usability",
            FeedbackType.GENERAL: "General Feedback"
        }
        return type_map.get(self.feedback_type, "Unknown")
    
    def validate(self) -> Dict[str, str]:
        """Validate feedback data and return errors if any"""
        errors = {}
        
        if not self.title or len(self.title.strip()) < 5:
            errors['title'] = 'Title must be at least 5 characters long'
            
        if not self.message or len(self.message.strip()) < 10:
            errors['message'] = 'Message must be at least 10 characters long'
            
        if not self.is_anonymous and not self.student_id:
            errors['student_id'] = 'Student ID is required for non-anonymous feedback'
            
        return errors

class FeedbackAnalytics:
    """Analytics class for feedback data"""
    
    @staticmethod
    def calculate_average_rating(feedbacks: list) -> float:
        """Calculate average rating from list of feedbacks"""
        if not feedbacks:
            return 0.0
        
        total_rating = sum(feedback.rating.value for feedback in feedbacks)
        return total_rating / len(feedbacks)
    
    @staticmethod
    def get_rating_distribution(feedbacks: list) -> Dict[str, int]:
        """Get distribution of ratings"""
        distribution = {
            "Excellent": 0,
            "Good": 0,
            "Average": 0,
            "Poor": 0,
            "Very Poor": 0
        }
        
        for feedback in feedbacks:
            rating_text = feedback.get_rating_text()
            if rating_text in distribution:
                distribution[rating_text] += 1
        
        return distribution
    
    @staticmethod
    def get_type_distribution(feedbacks: list) -> Dict[str, int]:
        """Get distribution of feedback types"""
        distribution = {
            "Application Process": 0,
            "Task Experience": 0,
            "System Usability": 0,
            "General Feedback": 0
        }
        
        for feedback in feedbacks:
            type_text = feedback.get_type_text()
            if type_text in distribution:
                distribution[type_text] += 1
        
        return distribution
    
    @staticmethod
    def get_response_rate(feedbacks: list) -> float:
        """Calculate percentage of feedbacks that have been responded to"""
        if not feedbacks:
            return 0.0
        
        responded_count = sum(1 for feedback in feedbacks if feedback.is_resolved)
        return (responded_count / len(feedbacks)) * 100