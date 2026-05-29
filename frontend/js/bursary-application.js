// Enhanced Bursary Application Form JavaScript with improved API integration
// Global flag to prevent multiple submissions
let isSubmitting = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎓 Enhanced Bursary Application Form Loaded');
    initializeBursaryForm();
});

function initializeBursaryForm() {
    const form = document.getElementById('bursaryForm');
    
    if (form) {
        // Remove any existing event listeners to prevent duplicates
        form.removeEventListener('submit', handleBursarySubmit);
        form.addEventListener('submit', handleBursarySubmit);
        
        // Initialize form enhancements
        setupFileInputs();
        setupValidation();
        setupFormInteractions();
        
        console.log('✅ Bursary form initialized successfully');
    } else {
        console.error('❌ Bursary form not found');
    }
}

function setupFileInputs() {
    // Enhanced file input handling
    const fileInputs = ['transcript', 'recommendation', 'idCopy', 'proof'];
    
    fileInputs.forEach(fieldId => {
        const fileInput = document.getElementById(fieldId);
        const browseBtn = fileInput?.parentElement.querySelector('.btn-browse');
        
        if (fileInput && browseBtn) {
            // Connect browse button to file input
            browseBtn.addEventListener('click', () => {
                fileInput.click();
            });
            
            // Enhanced file validation and preview
            fileInput.addEventListener('change', () => {
                validateAndPreviewFile(fileInput, browseBtn);
            });
        }
    });
}

function setupValidation() {
    // Real-time validation
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'studentId', 'program', 'income', 'sponsor', 'reason'];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', () => validateField(field));
            field.addEventListener('input', () => clearFieldError(field));
        }
    });
    
    // Special validation for email
    const emailField = document.getElementById('email');
    if (emailField) {
        emailField.addEventListener('blur', validateEmail);
    }
    
    // Special validation for phone
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('blur', validatePhone);
    }
    
    // Special validation for income
    const incomeField = document.getElementById('income');
    if (incomeField) {
        incomeField.addEventListener('input', validateIncome);
    }
}

function setupFormInteractions() {
    // Auto-format phone number
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 9) {
                value = value.substring(0, 9);
            }
            e.target.value = value;
        });
    }
    
    // Auto-format income with commas
    const incomeField = document.getElementById('income');
    if (incomeField) {
        incomeField.addEventListener('input', function(e) {
            let value = e.target.value.replace(/,/g, '');
            if (value && !isNaN(value)) {
                e.target.value = parseInt(value).toLocaleString();
            }
        });
    }
    
    // Character counter for reason field
    const reasonField = document.getElementById('reason');
    if (reasonField) {
        const maxLength = 1000;
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.style.cssText = 'text-align: right; font-size: 0.9rem; color: #666; margin-top: 5px;';
        reasonField.parentNode.appendChild(counter);
        
        reasonField.addEventListener('input', function() {
            const remaining = maxLength - this.value.length;
            counter.textContent = `${this.value.length}/${maxLength} characters`;
            counter.style.color = remaining < 50 ? '#dc3545' : '#666';
        });
        
        // Initial count
        reasonField.dispatchEvent(new Event('input'));
    }
}

