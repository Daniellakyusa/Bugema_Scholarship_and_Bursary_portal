// Main portal homepage JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Slider
    initializeSlider();
    
    // Dropdown menu functionality
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const container = this.closest('.dropdown-container');
            const menu = container.querySelector('.dropdown-menu');
            
            // Close other open menus
            document.querySelectorAll('.dropdown-menu.active').forEach(m => {
                if (m !== menu) {
                    m.classList.remove('active');
                }
            });
            
            // Toggle current menu
            menu.classList.toggle('active');
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.dropdown-container')) {
            document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
                menu.classList.remove('active');
            });
        }
    });
    
    // Navigation button interactions
    const navButtons = document.querySelectorAll('.nav-btn:not(.dropdown-toggle)');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            
            // Handle navigation based on button text
            switch(buttonText) {
                case 'Overview':
                    // Scroll to description section
                    document.querySelector('.description-box').scrollIntoView({ 
                        behavior: 'smooth' 
                    });
                    break;
                    
                case 'Notifications':
                    // Show notifications
                    showNotifications();
                    break;
                    
                case 'Announcements':
                    // Show announcements
                    showAnnouncements();
                    break;
            }
        });
    });
    
    // Criteria checkbox interactions
    const criteriaCheckboxes = document.querySelectorAll('.criteria-item input[type="checkbox"]');
    
    criteriaCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                this.parentElement.style.backgroundColor = '#e8f5e8';
            } else {
                this.parentElement.style.backgroundColor = 'transparent';
            }
        });
    });
    
    // WhatsApp link functionality
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function() {
            const phoneNumber = '+256123456789'; // Replace with actual WhatsApp number
            const message = 'Hello, I have a question about the scholarship and bursaries portal.';
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
    }
});

// Quick links functionality
function showQuickLinks() {
    const quickLinks = [
        { title: 'Student Registration', url: 'register.html' },
        { title: 'Bursary Application', url: 'bursary-application.html' },
        { title: 'Feedback Form', url: 'feedback.html' },
        { title: 'Contact Support', url: '#contact' }
    ];
    
    // Create modal for quick links
    const modal = createModal('Quick Links', quickLinks);
    document.body.appendChild(modal);
}

// Notifications functionality
function showNotifications() {
    const notifications = [
        { 
            title: 'Application Deadline', 
            message: 'PEAS Uganda scholarship application closes in 3 days',
            type: 'warning'
        },
        { 
            title: 'System Maintenance', 
            message: 'Portal will be unavailable on Sunday from 2-4 AM',
            type: 'info'
        },
        { 
            title: 'New Scholarship', 
            message: 'Lora Foundation has announced a new scholarship opportunity',
            type: 'success'
        }
    ];
    
    // Create modal for notifications
    const modal = createModal('Notifications', notifications, true);
    document.body.appendChild(modal);
}

// Announcements functionality
function showAnnouncements() {
    const announcements = [
        { 
            title: 'Bugema University Scholarship Program 2026', 
            message: 'Applications are now open for the 2026 academic year scholarship program.',
            date: '2026-05-01'
        },
        { 
            title: 'New Partnership Announcement', 
            message: 'We are pleased to announce our partnership with Ssanyu Babies Home for student support.',
            date: '2026-04-28'
        }
    ];
    
    // Create modal for announcements
    const modal = createModal('Announcements', announcements, true);
    document.body.appendChild(modal);
}

// Apply options functionality
function showApplyOptions() {
    const applyOptions = [
        {
            title: 'Registration',
            message: 'Create your student profile and start your portal access.',
            url: 'register.html'
        },
        {
            title: 'Scholarship',
            message: 'Apply for scholarship funding and track your status.',
            url: 'bursary-application.html'
        },
        {
            title: 'Bursaries',
            message: 'Submit a bursary application for financial support.',
            url: 'bursary-application.html'
        }
    ];
    
    const modal = createModal('Apply Now', applyOptions);
    document.body.appendChild(modal);
}

