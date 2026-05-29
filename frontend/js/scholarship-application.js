// Scholarship application form JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('scholarshipForm');
    
    if (form) {
        form.addEventListener('submit', handleScholarshipSubmit);
        
        // Add file validation
        const fileInputs = ['transcript', 'recommendation', 'idCopy', 'proof'];
        fileInputs.forEach(fieldId => {
            const fileInput = document.getElementById(fieldId);
            if (fileInput) {
                fileInput.addEventListener('change', () => validateFile(fileInput));
            }
        });
        
        // GPA validation
        const gpa = document.getElementById('gpa');
        if (gpa) {
            gpa.addEventListener('input', validateGPA);
        }
        
        // Phone validation
        const phone = document.getElementById('phone');
        if (phone) {
            phone.addEventListener('blur', validatePhone);
        }
    }
});

function handleScholarshipSubmit(e) {
    e.preventDefault();
    
    // Validate all fields
    if (!validateScholarshipForm()) {
        showNotification('Please correct the errors in the form and try again', 'error');
        return;
    }
    
    // Get form data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Prepare complete submission data with metadata
    const submissionData = {
        applicant: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            studentId: data.studentId,
            program: data.program
        },
        academicInfo: {
            currentYear: data.year,
            gpa: data.gpa,
            scholarshipType: data.scholarshipType
        },
        application: {
            personalStatement: data.essay,
            reason: data.essay, // Also include as reason for consistency
            declaration: data.declaration ? true : false,
            consent: data.consent ? true : false
        },
        documents: {
            transcript: formData.get('transcript')?.name || 'Not uploaded',
            recommendation: formData.get('recommendation')?.name || 'Not uploaded',
            idCopy: formData.get('idCopy')?.name || 'Not uploaded',
            proof: formData.get('proof')?.name || 'Not uploaded',
            essay: 'Personal statement included'
        },
        metadata: {
            submittedAt: new Date().toISOString(),
            status: 'pending',
            applicationId: 'SCHOL-' + Date.now(),
            applicationType: 'scholarship'
        }
    };
    
    // Show processing message
    showNotification('Processing your application...', 'info');
    
    // Attempt to submit to backend
    submitToBackend(submissionData)
        .then(response => {
            // Store locally as backup
            const existingApplications = JSON.parse(localStorage.getItem('scholarshipApplications') || '[]');
            existingApplications.push(submissionData);
            localStorage.setItem('scholarshipApplications', JSON.stringify(existingApplications));
            
            showNotification(
                `✓ Application submitted successfully!\n\nApplication ID: ${submissionData.metadata.applicationId}\n\nWe will review your application and contact you within 5-7 business days.`,
                'success'
            );
            
            // Reset form
            e.target.reset();
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 4000);
        })
        .catch(error => {
            console.error('Backend submission failed, saving locally:', error);
            
            // Fallback: Save locally if backend is unavailable
            const existingApplications = JSON.parse(localStorage.getItem('scholarshipApplications') || '[]');
            existingApplications.push(submissionData);
            localStorage.setItem('scholarshipApplications', JSON.stringify(existingApplications));
            
            showNotification(
                `✓ Application saved successfully!\n\nApplication ID: ${submissionData.metadata.applicationId}\n\nNote: Backend service unavailable, application saved locally.`,
                'success'
            );
            
            // Reset form
            e.target.reset();
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 4000);
        });
}