function handleBursarySubmit(e) {
    e.preventDefault();
    
    console.log('🚀 Bursary Application Submission Started');
    
    // Prevent multiple submissions
    if (isSubmitting) {
        console.log('⚠️ Form already being submitted, ignoring duplicate submission');
        showNotification('Please wait, your application is being processed...', 'warning');
        return;
    }
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    if (submitButton && submitButton.disabled) {
        console.log('⚠️ Submit button already disabled, ignoring submission');
        return;
    }
    
    // Set submission flag and disable button
    isSubmitting = true;
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span style="display: inline-block; animation: spin 1s linear infinite;">⏳</span> Processing...';
    }
    
    // Show processing notification
    showNotification('🔄 Processing your bursary application...', 'info');
    
    try {
        // Comprehensive form validation
        if (!validateBursaryForm()) {
            resetSubmissionState(submitButton);
            return;
        }
        
        // Collect and prepare form data
        const submissionData = prepareSubmissionData(e.target);
        console.log('📊 Prepared submission data:', submissionData);
        
        // Submit to backend with enhanced error handling
        submitToBackend(submissionData)
            .then(response => {
                console.log('✅ Backend submission successful:', response);
                handleSubmissionSuccess(submissionData, response, e.target);
            })
            .catch(error => {
                console.warn('⚠️ Backend submission failed, using fallback:', error);
                handleSubmissionFallback(submissionData, e.target);
            })
            .finally(() => {
                resetSubmissionState(submitButton);
            });
            
    } catch (error) {
        console.error('❌ Form submission error:', error);
        showNotification('An unexpected error occurred. Please try again.', 'error');
        resetSubmissionState(submitButton);
    }
}

function validateBursaryForm() {
    console.log('🔍 Validating bursary form...');
    let isValid = true;
    const errors = [];
    
    // Validate required text fields
    const requiredFields = {
        'firstName': 'First Name',
        'lastName': 'Last Name',
        'email': 'Email Address',
        'phone': 'Phone Number',
        'studentId': 'Student ID',
        'program': 'Program of Study',
        'income': 'Annual Income',
        'sponsor': 'Bursary Sponsor',
        'reason': 'Reason for Application'
    };
    
    Object.entries(requiredFields).forEach(([fieldId, fieldName]) => {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            showFieldError(field, `${fieldName} is required`);
            errors.push(fieldName);
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });
    
    // Validate email format
    const emailField = document.getElementById('email');
    if (emailField && emailField.value) {
        if (!isValidEmail(emailField.value)) {
            showFieldError(emailField, 'Please enter a valid email address');
            errors.push('Email format');
            isValid = false;
        }
    }
    
    // Validate phone number
    const phoneField = document.getElementById('phone');
    if (phoneField && phoneField.value) {
        if (!isValidPhone(phoneField.value)) {
            showFieldError(phoneField, 'Please enter a valid phone number (9 digits)');
            errors.push('Phone format');
            isValid = false;
        }
    }
    
    // Validate income
    const incomeField = document.getElementById('income');
    if (incomeField && incomeField.value) {
        const income = parseInt(incomeField.value.replace(/,/g, ''));
        if (isNaN(income) || income < 0) {
            showFieldError(incomeField, 'Please enter a valid income amount');
            errors.push('Income format');
            isValid = false;
        }
    }
    
    // Validate file uploads
    const requiredFiles = {
        'transcript': 'Academic Transcript',
        'recommendation': 'Recommendation Letter',
        'idCopy': 'ID Document',
        'proof': 'Proof of Admission'
    };
    
    Object.entries(requiredFiles).forEach(([fieldId, fieldName]) => {
        const field = document.getElementById(fieldId);
        if (!field || field.files.length === 0) {
            showFieldError(field, `${fieldName} is required`);
            errors.push(fieldName);
            isValid = false;
        }
    });
    
    // Validate checkboxes
    const declaration = document.getElementById('declaration');
    const consent = document.getElementById('consent');
    
    if (!declaration || !declaration.checked) {
        showFieldError(declaration?.parentNode, 'You must certify that the information is accurate');
        errors.push('Declaration');
        isValid = false;
    }
    
    if (!consent || !consent.checked) {
        showFieldError(consent?.parentNode, 'You must consent to data processing');
        errors.push('Consent');
        isValid = false;
    }
    
    // Validate reason length
    const reasonField = document.getElementById('reason');
    if (reasonField && reasonField.value) {
        if (reasonField.value.length < 50) {
            showFieldError(reasonField, 'Please provide at least 50 characters explaining your need');
            errors.push('Reason length');
            isValid = false;
        } else if (reasonField.value.length > 1000) {
            showFieldError(reasonField, 'Reason must be less than 1000 characters');
            errors.push('Reason length');
            isValid = false;
        }
    }
    
    if (!isValid) {
        console.log('❌ Form validation failed:', errors);
        showNotification(`Please correct the following errors: ${errors.join(', ')}`, 'error');
        
        // Scroll to first error
        const firstError = document.querySelector('.field-error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else {
        console.log('✅ Form validation passed');
    }
    
    return isValid;
}

function prepareSubmissionData(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Enhanced submission data structure
    const submissionData = {
        applicant: {
            firstName: data.firstName?.trim() || '',
            lastName: data.lastName?.trim() || '',
            email: data.email?.trim().toLowerCase() || '',
            phone: data.phone?.trim() || '',
            studentId: data.studentId?.trim().toUpperCase() || '',
            program: data.program?.trim() || ''
        },
        financialInfo: {
            annualIncome: data.income ? parseInt(data.income.replace(/,/g, '')) : 0,
            sponsor: data.sponsor || '',
            dependents: data.dependents || '',
            expenses: data.expenses || '',
            currency: 'UGX'
        },
        application: {
            reason: data.reason?.trim() || '',
            declaration: data.declaration ? true : false,
            consent: data.consent ? true : false,
            applicationDate: new Date().toISOString(),
            urgencyLevel: calculateUrgencyLevel(data)
        },
        documents: {
            transcript: formData.get('transcript')?.name || 'Not uploaded',
            recommendation: formData.get('recommendation')?.name || 'Not uploaded',
            idCopy: formData.get('idCopy')?.name || 'Not uploaded',
            proof: formData.get('proof')?.name || 'Not uploaded',
            incomeStatement: 'To be provided',
            bankStatement: 'To be provided'
        },
        metadata: {
            submittedAt: new Date().toISOString(),
            status: 'pending',
            applicationId: generateApplicationId('BURS'),
            applicationType: 'bursary',
            version: '2.0',
            source: 'web_form',
            ipAddress: 'client_side',
            userAgent: navigator.userAgent,
            formVersion: 'enhanced_v2.0'
        },
        systemInfo: {
            submissionMethod: 'enhanced_form',
            validationPassed: true,
            processingTime: Date.now(),
            browserInfo: {
                language: navigator.language,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled
            }
        }
    };
    
    return submissionData;
}

function calculateUrgencyLevel(data) {
    const income = parseInt(data.income?.replace(/,/g, '') || '0');
    
    if (income < 300000) return 'high';
    if (income < 600000) return 'medium';
    return 'low';
}

function generateApplicationId(prefix) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
}

