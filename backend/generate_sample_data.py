"""
Generate sample data for the admin panel demo
"""
import json
import os
import sys
import random
from datetime import datetime, timedelta

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.student import Student
from models.application import Application, ApplicationStatus, ApplicationCategory, ApplicationType
from models.organization import Organization, get_default_organizations
from models.feedback import Feedback, FeedbackType, FeedbackRating
from models.admin import Admin, create_default_admin

def generate_sample_students(count=50):
    """Generate sample students"""
    first_names = [
        "John", "Mary", "David", "Sarah", "Michael", "Jennifer", "Robert", "Lisa",
        "William", "Karen", "Richard", "Nancy", "Joseph", "Betty", "Thomas", "Helen",
        "Charles", "Sandra", "Christopher", "Donna", "Daniel", "Carol", "Matthew", "Ruth",
        "Anthony", "Sharon", "Mark", "Michelle", "Donald", "Laura", "Steven", "Sarah",
        "Paul", "Kimberly", "Andrew", "Deborah", "Joshua", "Dorothy", "Kenneth", "Lisa",
        "Kevin", "Nancy", "Brian", "Karen", "George", "Betty", "Edward", "Helen", "Ronald", "Sandra"
    ]
    
    last_names = [
        "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
        "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
        "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
        "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
        "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
        "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"
    ]
    
    programs = [
        "Computer Science", "Business Administration", "Engineering", "Medicine", "Education",
        "Nursing", "Agriculture", "Law", "Economics", "Psychology", "Biology", "Chemistry",
        "Physics", "Mathematics", "English Literature", "History", "Political Science",
        "Social Work", "Theology", "Mass Communication"
    ]
    
    students = []
    
    for i in range(count):
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        
        student = Student(
            name=f"{first_name} {last_name}",
            email=f"{first_name.lower()}.{last_name.lower()}@student.bugemauniv.ac.ug",
            contact=f"+256{random.randint(700000000, 799999999)}",
            institution="Bugema University",
            program=random.choice(programs),
            year_of_study=random.randint(1, 4),
            gpa=round(random.uniform(2.0, 4.0), 2),
            created_at=datetime.now() - timedelta(days=random.randint(1, 365))
        )
        students.append(student)
    
    return students

def generate_sample_applications(students, organizations, count=100):
    """Generate sample applications"""
    applications = []
    
    for i in range(count):
        student = random.choice(students)
        organization = random.choice(organizations)
        
        # Determine application category and type based on organization
        if organization.funding_type == "scholarship":
            category = ApplicationCategory.SCHOLARSHIP
            app_type = random.choice([ApplicationType.ACADEMIC, ApplicationType.SPORTS])
        elif organization.funding_type == "bursary":
            category = ApplicationCategory.BURSARY
            app_type = random.choice([ApplicationType.NEED_BASED, ApplicationType.WORK_PROGRAM])
        else:  # both
            category = random.choice([ApplicationCategory.SCHOLARSHIP, ApplicationCategory.BURSARY])
            if category == ApplicationCategory.SCHOLARSHIP:
                app_type = random.choice([ApplicationType.ACADEMIC, ApplicationType.SPORTS])
            else:
                app_type = random.choice([ApplicationType.NEED_BASED, ApplicationType.WORK_PROGRAM])
        
        # Generate realistic amounts
        if category == ApplicationCategory.SCHOLARSHIP:
            amount = random.randint(500000, 3000000)  # 500K - 3M UGX
        else:
            amount = random.randint(200000, 1500000)  # 200K - 1.5M UGX
        
        # Generate household income for bursaries
        household_income = 0
        if category == ApplicationCategory.BURSARY:
            household_income = random.randint(500000, 8000000)  # 500K - 8M UGX
        
        # Generate submission date (last 6 months)
        submission_date = datetime.now() - timedelta(days=random.randint(1, 180))
        
        # Determine status (most should be pending for demo)
        status_weights = [0.6, 0.25, 0.15]  # pending, approved, rejected
        status = random.choices([
            ApplicationStatus.PENDING,
            ApplicationStatus.APPROVED,
            ApplicationStatus.REJECTED
        ], weights=status_weights)[0]
        
        personal_statements = [
            "I am writing to apply for this scholarship/bursary as I am facing financial difficulties that are affecting my studies. My family's income is limited, and I need assistance to continue my education.",
            "As a dedicated student with strong academic performance, I believe I deserve this opportunity to further my education. I have maintained excellent grades and participated in various extracurricular activities.",
            "Coming from a humble background, education is my only hope for a better future. This financial assistance would enable me to focus on my studies without worrying about tuition fees.",
            "I am passionate about my field of study and committed to making a positive impact in my community. This scholarship/bursary would help me achieve my academic and career goals.",
            "Despite facing numerous challenges, I have remained determined to excel in my studies. This financial support would be instrumental in helping me complete my degree program."
        ]
        
        application = Application(
            student_id=student.student_id,
            category=category,
            application_type=app_type,
            organization_id=organization.organization_id,
            status=status,
            submission_date=submission_date,
            amount_requested=amount,
            personal_statement=random.choice(personal_statements),
            documents=["transcript.pdf", "recommendation.pdf", "id_copy.pdf"],
            household_income=household_income,
            task_completion_status={
                "sports_participation": random.choice([True, False]),
                "community_service": random.choice([True, False]),
                "work_program": random.choice([True, False])
            }
        )
        
        # Add review information for non-pending applications
        if status != ApplicationStatus.PENDING:
            application.reviewed_by = "admin"  # Default admin ID
            application.review_date = submission_date + timedelta(days=random.randint(1, 30))
            
            if status == ApplicationStatus.APPROVED:
                application.approval_amount = amount * random.uniform(0.5, 1.0)  # 50-100% of requested
                application.review_comments = "Application meets all criteria. Approved for funding."
            else:
                application.review_comments = random.choice([
                    "Application does not meet minimum GPA requirements.",
                    "Insufficient documentation provided.",
                    "Funding exhausted for this category.",
                    "Does not meet organization's eligibility criteria."
                ])
        
        applications.append(application)
    
    return applications

