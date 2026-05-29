/**
 * Global API configuration
 * Points to the Render backend in production, localhost in development
 */
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://bugema-scholarship-and-bursary-portal.onrender.com/api';