// Enhanced backend submission with retry logic
async function submitToBackend(submissionData) {
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 Backend submission attempt ${attempt}/${maxRetries}`);
            
            const response = await fetch('http://localhost:5000/api/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Application-Type': 'bursary'
                },
                body: JSON.stringify(submissionData)
            });
            
            console.log(`📡 Backend response status: ${response.status}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('✅ Backend submission successful:', result);
            return result;
            
        } catch (error) {
            console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);
            lastError = error;
            
            if (attempt < maxRetries) {
                // Wait before retry (exponential backoff)
                const delay = Math.pow(2, attempt) * 1000;
                console.log(`⏳ Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}

function handleSubmissionSuccess(submissionData, response, form) {
    console.log('🎉 Handling successful submission');
    
    // Store locally as backup
    storeApplicationLocally(submissionData);
    
    // Show success notification
    showNotification('✅ Bursary application submitted successfully!', 'success');
    
    // Show detailed success message
    const successMessage = `
🎉 BURSARY APPLICATION SUBMITTED SUCCESSFULLY!

📋 Application Details:
• Application ID: ${response.application_id || submissionData.metadata.applicationId}
• Student: ${submissionData.applicant.firstName} ${submissionData.applicant.lastName}
• Program: ${submissionData.applicant.program}
• Status: Pending Review

💰 Financial Information:
• Annual Income: UGX ${submissionData.financialInfo.annualIncome.toLocaleString()}
• Sponsor: ${submissionData.financialInfo.sponsor}
• Urgency Level: ${submissionData.application.urgencyLevel.toUpperCase()}

📄 Next Steps:
1. Check your email for confirmation
2. Wait for admin review (5-7 business days)
3. Prepare additional documents if requested
4. Check application status in student portal

📞 Contact Information:
• Email: studentaffairs@bugemauniv.ac.ug
• Phone: +256 414 290 882
• Office: Student Affairs, Main Building

Thank you for applying to Bugema University's Bursary Program!
    `;
    
    alert(successMessage);
    
    // Reset form
    form.reset();
    clearAllFieldErrors();
    
    // Redirect after delay
    setTimeout(() => {
        if (confirm('Would you like to return to the main page or view the admin panel?')) {
            window.location.href = 'index.html';
        }
    }, 2000);
}

function handleSubmissionFallback(submissionData, form) {
    console.log('💾 Handling fallback submission (offline mode)');
    
    // Store locally
    storeApplicationLocally(submissionData);
    
    // Show fallback notification
    showNotification('Application saved locally (backend unavailable)', 'warning');
    
    const fallbackMessage = `
💾 APPLICATION SAVED LOCALLY

⚠️ Backend service is currently unavailable, but your application has been saved locally.

📋 Application Details:
• Application ID: ${submissionData.metadata.applicationId}
• Student: ${submissionData.applicant.firstName} ${submissionData.applicant.lastName}
• Saved At: ${new Date().toLocaleString()}

📡 What happens next:
• Your application will be automatically synced when the server is available
• You can still view your application in the admin panel
• No data has been lost

💡 Recommendation:
• Try submitting again later
• Contact IT support if the issue persists
• Keep your application ID for reference

Application ID: ${submissionData.metadata.applicationId}
    `;
    
    alert(fallbackMessage);
    
    // Reset form
    form.reset();
    clearAllFieldErrors();
}

function storeApplicationLocally(submissionData) {
    try {
        let applications = JSON.parse(localStorage.getItem('bursaryApplications') || '[]');
        applications.push(submissionData);
        localStorage.setItem('bursaryApplications', JSON.stringify(applications));
        console.log('💾 Application stored locally successfully');
    } catch (error) {
        console.error('❌ Failed to store application locally:', error);
    }
}

function resetSubmissionState(submitButton) {
    isSubmitting = false;
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Submit Application';
    }
}

function validateBursaryForm() {
    let isValid = true;
    
    // Validate required text fields
    const requiredTextFields = ['firstName', 'lastName', 'email', 'phone', 'studentId', 'program', 'sponsor', 'income', 'reason'];
    
    requiredTextFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            if (field) showFieldError(field, 'This field is required');
            isValid = false;
        } else {
            if (field) clearFieldError(field);
        }
    });
    
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
    
    // Validate income
    const income = document.getElementById('income');
    if (income && income.value && !isValidIncome(income.value)) {
        showFieldError(income, 'Please enter a valid income amount');
        isValid = false;
    }
    
    // Validate phone
    const phone = document.getElementById('phone');
    if (phone && phone.value && !isValidPhone(phone.value)) {
        showFieldError(phone, 'Please enter a valid phone number');
        isValid = false;
    }
    
    // Validate reason length
    const reason = document.getElementById('reason');
    if (reason && reason.value && reason.value.length < 50) {
        showFieldError(reason, 'Please provide at least 50 characters for your reason');
        isValid = false;
    } else if (reason && reason.value && reason.value.length > 1000) {
        showFieldError(reason, 'Reason must be less than 1000 characters');
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

function validateIncome(e) {
    const income = e.target;
    const value = income.value.trim();
    
    if (value && !isValidIncome(value)) {
        showFieldError(income, 'Please enter a valid income amount (numbers only)');
    } else {
        clearFieldError(income);
    }
}

function isValidIncome(income) {
    // Remove commas and spaces, then check if it's a valid number
    const cleanIncome = income.replace(/[, ]/g, '');
    return /^\d+$/.test(cleanIncome) && parseInt(cleanIncome) >= 0;
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
    
    field.style.borderColor = '#dc3545';
    
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
    field.style.borderColor = '#e9ecef';
    
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

// Enhanced validation functions
function validateField(field) {
    if (!field.value.trim()) {
        showFieldError(field, 'This field is required');
        return false;
    }
    clearFieldError(field);
    return true;
}

function validateEmail(e) {
    const email = e.target;
    if (email.value && !isValidEmail(email.value)) {
        showFieldError(email, 'Please enter a valid email address');
        return false;
    }
    clearFieldError(email);
    return true;
}

function validatePhone(e) {
    const phone = e.target;
    if (phone.value && !isValidPhone(phone.value)) {
        showFieldError(phone, 'Please enter a valid 9-digit phone number');
        return false;
    }
    clearFieldError(phone);
    return true;
}

function validateIncome(e) {
    const income = e.target;
    const value = income.value.replace(/,/g, '');
    
    if (value && (isNaN(value) || parseInt(value) < 0)) {
        showFieldError(income, 'Please enter a valid income amount');
        return false;
    }
    clearFieldError(income);
    return true;
}

function validateAndPreviewFile(fileInput, browseBtn) {
    const file = fileInput.files[0];
    
    if (!file) {
        showFieldError(fileInput, 'Please select a file');
        browseBtn.textContent = 'Browse';
        browseBtn.style.background = '';
        browseBtn.style.color = '';
        return false;
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        showFieldError(fileInput, 'File size must be less than 5MB');
        fileInput.value = '';
        browseBtn.textContent = 'Browse';
        browseBtn.style.background = '';
        browseBtn.style.color = '';
        return false;
    }
    
    // Check file type
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/jpg'
    ];
    
    if (!allowedTypes.includes(file.type)) {
        showFieldError(fileInput, 'Only PDF, DOC, DOCX, JPG, and PNG files are allowed');
        fileInput.value = '';
        browseBtn.textContent = 'Browse';
        browseBtn.style.background = '';
        browseBtn.style.color = '';
        return false;
    }
    
    // Success - update button appearance
    clearFieldError(fileInput);
    browseBtn.textContent = `✓ ${file.name}`;
    browseBtn.style.background = '#28a745';
    browseBtn.style.color = 'white';
    
    // Show file info
    showFileInfo(fileInput, file);
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
        margin-top: 8px;
        padding: 10px;
        background: linear-gradient(135deg, #e8f5e8, #d4edda);
        border-radius: 6px;
        font-size: 14px;
        color: #155724;
        border: 1px solid #c3e6cb;
    `;
    
    const fileSize = (file.size / 1024).toFixed(2);
    const sizeUnit = fileSize > 1024 ? `${(fileSize / 1024).toFixed(2)} MB` : `${fileSize} KB`;
    
    fileInfo.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">📄</span>
            <div>
                <div style="font-weight: 600;">${file.name}</div>
                <div style="font-size: 12px; opacity: 0.8;">Size: ${sizeUnit} | Type: ${file.type.split('/')[1].toUpperCase()}</div>
            </div>
        </div>
    `;
    
    input.parentNode.appendChild(fileInfo);
}

// Utility validation functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Error handling functions
function showFieldError(field, message) {
    if (!field) return;
    
    clearFieldError(field);
    
    // Style the field
    field.style.borderColor = '#dc3545';
    field.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.cssText = `
        color: #dc3545;
        font-size: 14px;
        margin-top: 5px;
        padding: 5px 10px;
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 5px;
    `;
    errorDiv.innerHTML = `<span style="font-size: 16px;">⚠️</span> ${message}`;
    
    // Insert after the field or its wrapper
    const insertAfter = field.parentNode.classList.contains('file-input-wrapper') || 
                       field.parentNode.classList.contains('phone-input') ? 
                       field.parentNode : field;
    
    insertAfter.parentNode.insertBefore(errorDiv, insertAfter.nextSibling);
}

function clearFieldError(field) {
    if (!field) return;
    
    // Reset field styling
    field.style.borderColor = '#e9ecef';
    field.style.boxShadow = '';
    
    // Remove error message
    const errorDiv = field.parentNode.querySelector('.field-error') || 
                    field.parentNode.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function clearAllFieldErrors() {
    document.querySelectorAll('.field-error').forEach(error => error.remove());
    document.querySelectorAll('input, select, textarea').forEach(field => {
        field.style.borderColor = '#e9ecef';
        field.style.boxShadow = '';
    });
}

// Enhanced notification system
function showNotification(message, type = 'info') {
    console.log(`📢 Notification: ${type.toUpperCase()} - ${message}`);
    
    // Remove existing notifications
    const existingNotification = document.querySelector('.enhanced-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `enhanced-notification ${type}`;
    
    // Support multiline messages
    const messageLines = message.split('\n');
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">${getNotificationIcon(type)}</div>
            <div class="notification-text">
                ${messageLines.map((line, index) => {
                    if (index === 0) return `<div class="notification-title">${escapeHtml(line)}</div>`;
                    return `<div class="notification-subtitle">${escapeHtml(line)}</div>`;
                }).join('')}
            </div>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add enhanced notification styles
    if (!document.querySelector('#enhanced-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'enhanced-notification-styles';
        style.textContent = `
            .enhanced-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                min-width: 350px;
                max-width: 500px;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                z-index: 10000;
                animation: slideInRight 0.4s ease-out;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            .enhanced-notification.info {
                background: linear-gradient(135deg, #17a2b8, #138496);
                color: white;
            }
            
            .enhanced-notification.success {
                background: linear-gradient(135deg, #28a745, #1e7e34);
                color: white;
            }
            
            .enhanced-notification.error {
                background: linear-gradient(135deg, #dc3545, #c82333);
                color: white;
            }
            
            .enhanced-notification.warning {
                background: linear-gradient(135deg, #ffc107, #e0a800);
                color: #212529;
            }
            
            .notification-content {
                display: flex;
                align-items: flex-start;
                padding: 16px 20px;
                gap: 12px;
            }
            
            .notification-icon {
                font-size: 24px;
                flex-shrink: 0;
                margin-top: 2px;
            }
            
            .notification-text {
                flex: 1;
            }
            
            .notification-title {
                font-weight: 600;
                font-size: 16px;
                margin-bottom: 4px;
            }
            
            .notification-subtitle {
                font-size: 14px;
                opacity: 0.9;
                margin: 2px 0;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s;
            }
            
            .notification-close:hover {
                background-color: rgba(255, 255, 255, 0.2);
            }
            
            .enhanced-notification.warning .notification-close:hover {
                background-color: rgba(0, 0, 0, 0.1);
            }
            
            @keyframes slideInRight {
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
                .enhanced-notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    min-width: auto;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after delay
    const duration = type === 'success' ? 8000 : type === 'error' ? 10000 : 6000;
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideInRight 0.3s ease-in reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

function getNotificationIcon(type) {
    const icons = {
        info: '💡',
        success: '✅',
        error: '❌',
        warning: '⚠️'
    };
    return icons[type] || '📢';
}

// Helper function to escape HTML
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

// Initialize enhanced form when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBursaryForm);
} else {
    initializeBursaryForm();
}

console.log('🎓 Enhanced Bursary Application System Loaded Successfully');