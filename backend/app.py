"""
Application Factory and Initialization
"""
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from config import get_config
from database import init_db, db
import logging
from logging.handlers import RotatingFileHandler
import os


# Initialize extensions
jwt = JWTManager()
bcrypt = Bcrypt()


def create_app(config_name=None):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    config = get_config(config_name)
    app.config.from_object(config)
    
    # Initialize extensions
    init_db(app)
    CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=app.config['CORS_SUPPORTS_CREDENTIALS'])
    jwt.init_app(app)
    bcrypt.init_app(app)
    
    # Setup logging
    setup_logging(app)
    
    # Register blueprints
    register_blueprints(app)
    
    # Register error handlers
    register_error_handlers(app)
    
    # Register CLI commands
    register_commands(app)
    
    # Create default admin user
    with app.app_context():
        create_default_admin()
    
    return app


def setup_logging(app):
    """Setup application logging"""
    if not app.debug and not app.testing:
        # File handler
        if not os.path.exists('logs'):
            os.mkdir('logs')
        file_handler = RotatingFileHandler(
            app.config['LOG_FILE'],
            maxBytes=10240000,  # 10MB
            backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        
        app.logger.setLevel(logging.INFO)
        app.logger.info('Bugema Scholarship System startup')


def register_blueprints(app):
    """Register application blueprints"""
    from api.auth import auth_bp
    from api.students import students_bp
    from api.applications import applications_bp
    from api.organizations import organizations_bp
    from api.admin import admin_bp
    from api.feedback import feedback_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(students_bp, url_prefix='/api/students')
    app.register_blueprint(applications_bp, url_prefix='/api/applications')
    app.register_blueprint(organizations_bp, url_prefix='/api/organizations')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(feedback_bp, url_prefix='/api/feedback')
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'Bugema Scholarship System API is running',
            'version': '2.0.0'
        })
    
    # Root endpoint
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Welcome to Bugema University Scholarship & Bursary Management System API',
            'version': '2.0.0',
            'endpoints': {
                'health': '/api/health',
                'auth': '/api/auth',
                'students': '/api/students',
                'applications': '/api/applications',
                'organizations': '/api/organizations',
                'admin': '/api/admin',
                'feedback': '/api/feedback'
            }
        })


def register_error_handlers(app):
    """Register error handlers"""
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'error': 'Bad Request',
            'message': str(error)
        }), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'error': 'Unauthorized',
            'message': 'Authentication required'
        }), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'error': 'Forbidden',
            'message': 'You do not have permission to access this resource'
        }), 403
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'Not Found',
            'message': 'The requested resource was not found'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        app.logger.error(f'Internal error: {error}')
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred'
        }), 500
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        app.logger.error(f'Unhandled exception: {error}')
        return jsonify({
            'error': 'Internal Server Error',
            'message': str(error) if app.debug else 'An unexpected error occurred'
        }), 500


def register_commands(app):
    """Register CLI commands"""
    
    @app.cli.command()
    def init_db_command():
        """Initialize the database"""
        db.create_all()
        print('Database initialized successfully!')
    
    @app.cli.command()
    def create_admin():
        """Create default admin user"""
        create_default_admin()
        print('Admin user created successfully!')
    
    @app.cli.command()
    def seed_data():
        """Seed database with sample data"""
        from utils.seed_data import seed_database
        seed_database()
        print('Database seeded successfully!')


def create_default_admin():
    """Create default admin user if not exists"""
    from models.db_models import User, UserRole
    
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(
            username='admin',
            email='admin@bugemauniv.ac.ug',
            full_name='System Administrator',
            role=UserRole.ADMIN,
            is_active=True
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print('Default admin user created: admin / admin123')


# Create application instance
app = create_app()


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