def generate_sample_feedback(students, applications, count=30):
    """Generate sample feedback"""
    feedback_list = []
    
    feedback_titles = [
        "Great application process",
        "System is user-friendly",
        "Need more clarity on requirements",
        "Excellent support from staff",
        "Application form is too long",
        "Quick response time",
        "Difficult to upload documents",
        "Very satisfied with the service",
        "Need mobile-friendly interface",
        "Transparent selection process"
    ]
    
    feedback_messages = [
        "The application process was smooth and straightforward. I appreciate the clear instructions provided.",
        "I found the system very easy to use. The interface is intuitive and well-designed.",
        "Some requirements were not clearly explained. It would be helpful to have more detailed guidelines.",
        "The support staff was very helpful and responded quickly to my questions.",
        "The application form has too many fields. It would be better if it was shorter and more focused.",
        "I was impressed by how quickly I received feedback on my application status.",
        "I had trouble uploading my documents. The file size limits should be increased.",
        "Overall, I'm very satisfied with the service provided. Keep up the good work!",
        "The website doesn't work well on mobile devices. Please consider making it mobile-friendly.",
        "I appreciate the transparency in the selection process. It gives applicants confidence in the system."
    ]
    
    for i in range(count):
        student = random.choice(students)
        application = random.choice(applications)
        
        feedback = Feedback(
            student_id=student.student_id if not random.choice([True, False]) else "anonymous",
            application_id=application.application_id,
            feedback_type=random.choice(list(FeedbackType)),
            rating=random.choice(list(FeedbackRating)),
            title=random.choice(feedback_titles),
            message=random.choice(feedback_messages),
            suggestions="Consider improving the user interface and providing more detailed guidelines.",
            is_anonymous=random.choice([True, False]),
            created_at=datetime.now() - timedelta(days=random.randint(1, 90))
        )
        
        # Some feedback should be resolved
        if random.choice([True, False, False]):  # 1/3 chance of being resolved
            feedback.respond("admin", "Thank you for your feedback. We will consider your suggestions for future improvements.")
        
        feedback_list.append(feedback)
    
    return feedback_list

def save_data_to_files(students, applications, organizations, feedback_list, admins):
    """Save all data to JSON files"""
    data_dir = "data"
    
    # Create data directory if it doesn't exist
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    
    # Save students
    with open(os.path.join(data_dir, "students.json"), 'w') as f:
        json.dump([student.to_dict() for student in students], f, indent=2, default=str)
    
    # Save applications
    with open(os.path.join(data_dir, "applications.json"), 'w') as f:
        json.dump([app.to_dict() for app in applications], f, indent=2, default=str)
    
    # Save organizations
    with open(os.path.join(data_dir, "organizations.json"), 'w') as f:
        json.dump([org.to_dict() for org in organizations], f, indent=2, default=str)
    
    # Save feedback
    with open(os.path.join(data_dir, "feedback.json"), 'w') as f:
        json.dump([fb.to_dict() for fb in feedback_list], f, indent=2, default=str)
    
    # Save admins
    with open(os.path.join(data_dir, "admins.json"), 'w') as f:
        json.dump([admin.to_dict(include_sensitive=True) for admin in admins], f, indent=2, default=str)

def main():
    """Generate all sample data"""
    print("Generating sample data...")
    
    # Generate organizations (use defaults)
    organizations = get_default_organizations()
    print(f"Generated {len(organizations)} organizations")
    
    # Generate students
    students = generate_sample_students(50)
    print(f"Generated {len(students)} students")
    
    # Generate applications
    applications = generate_sample_applications(students, organizations, 100)
    print(f"Generated {len(applications)} applications")
    
    # Generate feedback
    feedback_list = generate_sample_feedback(students, applications, 30)
    print(f"Generated {len(feedback_list)} feedback entries")
    
    # Create default admin
    admins = [create_default_admin()]
    print(f"Created {len(admins)} admin accounts")
    
    # Save all data
    save_data_to_files(students, applications, organizations, feedback_list, admins)
    print("Sample data saved to files!")
    
    print("\nDefault admin credentials:")
    print("Username: admin")
    print("Password: admin123")
    print("\nYou can now start the admin panel and login with these credentials.")

if __name__ == "__main__":
    main()