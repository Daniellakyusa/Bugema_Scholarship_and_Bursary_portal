/**
 * Admin Panel JavaScript - Handles all admin panel functionality
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

// Global variables for editing
let currentEditingApplicationId = null;
let currentEditingRegistrationId = null;
let currentEditingScholarshipId = null;
let currentEditingBursaryId = null;
let currentDeletingApplicationId = null;

// API Base URL - set dynamically via config.js
const API_BASE = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://localhost:5000/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Skip authentication check - show admin panel directly
    showAdminPanel();
    setupEventListeners();
    // Load initial data
    loadDashboardStats();
    loadApplications();
    loadFeedback();
});

// Setup event listeners
function setupEventListeners() {
    // Feedback response form
    document.getElementById('feedbackResponseForm').addEventListener('submit', handleFeedbackResponse);
    
    // Create application form
    document.getElementById('createApplicationForm').addEventListener('submit', handleCreateApplication);
    
    // Modal close on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

// Authentication functions
async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const admin = await response.json();
            currentAdmin = admin;
            showAdminPanel();
        } else {
            showLoginScreen();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        showLoginScreen();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentAdmin = data.admin;
            showAdminPanel();
        } else {
            showError('loginError', data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('loginError', 'Network error. Please try again.');
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    currentAdmin = null;
    showLoginScreen();
}

// UI functions
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
    
    // Clear form
    document.getElementById('loginForm').reset();
    hideError('loginError');
}

function showAdminPanel() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    
    // Update admin info - use default since no authentication
    document.getElementById('adminName').textContent = 'Admin User';
}

function showSection(section) {
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(section + 'Section').classList.add('active');
    
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

// Missing functions that are called from HTML
function openCreateRegistrationModal() {
    currentEditingRegistrationId = null;
    document.getElementById('createApplicationTitle').textContent = 'Add New Student Registration';
    document.getElementById('createApplicationForm').reset();
    document.getElementById('applicationType').value = 'registration';
    showModal('createApplicationModal');
}

function openCreateScholarshipModal() {
    currentEditingScholarshipId = null;
    document.getElementById('createApplicationTitle').textContent = 'Add New Scholarship Application';
    document.getElementById('createApplicationForm').reset();
    document.getElementById('applicationType').value = 'scholarship';
    showModal('createApplicationModal');
}

function openCreateBursaryModal() {
    currentEditingBursaryId = null;
    document.getElementById('createApplicationTitle').textContent = 'Add New Bursary Application';
    document.getElementById('createApplicationForm').reset();
    document.getElementById('applicationType').value = 'bursary';
    showModal('createApplicationModal');
}

function filterRegistrations() {
    const filter = document.getElementById('registrationFilter').value;
    console.log('Filtering registrations by:', filter);
    loadRegistrations();
}

function filterScholarships() {
    const statusFilter = document.getElementById('scholarshipStatusFilter').value;
    const typeFilter = document.getElementById('scholarshipTypeFilter').value;
    console.log('Filtering scholarships by:', statusFilter, typeFilter);
    loadScholarships();
}

function filterBursaries() {
    const statusFilter = document.getElementById('bursaryStatusFilter').value;
    const priorityFilter = document.getElementById('bursaryPriorityFilter').value;
    console.log('Filtering bursaries by:', statusFilter, priorityFilter);
    loadBursaries();
}

function confirmDelete() {
    if (currentDeletingApplicationId) {
        try {
            let applications = JSON.parse(localStorage.getItem('applications') || '[]');
            applications = applications.filter(app => app.id !== currentDeletingApplicationId);
            localStorage.setItem('applications', JSON.stringify(applications));
            alert('Application deleted successfully!');
            closeModal('deleteModal');
            loadApplications();
            loadDashboardStats();
            currentDeletingApplicationId = null;
        } catch (error) {
            console.error('Error deleting application:', error);
            alert('Error deleting application. Please try again.');
        }
    }
}

// Dashboard functions
async function loadDashboardStats() {
    try {
        // Try to fetch from API first
        const response = await fetch(`${API_BASE}/dashboard/statistics`);
        
        if (response.ok) {
            const stats = await response.json();
            renderDashboardStats(stats);
        } else {
            // Fallback to mock data if API fails
            console.warn('API failed, using mock data');
            const mockStats = {
                applications: { total: 45, pending: 12, approved: 28, recent: 8 },
                students: { total: 156 },
                organizations: { active: 8 },
                feedback: { average_rating: 4.2, unresolved: 3 },
                registrations: { total: 156, recent: 23 },
                scholarships: { total: 28, pending: 8, approved: 15 },
                bursaries: { total: 17, pending: 4, approved: 13 }
            };
            renderDashboardStats(mockStats);
        }
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        // Use mock data as fallback
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
    const statsGrid = document.getElementById('statsGrid');
    
    const statsCards = [
        {
            number: stats.applications.total,
            label: 'Total Applications',
            change: `+${stats.applications.recent} this week`,
            changeType: 'positive'
        },
        {
            number: stats.registrations.total,
            label: 'Student Registrations',
            change: `+${stats.registrations.recent} this month`,
            changeType: 'positive'
        },
        {
            number: stats.scholarships.total,
            label: 'Scholarship Applications',
            change: `${stats.scholarships.pending} pending`,
            changeType: stats.scholarships.pending > 5 ? 'negative' : 'positive'
        },
        {
            number: stats.bursaries.total,
            label: 'Bursary Applications',
            change: `${stats.bursaries.pending} pending`,
            changeType: stats.bursaries.pending > 3 ? 'negative' : 'positive'
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
    showLoading('applicationsTable');
    
    try {
        console.log('Loading applications from API...');
        // Fetch applications from API
        const response = await fetch(`${API_BASE}/applications?page=${page}&per_page=20`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Applications loaded from API:', data);
            renderApplicationsTable(data.applications, data.pagination);
        } else {
            console.warn('API failed with status:', response.status);
            // Fallback to localStorage if API fails
            console.warn('API failed, loading from localStorage');
            let applications = JSON.parse(localStorage.getItem('applications') || '[]');
            
            // Also load bursary applications from localStorage
            const bursaryApplications = JSON.parse(localStorage.getItem('bursaryApplications') || '[]');
            const scholarshipApplications = JSON.parse(localStorage.getItem('scholarshipApplications') || '[]');
            
            // Combine all applications
            const allApplications = [...applications, ...bursaryApplications, ...scholarshipApplications];
            
            // Add mock data if no applications exist
            if (allApplications.length === 0) {
                applications = [
                    {
                        application_id: 'APP-001',
                        student_id: 'STU-001',
                        category: 'scholarship',
                        application_type: 'academic',
                        organization_id: 'ORG001',
                        amount_requested: 1000000,
                        status: 'pending',
                        submission_date: '2024-01-15T10:00:00',
                        personal_statement: 'I am dedicated to academic excellence and need financial support.',
                        household_income: 0
                    },
                    {
                        application_id: 'APP-002',
                        student_id: 'STU-002',
                        category: 'bursary',
                        application_type: 'need_based',
                        organization_id: 'ORG002',
                        amount_requested: 800000,
                        status: 'approved',
                        submission_date: '2024-01-16T10:00:00',
                        personal_statement: 'I come from a low-income family and need support to continue my studies.',
                        household_income: 500000
                    }
                ];
                localStorage.setItem('applications', JSON.stringify(applications));
                renderApplicationsTable(applications);
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
    const container = document.getElementById('applicationsTable');
    
    if (applications.length === 0) {
        container.innerHTML = '<div class="loading">No applications found</div>';
        return;
    }
    
    const tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Student ID</th>
                    <th>Type</th>
                    <th>Organization</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${applications.map(app => `
                    <tr>
                        <td>${app.student_id || 'Unknown'}</td>
                        <td>${formatApplicationType(app.category, app.application_type)}</td>
                        <td>${app.organization_id || 'Unknown'}</td>
                        <td>UGX ${formatNumber(app.amount_requested || 0)}</td>
                        <td><span class="status-badge status-${app.status}">${formatStatus(app.status)}</span></td>
                        <td>${formatDate(app.submission_date || app.created_at)}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-primary" onclick="viewApplication('${app.application_id}')">View</button>
                                ${app.status === 'pending' ? `
                                    <button class="btn btn-success" onclick="approveApplication('${app.application_id}')">Approve</button>
                                    <button class="btn btn-danger" onclick="rejectApplication('${app.application_id}')">Reject</button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ${pagination ? renderPagination(pagination, 'loadApplications') : ''}
    `;
    
    container.innerHTML = tableHTML;
}

async function viewApplication(applicationId) {
    try {
        // Try API first
        const response = await fetch(`${API_BASE}/applications/${applicationId}`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const application = await response.json();
            renderApplicationDetails(application);
            showModal('applicationModal');
        } else {
            // Fallback to localStorage
            const applications = JSON.parse(localStorage.getItem('applications') || '[]');
            const application = applications.find(app => app.application_id === applicationId || app.id === applicationId);
            
            if (application) {
                renderApplicationDetails(application);
                showModal('applicationModal');
            } else {
                alert('Application not found');
            }
        }
    } catch (error) {
        console.error('Failed to load application details:', error);
        alert('Error loading application details');
    }
}

function renderApplicationDetails(app) {
    const container = document.getElementById('applicationDetails');
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
                <h4>Student Information</h4>
                <p><strong>Student ID:</strong> ${app.student_id || 'Unknown'}</p>
                <p><strong>Application ID:</strong> ${app.application_id || 'Unknown'}</p>
            </div>
            <div>
                <h4>Application Details</h4>
                <p><strong>Type:</strong> ${formatApplicationType(app.category, app.application_type)}</p>
                <p><strong>Organization:</strong> ${app.organization_id || 'Unknown'}</p>
                <p><strong>Amount Requested:</strong> UGX ${formatNumber(app.amount_requested || 0)}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${app.status}">${formatStatus(app.status)}</span></p>
                <p><strong>Submitted:</strong> ${formatDate(app.submission_date || app.created_at)}</p>
            </div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h4>Personal Statement</h4>
            <p style="background: #f8f9fa; padding: 15px; border-radius: 6px; line-height: 1.6;">
                ${app.personal_statement || 'No statement provided'}
            </p>
        </div>
        
        ${app.household_income ? `
            <div style="margin-bottom: 20px;">
                <h4>Financial Information</h4>
                <p><strong>Household Income:</strong> UGX ${formatNumber(app.household_income)}</p>
            </div>
        ` : ''}
        
        ${app.review_comments ? `
            <div style="margin-bottom: 20px;">
                <h4>Review Comments</h4>
                <p style="background: #f8f9fa; padding: 15px; border-radius: 6px;">
                    ${app.review_comments}
                </p>
                <p><small>Reviewed by: ${app.reviewed_by} on ${formatDate(app.review_date)}</small></p>
            </div>
        ` : ''}
        
        ${app.status === 'pending' ? `
            <div style="text-align: right; border-top: 1px solid #e9ecef; padding-top: 20px;">
                <button class="btn btn-success" onclick="approveApplication('${app.application_id}')">Approve Application</button>
                <button class="btn btn-danger" onclick="rejectApplication('${app.application_id}')">Reject Application</button>
            </div>
        ` : ''}
    `;
}

function filterApplications() {
    currentFilters.status = document.getElementById('statusFilter').value;
    currentFilters.category = document.getElementById('categoryFilter').value;
    currentPage = 1;
    loadApplications();
}

// Search applications
function searchApplications() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    
    const filteredApplications = applications.filter(app => 
        app.student.name.toLowerCase().includes(searchTerm) ||
        app.student.email.toLowerCase().includes(searchTerm) ||
        app.student.program.toLowerCase().includes(searchTerm) ||
        app.organization.name.toLowerCase().includes(searchTerm)
    );
    
    renderApplicationsTable(filteredApplications);
}

// CREATE: Open create application modal
function openCreateApplicationModal() {
    document.getElementById('createApplicationTitle').textContent = 'Add New Application';
    document.getElementById('createApplicationForm').reset();
    document.getElementById('applicationStatus').value = 'pending';
    currentEditingApplicationId = null;
    showModal('createApplicationModal');
}

// CREATE: Handle create application form submission
function handleCreateApplication(e) {
    e.preventDefault();
    
    const applicationType = document.getElementById('applicationType').value;
    const name = document.getElementById('studentName').value;
    const email = document.getElementById('studentEmail').value;
    const phone = document.getElementById('studentPhone').value;
    const program = document.getElementById('studentProgram').value;
    const amount = parseFloat(document.getElementById('amountRequested').value);
    const statement = document.getElementById('personalStatement').value;
    
    try {
        if (applicationType === 'scholarship') {
            // Handle scholarship applications
            const scholarshipData = {
                id: currentEditingScholarshipId || Date.now(),
                name,
                email,
                phone,
                program,
                type: 'Academic Excellence',
                gpa: amount, // Using amount field for GPA
                status: 'pending',
                date: new Date().toISOString().split('T')[0],
                score: Math.floor(Math.random() * 30) + 70,
                statement
            };
            
            let scholarships = JSON.parse(localStorage.getItem('scholarships') || '[]');
            
            if (currentEditingScholarshipId) {
                const index = scholarships.findIndex(s => s.id === currentEditingScholarshipId);
                if (index !== -1) {
                    scholarships[index] = scholarshipData;
                    alert('Scholarship application updated successfully!');
                }
            } else {
                scholarships.push(scholarshipData);
                alert('Scholarship application created successfully!');
            }
            
            localStorage.setItem('scholarships', JSON.stringify(scholarships));
            loadScholarships();
            
        } else if (applicationType === 'bursary') {
            // Handle bursary applications
            const bursaryData = {
                id: currentEditingBursaryId || 'BUR-' + Date.now(),
                applicant: {
                    firstName: name.split(' ')[0] || '',
                    lastName: name.split(' ').slice(1).join(' ') || '',
                    email,
                    phone
                },
                academicInfo: {
                    program,
                    year: 1,
                    gpa: 3.0
                },
                financialInfo: {
                    annualIncome: amount,
                    familySize: 4,
                    dependents: 2
                },
                personalStatement: statement,
                metadata: {
                    status: 'pending',
                    submittedAt: new Date().toISOString()
                }
            };
            
            let bursaries = JSON.parse(localStorage.getItem('bursaryApplications') || '[]');
            
            if (currentEditingBursaryId) {
                const index = bursaries.findIndex(b => b.id === currentEditingBursaryId);
                if (index !== -1) {
                    bursaries[index] = bursaryData;
                    alert('Bursary application updated successfully!');
                }
            } else {
                bursaries.push(bursaryData);
                alert('Bursary application created successfully!');
            }
            
            localStorage.setItem('bursaryApplications', JSON.stringify(bursaries));
            loadBursaries();
            
        } else if (applicationType === 'registration') {
            // Handle student registrations
            const registrationData = {
                id: currentEditingRegistrationId || Date.now(),
                name,
                email,
                phone,
                program,
                year: 1,
                gpa: amount, // Using amount field for GPA
                status: 'pending',
                date: new Date().toISOString().split('T')[0],
                registrationDate: new Date().toISOString(),
                personalStatement: statement
            };
            
            let registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
            
            if (currentEditingRegistrationId) {
                const index = registrations.findIndex(reg => String(reg.id) === String(currentEditingRegistrationId));
                if (index !== -1) {
                    registrations[index] = registrationData;
                    alert('Student registration updated successfully!');
                }
            } else {
                registrations.push(registrationData);
                alert('Student registration created successfully!');
            }
            
            localStorage.setItem('registrations', JSON.stringify(registrations));
            loadRegistrations();
            
        } else {
            // Handle regular applications (original functionality)
            const applicationData = {
                id: currentEditingApplicationId || 'APP-' + Date.now(),
                student: {
                    name,
                    email,
                    phone,
                    program
                },
                category: applicationType,
                application_type: applicationType === 'scholarship' ? 'academic' : 'need',
                organization: { name: 'Bugema University' },
                amount_requested: amount,
                status: document.getElementById('applicationStatus').value,
                submission_date: new Date().toISOString().split('T')[0],
                eligibility_score: Math.floor(Math.random() * 30) + 70,
                personal_statement: statement
            };
            
            let applications = JSON.parse(localStorage.getItem('applications') || '[]');
            
            if (currentEditingApplicationId) {
                const index = applications.findIndex(app => app.id === currentEditingApplicationId);
                if (index !== -1) {
                    applications[index] = applicationData;
                    alert('Application updated successfully!');
                }
            } else {
                applications.push(applicationData);
                alert('Application created successfully!');
            }
            
            localStorage.setItem('applications', JSON.stringify(applications));
            loadApplications();
        }
        
        closeModal('createApplicationModal');
        loadDashboardStats();
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error saving data. Please try again.');
    }
}

// READ: View application details (already exists - updated to work with localStorage)
async function viewApplication(applicationId) {
    try {
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        const application = applications.find(app => app.id === applicationId);
        
        if (application) {
            renderApplicationDetails(application);
            showModal('applicationModal');
        } else {
            alert('Application not found');
        }
    } catch (error) {
        console.error('Failed to load application details:', error);
        alert('Error loading application details');
    }
}

// UPDATE: Edit application
function editApplication(applicationId) {
    try {
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        const application = applications.find(app => app.id === applicationId);
        
        if (application) {
            document.getElementById('createApplicationTitle').textContent = 'Edit Application';
            document.getElementById('studentName').value = application.student.name;
            document.getElementById('studentEmail').value = application.student.email;
            document.getElementById('studentPhone').value = application.student.phone;
            document.getElementById('studentProgram').value = application.student.program;
            document.getElementById('applicationType').value = application.category;
            document.getElementById('amountRequested').value = application.amount_requested;
            document.getElementById('applicationStatus').value = application.status;
            document.getElementById('personalStatement').value = application.personal_statement || '';
            
            currentEditingApplicationId = applicationId;
            showModal('createApplicationModal');
        } else {
            alert('Application not found');
        }
    } catch (error) {}
        console.error('Failed to load application for editing:', error);
let currentDeletingApplicationId = null;
function deleteApplication(applicationId) {
    currentDeletingApplicationId = applicationId;
    showModal('deleteModal');
}

function confirmDelete() {
    if (currentDeletingApplicationId) {
        try {
            let applications = JSON.parse(localStorage.getItem('applications') || '[]');
            applications = applications.filter(app => app.id !== currentDeletingApplicationId);
            localStorage.setItem('applications', JSON.stringify(applications));
            
            alert('Application deleted successfully!');
            closeModal('deleteModal');
            loadApplications();
            loadDashboardStats();
            currentDeletingApplicationId = null;
        } catch (error) {
            console.error('Error deleting application:', error);
            alert('Error deleting application. Please try again.');
        }
    }
}

// CREATE: Add new scholarship
function openCreateScholarshipModal() {
    document.getElementById('createApplicationTitle').textContent = 'Add New Scholarship Application';
    document.getElementById('createApplicationForm').reset();
    
    // Update form for scholarship specific fields
    document.getElementById('applicationType').value = 'scholarship';
    showModal('createApplicationModal');
}

// UPDATE: Edit scholarship
function editScholarship(id) {
    try {
        const scholarships = JSON.parse(localStorage.getItem('scholarships') || '[]');
        const scholarship = scholarships.find(s => s.id === id);
        
        if (scholarship) {
            document.getElementById('createApplicationTitle').textContent = 'Edit Scholarship Application';
            
            // Populate form fields
            document.getElementById('studentName').value = scholarship.name;
            document.getElementById('studentEmail').value = scholarship.email || '';
            document.getElementById('studentPhone').value = scholarship.phone || '';
            document.getElementById('studentProgram').value = scholarship.program || '';
            document.getElementById('applicationType').value = 'scholarship';
            document.getElementById('amountRequested').value = scholarship.amount || 0;
            document.getElementById('personalStatement').value = scholarship.statement || '';
            
            showModal('createApplicationModal');
        } else {
            alert('Scholarship application not found');
        }
    } catch (error) {
        console.error('Failed to load scholarship for editing:', error);
        alert('Error loading scholarship application for editing');
    }
}

// CREATE: Add new bursary
function openCreateBursaryModal() {
    document.getElementById('createApplicationTitle').textContent = 'Add New Bursary Application';
    document.getElementById('createApplicationForm').reset();
    
    // Update form for bursary specific fields
    document.getElementById('applicationType').value = 'bursary';
    showModal('createApplicationModal');
}

// UPDATE: Edit bursary
function editBursary(id) {
    try {
        const storedBursaries = JSON.parse(localStorage.getItem('bursaryApplications') || '[]');
        const application = storedBursaries.find(app => app.id === id);
        
        if (application) {
            document.getElementById('createApplicationTitle').textContent = 'Edit Bursary Application';
            
            // Populate form fields
            const name = `${application.applicant.firstName || ''} ${application.applicant.lastName || ''}`.trim();
            document.getElementById('studentName').value = name;
            document.getElementById('studentEmail').value = application.applicant.email || '';
            document.getElementById('studentPhone').value = application.applicant.phone || '';
            document.getElementById('studentProgram').value = application.academicInfo.program || '';
            document.getElementById('applicationType').value = 'bursary';
            document.getElementById('amountRequested').value = application.financialInfo.annualIncome || 0;
            document.getElementById('personalStatement').value = application.personalStatement || '';
            
            showModal('createApplicationModal');
        } else {
            alert('Bursary application not found');
        }
    } catch (error) {
        console.error('Failed to load bursary for editing:', error);
        alert('Error loading bursary application for editing');
    }
}

// CREATE: Add new registration
function openCreateRegistrationModal() {
    document.getElementById('createApplicationTitle').textContent = 'Add New Student Registration';
    document.getElementById('createApplicationForm').reset();
    
    // Update form for registration specific fields
    document.getElementById('applicationType').value = 'registration';
    showModal('createApplicationModal');
}

// UPDATE: Edit registration
function editRegistration(id) {
    try {
        const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
        const registration = registrations.find(reg => String(reg.id) === String(id));
        
        if (registration) {
            currentEditingRegistrationId = id;
            document.getElementById('createApplicationTitle').textContent = 'Edit Student Registration';
            
            // Populate form fields
            document.getElementById('studentName').value = registration.name || registration.fullName || '';
            document.getElementById('studentEmail').value = registration.email || '';
            document.getElementById('studentPhone').value = registration.phone || registration.fullPhone || '';
            document.getElementById('studentProgram').value = registration.program || registration.course || '';
            document.getElementById('applicationType').value = 'registration';
            document.getElementById('amountRequested').value = registration.gpa || 0;
            document.getElementById('personalStatement').value = registration.personalStatement || '';
            
            showModal('createApplicationModal');
        } else {
            alert('Student registration not found');
        }
    } catch (error) {
        console.error('Failed to load registration for editing:', error);
        alert('Error loading student registration for editing');
    }
}

// DELETE: Delete registration
function deleteRegistration(id) {
    if (confirm('Are you sure you want to delete this student registration? This action cannot be undone.')) {
        try {
            let registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
            registrations = registrations.filter(reg => String(reg.id) !== String(id));
            localStorage.setItem('registrations', JSON.stringify(registrations));
            
            alert('Student registration deleted successfully!');
            loadRegistrations();
            loadDashboardStats();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting student registration. Please try again.');
        }
    }
}

function updateBursaryStatus(id, status, reason = '') {
    const storedBursaries = JSON.parse(localStorage.getItem('bursaryApplications') || '[]');
    const index = storedBursaries.findIndex(app => app.id === String(id));
    if (index !== -1) {
        storedBursaries[index].metadata = storedBursaries[index].metadata || {};
        storedBursaries[index].metadata.status = status;
        if (reason) {
            storedBursaries[index].metadata.rejectionReason = reason;
        }
        localStorage.setItem('bursaryApplications', JSON.stringify(storedBursaries));
    }
}

function filterRegistrations() {
    const filter = document.getElementById('registrationFilter').value;
    console.log('Filtering registrations by:', filter);
    loadRegistrations();
}

function filterScholarships() {
    const statusFilter = document.getElementById('scholarshipStatusFilter').value;
    const typeFilter = document.getElementById('scholarshipTypeFilter').value;
    console.log('Filtering scholarships by:', statusFilter, typeFilter);
    loadScholarships();
}

function filterBursaries() {
    const statusFilter = document.getElementById('bursaryStatusFilter').value;
    const priorityFilter = document.getElementById('bursaryPriorityFilter').value;
    console.log('Filtering bursaries by:', statusFilter, priorityFilter);
    loadBursaries();
}

// Load bursary applications from localStorage and API
async function loadBursaries(page = 1) {
    showLoading('bursariesTable');
    
    try {
        console.log('Loading bursary applications...');
        
        // Try API first
        const response = await fetch(`${API_BASE}/bursaries?page=${page}&per_page=20`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Bursaries loaded from API:', data);
            renderBursariesTable(data.bursaries, data.pagination);
        } else {
            console.warn('API failed, loading from localStorage');
            // Fallback to localStorage
            let bursaries = JSON.parse(localStorage.getItem('bursaryApplications') || '[]');
            
            // If no bursaries in localStorage, add mock data
            if (bursaries.length === 0) {
                bursaries = [
                    {
                        id: 'BUR-' + Date.now(),
                        applicant: {
                            firstName: 'John',
                            lastName: 'Doe',
                            email: 'john.doe@example.com',
                            phone: '+256-123-456789',
                            studentId: 'STU001',
                            program: 'Computer Science'
                        },
                        academicInfo: {
                            program: 'Computer Science',
                            year: 2,
                            gpa: 3.5
                        },
                        financialInfo: {
                            annualIncome: 500000,
                            sponsor: 'Self',
                            dependents: 2,
                            expenses: 200000
                        },
                        application: {
                            reason: 'I need financial assistance to continue my studies due to family financial constraints.',
                            declaration: true,
                            consent: true
                        },
                        documents: {
                            transcript: 'transcript.pdf',
                            recommendation: 'recommendation.pdf',
                            idCopy: 'id.pdf',
                            proof: 'admission.pdf'
                        },
                        metadata: {
                            submittedAt: new Date().toISOString(),
                            status: 'pending',
                            applicationId: 'BURS-' + Date.now(),
                            applicationType: 'bursary'
                        }
                    },
                    {
                        id: 'BUR-' + (Date.now() + 1),
                        applicant: {
                            firstName: 'Jane',
                            lastName: 'Smith',
                            email: 'jane.smith@example.com',
                            phone: '+256-987-654321',
                            studentId: 'STU002',
                            program: 'Business Administration'
                        },
                        academicInfo: {
                            program: 'Business Administration',
                            year: 1,
                            gpa: 3.8
                        },
                        financialInfo: {
                            annualIncome: 300000,
                            sponsor: 'Parent',
                            dependents: 3,
                            expenses: 150000
                        },
                        application: {
                            reason: 'Seeking bursary support to pursue my dream of becoming a business leader.',
                            declaration: true,
                            consent: true
                        },
                        documents: {
                            transcript: 'transcript2.pdf',
                            recommendation: 'recommendation2.pdf',
                            idCopy: 'id2.pdf',
                            proof: 'admission2.pdf'
                        },
                        metadata: {
                            submittedAt: new Date().toISOString(),
                            status: 'approved',
                            applicationId: 'BURS-' + (Date.now() + 1),
                            applicationType: 'bursary',
                            approvalAmount: 1500000,
                            approvedDate: new Date().toISOString()
                        }
                    }
                ];
                localStorage.setItem('bursaryApplications', JSON.stringify(bursaries));
            }
            
            // Apply filters
            let filteredBursaries = bursaries;
            const statusFilter = document.getElementById('bursaryStatusFilter')?.value;
            const priorityFilter = document.getElementById('bursaryPriorityFilter')?.value;
            
            if (statusFilter && statusFilter !== 'all') {
                filteredBursaries = filteredBursaries.filter(b => b.metadata?.status === statusFilter);
            }
            
            if (priorityFilter && priorityFilter !== 'all') {
                filteredBursaries = filteredBursaries.filter(b => {
                    const income = Number(String(b.financialInfo?.annualIncome).replace(/[^0-9]/g, '')) || 0;
                    const priority = getBursaryPriority(income).toLowerCase();
                    return priority === priorityFilter;
                });
            }
            
            renderBursariesTable(filteredBursaries);
        }
    } catch (error) {
        console.error('Error loading bursaries:', error);
        // Final fallback to localStorage
        const bursaries = JSON.parse(localStorage.getItem('bursaryApplications') || '[]');
        renderBursariesTable(bursaries);
    }
}

// Render bursaries table
function renderBursariesTable(bursaries, pagination = null) {
    const container = document.getElementById('bursariesTable');
    if (!container) return;
    
    if (bursaries.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No bursary applications found.</p>';
        return;
    }
    
    const tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Application ID</th>
                    <th>Student Name</th>
                    <th>Program</th>
                    <th>Income</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${bursaries.map(bursary => {
                    const income = Number(String(bursary.financialInfo?.annualIncome).replace(/[^0-9]/g, '')) || 0;
                    const priority = getBursaryPriority(income);
                    const status = bursary.metadata?.status || 'pending';
                    const name = `${bursary.applicant?.firstName || ''} ${bursary.applicant?.lastName || ''}`.trim() || 'Unknown';
                    
                    return `
                        <tr>
                            <td>${bursary.metadata?.applicationId || bursary.id}</td>
                            <td>${name}</td>
                            <td>${bursary.academicInfo?.program || 'N/A'}</td>
                            <td>UGX ${formatNumber(income)}</td>
                            <td><span class="priority-badge priority-${priority.toLowerCase()}">${priority}</span></td>
                            <td><span class="status-badge status-${status}">${formatStatus(status)}</span></td>
                            <td>${formatDate(bursary.metadata?.submittedAt)}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary" onclick="viewBursary('${bursary.id}')">View</button>
                                    <button class="btn btn-secondary" onclick="editBursary('${bursary.id}')">Edit</button>
                                    ${status === 'pending' ? `
                                        <button class="btn btn-success" onclick="approveBursary('${bursary.id}')">Approve</button>
                                        <button class="btn btn-danger" onclick="rejectBursary('${bursary.id}')">Reject</button>
                                    ` : ''}
                                    <button class="btn btn-danger" onclick="deleteBursary('${bursary.id}')">Delete</button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        ${pagination ? renderPagination(pagination, 'loadBursaries') : ''}
    `;
    
    container.innerHTML = tableHTML;
}

// Delete bursary application
function deleteBursary(id) {
    if (confirm('Are you sure you want to delete this bursary application? This action cannot be undone.')) {
        try {
            let bursaries = JSON.parse(localStorage.getItem('bursaryApplications') || '[]');
            bursaries = bursaries.filter(b => b.id !== id);
            localStorage.setItem('bursaryApplications', JSON.stringify(bursaries));
            
            alert('Bursary application deleted successfully!');
            loadBursaries();
            loadDashboardStats();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting bursary application. Please try again.');
        }
    }
}

// Get bursary priority based on income
function getBursaryPriority(income) {
    if (income <= 200000) return 'High';
    if (income <= 500000) return 'Medium';
    return 'Low';
}

// Approve bursary application
function approveBursary(id) {
    try {
        const bursaries = JSON.parse(localStorage.getItem('bursaryApplications') || '[]');
        const bursary = bursaries.find(b => b.id === id);
        
        if (bursary) {
            // Update status
            bursary.metadata = bursary.metadata || {};
            bursary.metadata.status = 'approved';
            bursary.metadata.approvedDate = new Date().toISOString();
            bursary.metadata.approvedBy = 'Administrator';
            
            // Calculate approval amount based on income and needs
            const income = Number(String(bursary.financialInfo?.annualIncome).replace(/[^0-9]/g, '')) || 0;
            if (income <= 200000) {
                bursary.metadata.approvalAmount = 2500000; // Full bursary
            } else if (income <= 500000) {
                bursary.metadata.approvalAmount = 1500000; // Partial bursary
            } else {
                bursary.metadata.approvalAmount = 1000000; // Partial bursary
            }
            
            // Save updated data
            localStorage.setItem('bursaryApplications', JSON.stringify(bursaries));
            
            // Generate bursary approval letter
            generateBursaryLetter(id);
            
            // Show success message
            alert(`✅ Bursary Application Approved!\n\nApplication ID: ${bursary.metadata.applicationId}\nApproved Amount: UGX ${formatNumber(bursary.metadata.approvalAmount)}\n\nBursary approval letter has been generated.`);
            
            // Reload table
            loadBursaries();
            loadDashboardStats();
        } else {
            alert('Bursary application not found');
        }
    } catch (error) {
        console.error('Error approving bursary:', error);
        alert('Error approving bursary application. Please try again.');
    }
}

// Reject bursary application
function rejectBursary(id) {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    
    try {
        const bursaries = JSON.parse(localStorage.getItem('bursaryApplications') || '[]');
        const bursary = bursaries.find(b => b.id === id);
        
        if (bursary) {
            bursary.metadata = bursary.metadata || {};
            bursary.metadata.status = 'rejected';
            bursary.metadata.rejectionReason = reason;
            bursary.metadata.rejectedDate = new Date().toISOString();
            bursary.metadata.rejectedBy = 'Administrator';
            
            localStorage.setItem('bursaryApplications', JSON.stringify(bursaries));
            
            alert(`✅ Bursary Application Rejected\n\nApplication ID: ${bursary.metadata.applicationId}\nReason: ${reason}`);
            
            loadBursaries();
            loadDashboardStats();
        } else {
            alert('Bursary application not found');
        }
    } catch (error) {
        console.error('Error rejecting bursary:', error);
        alert('Error rejecting bursary application. Please try again.');
    }
}

// View bursary details
function viewBursary(id) {
    try {
        const bursaries = JSON.parse(localStorage.getItem('bursaryApplications') || '[]');
        const bursary = bursaries.find(b => b.id === id);
        
        if (bursary) {
            const status = bursary.metadata?.status || 'pending';
            const income = Number(String(bursary.financialInfo?.annualIncome).replace(/[^0-9]/g, '')) || 0;
            const priority = getBursaryPriority(income);
            const name = `${bursary.applicant?.firstName || ''} ${bursary.applicant?.lastName || ''}`.trim() || 'Unknown';
            
            const modalContent = `
                <div style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                    <h2 style="color: #007bff; margin-bottom: 20px;">Bursary Application Details</h2>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                            <h4 style="margin-bottom: 10px; color: #333;">Applicant Information</h4>
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${bursary.applicant?.email || 'N/A'}</p>
                            <p><strong>Phone:</strong> ${bursary.applicant?.phone || 'N/A'}</p>
                            <p><strong>Student ID:</strong> ${bursary.applicant?.studentId || 'N/A'}</p>
                            <p><strong>Program:</strong> ${bursary.academicInfo?.program || 'N/A'}</p>
                            <p><strong>Year:</strong> ${bursary.academicInfo?.year || 'N/A'}</p>
                        </div>
                        
                        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px;">
                            <h4 style="margin-bottom: 10px; color: #155724;">Financial Information</h4>
                            <p><strong>Annual Income:</strong> UGX ${formatNumber(income)}</p>
                            <p><strong>Sponsor:</strong> ${bursary.financialInfo?.sponsor || 'N/A'}</p>
                            <p><strong>Dependents:</strong> ${bursary.financialInfo?.dependents || 'N/A'}</p>
                            <p><strong>Monthly Expenses:</strong> UGX ${formatNumber(Number(String(bursary.financialInfo?.expenses).replace(/[^0-9]/g, '')) || 0)}</p>
                            <p><strong>Priority Level:</strong> <span class="priority-badge priority-${priority.toLowerCase()}">${priority}</span></p>
                        </div>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="margin-bottom: 10px; color: #856404;">Application Reason</h4>
                        <p style="line-height: 1.6;">${bursary.application?.reason || 'No reason provided'}</p>
                    </div>
                    
                    <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="margin-bottom: 10px; color: #0c5460;">Submitted Documents</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <p><strong>Transcript:</strong> ${bursary.documents?.transcript || 'Not uploaded'}</p>
                            <p><strong>Recommendation:</strong> ${bursary.documents?.recommendation || 'Not uploaded'}</p>
                            <p><strong>ID Copy:</strong> ${bursary.documents?.idCopy || 'Not uploaded'}</p>
                            <p><strong>Proof of Admission:</strong> ${bursary.documents?.proof || 'Not uploaded'}</p>
                        </div>
                    </div>
                    
                    <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="margin-bottom: 10px; color: #721c24;">Application Status</h4>
                        <p><strong>Status:</strong> <span class="status-badge status-${status}">${formatStatus(status)}</span></p>
                        <p><strong>Application ID:</strong> ${bursary.metadata?.applicationId || bursary.id}</p>
                        <p><strong>Submitted:</strong> ${formatDate(bursary.metadata?.submittedAt)}</p>
                        ${bursary.metadata?.approvedDate ? `<p><strong>Approved:</strong> ${formatDate(bursary.metadata.approvedDate)}</p>` : ''}
                        ${bursary.metadata?.rejectionReason ? `<p><strong>Rejection Reason:</strong> ${bursary.metadata.rejectionReason}</p>` : ''}
                    </div>
                    
                    ${status === 'pending' ? `
                        <div style="text-align: right; border-top: 1px solid #e9ecef; padding-top: 20px;">
                            <button class="btn btn-success" onclick="approveBursary('${id}')" style="margin-right: 10px;">Approve Application</button>
                            <button class="btn btn-danger" onclick="rejectBursary('${id}')">Reject Application</button>
                        </div>
                    ` : ''}
                </div>
            `;
            
            // Show modal with content
            showCustomModal('Bursary Application Details', modalContent);
        } else {
            alert('Bursary application not found');
        }
    } catch (error) {
        console.error('Error viewing bursary:', error);
        alert('Error loading bursary details');
    }
}

// Edit bursary application
function editBursary(id) {
    try {
        const bursaries = JSON.parse(localStorage.getItem('bursaryApplications') || '[]');
        const bursary = bursaries.find(b => b.id === id);
        
        if (bursary) {
            // For now, show a simple edit form
            const name = prompt('Edit student name:', `${bursary.applicant?.firstName || ''} ${bursary.applicant?.lastName || ''}`);
            const email = prompt('Edit email:', bursary.applicant?.email || '');
            const program = prompt('Edit program:', bursary.academicInfo?.program || '');
            
            if (name && email && program) {
                const nameParts = name.split(' ');
                bursary.applicant.firstName = nameParts[0] || '';
                bursary.applicant.lastName = nameParts.slice(1).join(' ') || '';
                bursary.applicant.email = email;
                bursary.academicInfo.program = program;
                
                localStorage.setItem('bursaryApplications', JSON.stringify(bursaries));
                alert('Bursary application updated successfully!');
                loadBursaries();
            }
        } else {
            alert('Bursary application not found');
        }
    } catch (error) {
        console.error('Error editing bursary:', error);
        alert('Error editing bursary application');
    }
}

// Show custom modal with content
function showCustomModal(title, content) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('customModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 10px; padding: 30px; max-width: 90%; max-height: 90vh; overflow-y: auto; position: relative;">
            <button onclick="closeCustomModal()" style="position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
            <h2 style="margin-bottom: 20px; color: #333;">${title}</h2>
            <div>${content}</div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Close custom modal
function closeCustomModal() {
    const modal = document.getElementById('customModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Approve scholarship application
function approveScholarship(id) {
    try {
        const scholarships = JSON.parse(localStorage.getItem('scholarships') || '[]');
        const scholarship = scholarships.find(s => s.id === id);
        
        if (scholarship) {
            // Update status
            scholarship.status = 'approved';
            scholarship.approvedDate = new Date().toISOString();
            scholarship.approvedBy = 'Administrator';
            
            // Calculate approval amount based on GPA and type
            const gpa = parseFloat(scholarship.gpa) || 0;
            if (gpa >= 3.8) {
                scholarship.approvalAmount = 5000000; // Full scholarship
            } else if (gpa >= 3.5) {
                scholarship.approvalAmount = 3000000; // Partial scholarship
            } else {
                scholarship.approvalAmount = 2000000; // Partial scholarship
            }
            
            // Save updated data
            localStorage.setItem('scholarships', JSON.stringify(scholarships));
            
            // Generate scholarship award letter
            generateScholarshipLetter(id);
            
            // Show success message
            alert(`✅ Scholarship Application Approved!\n\nApplication ID: ${scholarship.id}\nApproved Amount: UGX ${formatNumber(scholarship.approvalAmount)}\n\nScholarship award letter has been generated.`);
            
            // Reload table
            loadScholarships();
            loadDashboardStats();
        } else {
            alert('Scholarship application not found');
        }
    } catch (error) {
        console.error('Error approving scholarship:', error);
        alert('Error approving scholarship application. Please try again.');
    }
}

// Reject scholarship application
function rejectScholarship(id) {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    
    try {
        const scholarships = JSON.parse(localStorage.getItem('scholarships') || '[]');
        const scholarship = scholarships.find(s => s.id === id);
        
        if (scholarship) {
            scholarship.status = 'rejected';
            scholarship.rejectionReason = reason;
            scholarship.rejectedDate = new Date().toISOString();
            scholarship.rejectedBy = 'Administrator';
            
            localStorage.setItem('scholarships', JSON.stringify(scholarships));
            
            alert(`✅ Scholarship Application Rejected\n\nApplication ID: ${scholarship.id}\nReason: ${reason}`);
            
            loadScholarships();
            loadDashboardStats();
        } else {
            alert('Scholarship application not found');
        }
    } catch (error) {
        console.error('Error rejecting scholarship:', error);
        alert('Error rejecting scholarship application. Please try again.');
    }
}

// View scholarship details
function viewScholarship(id) {
    try {
        const scholarships = JSON.parse(localStorage.getItem('scholarships') || '[]');
        const scholarship = scholarships.find(s => s.id === id);
        
        if (scholarship) {
            const modalContent = `
                <div style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                    <h2 style="color: #007bff; margin-bottom: 20px;">Scholarship Application Details</h2>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                            <h4 style="margin-bottom: 10px; color: #333;">Applicant Information</h4>
                            <p><strong>Name:</strong> ${scholarship.name || 'N/A'}</p>
                            <p><strong>Email:</strong> ${scholarship.email || 'N/A'}</p>
                            <p><strong>Phone:</strong> ${scholarship.phone || 'N/A'}</p>
                            <p><strong>Program:</strong> ${scholarship.program || 'N/A'}</p>
                        </div>
                        
                        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px;">
                            <h4 style="margin-bottom: 10px; color: #155724;">Academic Information</h4>
                            <p><strong>Type:</strong> ${scholarship.type || 'N/A'}</p>
                            <p><strong>GPA:</strong> ${scholarship.gpa || 'N/A'}</p>
                            <p><strong>Score:</strong> ${scholarship.score || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="margin-bottom: 10px; color: #856404;">Personal Statement</h4>
                        <p style="line-height: 1.6;">${scholarship.statement || 'No statement provided'}</p>
                    </div>
                    
                    <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="margin-bottom: 10px; color: #721c24;">Application Status</h4>
                        <p><strong>Status:</strong> <span class="status-badge status-${scholarship.status || 'pending'}">${formatStatus(scholarship.status || 'pending')}</span></p>
                        <p><strong>Application ID:</strong> ${scholarship.id}</p>
                        <p><strong>Submitted:</strong> ${formatDate(scholarship.date)}</p>
                        ${scholarship.approvedDate ? `<p><strong>Approved:</strong> ${formatDate(scholarship.approvedDate)}</p>` : ''}
                        ${scholarship.rejectionReason ? `<p><strong>Rejection Reason:</strong> ${scholarship.rejectionReason}</p>` : ''}
                    </div>
                    
                    ${scholarship.status === 'pending' ? `
                        <div style="text-align: right; border-top: 1px solid #e9ecef; padding-top: 20px;">
                            <button class="btn btn-success" onclick="approveScholarship('${id}')" style="margin-right: 10px;">Approve Application</button>
                            <button class="btn btn-danger" onclick="rejectScholarship('${id}')">Reject Application</button>
                        </div>
                    ` : ''}
                </div>
            `;
            
            showCustomModal('Scholarship Application Details', modalContent);
        } else {
            alert('Scholarship application not found');
        }
    } catch (error) {
        console.error('Error viewing scholarship:', error);
        alert('Error loading scholarship details');
    }
}

// Edit scholarship application
function editScholarship(id) {
    try {
        const scholarships = JSON.parse(localStorage.getItem('scholarships') || '[]');
        const scholarship = scholarships.find(s => s.id === id);
        
        if (scholarship) {
            const name = prompt('Edit student name:', scholarship.name || '');
            const email = prompt('Edit email:', scholarship.email || '');
            const program = prompt('Edit program:', scholarship.program || '');
            const gpa = prompt('Edit GPA:', scholarship.gpa || '');
            
            if (name && email && program && gpa) {
                scholarship.name = name;
                scholarship.email = email;
                scholarship.program = program;
                scholarship.gpa = parseFloat(gpa);
                
                localStorage.setItem('scholarships', JSON.stringify(scholarships));
                alert('Scholarship application updated successfully!');
                loadScholarships();
            }
        } else {
            alert('Scholarship application not found');
        }
    } catch (error) {
        console.error('Error editing scholarship:', error);
        alert('Error editing scholarship application');
    }
}

// Approve student registration
function approveRegistration(id) {
    try {
        const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
        const registration = registrations.find(reg => String(reg.id) === String(id));
        
        if (registration) {
            // Update status
            registration.status = 'approved';
            registration.approvedDate = new Date().toISOString();
            registration.approvedBy = 'Administrator';
            
            // Generate student ID if not exists
            if (!registration.studentId) {
                registration.studentId = `STU-${String(registration.id).padStart(3, '0')}-${new Date().getFullYear()}`;
            }
            
            // Save updated data
            localStorage.setItem('registrations', JSON.stringify(registrations));
            
            // Generate registration card
            generateRegistrationCard(id);
            
            // Show success message
            alert(`✅ Student Registration Approved!\n\nStudent Name: ${registration.name}\nStudent ID: ${registration.studentId}\n\nRegistration card has been generated.`);
            
            // Reload table
            loadRegistrations();
            loadDashboardStats();
        } else {
            alert('Student registration not found');
        }
    } catch (error) {
        console.error('Error approving registration:', error);
        alert('Error approving student registration. Please try again.');
    }
}

// Reject student registration
function rejectRegistration(id) {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    
    try {
        const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
        const registration = registrations.find(reg => String(reg.id) === String(id));
        
        if (registration) {
            registration.status = 'rejected';
            registration.rejectionReason = reason;
            registration.rejectedDate = new Date().toISOString();
            registration.rejectedBy = 'Administrator';
            
            localStorage.setItem('registrations', JSON.stringify(registrations));
            
            alert(`✅ Student Registration Rejected\n\nStudent Name: ${registration.name}\nReason: ${reason}`);
            
            loadRegistrations();
            loadDashboardStats();
        } else {
            alert('Student registration not found');
        }
    } catch (error) {
        console.error('Error rejecting registration:', error);
        alert('Error rejecting student registration. Please try again.');
    }
}

// View registration details
function viewRegistration(id) {
    try {
        const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
        const registration = registrations.find(reg => String(reg.id) === String(id));
        
        if (registration) {
            const modalContent = `
                <div style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                    <h2 style="color: #007bff; margin-bottom: 20px;">Student Registration Details</h2>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                            <h4 style="margin-bottom: 10px; color: #333;">Student Information</h4>
                            <p><strong>Name:</strong> ${registration.name || 'N/A'}</p>
                            <p><strong>Email:</strong> ${registration.email || 'N/A'}</p>
                            <p><strong>Phone:</strong> ${registration.phone || 'N/A'}</p>
                            <p><strong>Student ID:</strong> ${registration.studentId || 'To be assigned'}</p>
                        </div>
                        
                        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px;">
                            <h4 style="margin-bottom: 10px; color: #155724;">Academic Information</h4>
                            <p><strong>Program:</strong> ${registration.program || 'N/A'}</p>
                            <p><strong>Year:</strong> ${registration.year || 'N/A'}</p>
                            <p><strong>Registration Date:</strong> ${formatDate(registration.date)}</p>
                        </div>
                    </div>
                    
                    <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="margin-bottom: 10px; color: #721c24;">Registration Status</h4>
                        <p><strong>Status:</strong> <span class="status-badge status-${registration.status || 'pending'}">${formatStatus(registration.status || 'pending')}</span></p>
                        <p><strong>Registration ID:</strong> ${registration.id}</p>
                        <p><strong>Submitted:</strong> ${formatDate(registration.date)}</p>
                        ${registration.approvedDate ? `<p><strong>Approved:</strong> ${formatDate(registration.approvedDate)}</p>` : ''}
                        ${registration.rejectionReason ? `<p><strong>Rejection Reason:</strong> ${registration.rejectionReason}</p>` : ''}
                    </div>
                    
                    ${registration.status === 'pending' ? `
                        <div style="text-align: right; border-top: 1px solid #e9ecef; padding-top: 20px;">
                            <button class="btn btn-success" onclick="approveRegistration('${id}')" style="margin-right: 10px;">Approve Registration</button>
                            <button class="btn btn-danger" onclick="rejectRegistration('${id}')">Reject Registration</button>
                        </div>
                    ` : ''}
                </div>
            `;
            
            showCustomModal('Student Registration Details', modalContent);
        } else {
            alert('Student registration not found');
        }
    } catch (error) {
        console.error('Error viewing registration:', error);
        alert('Error loading registration details');
    }
}

// Edit registration
function editRegistration(id) {
    try {
        const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
        const registration = registrations.find(reg => String(reg.id) === String(id));
        
        if (registration) {
            const name = prompt('Edit student name:', registration.name || '');
            const email = prompt('Edit email:', registration.email || '');
            const program = prompt('Edit program:', registration.program || '');
            
            if (name && email && program) {
                registration.name = name;
                registration.email = email;
                registration.program = program;
                
                localStorage.setItem('registrations', JSON.stringify(registrations));
                alert('Student registration updated successfully!');
                loadRegistrations();
            }
        } else {
            alert('Student registration not found');
        }
    } catch (error) {
        console.error('Error editing registration:', error);
        alert('Error editing student registration');
    }
}

function renderPagination(pagination, loadFunction) {
    if (pagination.pages <= 1) return '';
    
    let paginationHTML = '<div class="pagination">';
    
    // Previous button
    paginationHTML += `
        <button ${pagination.page <= 1 ? 'disabled' : ''} 
                onclick="${loadFunction}(${pagination.page - 1})">
            Previous
        </button>
    `;
    
    // Page numbers
    const startPage = Math.max(1, pagination.page - 2);
    const endPage = Math.min(pagination.pages, pagination.page + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="${i === pagination.page ? 'active' : ''}" 
                    onclick="${loadFunction}(${i})">
                ${i}
            </button>
        `;
    }
    
    // Next button
    paginationHTML += `
        <button ${pagination.page >= pagination.pages ? 'disabled' : ''} 
                onclick="${loadFunction}(${pagination.page + 1})">
            Next
        </button>
    `;
    
    paginationHTML += '</div>';
    return paginationHTML;
}

// Formatting functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function formatNumber(number) {
    return new Intl.NumberFormat().format(number);
}

function formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
}

function formatApplicationType(category, type) {
    return `${category.charAt(0).toUpperCase() + category.slice(1)} - ${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}`;
}

function formatFundingType(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatFeedbackType(type) {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Document viewing functions
function viewDocument(url, filename) {
    // Open document in new window for viewing
    if (url && url.startsWith('data:')) {
        // Handle base64 encoded documents
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(`
                <html>
                    <head><title>${filename}</title></head>
                    <body style="margin:0;padding:20px;font-family:Arial,sans-serif;">
                        <div style="text-align:center;margin-bottom:20px;">
                            <h2>${filename}</h2>
                            <button onclick="window.close()" style="padding:10px 20px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;">Close</button>
                        </div>
                        <div style="border:1px solid #ddd;padding:20px;border-radius:4px;">
                            <iframe src="${url}" style="width:100%;height:80vh;border:none;"></iframe>
                        </div>
                    </body>
                </html>
            `);
        }
    } else if (url) {
        // Handle regular URLs
        window.open(url, '_blank');
    } else {
        alert('Document not available');
    }
}

function downloadDocument(url, filename) {
    if (url && url.startsWith('data:')) {
        // Handle base64 encoded documents
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else if (url) {
        // Handle regular URLs
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert('Document not available for download');
    }
}

// Document generation functions
function generateScholarshipLetter(id) {
    try {
        const scholarships = JSON.parse(localStorage.getItem('scholarships') || '[]');
        const scholarship = scholarships.find(s => s.id === id);
        
        if (scholarship) {
            const letterContent = createScholarshipLetterContent(scholarship);
            const letterWindow = window.open('', '_blank', 'width=800,height=600');
            
            if (letterWindow) {
                letterWindow.document.write(`
                    <html>
                        <head>
                            <title>Scholarship Award Letter - ${scholarship.name}</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                                .header { text-align: center; margin-bottom: 30px; }
                                .letter-body { margin: 20px 0; }
                                .signature { margin-top: 50px; }
                                .official-stamp { margin-top: 20px; }
                                @media print { body { margin: 20px; } }
                            </style>
                        </head>
                        <body>
                            ${letterContent}
                            <div style="text-align: center; margin-top: 30px;">
                                <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">Print</button>
                                <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
                            </div>
                        </body>
                    </html>
                `);
                letterWindow.document.close();
            }
        } else {
            alert('Scholarship not found');
        }
    } catch (error) {
        console.error('Error generating scholarship letter:', error);
        alert('Error generating scholarship letter');
    }
}

function generateBursaryLetter(id) {
    try {
        const storedBursaries = JSON.parse(localStorage.getItem('bursaryApplications') || '[]');
        const application = storedBursaries.find(app => app.id === id);
        
        if (application) {
            const letterContent = createBursaryLetterContent(application);
            const letterWindow = window.open('', '_blank', 'width=800,height=600');
            
            if (letterWindow) {
                letterWindow.document.write(`
                    <html>
                        <head>
                            <title>Bursary Award Letter - ${application.applicant.firstName} ${application.applicant.lastName}</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                                .header { text-align: center; margin-bottom: 30px; }
                                .letter-body { margin: 20px 0; }
                                .signature { margin-top: 50px; }
                                .official-stamp { margin-top: 20px; }
                                @media print { body { margin: 20px; } }
                            </style>
                        </head>
                        <body>
                            ${letterContent}
                            <div style="text-align: center; margin-top: 30px;">
                                <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">Print</button>
                                <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
                            </div>
                        </body>
                    </html>
                `);
                letterWindow.document.close();
            }
        } else {
            alert('Bursary application not found');
        }
    } catch (error) {
        console.error('Error generating bursary letter:', error);
        alert('Error generating bursary letter');
    }
}

function generateRegistrationCard(id) {
    try {
        const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
        const registration = registrations.find(reg => String(reg.id) === String(id));
        
        if (registration) {
            const cardContent = createRegistrationCardContent(registration);
            const cardWindow = window.open('', '_blank', 'width=600,height=400');
            
            if (cardWindow) {
                cardWindow.document.write(`
                    <html>
                        <head>
                            <title>Registration Card - ${registration.name}</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                .card { border: 2px solid #007bff; border-radius: 10px; padding: 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); }
                                .card-header { text-align: center; margin-bottom: 20px; }
                                .card-body { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                                .card-footer { text-align: center; margin-top: 20px; }
                                .student-photo { width: 100px; height: 120px; background: #ddd; border-radius: 5px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
                                @media print { body { margin: 0; } .card { page-break-inside: avoid; } }
                            </style>
                        </head>
                        <body>
                            ${cardContent}
                            <div style="text-align: center; margin-top: 20px;">
                                <button onclick="window.print()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 8px;">Print</button>
                                <button onclick="window.close()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
                            </div>
                        </body>
                    </html>
                `);
                cardWindow.document.close();
            }
        } else {
            alert('Registration not found');
        }
    } catch (error) {
        console.error('Error generating registration card:', error);
        alert('Error generating registration card');
    }
}

// Content creation functions
function createScholarshipLetterContent(scholarship) {
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const approvedDate = scholarship.approvedDate ? new Date(scholarship.approvedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : currentDate;
    const academicYear = `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;
    const referenceNumber = `SCH-ORG002-${String(scholarship.id).padStart(3, '0')}`;
    const awardAmount = scholarship.awardAmount || (scholarship.type === 'Full Scholarship' ? 5000000 : scholarship.type === 'Partial Scholarship' ? 2500000 : 3000000);
    
    return `
        <div class="header" style="display: flex; align-items: center; margin-bottom: 30px;">
            <div style="flex: 0 0 120px; margin-right: 30px;">
                <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; text-align: center; box-shadow: 0 4px 8px rgba(0,123,255,0.3);">
                    BU
                </div>
            </div>
            <div style="flex: 1;">
                <h1 style="color: #007bff; margin: 0 0 5px 0; font-size: 32px;">Bugema University</h1>
                <h2 style="color: #333; margin: 0; font-size: 24px; font-weight: normal;">Scholarship Award Letter</h2>
                <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Excellence in Education Since 1948</p>
            </div>
        </div>
        
        <div class="letter-body">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #007bff;">
                <p style="margin: 5px 0;"><strong>Reference Number:</strong> ${referenceNumber}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${currentDate}</p>
                <p style="margin: 5px 0;"><strong>Academic Year:</strong> ${academicYear}</p>
            </div>
            
            <p>Dear <strong>${scholarship.name}</strong>,</p>
            
            <p>We are delighted to inform you that you have been awarded the <strong>${scholarship.type} Scholarship</strong> at Bugema University for the academic year ${academicYear}. This prestigious award recognizes your outstanding academic achievements and potential for excellence.</p>
            
            <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #b3d9ff;">
                <h3 style="color: #007bff; margin: 0 0 15px 0; font-size: 18px;">Award Details</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <p style="margin: 5px 0;"><strong>Award Amount:</strong></p>
                        <p style="margin: 0 0 10px 0; font-size: 20px; color: #28a745; font-weight: bold;">UGX ${formatNumber(awardAmount)}</p>
                    </div>
                    <div>
                        <p style="margin: 5px 0;"><strong>Coverage Period:</strong></p>
                        <p style="margin: 0 0 10px 0; font-size: 16px; color: #333;">${academicYear}</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <p style="margin: 5px 0;"><strong>Scholarship Type:</strong> ${scholarship.type}</p>
                        <p style="margin: 5px 0;"><strong>Program:</strong> ${scholarship.program}</p>
                    </div>
                    <div>
                        <p style="margin: 5px 0;"><strong>Student ID:</strong> ${scholarship.studentId || 'To be assigned'}</p>
                        <p style="margin: 5px 0;"><strong>Academic Score:</strong> ${scholarship.score}%</p>
                    </div>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Organization Details</h3>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6;">
                    <p style="margin: 5px 0;"><strong>Sponsoring Organization:</strong> Bugema University Scholarship Fund (ORG-002)</p>
                    <p style="margin: 5px 0;"><strong>Contact:</strong> financial.aid@bugema.edu.ug | +256-123-456789</p>
                    <p style="margin: 5px 0;"><strong>Office:</strong> Financial Aid Department, Main Campus</p>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Terms & Conditions</h3>
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeaa7;">
                    <ol style="margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 8px;"><strong>Academic Performance:</strong> Maintain a minimum GPA of 3.0 throughout your studies</li>
                        <li style="margin-bottom: 8px;"><strong>Attendance:</strong> Maintain minimum 85% class attendance per semester</li>
                        <li style="margin-bottom: 8px;"><strong>Full-time Enrollment:</strong> Must be enrolled as a full-time student (minimum 12 credit hours)</li>
                        <li style="margin-bottom: 8px;"><strong>Conduct:</strong> Maintain good disciplinary standing and comply with all university regulations</li>
                        <li style="margin-bottom: 8px;"><strong>Renewal:</strong> Scholarship is renewable annually based on academic performance and conduct review</li>
                    </ol>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Disbursement Schedule</h3>
                <div style="background: #d4edda; padding: 15px; border-radius: 8px; border: 1px solid #c3e6cb;">
                    <p style="margin: 5px 0;"><strong>Payment Method:</strong> Paid directly to the University Finance Office</p>
                    <p style="margin: 5px 0;"><strong>Schedule:</strong> 50% at beginning of each semester, 50% mid-semester</p>
                    <p style="margin: 5px 0;"><strong>Requirements:</strong> Present this letter and valid student ID at Finance Office</p>
                </div>
            </div>
            
            <p>Please contact the Financial Aid Office within 14 days to complete the necessary paperwork and claim your scholarship award. Failure to do so may result in forfeiture of this award.</p>
            
            <p>Congratulations on this outstanding achievement! We look forward to supporting your academic journey at Bugema University.</p>
        </div>
        
        <div style="margin-top: 50px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                <div style="text-align: left;">
                    <p style="margin: 0; font-style: italic; color: #666;">Student Signature:</p>
                    <p style="margin: 5px 0; border-bottom: 1px solid #333; height: 40px;"></p>
                    <p style="margin: 5px 0; font-size: 12px; color: #666;">${scholarship.name}</p>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0; font-style: italic; color: #666;">Authorized Signature:</p>
                    <p style="margin: 5px 0; border-bottom: 1px solid #333; height: 40px;"></p>
                    <p style="margin: 5px 0;"><strong>Dr. Sarah Johnson</strong></p>
                    <p style="margin: 0; font-size: 12px; color: #666;">Director of Financial Aid</p>
                    <p style="margin: 0; font-size: 12px; color: #666;">Bugema University</p>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
            <div style="display: inline-block; padding: 10px 20px; border: 2px solid #007bff; border-radius: 8px; background: #f8f9fa;">
                <p style="margin: 0; color: #007bff; font-weight: bold; font-size: 14px;">OFFICIAL UNIVERSITY SEAL</p>
                <p style="margin: 5px 0 0 0; font-size: 10px; color: #666;">Bugema University | Financial Aid Department</p>
            </div>
        </div>
    `;
}

function createBursaryLetterContent(application) {
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const name = `${application.applicant.firstName} ${application.applicant.lastName}`;
    const amount = application.metadata?.approvalAmount || 1500000;
    const referenceNumber = `BUR-ORG001-${String(application.id).replace('BUR-', '').padStart(3, '0')}`;
    const validityDate = new Date();
    validityDate.setDate(validityDate.getDate() + 30); // 30 days validity
    
    return `
        <div class="header" style="display: flex; align-items: center; margin-bottom: 30px;">
            <div style="flex: 0 0 120px; margin-right: 30px;">
                <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; text-align: center; box-shadow: 0 4px 8px rgba(0,123,255,0.3);">
                    BU
                </div>
            </div>
            <div style="flex: 1;">
                <h1 style="color: #007bff; margin: 0 0 5px 0; font-size: 32px;">Bugema University</h1>
                <h2 style="color: #333; margin: 0; font-size: 24px; font-weight: normal;">Bursary Approval Letter</h2>
                <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Excellence in Education Since 1948</p>
            </div>
        </div>
        
        <div class="letter-body">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
                <p style="margin: 5px 0;"><strong>Reference Number:</strong> ${referenceNumber}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${currentDate}</p>
                <p style="margin: 5px 0;"><strong>Academic Year:</strong> ${new Date().getFullYear()}/${new Date().getFullYear() + 1}</p>
            </div>
            
            <p>Dear <strong>${name}</strong>,</p>
            
            <p>We are pleased to inform you that your application for financial assistance has been approved. This letter serves as official proof of your bursary award and can be used to clear your balance with the university accounts office.</p>
            
            <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #c3e6cb;">
                <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">Bursary Award Details</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <p style="margin: 5px 0;"><strong>Reference Number:</strong></p>
                        <p style="margin: 0 0 10px 0; font-size: 16px; color: #155724; font-weight: bold;">${referenceNumber}</p>
                    </div>
                    <div>
                        <p style="margin: 5px 0;"><strong>Bursary Type:</strong></p>
                        <p style="margin: 0 0 10px 0; font-size: 16px; color: #155724; font-weight: bold;">${amount >= 2000000 ? 'Full Bursary' : 'Partial Bursary'}</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <p style="margin: 5px 0;"><strong>Approved Amount:</strong></p>
                        <p style="margin: 0 0 10px 0; font-size: 20px; color: #155724; font-weight: bold;">UGX ${formatNumber(amount)}</p>
                    </div>
                    <div>
                        <p style="margin: 5px 0;"><strong>Validity Period:</strong></p>
                        <p style="margin: 0 0 10px 0; font-size: 16px; color: #155724;">Until ${validityDate.toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Recipient Details</h3>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <p style="margin: 5px 0;"><strong>Student Name:</strong> ${name}</p>
                            <p style="margin: 5px 0;"><strong>Student ID:</strong> ${application.applicant.studentId || 'To be assigned'}</p>
                            <p style="margin: 5px 0;"><strong>Program:</strong> ${application.academicInfo.program}</p>
                        </div>
                        <div>
                            <p style="margin: 5px 0;"><strong>Year of Study:</strong> ${application.academicInfo.year}</p>
                            <p style="margin: 5px 0;"><strong>Email:</strong> ${application.applicant.email}</p>
                            <p style="margin: 5px 0;"><strong>Phone:</strong> ${application.applicant.phone}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Purpose of Funds</h3>
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeaa7;">
                    <p style="margin: 5px 0;"><strong>Coverage Details:</strong></p>
                    <ul style="margin: 5px 0 0 20px; padding: 0;">
                        <li style="margin-bottom: 5px;">${amount >= 2000000 ? 'Full Tuition Coverage' : 'Partial Tuition Coverage'}</li>
                        <li style="margin-bottom: 5px;">${amount >= 2500000 ? 'Accommodation and Meals' : 'Tuition Only'}</li>
                        <li style="margin-bottom: 5px;">Academic Materials and Books</li>
                        <li>Registration and Administrative Fees</li>
                    </ul>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Payment Instructions for University Bursar</h3>
                <div style="background: #cce5ff; padding: 15px; border-radius: 8px; border: 1px solid #99ccff;">
                    <p style="margin: 5px 0;"><strong>To:</strong> University Finance/Bursar Office</p>
                    <p style="margin: 5px 0;"><strong>From:</strong> Bugema University Bursary Fund (ORG-001)</p>
                    <p style="margin: 5px 0;"><strong>Subject:</strong> Bursary Payment Authorization - Ref: ${referenceNumber}</p>
                    <p style="margin: 10px 0;"><strong>Instructions:</strong></p>
                    <ol style="margin: 5px 0 0 20px; padding: 0;">
                        <li style="margin-bottom: 5px;">Verify student identity using this letter and student ID</li>
                        <li style="margin-bottom: 5px;">Apply bursary amount to student's account balance</li>
                        <li style="margin-bottom: 5px;">Issue receipt to student with reference number ${referenceNumber}</li>
                        <li>Report any discrepancies to Bursary Office immediately</li>
                    </ol>
                    <p style="margin: 10px 0 5px 0;"><strong>Contact for Verification:</strong> bursary.office@bugema.edu.ug | +256-456-789012</p>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Important Information</h3>
                <div style="background: #f8d7da; padding: 15px; border-radius: 8px; border: 1px solid #f5c6cb;">
                    <p style="margin: 5px 0;"><strong>Expiration/Validity:</strong> This bursary must be claimed by <strong>${validityDate.toLocaleDateString()}</strong></p>
                    <p style="margin: 5px 0;"><strong>Claim Process:</strong> Present this letter to the University Bursar Office with valid student ID</p>
                    <p style="margin: 5px 0;"><strong>Non-Transferable:</strong> This bursary is non-transferable and specific to the named recipient</p>
                </div>
            </div>
            
            <p>Please present this letter to the University Bursar Office to claim your bursary funds. The university accounts office will process your payment according to the instructions provided above.</p>
            
            <p>We are committed to supporting your educational success at Bugema University. Should you have any questions, please contact the Bursary Office.</p>
        </div>
        
        <div style="margin-top: 50px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                <div style="text-align: left;">
                    <p style="margin: 0; font-style: italic; color: #666;">Student Signature:</p>
                    <p style="margin: 5px 0; border-bottom: 1px solid #333; height: 40px;"></p>
                    <p style="margin: 5px 0; font-size: 12px; color: #666;">${name}</p>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0; font-style: italic; color: #666;">Authorized Signature:</p>
                    <p style="margin: 5px 0; border-bottom: 1px solid #333; height: 40px;"></p>
                    <p style="margin: 5px 0;"><strong>Mr. Robert Williams</strong></p>
                    <p style="margin: 0; font-size: 12px; color: #666;">Bursary Officer</p>
                    <p style="margin: 0; font-size: 12px; color: #666;">Bugema University</p>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
            <div style="display: inline-block; padding: 10px 20px; border: 2px solid #28a745; border-radius: 8px; background: #f8f9fa;">
                <p style="margin: 0; color: #28a745; font-weight: bold; font-size: 14px;">OFFICIAL SCHOLARSHIP & BURSARY MANAGEMENT BOARD SEAL</p>
                <p style="margin: 5px 0 0 0; font-size: 10px; color: #666;">Bugema University | Bursary Department | Valid Until ${validityDate.toLocaleDateString()}</p>
            </div>
        </div>
    `;
}

function createRegistrationCardContent(registration) {
    const studentId = registration.studentId || `STU-${String(registration.id).padStart(3, '0')}-${new Date().getFullYear()}`;
    const qrCodeUrl = `https://bugema.edu.ug/verify/${studentId}`;
    
    return `
        <div class="card" style="position: relative; background: white; border: 2px solid #007bff; border-radius: 15px; padding: 20px; width: 400px; min-height: 250px;">
            <!-- Watermark Status -->
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 48px; color: rgba(40, 167, 69, 0.1); font-weight: bold; z-index: 1; pointer-events: none;">
                ACTIVE
            </div>
            
            <div class="card-header" style="display: flex; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #007bff; position: relative; z-index: 2;">
                <div style="flex: 0 0 60px; margin-right: 15px;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; text-align: center; box-shadow: 0 2px 4px rgba(0,123,255,0.3);">
                        BU
                    </div>
                </div>
                <div style="flex: 1;">
                    <h2 style="color: #007bff; margin: 0 0 2px 0; font-size: 18px;">Bugema University</h2>
                    <h3 style="color: #333; margin: 0 0 2px 0; font-size: 14px; font-weight: normal;">Student ID Card</h3>
                    <p style="color: #666; margin: 0; font-size: 9px;">Academic Year ${new Date().getFullYear()}-${new Date().getFullYear() + 1}</p>
                </div>
            </div>
            
            <div class="card-body" style="display: grid; grid-template-columns: 120px 1fr; gap: 15px; position: relative; z-index: 2;">
                <!-- Left Column - Photo and QR Code -->
                <div>
                    <div style="text-align: center; margin-bottom: 10px;">
                        <div style="width: 100px; height: 120px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 5px;">
                            <span style="color: #6c757d; font-size: 10px;">STUDENT<br/>PHOTO</span>
                        </div>
                        <p style="margin: 0; font-weight: bold; font-size: 11px; line-height: 1.2;">${registration.name}</p>
                    </div>
                    
                    <div style="text-align: center;">
                        <div style="width: 80px; height: 80px; background: white; border: 1px solid #dee2e6; padding: 5px; margin: 0 auto;">
                            <div style="width: 100%; height: 100%; background: repeating-linear-gradient(45deg, #000 0px, #000 2px, #fff 2px, #fff 4px); display: flex; align-items: center; justify-content: center;">
                                <div style="background: white; padding: 2px; font-size: 6px; text-align: center;">
                                    <strong>QR CODE</strong><br/>
                                    <span style="font-size: 5px;">Scan to Verify</span>
                                </div>
                            </div>
                        </div>
                        <p style="margin: 2px 0 0 0; font-size: 8px; color: #666;">${studentId}</p>
                    </div>
                </div>
                
                <!-- Right Column - Student Details -->
                <div>
                    <div style="margin-bottom: 10px;">
                        <p style="margin: 2px 0; font-size: 11px;"><strong>Full Name:</strong> ${registration.name}</p>
                        <p style="margin: 2px 0; font-size: 11px;"><strong>Student ID:</strong> ${studentId}</p>
                        <p style="margin: 2px 0; font-size: 11px;"><strong>Program:</strong> ${registration.program}</p>
                        <p style="margin: 2px 0; font-size: 11px;"><strong>Year:</strong> ${registration.year}</p>
                    </div>
                    
                    <div style="margin-bottom: 10px;">
                        <p style="margin: 2px 0; font-size: 11px;"><strong>Registration:</strong> ${formatDate(registration.date || registration.registrationDate).split(' ')[0]}</p>
                        <p style="margin: 2px 0; font-size: 11px;"><strong>Status:</strong> <span style="color: #28a745; font-weight: bold; font-size: 10px;">REGISTERED</span></p>
                        <p style="margin: 2px 0; font-size: 11px;"><strong>Valid Until:</strong> ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString()}</p>
                    </div>
                    
                    <div style="border-top: 1px solid #e9ecef; padding-top: 5px; margin-top: 5px;">
                        <p style="margin: 2px 0; font-size: 9px; color: #666;"><strong>Email:</strong> ${registration.email}</p>
                        <p style="margin: 2px 0; font-size: 9px; color: #666;"><strong>Phone:</strong> ${registration.phone}</p>
                    </div>
                </div>
            </div>
            
            <div class="card-footer" style="margin-top: 10px; text-align: center; position: relative; z-index: 2;">
                <div style="border-top: 1px solid #dee2e6; padding-top: 8px;">
                    <p style="margin: 0; font-size: 8px; color: #6c757d;">This card is the property of Bugema University</p>
                    <p style="margin: 0; font-size: 8px; color: #6c757d;">Report if lost or stolen immediately</p>
                    <p style="margin: 3px 0 0 0; font-size: 7px; color: #999;">Verify online: ${qrCodeUrl}</p>
                </div>
            </div>
        </div>
    `;
}

// Print functions
function printScholarshipLetter(id) {
    generateScholarshipLetter(id);
}

function printBursaryLetter(id) {
    generateBursaryLetter(id);
}

function printRegistrationCard(id) {
    generateRegistrationCard(id);
}
}