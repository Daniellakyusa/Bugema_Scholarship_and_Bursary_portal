// Student Account JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadRegistrationStatus();
});

function loadRegistrationStatus() {
    const registrationStatus = document.getElementById('registrationStatus');
    
    // Get registrations from localStorage
    const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
    
    if (registrations.length === 0) {
        registrationStatus.innerHTML = `
            <div class="no-registration">
                <h2>No Registration Found</h2>
                <p>You haven't submitted any registration yet.</p>
                <a href="register.html" class="btn-primary">Complete Registration</a>
            </div>
        `;
        return;
    }
    
    // Get the most recent registration (or find by some student identifier)
    const latestRegistration = registrations[registrations.length - 1];
    
    const statusClass = `status-${latestRegistration.status}`;
    const statusText = latestRegistration.status.charAt(0).toUpperCase() + latestRegistration.status.slice(1);
    
    let statusMessage = '';
    if (latestRegistration.status === 'pending') {
        statusMessage = 'Your registration is being reviewed by the administration. You will receive updates once it\'s processed.';
    } else if (latestRegistration.status === 'approved') {
        statusMessage = 'Congratulations! Your registration has been approved. You now have access to all student services.';
    } else if (latestRegistration.status === 'rejected') {
        statusMessage = 'Your registration was not approved. Please contact the administration for more information.';
    }
    
    registrationStatus.innerHTML = `
        <div class="registration-card">
            <div class="card-header">
                <h3>Registration Status</h3>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Student Name</div>
                    <div class="info-value">${latestRegistration.fullName || `${latestRegistration.firstName || ''} ${latestRegistration.lastName || ''}`.trim() || 'N/A'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Student ID</div>
                    <div class="info-value">${latestRegistration.studentId || 'N/A'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">${latestRegistration.email || 'N/A'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Phone</div>
                    <div class="info-value">${latestRegistration.phone || 'N/A'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Program</div>
                    <div class="info-value">${latestRegistration.program || 'N/A'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Year of Study</div>
                    <div class="info-value">Year ${latestRegistration.year || 'N/A'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">GPA</div>
                    <div class="info-value">${latestRegistration.gpa || 'N/A'}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Registration Date</div>
                    <div class="info-value">${new Date(latestRegistration.registrationDate).toLocaleDateString()}</div>
                </div>
            </div>
            
            <div style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin-top: 20px;">
                <h4 style="margin-bottom: 10px; color: #495057;">Status Message</h4>
                <p style="color: #6c757d; line-height: 1.6;">${statusMessage}</p>
            </div>
            
            ${latestRegistration.approvalDate ? `
                <div style="padding: 15px; background: #d4edda; border-radius: 8px; margin-top: 15px;">
                    <strong>Approval Date:</strong> ${new Date(latestRegistration.approvalDate).toLocaleDateString()}
                </div>
            ` : ''}
            
            ${latestRegistration.rejectionReason ? `
                <div style="padding: 15px; background: #f8d7da; border-radius: 8px; margin-top: 15px;">
                    <strong>Rejection Reason:</strong> ${latestRegistration.rejectionReason}
                </div>
            ` : ''}
        </div>
    `;
}
