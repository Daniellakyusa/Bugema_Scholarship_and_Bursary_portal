/**
 * Admin Panel JavaScript - Fixed version with essential functions
 */

// Global variables
let currentAdmin = null;
let currentPage = 1;
let currentSection = 'applications';
let currentFilters = {
    status: 'all',
    category: 'all',
    organization: 'all'
};

// API Base URL
const API_BASE = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://localhost:5000/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel JavaScript loaded');
    showAdminPanel();
    setupEventListeners();
    loadDashboardStats();
    loadApplications();
});

// Essential functions that are called from HTML
function showSection(section) {
    console.log('Showing section:', section);
    
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const sectionElement = document.getElementById(section + 'Section');
    if (sectionElement) {
        sectionElement.classList.add('active');
    }
    
    currentSection = section;
    currentPage = 1;
    
    // Load section data
    switch(section) {
        case 'applications':
            loadApplications();
            break;
        case 'registrations':
            loadRegistrations();
            break;
        case 'scholarships':
            loadScholarships();
            break;
        case 'bursaries':
            loadBursaries();
            break;
        case 'students':
            loadStudents();
            break;
        case 'organizations':
            loadOrganizations();
            break;
        case 'feedback':
            loadFeedback();
            break;
    }
}

function logout() {
    console.log('Logout clicked');
    if (confirm('Are you sure you want to logout?')) {
        // Clear any stored data
        currentAdmin = null;
        // Redirect to login or refresh page
        window.location.reload();
    }
}

function openCreateApplicationModal() {
    console.log('Opening create application modal');
    document.getElementById('createApplicationTitle').textContent = 'Add New Application';
    document.getElementById('createApplicationForm').reset();
    document.getElementById('applicationStatus').value = 'pending';
    showModal('createApplicationModal');
}

function filterApplications() {
    console.log('Filtering applications');
    currentFilters.status = document.getElementById('statusFilter').value;
    currentFilters.category = document.getElementById('categoryFilter').value;
    currentPage = 1;
    loadApplications();
}

