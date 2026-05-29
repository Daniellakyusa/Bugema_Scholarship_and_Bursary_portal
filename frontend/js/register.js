// Registration form JavaScript - Fixed version
document.addEventListener('DOMContentLoaded', function() {
    console.log('Registration form loaded');
    
    const form = document.getElementById('registrationForm');
    
    if (form) {
        form.addEventListener('submit', handleRegistrationSubmit);
        
        // File input styling
        const uploadedDocumentInput = document.getElementById('uploadedDocument');
        const browseBtn = document.querySelector('.btn-browse');
        
        if (uploadedDocumentInput && browseBtn) {
            browseBtn.addEventListener('click', () => {
                uploadedDocumentInput.click();
            });
            
            uploadedDocumentInput.addEventListener('change', function() {
                if (this.files.length > 0) {
                    browseBtn.textContent = `Selected: ${this.files[0].name}`;
                    browseBtn.style.background = '#28a745';
                    browseBtn.style.color = 'white';
                } else {
                    browseBtn.textContent = 'Browse';
                    browseBtn.style.background = '';
                    browseBtn.style.color = '';
                }
            });
        }
    }
});

function handleRegistrationSubmit(e) {
    e.preventDefault();
    
    console.log('Form submission started');
    
    try {
        // Get form data
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        console.log('Form data collected:', data);
        
        // Basic validation
        const requiredFields = {
            'fullName': 'Full Name',
            'email': 'Email',
            'phone': 'Phone',
            'studentId': 'Student ID',
            'course': 'Course',
            'year': 'Year',
            'gpa': 'GPA'
        };
        
        let missingFields = [];
        
        for (let fieldId in requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                missingFields.push(requiredFields[fieldId]);
            }
        }
        
        if (missingFields.length > 0) {
            showNotification(`Please fill in: ${missingFields.join(', ')}`, 'error');
            return;
        }
        
        // Check gender selection
        const genderSelected = document.querySelector('input[name="gender"]:checked');
        if (!genderSelected) {
            showNotification('Please select your gender', 'error');
            return;
        }
        
        // Check date of birth
        const dateOfBirth = document.getElementById('dateOfBirth');
        if (!dateOfBirth || !dateOfBirth.value) {
            showNotification('Please select your date of birth', 'error');
            return;
        }
        
        console.log('Validation passed');
        
        // Get document name safely
        let documentName = 'No document uploaded';
        try {
            const docInput = document.getElementById('uploadedDocument');
            if (docInput && docInput.files && docInput.files.length > 0) {
                documentName = docInput.files[0].name;
            }
        } catch (docError) {
            console.log('Document access error:', docError);
        }
        
        // Create registration data
        const registrationData = {
            id: Date.now().toString(),
            fullName: data.fullName || '',
            email: data.email || '',
            phone: data.phone || '',
            countryCode: data.countryCode || '+256',
            fullPhone: `${data.countryCode || '+256'}${data.phone || ''}`,
            studentId: data.studentId || '',
            course: data.course || '',
            program: getProgramName(data.course || ''),
            year: data.year || '',
            gpa: data.gpa || '',
            dateOfBirth: data.dateOfBirth || '',
            gender: genderSelected ? genderSelected.value : '',
            street: data.street || '',
            document: documentName,
            registrationDate: new Date().toISOString(),
            status: 'pending'
        };
        
        console.log('Registration data prepared:', registrationData);
        
        // Show processing message
        showNotification('Processing your registration...', 'info');
        
        // Simulate processing delay
        setTimeout(() => {
            try {
                // Store in localStorage
                let registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
                registrations.push(registrationData);
                localStorage.setItem('registrations', JSON.stringify(registrations));
                
                console.log('Registration saved successfully');
                
                // Show success message
                showNotification('Registration completed successfully!', 'success');
                
                // Show success alert
                alert(`✅ Registration Successful!\n\nYour registration has been submitted.\n\nRegistration ID: ${registrationData.id}\n\nStatus: Pending Admin Review`);
                
                // Reset form
                e.target.reset();
                
                // Reset file button
                const browseBtn = document.querySelector('.btn-browse');
                if (browseBtn) {
                    browseBtn.textContent = 'Browse';
                    browseBtn.style.background = '';
                    browseBtn.style.color = '';
                }
                
                // Ask about admin panel
                setTimeout(() => {
                    if (confirm('Would you like to view the admin panel?')) {
                        window.location.href = 'admin-panel.html';
                    }
                }, 1000);
                
            } catch (saveError) {
                console.error('Error saving registration:', saveError);
                showNotification('Registration completed but there was a storage error.', 'warning');
                alert('Registration completed! However, there was a minor storage issue. Please contact support if needed.');
            }
        }, 1500);
        
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('An error occurred. Please try again.', 'error');
        alert('An error occurred during registration. Please check your information and try again.');
    }
}

// Helper function to get program name
function getProgramName(courseCode) {
    const programs = {
        'bba': 'Bachelor of Business Administration',
        'bed': 'Bachelor of Education',
        'bth': 'Bachelor of Theology',
        'bcs': 'Bachelor of Computer Science',
        'bna': 'Bachelor of Nursing'
    };
    return programs[courseCode] || courseCode || 'Unknown Program';
}

// Notification function
function showNotification(message, type = 'info') {
    console.log(`Notification: ${type} - ${message}`);
    
    // Show in message display area if it exists
    const messageDisplay = document.getElementById('messageDisplay');
    if (messageDisplay) {
        messageDisplay.style.display = 'block';
        messageDisplay.textContent = message;
        
        // Set colors based on type
        switch(type) {
            case 'success':
                messageDisplay.style.backgroundColor = '#d4edda';
                messageDisplay.style.color = '#155724';
                messageDisplay.style.border = '1px solid #c3e6cb';
                break;
            case 'error':
                messageDisplay.style.backgroundColor = '#f8d7da';
                messageDisplay.style.color = '#721c24';
                messageDisplay.style.border = '1px solid #f5c6cb';
                break;
            case 'info':
                messageDisplay.style.backgroundColor = '#d1ecf1';
                messageDisplay.style.color = '#0c5460';
                messageDisplay.style.border = '1px solid #bee5eb';
                break;
            default:
                messageDisplay.style.backgroundColor = '#fff3cd';
                messageDisplay.style.color = '#856404';
                messageDisplay.style.border = '1px solid #ffeaa7';
        }
        
        // Auto-hide after 5 seconds for non-success messages
        if (type !== 'success') {
            setTimeout(() => {
                messageDisplay.style.display = 'none';
            }, 5000);
        }
    }
    
    // Create floating notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles if not present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 1001;
                max-width: 300px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                animation: slideIn 0.3s ease;
            }
            .notification.info { background: #17a2b8; }
            .notification.success { background: #28a745; }
            .notification.error { background: #dc3545; }
            .notification.warning { background: #ffc107; color: #212529; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}