async function submitToBackend(submissionData) {
    const backendUrl = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://localhost:5000/api';
    try {
        const response = await fetch(`${backendUrl}/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(submissionData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        throw error;
    }
}

function validateScholarshipForm() {
    let isValid = true;
    
    // Validate required text fields
    const requiredTextFields = ['firstName', 'lastName', 'email', 'phone', 'studentId', 'program', 'year', 'gpa', 'essay'];
    
    requiredTextFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            if (field) showFieldError(field, 'This field is required');
            isValid = false;
        } else {
            if (field) clearFieldError(field);
        }
    });
    
    // Validate scholarship type (radio button)
    const scholarshipTypeSelected = document.querySelector('input[name="scholarshipType"]:checked');
    if (!scholarshipTypeSelected) {
        const scholarshipTypeContainer = document.querySelector('.radio-group');
        if (scholarshipTypeContainer) {
            showFieldError(scholarshipTypeContainer, 'Please select a scholarship type');
        }
        isValid = false;
    }
    
    // Validate file fields (transcript, recommendation, idCopy, proof)
    const requiredFileFields = ['transcript', 'recommendation', 'idCopy', 'proof'];
    
    requiredFileFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field || field.files.length === 0) {
            if (field) showFieldError(field, 'Please upload a file');
            isValid = false;
        } else {
            if (field) clearFieldError(field);
        }
    });
    
    // Validate checkboxes (declaration and consent)
    const declaration = document.getElementById('declaration');
    const consent = document.getElementById('consent');
    
    if (!declaration || !declaration.checked) {
        if (declaration) showFieldError(declaration.parentNode, 'You must certify that information is true and accurate');
        isValid = false;
    } else {
        if (declaration) clearFieldError(declaration.parentNode);
    }
    
    if (!consent || !consent.checked) {
        if (consent) showFieldError(consent.parentNode, 'You must consent to data processing');
        isValid = false;
    } else {
        if (consent) clearFieldError(consent.parentNode);
    }
    
    // Validate GPA
    const gpa = document.getElementById('gpa');
    if (gpa && gpa.value && !isValidGPA(gpa.value)) {
        showFieldError(gpa, 'Please enter a valid GPA (0-4.0)');
        isValid = false;
    }
    
    // Validate phone
    const phone = document.getElementById('phone');
    if (phone && phone.value && !isValidPhone(phone.value)) {
        showFieldError(phone, 'Please enter a valid phone number');
        isValid = false;
    }
    
    // Validate essay length
    const essay = document.getElementById('essay');
    if (essay && essay.value && essay.value.length < 50) {
        showFieldError(essay, 'Please provide at least 50 characters for your personal statement');
        isValid = false;
    } else if (essay && essay.value && essay.value.length > 2000) {
        showFieldError(essay, 'Personal statement must be less than 2000 characters');
        isValid = false;
    }
    
    return isValid;
}

function validateFile(input) {
    const file = input.files[0];
    
    if (!file) {
        showFieldError(input, 'Please select a file');
        return false;
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        showFieldError(input, 'File size must be less than 5MB');
        input.value = ''; // Clear the file input
        return false;
    }
    
    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        showFieldError(input, 'Only PDF, DOC, DOCX, JPG, and PNG files are allowed');
        input.value = ''; // Clear the file input
        return false;
    }
    
    clearFieldError(input);
    showFileInfo(input, file);
    return true;
}

function showFileInfo(input, file) {
    // Remove existing file info
    const existingInfo = input.parentNode.querySelector('.file-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    // Create file info display
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    fileInfo.style.cssText = `
        margin-top: 5px;
        padding: 8px;
        background: #e8f5e8;
        border-radius: 4px;
        font-size: 14px;
        color: #155724;
    `;
    
    const fileSize = (file.size / 1024).toFixed(2); // Size in KB
    fileInfo.textContent = `✓ ${file.name} (${fileSize} KB)`;
    
    input.parentNode.appendChild(fileInfo);
}

function validateGPA(e) {
    const gpa = e.target;
    const value = gpa.value.trim();
    
    if (value && !isValidGPA(value)) {
        showFieldError(gpa, 'Please enter a valid GPA (0.0 to 4.0)');
    } else {
        clearFieldError(gpa);
    }
}

function isValidGPA(gpa) {
    const gpaNum = parseFloat(gpa);
    return !isNaN(gpaNum) && gpaNum >= 0 && gpaNum <= 4.0;
}

function validatePhone(e) {
    const phone = e.target;
    
    if (phone.value && !isValidPhone(phone.value)) {
        showFieldError(phone, 'Please enter a valid phone number');
    } else {
        clearFieldError(phone);
    }
}

function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    if (field.classList) {
        field.style.borderColor = '#dc3545';
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.cssText = `
        color: #dc3545;
        font-size: 14px;
        margin-top: 5px;
    `;
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    if (field.classList && field.style) {
        field.style.borderColor = '#e9ecef';
    }
    
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Support multiline messages
    const messageLines = message.split('\n');
    notification.innerHTML = messageLines.map((line, index) => {
        if (index === 0) return `<div style="font-weight: 600; margin-bottom: 8px;">${escapeHtml(line)}</div>`;
        return `<div style="margin: 4px 0; font-size: 13px; opacity: 0.95;">${escapeHtml(line)}</div>`;
    }).join('');
    
    // Add notification styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const notificationStyles = document.createElement('style');
        notificationStyles.id = 'notification-styles';
        notificationStyles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 1001;
                max-width: 380px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                animation: slideIn 0.3s ease;
                word-wrap: break-word;
                white-space: pre-wrap;
            }
            
            .notification.info {
                background: #17a2b8;
            }
            
            .notification.success {
                background: #28a745;
            }
            
            .notification.error {
                background: #dc3545;
            }
            
            .notification.warning {
                background: #ffc107;
                color: #212529;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @media (max-width: 600px) {
                .notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(notificationStyles);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 6 seconds (longer for success messages)
    const duration = type === 'success' ? 6000 : 5000;
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, duration);
}

// Helper function to escape HTML special characters
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
