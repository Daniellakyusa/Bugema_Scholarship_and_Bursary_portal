// Feedback form JavaScript with star rating system
document.addEventListener('DOMContentLoaded', function() {
    initializeStarRatings();
    
    const form = document.getElementById('feedbackForm');
    
    if (form) {
        form.addEventListener('submit', handleFeedbackSubmit);
        
        // Add character counters for text areas
        const comments = document.getElementById('comments');
        const improvements = document.getElementById('improvements');
        
        if (comments) {
            addCharacterCounter(comments, 500);
        }
        
        if (improvements) {
            addCharacterCounter(improvements, 300);
        }
    }
});

function initializeStarRatings() {
    const starRatings = document.querySelectorAll('.star-rating');
    
    starRatings.forEach(rating => {
        const stars = rating.querySelectorAll('.star');
        const category = rating.dataset.category;
        
        stars.forEach((star, index) => {
            // Handle mouse enter for preview
            star.addEventListener('mouseenter', () => {
                highlightStars(stars, index + 1);
            });
            
            // Handle click for selection
            star.addEventListener('click', () => {
                setRating(category, index + 1);
                highlightStars(stars, index + 1);
                
                // Add animation
                stars[index].classList.add('active');
                setTimeout(() => {
                    stars[index].classList.remove('active');
                }, 300);
            });
        });
        
        // Handle mouse leave to reset to selected rating
        rating.addEventListener('mouseleave', () => {
            const selectedRating = getRating(category);
            highlightStars(stars, selectedRating);
        });
    });
}

function highlightStars(stars, rating) {
    stars.forEach((star, index) => {
        if (index < rating) {
            star.style.color = '#ffc107';
            star.classList.add('highlighted');
        } else {
            star.style.color = '#ddd';
            star.classList.remove('highlighted');
        }
    });
}

function setRating(category, rating) {
    // Store rating in localStorage
    const ratings = JSON.parse(localStorage.getItem('feedbackRatings') || '{}');
    ratings[category] = rating;
    localStorage.setItem('feedbackRatings', JSON.stringify(ratings));
    
    // Update data attribute
    const ratingElement = document.querySelector(`[data-category="${category}"]`);
    if (ratingElement) {
        ratingElement.dataset.rating = rating;
    }
}

function getRating(category) {
    const ratings = JSON.parse(localStorage.getItem('feedbackRatings') || '{}');
    return ratings[category] || 0;
}

function handleFeedbackSubmit(e) {
    e.preventDefault();
    
    // Validate all ratings are provided
    if (!validateRatings()) {
        showNotification('Please provide ratings for all categories', 'error');
        return;
    }
    
    // Get form data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Add ratings to data
    const ratings = JSON.parse(localStorage.getItem('feedbackRatings') || '{}');
    data.ratings = ratings;
    data.submittedAt = new Date().toISOString();
    
    // Show processing message
    showNotification('Submitting your feedback...', 'info');
    
    // Simulate submission
    setTimeout(() => {
        showNotification('Thank you for your feedback! Your response has been recorded.', 'success');
        
        // Store feedback data (in real app, this would be sent to backend)
        const existingFeedback = JSON.parse(localStorage.getItem('feedbackData') || '[]');
        existingFeedback.push(data);
        localStorage.setItem('feedbackData', JSON.stringify(existingFeedback));
        
        // Clear ratings after submission
        localStorage.removeItem('feedbackRatings');
        
        // Reset form and redirect after delay
        setTimeout(() => {
            e.target.reset();
            resetAllStars();
            window.location.href = 'index.html';
        }, 2000);
    }, 1500);
}

function validateRatings() {
    const requiredCategories = ['overall', 'usability', 'fairness', 'communication', 'response-time'];
    
    for (const category of requiredCategories) {
        const rating = getRating(category);
        if (rating === 0) {
            // Highlight missing rating
            const ratingElement = document.querySelector(`[data-category="${category}"]`);
            if (ratingElement) {
                ratingElement.style.border = '2px solid #dc3545';
                ratingElement.style.borderRadius = '8px';
                ratingElement.style.padding = '10px';
                
                setTimeout(() => {
                    ratingElement.style.border = 'none';
                    ratingElement.style.padding = '0';
                }, 3000);
            }
            return false;
        }
    }
    
    return true;
}

function resetAllStars() {
    const starRatings = document.querySelectorAll('.star-rating');
    
    starRatings.forEach(rating => {
        const stars = rating.querySelectorAll('.star');
        highlightStars(stars, 0);
    });
}

function addCharacterCounter(textarea, maxLength) {
    const counter = document.createElement('div');
    counter.className = 'character-counter';
    counter.style.cssText = `
        font-size: 12px;
        color: #6c757d;
        text-align: right;
        margin-top: 5px;
    `;
    
    textarea.parentNode.appendChild(counter);
    
    function updateCounter() {
        const current = textarea.value.length;
        const remaining = maxLength - current;
        
        counter.textContent = `${current}/${maxLength} characters`;
        
        if (remaining < 50) {
            counter.style.color = '#ffc107';
        }
        
        if (remaining < 20) {
            counter.style.color = '#dc3545';
        }
        
        if (remaining < 0) {
            counter.style.color = '#dc3545';
            textarea.value = textarea.value.substring(0, maxLength);
        }
    }
    
    textarea.addEventListener('input', updateCounter);
    updateCounter(); // Initial count
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add notification styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const notificationStyles = document.createElement('style');
        notificationStyles.id = 'notification-styles';
        notificationStyles.textContent = `
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
        `;
        document.head.appendChild(notificationStyles);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Load saved ratings on page load
document.addEventListener('DOMContentLoaded', function() {
    const ratings = JSON.parse(localStorage.getItem('feedbackRatings') || '{}');
    
    Object.keys(ratings).forEach(category => {
        const rating = ratings[category];
        const ratingElement = document.querySelector(`[data-category="${category}"]`);
        
        if (ratingElement && rating > 0) {
            const stars = ratingElement.querySelectorAll('.star');
            highlightStars(stars, rating);
            ratingElement.dataset.rating = rating;
        }
    });
});
