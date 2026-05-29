"""
Simple server runner for the admin panel
"""
import sys
import os

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from api.admin_api import app

if __name__ == '__main__':
    print("Starting Admin Panel Server...")
    print("Admin Panel URL: http://localhost:5000")
    print("Default credentials: admin / admin123")
    print("\nTo generate sample data, run: python generate_sample_data.py")
    print("Press Ctrl+C to stop the server")
    
    app.run(debug=True, host='0.0.0.0', port=5000)