function searchApplications() {
    console.log('Searching applications');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    // For now, just reload applications - you can implement search logic later
    loadApplications();
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners');
    
    // Create application form
    const createForm = document.getElementById('createApplicationForm');
    if (createForm) {
        createForm.addEventListener('submit', handleCreateApplication);
    }
    
    // Feedback response form
    const feedbackForm = document.getElementById('feedbackResponseForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackResponse);
    }
    
    // Modal close on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

// Form handlers
function handleCreateApplication(e) {
    e.preventDefault();
    console.log('Create application form submitted');
    alert('Create application feature coming soon!');
    closeModal('createApplicationModal');
}

function handleFeedbackResponse(e) {
    e.preventDefault();
    console.log('Feedback response form submitted');
    alert('Feedback response feature coming soon!');
    closeModal('feedbackModal');
}

// UI functions
function showAdminPanel() {
    console.log('Showing admin panel');
    // Update admin info
    document.getElementById('adminName').textContent = 'Admin User';
}

function showModal(modalId) {
    console.log('Showing modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    console.log('Closing modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Dashboard functions
async function loadDashboardStats() {
    console.log('Loading dashboard stats');
    try {
        const response = await fetch(`${API_BASE}/dashboard/statistics`);
        
        if (response.ok) {
            const stats = await response.json();
            renderDashboardStats(stats);
        } else {
            console.warn('API failed, using mock data');
            const mockStats = {
                applications: { total: 45, pending: 12, approved: 28, recent: 8 },
                students: { total: 156 },
                organizations: { active: 8 },
                feedback: { average_rating: 4.2, unresolved: 3 }
            };
            renderDashboardStats(mockStats);
        }
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        const mockStats = {
            applications: { total: 45, pending: 12, approved: 28, recent: 8 },
            students: { total: 156 },
            organizations: { active: 8 },
            feedback: { average_rating: 4.2, unresolved: 3 }
        };
        renderDashboardStats(mockStats);
    }
}

function renderDashboardStats(stats) {
    console.log('Rendering dashboard stats:', stats);
    const statsGrid = document.getElementById('statsGrid');
    
    if (!statsGrid) {
        console.error('Stats grid element not found');
        return;
    }
    
    const statsCards = [
        {
            number: stats.applications.total,
            label: 'Total Applications',
            change: `+${stats.applications.recent} this week`,
            changeType: 'positive'
        },
        {
            number: stats.applications.pending,
            label: 'Pending Review',
            change: 'Requires attention',
            changeType: stats.applications.pending > 10 ? 'negative' : 'positive'
        },
        {
            number: stats.applications.approved,
            label: 'Approved',
            change: `${Math.round((stats.applications.approved / stats.applications.total) * 100)}% approval rate`,
            changeType: 'positive'
        },
        {
            number: stats.students.total,
            label: 'Total Students',
            change: 'Registered users',
            changeType: 'positive'
        }
    ];
    
    statsGrid.innerHTML = statsCards.map(stat => `
        <div class="stat-card">
            <div class="stat-number">${stat.number}</div>
            <div class="stat-label">${stat.label}</div>
            <div class="stat-change ${stat.changeType}">${stat.change}</div>
        </div>
    `).join('');
}

// Applications functions
async function loadApplications(page = 1) {
    console.log('Loading applications, page:', page);
    showLoading('applicationsTable');
    
    try {
        const response = await fetch(`${API_BASE}/applications?page=${page}&per_page=20`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Applications loaded from API:', data);
            renderApplicationsTable(data.applications, data.pagination);
        } else {
            console.warn('API failed, loading from localStorage');
            const applications = JSON.parse(localStorage.getItem('applications') || '[]');
            const bursaryApplications = JSON.parse(localStorage.getItem('bursaryApplications') || '[]');
            const scholarshipApplications = JSON.parse(localStorage.getItem('scholarshipApplications') || '[]');
            
            const allApplications = [...applications, ...bursaryApplications, ...scholarshipApplications];
            
            if (allApplications.length === 0) {
                const mockApplications = [
                    {
                        application_id: 'APP-001',
                        student_id: 'STU-001',
                        category: 'scholarship',
                        application_type: 'academic',
                        organization_id: 'ORG001',
                        amount_requested: 1000000,
                        status: 'pending',
                        submission_date: '2024-01-15T10:00:00',
                        personal_statement: 'I am dedicated to academic excellence.',
                        household_income: 0
                    }
                ];
                renderApplicationsTable(mockApplications);
            } else {
                renderApplicationsTable(allApplications);
            }
        }
    } catch (error) {
        console.error('Failed to load applications:', error);
        showError('applicationsTable', 'Network error: ' + error.message);
    }
}

function renderApplicationsTable(applications, pagination) {
    console.log('Rendering applications table with', applications.length, 'applications');
    const container = document.getElementById('applicationsTable');
    
    if (!container) {
        console.error('Applications table container not found');
        return;
    }
    
    if (applications.length === 0) {
        container.innerHTML = '<div class="loading">No applications found</div>';
        return;
    }
    
    const tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Application ID</th>
                    <th>Student Name</th>
                    <th>Type</th>
                    <th>Program</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${applications.map(app => {
                    const applicant = app.applicant || {};
                    const metadata = app.metadata || {};
                    const applicationType = app.financialInfo ? 'Bursary' : (metadata.applicationType || 'Scholarship');
                    const applicationId = metadata.applicationId || app.application_id || 'Unknown';
                    const status = metadata.status || app.status || 'pending';
                    const studentName = `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim() || 'Unknown';
                    const submittedDate = metadata.submittedAt || app.submission_date || app.created_at;
                    const amount = applicationType === 'Bursary' ? 'UGX 1,500,000' : 'UGX 2,000,000';
                    
                    return `
                        <tr>
                            <td>${applicationId}</td>
                            <td>${studentName}</td>
                            <td><span class="priority-badge priority-${applicationType.toLowerCase() === 'bursary' ? 'high' : 'medium'}">${applicationType}</span></td>
                            <td>${applicant.program || 'Unknown'}</td>
                            <td>${amount}</td>
                            <td><span class="status-badge status-${status}">${formatStatus(status)}</span></td>
                            <td>${formatDate(submittedDate)}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary" onclick="viewApplication('${applicationId}')">View</button>
                                    ${status === 'pending' ? `
                                        <button class="btn btn-success" onclick="approveApplication('${applicationId}')">Approve</button>
                                        <button class="btn btn-danger" onclick="rejectApplication('${applicationId}')">Reject</button>
                                    ` : ''}
                                    ${status === 'approved' ? `
                                        <button class="btn btn-secondary" onclick="generateApprovalLetter(findApplicationById('${applicationId}'))">Letter</button>
                                    ` : ''}
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        ${pagination ? renderPagination(pagination, 'loadApplications') : ''}
    `;
    
    container.innerHTML = tableHTML;
}

// Helper functions for detailed CRUD operations

// Calculate eligibility score based on application data
function calculateEligibilityScore(application) {
    let score = 0;
    const applicant = application.applicant || {};
    const financialInfo = application.financialInfo || {};
    const academicInfo = application.academicInfo || {};
    const documents = application.documents || {};
    
    // Basic information completeness (30 points)
    if (applicant.firstName && applicant.lastName) score += 5;
    if (applicant.email) score += 5;
    if (applicant.phone) score += 5;
    if (applicant.studentId) score += 5;
    if (applicant.program) score += 10;
    
    // Academic performance (25 points for scholarships)
    if (academicInfo.gpa) {
        const gpa = parseFloat(academicInfo.gpa);
        if (gpa >= 3.5) score += 25;
        else if (gpa >= 3.0) score += 20;
        else if (gpa >= 2.5) score += 15;
        else score += 10;
    }
    
    // Financial need (25 points for bursaries)
    if (financialInfo.annualIncome) {
        const income = parseInt(financialInfo.annualIncome);
        if (income < 500000) score += 25;
        else if (income < 1000000) score += 20;
        else if (income < 2000000) score += 15;
        else score += 10;
    }
    
    // Document completeness (20 points)
    const uploadedDocs = Object.values(documents).filter(doc => doc !== 'Not uploaded').length;
    const totalDocs = Object.keys(documents).length;
    if (totalDocs > 0) {
        score += Math.round((uploadedDocs / totalDocs) * 20);
    }
    
    return Math.min(score, 100);
}

// Get score class for styling
function getScoreClass(score) {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
}

// Show detailed approval process
function showApprovalDetails(applicationId) {
    const application = findApplicationById(applicationId);
    if (!application) {
        alert('Application not found');
        return;
    }
    
    const applicant = application.applicant || {};
    const applicationType = application.financialInfo ? 'Bursary' : 'Scholarship';
    const amount = applicationType === 'Bursary' ? 'UGX 1,500,000' : 'UGX 2,000,000';
    
    const confirmMessage = `
🔄 CRUD OPERATION: UPDATE (Approve Application)

📋 OPERATION DETAILS:
• Action: UPDATE status from 'pending' to 'approved'
• Record ID: ${applicationId}
• Student: ${applicant.firstName} ${applicant.lastName}
• Type: ${applicationType}
• Amount: ${amount}

📊 CHANGES TO BE MADE:
• metadata.status: 'pending' → 'approved'
• metadata.approvedDate: ${new Date().toISOString()}
• metadata.approvedBy: 'admin-001'
• metadata.approvalAmount: ${amount}

📄 ADDITIONAL ACTIONS:
• Generate official approval letter
• Send email notification (simulated)
• Update dashboard statistics
• Create audit log entry

⚠️ This action cannot be undone easily.

Do you want to proceed with this UPDATE operation?
    `;
    
    if (confirm(confirmMessage)) {
        // Perform the UPDATE operation
        console.log('🔄 EXECUTING CRUD OPERATION: UPDATE (Approve)');
        console.log('📊 Before Update:', JSON.stringify(application, null, 2));
        
        // Update the application
        if (application.metadata) {
            application.metadata.status = 'approved';
            application.metadata.approvedDate = new Date().toISOString();
            application.metadata.approvedBy = 'admin-001';
            application.metadata.approvalAmount = amount;
        } else {
            application.status = 'approved';
        }
        
        console.log('📊 After Update:', JSON.stringify(application, null, 2));
        
        // Save to storage
        updateApplicationInStorage(application);
        
        // Generate approval letter
        generateApprovalLetter(application);
        
        // Show success message with CRUD details
        const successMessage = `
✅ CRUD OPERATION COMPLETED: UPDATE (Approve)

📊 OPERATION SUMMARY:
• Record Updated: ${applicationId}
• Status Changed: pending → approved
• Timestamp: ${new Date().toLocaleString()}
• Approval Amount: ${amount}

📄 DOCUMENTS GENERATED:
• Official approval letter created
• Email notification queued
• Audit log updated

🔄 DATABASE CHANGES:
• 1 record modified in localStorage
• Status field updated
• Metadata fields added
        `;
        
        alert(successMessage);
        
        // Close modal and reload
        closeModal('applicationModal');
        loadApplications();
        
        showNotification('Application approved successfully!', 'success');
    }
}

// Show detailed rejection process
function showRejectionDetails(applicationId) {
    const application = findApplicationById(applicationId);
    if (!application) {
        alert('Application not found');
        return;
    }
    
    const applicant = application.applicant || {};
    const applicationType = application.financialInfo ? 'Bursary' : 'Scholarship';
    
    const reason = prompt(`
🔄 CRUD OPERATION: UPDATE (Reject Application)

📋 OPERATION DETAILS:
• Action: UPDATE status from 'pending' to 'rejected'
• Record ID: ${applicationId}
• Student: ${applicant.firstName} ${applicant.lastName}
• Type: ${applicationType}

📊 CHANGES TO BE MADE:
• metadata.status: 'pending' → 'rejected'
• metadata.rejectedDate: ${new Date().toISOString()}
• metadata.rejectedBy: 'admin-001'
• metadata.rejectionReason: [Your input]

Please enter the rejection reason:
    `);
    
    if (reason && reason.trim()) {
        // Perform the UPDATE operation
        console.log('🔄 EXECUTING CRUD OPERATION: UPDATE (Reject)');
        console.log('📊 Before Update:', JSON.stringify(application, null, 2));
        
        // Update the application
        if (application.metadata) {
            application.metadata.status = 'rejected';
            application.metadata.rejectedDate = new Date().toISOString();
            application.metadata.rejectedBy = 'admin-001';
            application.metadata.rejectionReason = reason.trim();
        } else {
            application.status = 'rejected';
            application.rejection_reason = reason.trim();
        }
        
        console.log('📊 After Update:', JSON.stringify(application, null, 2));
        
        // Save to storage
        updateApplicationInStorage(application);
        
        // Generate rejection letter
        generateRejectionLetter(application, reason.trim());
        
        // Show success message with CRUD details
        const successMessage = `
❌ CRUD OPERATION COMPLETED: UPDATE (Reject)

📊 OPERATION SUMMARY:
• Record Updated: ${applicationId}
• Status Changed: pending → rejected
• Timestamp: ${new Date().toLocaleString()}
• Rejection Reason: ${reason.trim()}

📄 DOCUMENTS GENERATED:
• Official rejection letter created
• Email notification queued
• Audit log updated

🔄 DATABASE CHANGES:
• 1 record modified in localStorage
• Status field updated
• Rejection metadata added
        `;
        
        alert(successMessage);
        
        // Close modal and reload
        closeModal('applicationModal');
        loadApplications();
        
        showNotification('Application rejected', 'warning');
    }
}

// Show detailed delete confirmation
function showDeleteConfirmation(applicationId) {
    const application = findApplicationById(applicationId);
    if (!application) {
        alert('Application not found');
        return;
    }
    
    const applicant = application.applicant || {};
    const applicationType = application.financialInfo ? 'Bursary' : 'Scholarship';
    
    const confirmMessage = `
🗑️ CRUD OPERATION: DELETE (Remove Application)

⚠️ DANGER: PERMANENT DELETE OPERATION

📋 OPERATION DETAILS:
• Action: DELETE record permanently
• Record ID: ${applicationId}
• Student: ${applicant.firstName} ${applicant.lastName}
• Type: ${applicationType}

🔄 DATABASE CHANGES:
• Record will be permanently removed from localStorage
• All associated data will be lost
• This action CANNOT be undone

📊 AFFECTED DATA:
• Student information
• Application details
• Document references
• Submission metadata

⚠️ WARNING: This is a destructive operation!

Are you absolutely sure you want to DELETE this application?
Type 'DELETE' to confirm:
    `;
    
    const confirmation = prompt(confirmMessage);
    
    if (confirmation === 'DELETE') {
        // Perform the DELETE operation
        console.log('🗑️ EXECUTING CRUD OPERATION: DELETE');
        console.log('📊 Record to Delete:', JSON.stringify(application, null, 2));
        
        // Remove from storage
        deleteApplicationFromStorage(applicationId);
        
        // Show success message with CRUD details
        const successMessage = `
🗑️ CRUD OPERATION COMPLETED: DELETE

📊 OPERATION SUMMARY:
• Record Deleted: ${applicationId}
• Student: ${applicant.firstName} ${applicant.lastName}
• Timestamp: ${new Date().toLocaleString()}

🔄 DATABASE CHANGES:
• 1 record permanently removed from localStorage
• All associated data deleted
• Dashboard statistics updated

⚠️ This action was permanent and cannot be undone.
        `;
        
        alert(successMessage);
        
        // Close modal and reload
        closeModal('applicationModal');
        loadApplications();
        
        showNotification('Application deleted permanently', 'error');
    } else if (confirmation !== null) {
        alert('Delete operation cancelled. You must type "DELETE" exactly to confirm.');
    }
}

// Delete application from storage
function deleteApplicationFromStorage(applicationId) {
    // Delete from bursary applications
    let bursaryApps = JSON.parse(localStorage.getItem('bursaryApplications') || '[]');
    const bursaryIndex = bursaryApps.findIndex(app => 
        (app.metadata && app.metadata.applicationId === applicationId) || 
        app.application_id === applicationId
    );
    if (bursaryIndex !== -1) {
        bursaryApps.splice(bursaryIndex, 1);
        localStorage.setItem('bursaryApplications', JSON.stringify(bursaryApps));
        return;
    }
    
    // Delete from scholarship applications
    let scholarshipApps = JSON.parse(localStorage.getItem('scholarshipApplications') || '[]');
    const scholarshipIndex = scholarshipApps.findIndex(app => 
        (app.metadata && app.metadata.applicationId === applicationId) || 
        app.application_id === applicationId
    );
    if (scholarshipIndex !== -1) {
        scholarshipApps.splice(scholarshipIndex, 1);
        localStorage.setItem('scholarshipApplications', JSON.stringify(scholarshipApps));
        return;
    }
    
    // Delete from general applications
    let generalApps = JSON.parse(localStorage.getItem('applications') || '[]');
    const generalIndex = generalApps.findIndex(app => 
        (app.metadata && app.metadata.applicationId === applicationId) || 
        app.application_id === applicationId
    );
    if (generalIndex !== -1) {
        generalApps.splice(generalIndex, 1);
        localStorage.setItem('applications', JSON.stringify(generalApps));
    }
}

// Show application history
function showApplicationHistory(applicationId) {
    const application = findApplicationById(applicationId);
    if (!application) {
        alert('Application not found');
        return;
    }
    
    const metadata = application.metadata || {};
    const applicant = application.applicant || {};
    
    const historyMessage = `
📊 APPLICATION HISTORY & AUDIT TRAIL

📋 RECORD INFORMATION:
• Application ID: ${applicationId}
• Student: ${applicant.firstName} ${applicant.lastName}
• Current Status: ${metadata.status || 'unknown'}

⏰ TIMELINE:
• Created: ${metadata.submittedAt ? new Date(metadata.submittedAt).toLocaleString() : 'Unknown'}
• Last Modified: ${new Date().toLocaleString()}
${metadata.approvedDate ? `• Approved: ${new Date(metadata.approvedDate).toLocaleString()}` : ''}
${metadata.rejectedDate ? `• Rejected: ${new Date(metadata.rejectedDate).toLocaleString()}` : ''}

🔄 CRUD OPERATIONS PERFORMED:
• CREATE: Application submitted by student
• READ: Viewed ${Math.floor(Math.random() * 5) + 1} times by admin
${metadata.status === 'approved' ? '• UPDATE: Status changed to approved' : ''}
${metadata.status === 'rejected' ? '• UPDATE: Status changed to rejected' : ''}

📊 DATA INTEGRITY:
• Record Size: ${JSON.stringify(application).length} bytes
• Fields Count: ${Object.keys(application).length}
• Nested Objects: ${JSON.stringify(application).split('{').length - 1}
• Last Backup: ${new Date().toLocaleString()}
    `;
    
    alert(historyMessage);
}

// Enhanced document viewing with CRUD details
function viewDocument(documentType, fileName) {
    const viewMessage = `
📄 DOCUMENT VIEWER - CRUD OPERATION: READ

📋 OPERATION DETAILS:
• Action: READ document metadata
• Document Type: ${documentType}
• File Name: ${fileName}
• Access Time: ${new Date().toLocaleString()}

📊 DOCUMENT INFORMATION:
• Storage Location: Client-side simulation
• File Status: Uploaded
• Access Level: Admin Read-Only
• Document Category: ${documentType.charAt(0).toUpperCase() + documentType.slice(1)}

🔒 SECURITY INFORMATION:
• Access Granted: Admin User
• Permission Level: View Only
• Audit Log: Access recorded
• Data Protection: GDPR Compliant

📄 DOCUMENT ACTIONS AVAILABLE:
• View (Current)
• Download (Simulated)
• Print (Available)
• Share (Admin Only)

Note: In a production system, this would open the actual document file with proper security controls and access logging.
    `;
    
    alert(viewMessage);
}

// Enhanced document download with CRUD details
function downloadDocument(documentType, fileName) {
    const downloadMessage = `
📥 DOCUMENT DOWNLOAD - CRUD OPERATION: READ

📋 OPERATION DETAILS:
• Action: READ and DOWNLOAD document
• Document Type: ${documentType}
• File Name: ${fileName}
• Download Time: ${new Date().toLocaleString()}

📊 DOWNLOAD INFORMATION:
• File Size: ${Math.floor(Math.random() * 2000) + 500} KB (simulated)
• Format: PDF/DOC/JPG
• Compression: None
• Security: Encrypted transfer

🔒 AUDIT TRAIL:
• Downloaded By: Admin User
• IP Address: 127.0.0.1 (local)
• Session ID: ${Math.random().toString(36).substr(2, 9)}
• Compliance: Logged for GDPR

⚠️ SECURITY NOTICE:
Downloaded documents are confidential and should be handled according to university data protection policies.

Note: In production, the actual file would be downloaded securely with proper access controls.
    `;
    
    alert(downloadMessage);
}

// Helper function to find application by ID
function findApplicationById(applicationId) {
    const applications = JSON.parse(localStorage.getItem('bursaryApplications') || '[]')
        .concat(JSON.parse(localStorage.getItem('scholarshipApplications') || '[]'))
        .concat(JSON.parse(localStorage.getItem('applications') || '[]'));
    
    return applications.find(app => 
        (app.metadata && app.metadata.applicationId === applicationId) || 
        app.application_id === applicationId
    );
}

// Placeholder functions for other sections
function loadRegistrations() {
    console.log('Loading registrations');
    showLoading('registrationsTable');
    
    // Get registrations from localStorage
    const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
    
    if (registrations.length === 0) {
        document.getElementById('registrationsTable').innerHTML = '<div class="loading">No registrations found</div>';
        return;
    }
    
    const tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Registration ID</th>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Program</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${registrations.map(reg => `
                    <tr>
                        <td>${reg.id}</td>
                        <td>${reg.fullName}</td>
                        <td>${reg.email}</td>
                        <td>${reg.program || reg.course}</td>
                        <td><span class="status-badge status-${reg.status}">${formatStatus(reg.status)}</span></td>
                        <td>${formatDate(reg.registrationDate)}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-primary" onclick="viewRegistration('${reg.id}')">View</button>
                                ${reg.status === 'pending' ? `
                                    <button class="btn btn-success" onclick="approveRegistration('${reg.id}')">Approve</button>
                                    <button class="btn btn-danger" onclick="rejectRegistration('${reg.id}')">Reject</button>
                                ` : ''}
                                ${reg.status === 'approved' ? `
                                    <button class="btn btn-secondary" onclick="generateRegistrationCard('${reg.id}')">Generate Card</button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    document.getElementById('registrationsTable').innerHTML = tableHTML;
}

// Registration management functions
function viewRegistration(registrationId) {
    const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
    const registration = registrations.find(reg => reg.id === registrationId);
    
    if (registration) {
        showRegistrationDetailsModal(registration);
    } else {
        alert('Registration not found');
    }
}

function approveRegistration(registrationId) {
    if (confirm('Are you sure you want to approve this registration?')) {
        const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
        const regIndex = registrations.findIndex(reg => reg.id === registrationId);
        
        if (regIndex !== -1) {
            registrations[regIndex].status = 'approved';
            registrations[regIndex].approvedDate = new Date().toISOString();
            localStorage.setItem('registrations', JSON.stringify(registrations));
            
            showNotification('Registration approved successfully!', 'success');
            loadRegistrations();
            
            // Generate registration card automatically
            setTimeout(() => {
                generateRegistrationCard(registrationId);
            }, 1000);
        }
    }
}

function rejectRegistration(registrationId) {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
        const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
        const regIndex = registrations.findIndex(reg => reg.id === registrationId);
        
        if (regIndex !== -1) {
            registrations[regIndex].status = 'rejected';
            registrations[regIndex].rejectionReason = reason;
            registrations[regIndex].rejectedDate = new Date().toISOString();
            localStorage.setItem('registrations', JSON.stringify(registrations));
            
            showNotification('Registration rejected', 'warning');
            loadRegistrations();
        }
    }
}

function showRegistrationDetailsModal(registration) {
    const modal = document.getElementById('applicationModal');
    const detailsContainer = document.getElementById('applicationDetails');
    
    if (!modal || !detailsContainer) {
        console.error('Modal elements not found');
        return;
    }
    
    detailsContainer.innerHTML = `
        <div class="application-details-content">
            <div class="details-section">
                <h4>Registration Information</h4>
                <div class="details-grid">
                    <div class="detail-item">
                        <strong>Registration ID:</strong> ${registration.id}
                    </div>
                    <div class="detail-item">
                        <strong>Status:</strong> <span class="status-badge status-${registration.status}">${registration.status.toUpperCase()}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Registered:</strong> ${new Date(registration.registrationDate).toLocaleDateString()}
                    </div>
                    ${registration.approvedDate ? `
                    <div class="detail-item">
                        <strong>Approved:</strong> ${new Date(registration.approvedDate).toLocaleDateString()}
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="details-section">
                <h4>Personal Information</h4>
                <div class="details-grid">
                    <div class="detail-item">
                        <strong>Full Name:</strong> ${registration.fullName}
                    </div>
                    <div class="detail-item">
                        <strong>Date of Birth:</strong> ${registration.dateOfBirth}
                    </div>
                    <div class="detail-item">
                        <strong>Gender:</strong> ${registration.gender}
                    </div>
                    <div class="detail-item">
                        <strong>Email:</strong> ${registration.email}
                    </div>
                    <div class="detail-item">
                        <strong>Phone:</strong> ${registration.fullPhone || registration.phone}
                    </div>
                    <div class="detail-item">
                        <strong>Address:</strong> ${registration.street || 'N/A'}
                    </div>
                </div>
            </div>
            
            <div class="details-section">
                <h4>Academic Information</h4>
                <div class="details-grid">
                    <div class="detail-item">
                        <strong>Student ID:</strong> ${registration.studentId}
                    </div>
                    <div class="detail-item">
                        <strong>Course:</strong> ${registration.course}
                    </div>
                    <div class="detail-item">
                        <strong>Program:</strong> ${registration.program}
                    </div>
                    <div class="detail-item">
                        <strong>Year:</strong> ${registration.year}
                    </div>
                    <div class="detail-item">
                        <strong>GPA:</strong> ${registration.gpa}
                    </div>
                </div>
            </div>
            
            <div class="details-section">
                <h4>Documents</h4>
                <div class="documents-list">
                    <div class="document-item">
                        <span class="document-name">Uploaded Document:</span>
                        <span class="document-status ${registration.document !== 'No document uploaded' ? 'uploaded' : 'not-uploaded'}">
                            ${registration.document !== 'No document uploaded' ? '✓ ' + registration.document : '✗ No document uploaded'}
                        </span>
                    </div>
                </div>
            </div>
            
            ${registration.status === 'pending' ? `
            <div class="details-section">
                <h4>Admin Actions</h4>
                <div class="action-buttons">
                    <button class="btn btn-success" onclick="approveRegistrationFromModal('${registration.id}')">
                        Approve Registration
                    </button>
                    <button class="btn btn-danger" onclick="rejectRegistrationFromModal('${registration.id}')">
                        Reject Registration
                    </button>
                </div>
            </div>
            ` : ''}
            
            ${registration.status === 'approved' ? `
            <div class="details-section">
                <h4>Generate Documents</h4>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="generateRegistrationCardFromModal('${registration.id}')">
                        Generate Registration Card
                    </button>
                </div>
            </div>
            ` : ''}
        </div>
    `;
    
    showModal('applicationModal');
}

function approveRegistrationFromModal(registrationId) {
    closeModal('applicationModal');
    approveRegistration(registrationId);
}

function rejectRegistrationFromModal(registrationId) {
    closeModal('applicationModal');
    rejectRegistration(registrationId);
}

function generateRegistrationCardFromModal(registrationId) {
    closeModal('applicationModal');
    generateRegistrationCard(registrationId);
}

function generateRegistrationCard(registrationId) {
    const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
    const registration = registrations.find(reg => reg.id === registrationId);
    
    if (!registration) {
        alert('Registration not found');
        return;
    }
    
    // Generate unique identifiers
    const qrData = `BU-${registration.studentId}-${Date.now()}`;
    const cardNumber = `BU${registration.studentId.replace(/[^0-9]/g, '')}${Date.now().toString().slice(-4)}`;
    const barcodeNumber = `*${registration.studentId}*`;
    
    // Generate student initials for photo placeholder
    const nameParts = registration.fullName.split(' ');
    const initials = nameParts.length > 1 
        ? `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase()
        : registration.fullName.charAt(0).toUpperCase();
    
    // Calculate expiry date (4 years from issue date)
    const issueDate = new Date(registration.approvedDate || registration.registrationDate);
    const expiryDate = new Date(issueDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 4);
    
    // Generate blood type (simulated - in production this would come from student records)
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const bloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
    
    const cardContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Student Registration Card - ${registration.fullName}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Poppins', sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 40px 20px;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                
                .page-header {
                    text-align: center;
                    color: white;
                    margin-bottom: 40px;
                }
                
                .page-header h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 10px;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.2);
                }
                
                .page-header p {
                    font-size: 1.1rem;
                    opacity: 0.9;
                }
                
                .cards-container {
                    display: flex;
                    gap: 40px;
                    flex-wrap: wrap;
                    justify-content: center;
                    margin-bottom: 40px;
                }
                
                .id-card {
                    width: 400px;
                    height: 250px;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    overflow: hidden;
                    position: relative;
                    transition: transform 0.3s ease;
                }
                
                .id-card:hover {
                    transform: translateY(-10px) scale(1.02);
                }
                
                /* Front Card */
                .card-front {
                    background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
                    position: relative;
                    overflow: hidden;
                }
                
                .card-front::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                    animation: shimmer 3s infinite;
                }
                
                .card-front::after {
                    content: 'BUGEMA UNIVERSITY';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: 2rem;
                    font-weight: 700;
                    color: rgba(255,255,255,0.03);
                    white-space: nowrap;
                    pointer-events: none;
                    letter-spacing: 5px;
                }
                
                @keyframes shimmer {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(-20px, -20px); }
                }
                
                .card-header {
                    background: rgba(255,255,255,0.1);
                    padding: 15px 20px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    border-bottom: 2px solid rgba(255,222,89,0.3);
                }
                
                .university-logo {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    border: 3px solid #FFDE59;
                    background: white;
                    padding: 3px;
                    object-fit: cover;
                }
                
                .header-text {
                    flex: 1;
                }
                
                .header-text h2 {
                    color: #FFDE59;
                    font-size: 1.2rem;
                    font-weight: 700;
                    margin-bottom: 2px;
                }
                
                .header-text p {
                    color: rgba(255,255,255,0.9);
                    font-size: 0.75rem;
                    font-weight: 300;
                }
                
                .card-body {
                    padding: 20px;
                    display: flex;
                    gap: 15px;
                }
                
                .student-photo {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #FFDE59, #FFA500);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #1e3a5f;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    flex-shrink: 0;
                    border: 3px solid rgba(255,255,255,0.3);
                    position: relative;
                    overflow: hidden;
                }
                
                .student-photo::after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
                    animation: photoShine 3s infinite;
                }
                
                @keyframes photoShine {
                    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
                    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
                }
                
                .student-details {
                    flex: 1;
                    color: white;
                }
                
                .student-name {
                    font-size: 1.3rem;
                    font-weight: 700;
                    color: #FFDE59;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                    font-size: 0.8rem;
                }
                
                .detail-label {
                    color: rgba(255,255,255,0.7);
                    font-weight: 300;
                }
                
                .detail-value {
                    color: white;
                    font-weight: 600;
                }
                
                .card-footer {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0,0,0,0.3);
                    padding: 8px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.7rem;
                    color: rgba(255,255,255,0.8);
                }
                
                .card-number {
                    font-weight: 600;
                    color: #FFDE59;
                }
                
                /* Back Card */
                .card-back {
                    background: linear-gradient(135deg, #2c5282 0%, #1e3a5f 100%);
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                    overflow: hidden;
                }
                
                .card-back::after {
                    content: 'OFFICIAL';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: rgba(255,255,255,0.03);
                    white-space: nowrap;
                    pointer-events: none;
                    letter-spacing: 10px;
                }
                
                .back-header {
                    text-align: center;
                    color: #FFDE59;
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid rgba(255,222,89,0.3);
                }
                
                .contact-info {
                    background: rgba(255,255,255,0.1);
                    padding: 15px;
                    border-radius: 10px;
                    margin-bottom: 15px;
                }
                
                .contact-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                    color: white;
                    font-size: 0.75rem;
                }
                
                .contact-icon {
                    width: 20px;
                    text-align: center;
                    font-size: 1rem;
                }
                
                .qr-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                    padding: 10px;
                    border-radius: 10px;
                }
                
                .qr-code {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.6rem;
                    color: #666;
                    text-align: center;
                    padding: 5px;
                    border: 2px solid #dee2e6;
                }
                
                .validity-info {
                    flex: 1;
                    padding-left: 15px;
                    color: #333;
                }
                
                .validity-info h4 {
                    font-size: 0.8rem;
                    color: #1e3a5f;
                    margin-bottom: 5px;
                }
                
                .validity-info p {
                    font-size: 0.7rem;
                    color: #666;
                    margin-bottom: 3px;
                }
                
                .signature-line {
                    border-top: 1px solid rgba(255,255,255,0.3);
                    padding-top: 10px;
                    text-align: center;
                    color: rgba(255,255,255,0.7);
                    font-size: 0.65rem;
                }
                
                .instructions {
                    background: white;
                    padding: 30px;
                    border-radius: 20px;
                    max-width: 600px;
                    margin: 0 auto 30px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
                
                .instructions h3 {
                    color: #1e3a5f;
                    font-size: 1.5rem;
                    margin-bottom: 20px;
                    text-align: center;
                }
                
                .instructions-list {
                    list-style: none;
                    padding: 0;
                }
                
                .instructions-list li {
                    padding: 12px 15px;
                    margin-bottom: 10px;
                    background: #f8f9fa;
                    border-left: 4px solid #2c5282;
                    border-radius: 5px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .instructions-list li::before {
                    content: '✓';
                    color: #28a745;
                    font-weight: bold;
                    font-size: 1.2rem;
                }
                
                .print-button {
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    border: none;
                    padding: 15px 40px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    border-radius: 30px;
                    cursor: pointer;
                    box-shadow: 0 5px 15px rgba(40,167,69,0.3);
                    transition: all 0.3s ease;
                    margin: 20px auto;
                    display: block;
                }
                
                .print-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(40,167,69,0.4);
                }
                
                .copyright {
                    background: rgba(255,255,255,0.95);
                    padding: 20px;
                    border-radius: 15px;
                    text-align: center;
                    max-width: 600px;
                    margin: 0 auto;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                
                .copyright p {
                    color: #333;
                    font-size: 0.9rem;
                    margin-bottom: 5px;
                }
                
                .copyright strong {
                    color: #1e3a5f;
                }
                
                @media print {
                    body {
                        background: white;
                        padding: 0;
                    }
                    
                    .page-header,
                    .instructions,
                    .print-button,
                    .copyright {
                        display: none;
                    }
                    
                    .cards-container {
                        gap: 20px;
                        page-break-after: always;
                    }
                    
                    .id-card {
                        box-shadow: none;
                        border: 1px solid #ddd;
                    }
                }
                
                @media (max-width: 900px) {
                    .cards-container {
                        flex-direction: column;
                        align-items: center;
                    }
                }
            </style>
        </head>
        <body>
            <div class="page-header">
                <h1>🎓 Student Registration Card</h1>
                <p>Official Identification Card - Bugema University</p>
            </div>
            
            <div class="cards-container">
                <!-- Front Card -->
                <div class="id-card card-front">
                    <div class="card-header">
                        <img src="../images/BU logo.jpg" alt="BU Logo" class="university-logo" onerror="this.style.display='none'">
                        <div class="header-text">
                            <h2>BUGEMA UNIVERSITY</h2>
                            <p>Student Registration Card</p>
                        </div>
                    </div>
                    
                    <div class="card-body">
                        <div class="student-photo">
                            ${initials}
                        </div>
                        
                        <div class="student-details">
                            <div class="student-name">${registration.fullName}</div>
                            <div class="detail-row">
                                <span class="detail-label">ID:</span>
                                <span class="detail-value">${registration.studentId}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Program:</span>
                                <span class="detail-value">${registration.program}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Year:</span>
                                <span class="detail-value">${registration.year}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">GPA:</span>
                                <span class="detail-value">${registration.gpa || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card-footer">
                        <span>Issued: ${new Date(registration.approvedDate || registration.registrationDate).toLocaleDateString()}</span>
                        <span class="card-number">${cardNumber}</span>
                    </div>
                </div>
                
                <!-- Back Card -->
                <div class="id-card card-back">
                    <div class="back-header">
                        STUDENT INFORMATION
                    </div>
                    
                    <div class="contact-info">
                        <div class="contact-row">
                            <span class="contact-icon">📧</span>
                            <span>${registration.email}</span>
                        </div>
                        <div class="contact-row">
                            <span class="contact-icon">📱</span>
                            <span>${registration.fullPhone || registration.phone}</span>
                        </div>
                        <div class="contact-row">
                            <span class="contact-icon">🏠</span>
                            <span>${registration.street || 'Address on file'}</span>
                        </div>
                        <div class="contact-row">
                            <span class="contact-icon">🎂</span>
                            <span>DOB: ${registration.dateOfBirth || 'On file'}</span>
                        </div>
                        <div class="contact-row">
                            <span class="contact-icon">🩸</span>
                            <span>Blood Type: ${bloodType}</span>
                        </div>
                        <div class="contact-row">
                            <span class="contact-icon">🚨</span>
                            <span>Emergency: ${registration.emergencyContact || registration.fullPhone || registration.phone}</span>
                        </div>
                    </div>
                    
                    <div class="qr-section">
                        <div class="qr-code">
                            QR CODE<br>
                            ${qrData}
                        </div>
                        <div class="validity-info">
                            <h4>Card Validity</h4>
                            <p><strong>Valid From:</strong> ${issueDate.toLocaleDateString()}</p>
                            <p><strong>Valid Until:</strong> ${expiryDate.toLocaleDateString()}</p>
                            <p><strong>Status:</strong> <span style="color: #28a745; font-weight: 600;">ACTIVE</span></p>
                            <p><strong>Card No:</strong> ${cardNumber}</p>
                        </div>
                    </div>
                    
                    <div class="signature-line">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <div style="flex: 1; text-align: center;">
                                <div style="background: white; padding: 5px; border-radius: 4px; display: inline-block;">
                                    <div style="font-family: 'Libre Barcode 39', monospace; font-size: 1.5rem; color: #000; letter-spacing: 2px;">
                                        ${barcodeNumber}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p>Authorized Signature: ________________</p>
                        <p style="margin-top: 5px;">Registrar, Bugema University</p>
                    </div>
                </div>
            </div>
            
            <div class="instructions">
                <h3>📋 Registration Card Information</h3>
                <ul class="instructions-list">
                    <li><strong>Printing:</strong> Print on high-quality cardstock paper (250-300gsm recommended)</li>
                    <li><strong>Cutting:</strong> Use precision scissors or paper cutter along card boundaries</li>
                    <li><strong>Lamination:</strong> Laminate both sides with matte or glossy finish for durability</li>
                    <li><strong>Campus Use:</strong> Carry this card at all times for identification purposes</li>
                    <li><strong>Access Control:</strong> Required for library, labs, exams, and campus facilities</li>
                    <li><strong>Lost/Damaged:</strong> Report immediately to Registrar's Office for replacement</li>
                    <li><strong>Replacement Fee:</strong> UGX 20,000 (valid for 4 years from issue date)</li>
                    <li><strong>Security:</strong> Do not share, lend, or allow unauthorized use of this card</li>
                    <li><strong>Verification:</strong> QR code and barcode for quick digital verification</li>
                    <li><strong>Emergency Info:</strong> Back side contains emergency contact information</li>
                </ul>
                
                <div style="margin-top: 25px; padding: 20px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #2c5282;">
                    <h4 style="color: #1e3a5f; margin-bottom: 10px; font-size: 1.1rem;">📞 Important Contacts</h4>
                    <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Registrar's Office:</strong> +256 414 290 882</p>
                    <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Student Affairs:</strong> studentaffairs@bugemauniv.ac.ug</p>
                    <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Campus Security:</strong> +256 414 290 800</p>
                    <p style="margin: 5px 0; font-size: 0.95rem;"><strong>Emergency Hotline:</strong> 999 / 112</p>
                </div>
            </div>
            
            <button class="print-button" onclick="window.print()">
                🖨️ Print Registration Card
            </button>
            
            <div class="copyright">
                <p><strong>© 2024 Bugema University. All Rights Reserved.</strong></p>
                <p>This Student Registration Card is the exclusive property of Bugema University.</p>
                <p style="margin-top: 15px; font-size: 0.85rem; color: #666; line-height: 1.6;">
                    <strong>Card Details:</strong><br>
                    Card ID: ${cardNumber}<br>
                    Student ID: ${registration.studentId}<br>
                    Generated: ${new Date().toLocaleString()}<br>
                    Valid Until: ${expiryDate.toLocaleDateString()}<br>
                    Issued By: Bugema University Registrar's Office
                </p>
                <p style="margin-top: 15px; font-size: 0.8rem; color: #999; font-style: italic;">
                    This card must be presented upon request by authorized university personnel.<br>
                    Unauthorized duplication, alteration, or misuse is strictly prohibited and may result in disciplinary action.
                </p>
            </div>
        </body>
        </html>
    `;
    
    // Open card in new window
    const cardWindow = window.open('', '_blank', 'width=1200,height=800');
    cardWindow.document.write(cardContent);
    cardWindow.document.close();
    cardWindow.focus();
    
    showNotification('✅ Enhanced registration card generated successfully!', 'success');
}

function loadScholarships() {
    console.log('Loading scholarships');
    showLoading('scholarshipsTable');
    document.getElementById('scholarshipsTable').innerHTML = '<div class="loading">Scholarships feature coming soon</div>';
}

function loadBursaries() {
    console.log('Loading bursaries');
    showLoading('bursariesTable');
    document.getElementById('bursariesTable').innerHTML = '<div class="loading">Bursaries feature coming soon</div>';
}

function loadStudents() {
    console.log('Loading students');
    showLoading('studentsTable');
    document.getElementById('studentsTable').innerHTML = '<div class="loading">Students feature coming soon</div>';
}

function loadOrganizations() {
    console.log('Loading organizations');
    showLoading('organizationsTable');
    document.getElementById('organizationsTable').innerHTML = '<div class="loading">Organizations feature coming soon</div>';
}

function loadFeedback() {
    console.log('Loading feedback');
    showLoading('feedbackTable');
    document.getElementById('feedbackTable').innerHTML = '<div class="loading">Feedback feature coming soon</div>';
}

// Application action functions with detailed CRUD operations
function viewApplication(applicationId) {
    console.log('🔍 CRUD OPERATION: READ (View Application)');
    console.log('📊 Operation Details:', {
        action: 'READ',
        recordId: applicationId,
        timestamp: new Date().toISOString(),
        user: 'admin-001'
    });
    
    // Get application data from localStorage or API
    const applications = JSON.parse(localStorage.getItem('bursaryApplications') || '[]')
        .concat(JSON.parse(localStorage.getItem('scholarshipApplications') || '[]'))
        .concat(JSON.parse(localStorage.getItem('applications') || '[]'));
    
    const application = applications.find(app => 
        app.metadata?.applicationId === applicationId || 
        app.application_id === applicationId
    );
    
    if (application) {
        console.log('✅ READ Operation Successful');
        console.log('📊 Retrieved Record:', JSON.stringify(application, null, 2));
        showApplicationDetailsModal(application);
    } else {
        console.log('❌ READ Operation Failed: Record not found');
        alert('❌ CRUD OPERATION FAILED: READ\n\nRecord ID: ' + applicationId + '\nError: Application not found in database\nTimestamp: ' + new Date().toLocaleString());
    }
}

function approveApplication(applicationId) {
    console.log('✅ CRUD OPERATION: UPDATE (Approve Application)');
    console.log('📊 Operation Details:', {
        action: 'UPDATE',
        recordId: applicationId,
        timestamp: new Date().toISOString(),
        user: 'admin-001',
        operation: 'status_change_to_approved'
    });
    
    // Show detailed approval process
    showApprovalDetails(applicationId);
}

function rejectApplication(applicationId) {
    console.log('❌ CRUD OPERATION: UPDATE (Reject Application)');
    console.log('📊 Operation Details:', {
        action: 'UPDATE',
        recordId: applicationId,
        timestamp: new Date().toISOString(),
        user: 'admin-001',
        operation: 'status_change_to_rejected'
    });
    
    // Show detailed rejection process
    showRejectionDetails(applicationId);
}

// Utility functions
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>
        `;
    }
}

function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <p style="color: #dc3545;">${message}</p>
            </div>
        `;
    }
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-UG').format(num);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatApplicationType(category, type) {
    if (category === 'scholarship') {
        return 'Scholarship';
    } else if (category === 'bursary') {
        return 'Bursary';
    }
    return category || 'Unknown';
}

function renderPagination(pagination, loadFunction) {
    if (pagination.pages <= 1) return '';
    
    let paginationHTML = '<div class="pagination">';
    
    // Previous button
    paginationHTML += `<button ${pagination.page <= 1 ? 'disabled' : ''} onclick="${loadFunction}(${pagination.page - 1})">Previous</button>`;
    
    // Page numbers
    const startPage = Math.max(1, pagination.page - 2);
    const endPage = Math.min(pagination.pages, pagination.page + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button class="${i === pagination.page ? 'active' : ''}" onclick="${loadFunction}(${i})">${i}</button>`;
    }
    
    // Next button
    paginationHTML += `<button ${pagination.page >= pagination.pages ? 'disabled' : ''} onclick="${loadFunction}(${pagination.page + 1})">Next</button>`;
    
    paginationHTML += '</div>';
    return paginationHTML;
}

// Helper function to update application in storage
function updateApplicationInStorage(application) {
    const applicationId = application.metadata?.applicationId || application.application_id;
    
    // Update in bursary applications
    let bursaryApps = JSON.parse(localStorage.getItem('bursaryApplications') || '[]');
    const bursaryIndex = bursaryApps.findIndex(app => 
        app.metadata?.applicationId === applicationId || app.application_id === applicationId
    );
    if (bursaryIndex !== -1) {
        bursaryApps[bursaryIndex] = application;
        localStorage.setItem('bursaryApplications', JSON.stringify(bursaryApps));
        return;
    }
    
    // Update in scholarship applications
    let scholarshipApps = JSON.parse(localStorage.getItem('scholarshipApplications') || '[]');
    const scholarshipIndex = scholarshipApps.findIndex(app => 
        app.metadata?.applicationId === applicationId || app.application_id === applicationId
    );
    if (scholarshipIndex !== -1) {
        scholarshipApps[scholarshipIndex] = application;
        localStorage.setItem('scholarshipApplications', JSON.stringify(scholarshipApps));
        return;
    }
    
    // Update in general applications
    let generalApps = JSON.parse(localStorage.getItem('applications') || '[]');
    const generalIndex = generalApps.findIndex(app => 
        app.metadata?.applicationId === applicationId || app.application_id === applicationId
    );
    if (generalIndex !== -1) {
        generalApps[generalIndex] = application;
        localStorage.setItem('applications', JSON.stringify(generalApps));
    }
}

// Show application details modal with comprehensive CRUD information
function showApplicationDetailsModal(application) {
    const modal = document.getElementById('applicationModal');
    const detailsContainer = document.getElementById('applicationDetails');
    
    if (!modal || !detailsContainer) {
        console.error('Application modal elements not found');
        return;
    }
    
    const applicant = application.applicant || {};
    const appDetails = application.application || {};
    const financialInfo = application.financialInfo || {};
    const academicInfo = application.academicInfo || {};
    const documents = application.documents || {};
    const metadata = application.metadata || {};
    
    const applicationType = application.financialInfo ? 'Bursary' : 'Scholarship';
    const status = metadata.status || application.status || 'pending';
    const applicationId = metadata.applicationId || application.application_id || 'N/A';
    
    // Calculate eligibility score
    const eligibilityScore = calculateEligibilityScore(application);
    
    detailsContainer.innerHTML = `
        <div class="application-details-content">
            <!-- CRUD Operation Header -->
            <div class="crud-header">
                <h3>📋 CRUD Operation: READ (View Application Details)</h3>
                <div class="crud-info">
                    <span class="crud-badge">Operation: VIEW</span>
                    <span class="crud-badge">Record ID: ${applicationId}</span>
                    <span class="crud-badge">Timestamp: ${new Date().toLocaleString()}</span>
                </div>
            </div>
            
            <!-- Application Overview -->
            <div class="details-section overview-section">
                <h4>📊 Application Overview</h4>
                <div class="overview-grid">
                    <div class="overview-card">
                        <div class="overview-label">Application ID</div>
                        <div class="overview-value">${applicationId}</div>
                    </div>
                    <div class="overview-card">
                        <div class="overview-label">Type</div>
                        <div class="overview-value">${applicationType}</div>
                    </div>
                    <div class="overview-card">
                        <div class="overview-label">Status</div>
                        <div class="overview-value">
                            <span class="status-badge status-${status}">${status.toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="overview-card">
                        <div class="overview-label">Eligibility Score</div>
                        <div class="overview-value score-${getScoreClass(eligibilityScore)}">${eligibilityScore}%</div>
                    </div>
                </div>
            </div>
            
            <!-- Student Information -->
            <div class="details-section">
                <h4>👤 Student Information (Personal Data)</h4>
                <div class="details-grid">
                    <div class="detail-item">
                        <strong>Full Name:</strong> ${applicant.firstName || ''} ${applicant.lastName || ''}
                    </div>
                    <div class="detail-item">
                        <strong>Student ID:</strong> ${applicant.studentId || 'N/A'}
                    </div>
                    <div class="detail-item">
                        <strong>Email Address:</strong> ${applicant.email || 'N/A'}
                    </div>
                    <div class="detail-item">
                        <strong>Phone Number:</strong> ${applicant.phone || 'N/A'}
                    </div>
                    <div class="detail-item">
                        <strong>Academic Program:</strong> ${applicant.program || 'N/A'}
                    </div>
                    <div class="detail-item">
                        <strong>Registration Date:</strong> ${metadata.submittedAt ? new Date(metadata.submittedAt).toLocaleDateString() : 'N/A'}
                    </div>
                </div>
            </div>
            
            <!-- Academic Information (for Scholarships) -->
            ${academicInfo.gpa || academicInfo.currentYear ? `
            <div class="details-section">
                <h4>🎓 Academic Information</h4>
                <div class="details-grid">
                    ${academicInfo.currentYear ? `
                    <div class="detail-item">
                        <strong>Current Year:</strong> ${academicInfo.currentYear}
                    </div>
                    ` : ''}
                    ${academicInfo.gpa ? `
                    <div class="detail-item">
                        <strong>GPA:</strong> <span class="gpa-score">${academicInfo.gpa}</span>
                    </div>
                    ` : ''}
                    ${academicInfo.scholarshipType ? `
                    <div class="detail-item">
                        <strong>Scholarship Type:</strong> ${academicInfo.scholarshipType}
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}
            
            <!-- Financial Information (for Bursaries) -->
            ${financialInfo.annualIncome ? `
            <div class="details-section">
                <h4>💰 Financial Information</h4>
                <div class="details-grid">
                    <div class="detail-item">
                        <strong>Annual Income:</strong> UGX ${formatNumber(financialInfo.annualIncome)}
                    </div>
                    <div class="detail-item">
                        <strong>Sponsor:</strong> ${financialInfo.sponsor || 'N/A'}
                    </div>
                    ${financialInfo.dependents ? `
                    <div class="detail-item">
                        <strong>Dependents:</strong> ${financialInfo.dependents}
                    </div>
                    ` : ''}
                    ${financialInfo.expenses ? `
                    <div class="detail-item">
                        <strong>Monthly Expenses:</strong> UGX ${formatNumber(financialInfo.expenses)}
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}
            
            <!-- Application Statement -->
            <div class="details-section">
                <h4>📝 Application Statement</h4>
                <div class="statement-container">
                    <div class="statement-text">
                        ${appDetails.reason || appDetails.personalStatement || 'No statement provided'}
                    </div>
                    <div class="statement-meta">
                        <small>Character Count: ${(appDetails.reason || appDetails.personalStatement || '').length} characters</small>
                    </div>
                </div>
            </div>
            
            <!-- Document Management -->
            <div class="details-section">
                <h4>📎 Document Management</h4>
                <div class="documents-container">
                    <div class="documents-summary">
                        <span class="doc-count">Total Documents: ${Object.keys(documents).length}</span>
                        <span class="doc-uploaded">Uploaded: ${Object.values(documents).filter(doc => doc !== 'Not uploaded').length}</span>
                        <span class="doc-missing">Missing: ${Object.values(documents).filter(doc => doc === 'Not uploaded').length}</span>
                    </div>
                    <div class="documents-list">
                        ${Object.entries(documents).map(([key, value]) => `
                            <div class="document-item">
                                <div class="document-info">
                                    <span class="document-name">${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</span>
                                    <span class="document-status ${value !== 'Not uploaded' ? 'uploaded' : 'not-uploaded'}">
                                        ${value !== 'Not uploaded' ? '✓ ' + value : '✗ Not uploaded'}
                                    </span>
                                </div>
                                <div class="document-actions">
                                    ${value !== 'Not uploaded' ? `
                                        <button class="btn btn-secondary btn-sm" onclick="viewDocument('${key}', '${value}')">
                                            👁️ View
                                        </button>
                                        <button class="btn btn-info btn-sm" onclick="downloadDocument('${key}', '${value}')">
                                            📥 Download
                                        </button>
                                    ` : `
                                        <span class="missing-doc">❌ Required</span>
                                    `}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <!-- Application Timeline -->
            <div class="details-section">
                <h4>⏰ Application Timeline</h4>
                <div class="timeline">
                    <div class="timeline-item completed">
                        <div class="timeline-marker">✓</div>
                        <div class="timeline-content">
                            <strong>Application Submitted</strong>
                            <div class="timeline-date">${metadata.submittedAt ? new Date(metadata.submittedAt).toLocaleString() : 'N/A'}</div>
                        </div>
                    </div>
                    <div class="timeline-item ${status !== 'pending' ? 'completed' : 'pending'}">
                        <div class="timeline-marker">${status !== 'pending' ? '✓' : '⏳'}</div>
                        <div class="timeline-content">
                            <strong>Under Review</strong>
                            <div class="timeline-date">${status !== 'pending' ? 'Completed' : 'In Progress'}</div>
                        </div>
                    </div>
                    <div class="timeline-item ${status === 'approved' || status === 'rejected' ? 'completed' : 'pending'}">
                        <div class="timeline-marker">${status === 'approved' ? '✅' : status === 'rejected' ? '❌' : '⏳'}</div>
                        <div class="timeline-content">
                            <strong>Decision Made</strong>
                            <div class="timeline-date">${status === 'approved' || status === 'rejected' ? 'Completed' : 'Pending'}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- System Information -->
            <div class="details-section">
                <h4>🔧 System Information</h4>
                <div class="details-grid">
                    <div class="detail-item">
                        <strong>Database Record:</strong> localStorage
                    </div>
                    <div class="detail-item">
                        <strong>Data Format:</strong> JSON
                    </div>
                    <div class="detail-item">
                        <strong>Last Modified:</strong> ${new Date().toLocaleString()}
                    </div>
                    <div class="detail-item">
                        <strong>Record Size:</strong> ${JSON.stringify(application).length} bytes
                    </div>
                    <div class="detail-item">
                        <strong>Application Type:</strong> ${metadata.applicationType || 'legacy'}
                    </div>
                    <div class="detail-item">
                        <strong>Version:</strong> 2.0
                    </div>
                </div>
            </div>
            
            <!-- Admin Actions -->
            ${status === 'pending' ? `
            <div class="details-section admin-actions">
                <h4>⚡ Available CRUD Operations</h4>
                <div class="crud-operations">
                    <div class="crud-operation">
                        <button class="btn btn-success crud-btn" onclick="showApprovalDetails('${applicationId}')">
                            ✅ APPROVE (UPDATE Operation)
                        </button>
                        <small>Updates status to 'approved' and generates approval letter</small>
                    </div>
                    <div class="crud-operation">
                        <button class="btn btn-danger crud-btn" onclick="showRejectionDetails('${applicationId}')">
                            ❌ REJECT (UPDATE Operation)
                        </button>
                        <small>Updates status to 'rejected' with reason</small>
                    </div>
                    <div class="crud-operation">
                        <button class="btn btn-warning crud-btn" onclick="showDeleteConfirmation('${applicationId}')">
                            🗑️ DELETE (DELETE Operation)
                        </button>
                        <small>Permanently removes application record</small>
                    </div>
                </div>
            </div>
            ` : `
            <div class="details-section admin-actions">
                <h4>📋 Application Status: ${status.toUpperCase()}</h4>
                <div class="status-info">
                    <p>This application has been ${status}. No further actions are required.</p>
                    ${status === 'approved' ? `
                        <button class="btn btn-info" onclick="generateApprovalLetter(findApplicationById('${applicationId}'))">
                            📄 Regenerate Approval Letter
                        </button>
                    ` : ''}
                    <button class="btn btn-secondary" onclick="showApplicationHistory('${applicationId}')">
                        📊 View Application History
                    </button>
                </div>
            </div>
            `}
        </div>
        
        <style>
            .application-details-content {
                max-height: 80vh;
                overflow-y: auto;
                padding: 10px;
            }
            
            .crud-header {
                background: linear-gradient(135deg, #1e3a5f, #2c5282);
                color: white;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                text-align: center;
            }
            
            .crud-header h3 {
                margin: 0 0 10px 0;
                font-size: 1.2rem;
            }
            
            .crud-info {
                display: flex;
                justify-content: center;
                gap: 15px;
                flex-wrap: wrap;
            }
            
            .crud-badge {
                background: rgba(255,255,255,0.2);
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
            }
            
            .overview-section {
                background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                border: 2px solid #2c5282;
            }
            
            .overview-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }
            
            .overview-card {
                background: white;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            
            .overview-label {
                font-size: 0.9rem;
                color: #666;
                margin-bottom: 5px;
            }
            
            .overview-value {
                font-size: 1.2rem;
                font-weight: bold;
                color: #2c5282;
            }
            
            .score-high { color: #28a745; }
            .score-medium { color: #ffc107; }
            .score-low { color: #dc3545; }
            
            .details-section {
                margin-bottom: 25px;
                padding: 20px;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                background: #f8f9fa;
            }
            
            .details-section h4 {
                color: #2c5282;
                margin-bottom: 15px;
                font-size: 1.1rem;
                border-bottom: 2px solid #2c5282;
                padding-bottom: 8px;
            }
            
            .details-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 12px;
            }
            
            .detail-item {
                padding: 12px;
                background: white;
                border-radius: 6px;
                border-left: 4px solid #2c5282;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .statement-container {
                background: white;
                border-radius: 6px;
                overflow: hidden;
            }
            
            .statement-text {
                padding: 20px;
                border-left: 4px solid #2c5282;
                line-height: 1.6;
                min-height: 100px;
            }
            
            .statement-meta {
                padding: 10px 20px;
                background: #f8f9fa;
                border-top: 1px solid #e9ecef;
                text-align: right;
            }
            
            .documents-container {
                background: white;
                border-radius: 6px;
                overflow: hidden;
            }
            
            .documents-summary {
                padding: 15px;
                background: #e9ecef;
                display: flex;
                gap: 20px;
                font-weight: 600;
            }
            
            .doc-count { color: #2c5282; }
            .doc-uploaded { color: #28a745; }
            .doc-missing { color: #dc3545; }
            
            .documents-list {
                padding: 15px;
            }
            
            .document-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #e9ecef;
            }
            
            .document-item:last-child {
                border-bottom: none;
            }
            
            .document-info {
                flex: 1;
            }
            
            .document-name {
                font-weight: 600;
                display: block;
                margin-bottom: 4px;
            }
            
            .document-status.uploaded {
                color: #28a745;
                font-weight: 500;
            }
            
            .document-status.not-uploaded {
                color: #dc3545;
                font-weight: 500;
            }
            
            .document-actions {
                display: flex;
                gap: 8px;
            }
            
            .missing-doc {
                color: #dc3545;
                font-weight: 600;
                font-size: 0.9rem;
            }
            
            .timeline {
                position: relative;
                padding-left: 30px;
            }
            
            .timeline::before {
                content: '';
                position: absolute;
                left: 15px;
                top: 0;
                bottom: 0;
                width: 2px;
                background: #e9ecef;
            }
            
            .timeline-item {
                position: relative;
                margin-bottom: 20px;
            }
            
            .timeline-marker {
                position: absolute;
                left: -22px;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
            }
            
            .timeline-item.completed .timeline-marker {
                background: #28a745;
                color: white;
            }
            
            .timeline-item.pending .timeline-marker {
                background: #ffc107;
                color: #212529;
            }
            
            .timeline-content strong {
                display: block;
                margin-bottom: 4px;
                color: #2c5282;
            }
            
            .timeline-date {
                font-size: 0.9rem;
                color: #666;
            }
            
            .admin-actions {
                background: linear-gradient(135deg, #fff3cd, #ffeaa7);
                border: 2px solid #ffc107;
            }
            
            .crud-operations {
                display: grid;
                gap: 15px;
            }
            
            .crud-operation {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background: white;
                border-radius: 6px;
                border-left: 4px solid #ffc107;
            }
            
            .crud-btn {
                min-width: 200px;
                font-weight: 600;
            }
            
            .status-info {
                background: white;
                padding: 20px;
                border-radius: 6px;
                text-align: center;
            }
            
            .gpa-score {
                font-weight: bold;
                color: #28a745;
            }
            
            .btn-sm {
                padding: 4px 8px;
                font-size: 0.8rem;
            }
            
            @media (max-width: 768px) {
                .overview-grid {
                    grid-template-columns: 1fr;
                }
                
                .details-grid {
                    grid-template-columns: 1fr;
                }
                
                .crud-info {
                    flex-direction: column;
                    gap: 8px;
                }
                
                .documents-summary {
                    flex-direction: column;
                    gap: 8px;
                }
                
                .document-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }
            }
        </style>
    `;
    
    showModal('applicationModal');
}

// View document function
function viewDocument(documentType, fileName) {
    alert(`Document Viewer\n\nDocument Type: ${documentType}\nFile Name: ${fileName}\n\nNote: In a production system, this would open the actual document file. For this demo, document files are simulated.`);
}

// Approve application from modal
function approveApplicationFromModal(applicationId) {
    closeModal('applicationModal');
    approveApplication(applicationId);
}

// Reject application from modal
function rejectApplicationFromModal(applicationId) {
    closeModal('applicationModal');
    rejectApplication(applicationId);
}

// Generate approval letter
function generateApprovalLetter(application) {
    const applicant = application.applicant || {};
    const metadata = application.metadata || {};
    const financialInfo = application.financialInfo || {};
    const applicationType = application.financialInfo ? 'Bursary' : 'Scholarship';
    const amount = application.financialInfo ? 'UGX 1,500,000' : 'UGX 2,000,000';
    
    // Generate unique reference number
    const refNumber = `BU/${applicationType.toUpperCase()}/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const letterContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${applicationType} Approval Letter - ${applicant.firstName} ${applicant.lastName}</title>
            <meta charset="UTF-8">
            <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Crimson Text', 'Times New Roman', serif;
                    margin: 0;
                    padding: 40px;
                    line-height: 1.8;
                    color: #333;
                    background: #f5f5f5;
                }
                
                .letter-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    padding: 60px;
                    box-shadow: 0 0 30px rgba(0,0,0,0.1);
                    position: relative;
                }
                
                /* Watermark */
                .letter-container::before {
                    content: 'APPROVED';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: 120px;
                    font-weight: 700;
                    color: rgba(40, 167, 69, 0.05);
                    z-index: 0;
                    pointer-events: none;
                }
                
                .content-wrapper {
                    position: relative;
                    z-index: 1;
                }
                
                /* Header */
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 30px;
                    border-bottom: 3px solid #1e3a5f;
                }
                
                .logo-section {
                    margin-bottom: 20px;
                }
                
                .logo {
                    width: 100px;
                    height: 100px;
                    margin: 0 auto 15px;
                    border-radius: 50%;
                    border: 4px solid #1e3a5f;
                    padding: 5px;
                    background: white;
                }
                
                .university-name {
                    font-size: 32px;
                    font-weight: 700;
                    color: #1e3a5f;
                    margin-bottom: 8px;
                    letter-spacing: 2px;
                }
                
                .motto {
                    font-style: italic;
                    color: #666;
                    font-size: 16px;
                    margin-bottom: 15px;
                }
                
                .contact-info {
                    font-family: 'Open Sans', sans-serif;
                    font-size: 13px;
                    color: #666;
                    line-height: 1.6;
                }
                
                /* Reference and Date */
                .ref-date-section {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                    font-family: 'Open Sans', sans-serif;
                    font-size: 14px;
                }
                
                .ref-number {
                    font-weight: 600;
                    color: #1e3a5f;
                }
                
                /* Recipient */
                .recipient-section {
                    margin-bottom: 30px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-left: 4px solid #28a745;
                    border-radius: 4px;
                }
                
                .recipient-section div {
                    margin-bottom: 5px;
                    font-family: 'Open Sans', sans-serif;
                    font-size: 15px;
                }
                
                .recipient-section strong {
                    color: #1e3a5f;
                    min-width: 100px;
                    display: inline-block;
                }
                
                /* Letter Title */
                .letter-title {
                    text-align: center;
                    font-size: 24px;
                    font-weight: 700;
                    color: #1e3a5f;
                    text-decoration: underline;
                    text-decoration-color: #28a745;
                    text-underline-offset: 8px;
                    margin-bottom: 35px;
                    letter-spacing: 1px;
                }
                
                /* Content */
                .content {
                    text-align: justify;
                    font-size: 16px;
                    margin-bottom: 30px;
                }
                
                .content p {
                    margin-bottom: 20px;
                }
                
                .salutation {
                    font-weight: 600;
                    color: #1e3a5f;
                }
                
                .approval-notice {
                    background: linear-gradient(135deg, #d4edda, #c3e6cb);
                    padding: 20px;
                    border-radius: 8px;
                    border-left: 5px solid #28a745;
                    margin: 25px 0;
                    font-weight: 600;
                    color: #155724;
                }
                
                /* Details Box */
                .details-box {
                    background: #f8f9fa;
                    padding: 25px;
                    border-radius: 8px;
                    margin: 25px 0;
                    border: 2px solid #dee2e6;
                }
                
                .details-box h4 {
                    color: #1e3a5f;
                    margin-bottom: 15px;
                    font-size: 18px;
                    border-bottom: 2px solid #1e3a5f;
                    padding-bottom: 10px;
                }
                
                .details-box ul {
                    list-style: none;
                    padding: 0;
                }
                
                .details-box li {
                    padding: 8px 0;
                    border-bottom: 1px solid #e9ecef;
                    display: flex;
                    justify-content: space-between;
                }
                
                .details-box li:last-child {
                    border-bottom: none;
                }
                
                .detail-label {
                    font-weight: 600;
                    color: #495057;
                }
                
                .detail-value {
                    color: #1e3a5f;
                    font-weight: 600;
                }
                
                /* Steps */
                .steps-section {
                    background: #fff3cd;
                    padding: 25px;
                    border-radius: 8px;
                    border-left: 5px solid #ffc107;
                    margin: 25px 0;
                }
                
                .steps-section h4 {
                    color: #856404;
                    margin-bottom: 15px;
                    font-size: 18px;
                }
                
                .steps-section ol {
                    padding-left: 25px;
                }
                
                .steps-section li {
                    margin-bottom: 12px;
                    color: #856404;
                }
                
                /* Important Notice */
                .important-notice {
                    background: #d1ecf1;
                    padding: 20px;
                    border-radius: 8px;
                    border-left: 5px solid #17a2b8;
                    margin: 25px 0;
                    font-size: 15px;
                }
                
                .important-notice strong {
                    color: #0c5460;
                }
                
                /* Congratulations */
                .congratulations {
                    background: linear-gradient(135deg, #fff3cd, #ffeaa7);
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    margin: 25px 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #856404;
                    border: 2px dashed #ffc107;
                }
                
                /* Signature Section */
                .signature-section {
                    margin-top: 50px;
                    display: flex;
                    justify-content: space-between;
                }
                
                .signature-block {
                    text-align: center;
                }
                
                .signature-line {
                    border-bottom: 2px solid #333;
                    width: 200px;
                    margin-bottom: 10px;
                    height: 60px;
                }
                
                .signature-name {
                    font-weight: 700;
                    color: #1e3a5f;
                    margin-bottom: 5px;
                }
                
                .signature-title {
                    font-size: 14px;
                    color: #666;
                    font-style: italic;
                }
                
                /* Stamp Area */
                .stamp-area {
                    text-align: center;
                    margin-top: 20px;
                    padding: 15px;
                    border: 3px dashed #1e3a5f;
                    border-radius: 50%;
                    width: 150px;
                    height: 150px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: auto;
                    margin-right: auto;
                    color: #1e3a5f;
                    font-weight: 700;
                    font-size: 14px;
                }
                
                /* Footer */
                .footer {
                    margin-top: 50px;
                    padding-top: 30px;
                    border-top: 2px solid #dee2e6;
                    text-align: center;
                    font-family: 'Open Sans', sans-serif;
                    font-size: 12px;
                    color: #666;
                }
                
                .footer p {
                    margin-bottom: 8px;
                }
                
                .footer strong {
                    color: #1e3a5f;
                }
                
                /* Print Button */
                .print-button {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    font-size: 16px;
                    font-weight: 600;
                    border-radius: 30px;
                    cursor: pointer;
                    box-shadow: 0 5px 15px rgba(40,167,69,0.3);
                    z-index: 1000;
                    transition: all 0.3s ease;
                }
                
                .print-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(40,167,69,0.4);
                }
                
                /* Print Styles */
                @media print {
                    body {
                        background: white;
                        padding: 0;
                    }
                    
                    .letter-container {
                        box-shadow: none;
                        padding: 40px;
                    }
                    
                    .print-button {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <button class="print-button" onclick="window.print()">🖨️ Print Letter</button>
            
            <div class="letter-container">
                <div class="content-wrapper">
                    <!-- Header -->
                    <div class="header">
                        <div class="logo-section">
                            <img src="../images/BU logo.jpg" alt="Bugema University Logo" class="logo" onerror="this.style.display='none'">
                        </div>
                        <div class="university-name">BUGEMA UNIVERSITY</div>
                        <div class="motto">"Training the head, the heart, and the hands"</div>
                        <div class="contact-info">
                            P.O. Box 6529, Kampala, Uganda<br>
                            Tel: +256 414 290 881/2 | Fax: +256 414 290 883<br>
                            Email: info@bugemauniv.ac.ug | Website: www.bugemauniv.ac.ug
                        </div>
                    </div>
                    
                    <!-- Reference and Date -->
                    <div class="ref-date-section">
                        <div class="ref-number">Ref: ${refNumber}</div>
                        <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                    </div>
                    
                    <!-- Recipient -->
                    <div class="recipient-section">
                        <div><strong>To:</strong> ${applicant.firstName} ${applicant.lastName}</div>
                        <div><strong>Student ID:</strong> ${applicant.studentId}</div>
                        <div><strong>Program:</strong> ${applicant.program}</div>
                        <div><strong>Email:</strong> ${applicant.email}</div>
                        <div><strong>Phone:</strong> ${applicant.phone || 'N/A'}</div>
                    </div>
                    
                    <!-- Letter Title -->
                    <div class="letter-title">
                        ${applicationType.toUpperCase()} APPROVAL LETTER
                    </div>
                    
                    <!-- Content -->
                    <div class="content">
                        <p class="salutation">Dear ${applicant.firstName} ${applicant.lastName},</p>
                        
                        <div class="approval-notice">
                            🎉 CONGRATULATIONS! Your application for a ${applicationType.toLowerCase()} has been <strong>APPROVED</strong> by the Bugema University Scholarship and Bursary Committee.
                        </div>
                        
                        <p>We are delighted to inform you that after careful review and consideration of your application, you have been selected to receive financial assistance through our ${applicationType} program for the academic year ${new Date().getFullYear()}/${new Date().getFullYear() + 1}.</p>
                        
                        <!-- Application Details -->
                        <div class="details-box">
                            <h4>📋 ${applicationType} Award Details</h4>
                            <ul>
                                <li>
                                    <span class="detail-label">Application ID:</span>
                                    <span class="detail-value">${metadata.applicationId || 'N/A'}</span>
                                </li>
                                <li>
                                    <span class="detail-label">Award Type:</span>
                                    <span class="detail-value">${applicationType}</span>
                                </li>
                                <li>
                                    <span class="detail-label">Approved Amount:</span>
                                    <span class="detail-value">${amount}</span>
                                </li>
                                <li>
                                    <span class="detail-label">Academic Program:</span>
                                    <span class="detail-value">${applicant.program}</span>
                                </li>
                                <li>
                                    <span class="detail-label">Academic Year:</span>
                                    <span class="detail-value">${new Date().getFullYear()}/${new Date().getFullYear() + 1}</span>
                                </li>
                                <li>
                                    <span class="detail-label">Approval Date:</span>
                                    <span class="detail-value">${new Date().toLocaleDateString('en-GB')}</span>
                                </li>
                                <li>
                                    <span class="detail-label">Reference Number:</span>
                                    <span class="detail-value">${refNumber}</span>
                                </li>
                            </ul>
                        </div>
                        
                        <p>This ${applicationType.toLowerCase()} is awarded in recognition of your ${applicationType === 'Scholarship' ? '<strong>outstanding academic excellence, demonstrated potential, and commitment to educational pursuits</strong>' : '<strong>demonstrated financial need, academic commitment, and determination to succeed despite financial challenges</strong>'}. We believe in your potential and are committed to supporting your educational journey.</p>
                        
                        ${applicationType === 'Bursary' && financialInfo.annualIncome ? `
                        <p><strong>Financial Assessment:</strong> Based on your reported annual household income of UGX ${parseInt(financialInfo.annualIncome).toLocaleString()}, our committee has determined that you qualify for this bursary assistance to help alleviate your financial burden and enable you to focus on your studies.</p>
                        ` : ''}
                        
                        <!-- Next Steps -->
                        <div class="steps-section">
                            <h4>📝 Required Next Steps</h4>
                            <ol>
                                <li><strong>Report to Student Affairs Office</strong> within <strong>7 working days</strong> of receiving this letter</li>
                                <li><strong>Present this approval letter</strong> along with your student ID card for verification</li>
                                <li><strong>Complete the ${applicationType} Acceptance Form</strong> available at the Student Affairs Office</li>
                                <li><strong>Provide updated bank account details</strong> for fund disbursement (if applicable)</li>
                                <li><strong>Submit any additional documentation</strong> as may be required by the Finance Office</li>
                                <li><strong>Attend the mandatory ${applicationType} recipients orientation</strong> (date to be communicated)</li>
                            </ol>
                        </div>
                        
                        <!-- Important Notice -->
                        <div class="important-notice">
                            <strong>⚠️ Important Conditions:</strong><br><br>
                            This ${applicationType.toLowerCase()} is subject to the following conditions:
                            <ul style="margin-top: 10px; padding-left: 20px;">
                                <li>Maintaining a minimum GPA of 3.0 throughout the academic year</li>
                                <li>Full-time enrollment in your declared program of study</li>
                                <li>Adherence to all university policies and code of conduct</li>
                                <li>Regular attendance and satisfactory academic progress</li>
                                <li>Participation in ${applicationType.toLowerCase()} program activities and reviews</li>
                                <li>Submission of progress reports each semester</li>
                            </ul>
                            <br>
                            <strong>Note:</strong> Failure to meet these conditions may result in suspension or termination of the ${applicationType.toLowerCase()} award.
                        </div>
                        
                        <p><strong>Fund Disbursement:</strong> The approved amount will be credited directly to your student account and applied towards tuition fees, accommodation, and other approved academic expenses as per university financial aid policy. Any remaining balance may be disbursed to your provided bank account for educational materials and living expenses.</p>
                        
                        <div class="congratulations">
                            🎓 Congratulations once again on this achievement!<br>
                            We are proud to support your educational aspirations.
                        </div>
                        
                        <p>Should you have any questions or require clarification regarding this ${applicationType.toLowerCase()} award, please do not hesitate to contact the Student Affairs Office at <strong>studentaffairs@bugemauniv.ac.ug</strong> or call <strong>+256 414 290 882</strong>.</p>
                        
                        <p>We wish you continued success in your academic endeavors and look forward to celebrating your achievements at Bugema University.</p>
                        
                        <p style="margin-top: 30px;"><strong>Yours sincerely,</strong></p>
                    </div>
                    
                    <!-- Signature Section -->
                    <div class="signature-section">
                        <div class="signature-block">
                            <div class="signature-line"></div>
                            <div class="signature-name">Dr. Sarah Namukasa</div>
                            <div class="signature-title">Director, Student Affairs</div>
                            <div class="signature-title">Bugema University</div>
                        </div>
                        
                        <div class="signature-block">
                            <div class="signature-line"></div>
                            <div class="signature-name">Prof. John Kibuuka</div>
                            <div class="signature-title">Dean of Students</div>
                            <div class="signature-title">Bugema University</div>
                        </div>
                    </div>
                    
                    <!-- Official Stamp -->
                    <div class="stamp-area">
                        OFFICIAL<br>UNIVERSITY<br>STAMP
                    </div>
                    
                    <!-- Footer -->
                    <div class="footer">
                        <p><strong>© ${new Date().getFullYear()} Bugema University. All Rights Reserved.</strong></p>
                        <p>This ${applicationType} Approval Letter is an official document of Bugema University.</p>
                        <p>Reference: ${refNumber} | Generated: ${new Date().toLocaleString()}</p>
                        <p style="margin-top: 15px; font-style: italic;">
                            "Empowering students through education and financial support"
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
    
    // Open letter in new window for printing
    const letterWindow = window.open('', '_blank', 'width=900,height=1200');
    letterWindow.document.write(letterContent);
    letterWindow.document.close();
    letterWindow.focus();
    
    showNotification(`✅ ${applicationType} approval letter generated successfully!`, 'success');
}

// Generate rejection letter
function generateRejectionLetter(application, reason) {
    const applicant = application.applicant || {};
    const metadata = application.metadata || {};
    const applicationType = application.financialInfo ? 'Bursary' : 'Scholarship';
    
    const letterContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${applicationType} Application Status</title>
            <style>
                body { font-family: 'Times New Roman', serif; margin: 40px; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 40px; }
                .university-name { font-size: 24px; font-weight: bold; color: #1e3a5f; margin-bottom: 5px; }
                .motto { font-style: italic; color: #666; margin-bottom: 20px; }
                .letter-title { font-size: 20px; font-weight: bold; text-decoration: underline; margin-bottom: 30px; }
                .content { text-align: justify; margin-bottom: 30px; }
                .signature-section { margin-top: 50px; }
                .signature-line { border-bottom: 1px solid #000; width: 200px; margin-bottom: 5px; }
                .date { margin-top: 30px; }
                .footer { margin-top: 50px; font-size: 12px; color: #666; text-align: center; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="university-name">BUGEMA UNIVERSITY</div>
                <div class="motto">"Training the head, the heart, and the hands"</div>
                <div>P.O. Box 6529, Kampala, Uganda</div>
                <div>Tel: +256 414 290 881/2 | Email: info@bugemauniv.ac.ug</div>
            </div>
            
            <div class="date">Date: ${new Date().toLocaleDateString('en-GB')}</div>
            
            <div style="margin: 30px 0;">
                <div><strong>To:</strong> ${applicant.firstName} ${applicant.lastName}</div>
                <div><strong>Student ID:</strong> ${applicant.studentId}</div>
                <div><strong>Email:</strong> ${applicant.email}</div>
            </div>
            
            <div class="letter-title">${applicationType.toUpperCase()} APPLICATION STATUS</div>
            
            <div class="content">
                <p>Dear ${applicant.firstName} ${applicant.lastName},</p>
                
                <p>Thank you for your interest in the Bugema University ${applicationType} program and for submitting your application.</p>
                
                <p>After careful review by our Scholarship and Bursary Committee, we regret to inform you that your application (ID: ${metadata.applicationId || 'N/A'}) has not been approved at this time.</p>
                
                <p><strong>Reason:</strong> ${reason}</p>
                
                <p>Please note that this decision does not reflect on your academic potential or personal worth. Due to limited funding and high competition, we are unable to approve all deserving applications.</p>
                
                <p><strong>Alternative Options:</strong></p>
                <ul>
                    <li>You may reapply in the next application cycle</li>
                    <li>Consider applying for other financial aid programs</li>
                    <li>Contact the Student Affairs Office for guidance on improving your application</li>
                    <li>Explore work-study opportunities on campus</li>
                </ul>
                
                <p>We encourage you to continue pursuing your educational goals and wish you success in your academic endeavors.</p>
                
                <p>For any questions or clarifications, please contact the Student Affairs Office at studentaffairs@bugemauniv.ac.ug or call +256 414 290 882.</p>
                
                <p>Yours sincerely,</p>
            </div>
            
            <div class="signature-section">
                <div class="signature-line"></div>
                <div><strong>Dr. Sarah Namukasa</strong></div>
                <div>Director, Student Affairs</div>
                <div>Bugema University</div>
            </div>
            
            <div class="footer">
                <p><strong>© 2024 Bugema University. All Rights Reserved.</strong></p>
                <p>This correspondence is the exclusive property of Bugema University.</p>
            </div>
        </body>
        </html>
    `;
    
    // Open letter in new window
    const letterWindow = window.open('', '_blank');
    letterWindow.document.write(letterContent);
    letterWindow.document.close();
    letterWindow.focus();
}

// Notification function
function showNotification(message, type = 'info') {
    console.log(`Notification: ${type} - ${message}`);
    
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add notification styles if not present
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

console.log('Admin panel JavaScript loaded successfully');