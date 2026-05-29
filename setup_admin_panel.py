"""
Simple setup script for the admin panel
"""
import os
import subprocess
import sys

def main():
    print("🚀 Setting up Admin Panel...")
    
    # Check if we're in the right directory
    if not os.path.exists("backend"):
        print("❌ Error: Please run this script from the project root directory")
        return
    
    print("📦 Installing Python dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "flask", "flask-cors"], check=True)
        print("✅ Dependencies installed successfully!")
    except subprocess.CalledProcessError:
        print("⚠️  Warning: Could not install dependencies. Please install manually:")
        print("   pip install flask flask-cors")
    
    print("📊 Generating sample data...")
    try:
        # Change to backend directory and run the data generator
        os.chdir("backend")
        subprocess.run([sys.executable, "generate_sample_data.py"], check=True)
        print("✅ Sample data generated successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error generating sample data: {e}")
        return
    except Exception as e:
        print(f"❌ Error: {e}")
        return
    
    print("\n🎉 Setup complete!")
    print("\n📋 Next steps:")
    print("1. Start the backend server:")
    print("   cd backend")
    print("   python run_server.py")
    print("\n2. Open the admin panel:")
    print("   Open frontend/pages/admin-panel.html in your browser")
    print("\n3. Login with default credentials:")
    print("   Username: admin")
    print("   Password: admin123")
    print("\n🌐 The backend will run on: http://localhost:5000")

if __name__ == "__main__":
    main()