// Modal creation helper function
function createModal(title, content, showType = false) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${renderModalContent(content, showType)}
            </div>
        </div>
    `;
    
    // Add modal styles if not already present
    if (!document.querySelector('#modal-styles')) {
        const modalStyles = document.createElement('style');
        modalStyles.id = 'modal-styles';
        modalStyles.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            
            .modal-content {
                background: white;
                border-radius: 10px;
                padding: 0;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            
            .modal-header {
                background: linear-gradient(135deg, #1e3c72, #2a5298);
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h3 {
                margin: 0;
            }
            
            .modal-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.3s ease;
            }
            
            .modal-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .modal-body {
                padding: 20px;
                max-height: 60vh;
                overflow-y: auto;
            }
            
            .modal-item {
                padding: 15px;
                border-bottom: 1px solid #e9ecef;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }
            
            .modal-item:hover {
                background: #f8f9fa;
            }
            
            .modal-item:last-child {
                border-bottom: none;
            }
            
            .modal-item h4 {
                margin: 0 0 5px 0;
                color: #1e3c72;
            }
            
            .modal-item p {
                margin: 0;
                color: #666;
                font-size: 14px;
            }
            
            .modal-item .date {
                margin-top: 5px;
                font-size: 12px;
                color: #999;
            }
            
            .modal-item .type {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                margin-top: 5px;
            }
            
            .type.warning {
                background: #fff3cd;
                color: #856404;
            }
            
            .type.info {
                background: #d1ecf1;
                color: #0c5460;
            }
            
            .type.success {
                background: #d4edda;
                color: #155724;
            }
        `;
        document.head.appendChild(modalStyles);
    }
    
    // Add close functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Add click handlers for content items
    const modalItems = modal.querySelectorAll('.modal-item');
    modalItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (content[index].url) {
                window.location.href = content[index].url;
            }
            document.body.removeChild(modal);
        });
    });
    
    return modal;
}

// Render modal content based on type
function renderModalContent(content, showType) {
    if (showType) {
        return content.map(item => `
            <div class="modal-item">
                <h4>${item.title}</h4>
                <p>${item.message}</p>
                ${item.date ? `<div class="date">${new Date(item.date).toLocaleDateString()}</div>` : ''}
                ${item.type ? `<span class="type ${item.type}">${item.type}</span>` : ''}
            </div>
        `).join('');
    } else {
        return content.map(item => `
            <div class="modal-item">
                <h4>${item.title}</h4>
                <p>${item.message || 'Click to access'}</p>
                ${item.url ? `<a href="${item.url}" class="modal-link">Open</a>` : ''}
            </div>
        `).join('');
    }
}

// Slider functionality
let currentSlide = 0;
let slideInterval;
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');

function initializeSlider() {
    if (slides.length === 0) return;
    
    // Show first slide
    showSlide(0);
    
    // Start auto-play
    startAutoPlay();
    
    // Pause on hover
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopAutoPlay);
        sliderContainer.addEventListener('mouseleave', startAutoPlay);
    }
    
    // Add touch support for mobile
    addTouchSupport();
}

function showSlide(index) {
    // Hide all slides
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Show current slide
    slides[index].classList.add('active');
    indicators[index].classList.add('active');
    
    currentSlide = index;
}

function changeSlide(direction) {
    currentSlide += direction;
    
    if (currentSlide >= slides.length) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    }
    
    showSlide(currentSlide);
    resetAutoPlay();
}

function goToSlide(index) {
    showSlide(index);
    resetAutoPlay();
}

function startAutoPlay() {
    slideInterval = setInterval(() => {
        changeSlide(1);
    }, 5000); // Change slide every 5 seconds
}

function stopAutoPlay() {
    clearInterval(slideInterval);
}

function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
}

function addTouchSupport() {
    const sliderContainer = document.querySelector('.slider-container');
    if (!sliderContainer) return;
    
    let startX = 0;
    let endX = 0;
    
    sliderContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });
    
    sliderContainer.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                changeSlide(1);
            } else {
                // Swipe right - previous slide
                changeSlide(-1);
            }
        }
    }
}

// Make slider functions global for onclick handlers
window.changeSlide = changeSlide;
window.goToSlide = goToSlide;
