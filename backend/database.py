"""
Database initialization and utilities
"""
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime
import json

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()


def init_db(app):
    """Initialize database with app"""
    db.init_app(app)
    migrate.init_app(app, db)
    
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Create upload folder if it doesn't exist
        import os
        upload_folder = app.config.get('UPLOAD_FOLDER')
        if upload_folder and not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        
        # Create logs folder
        log_file = app.config.get('LOG_FILE')
        if log_file:
            log_dir = os.path.dirname(log_file)
            if not os.path.exists(log_dir):
                os.makedirs(log_dir)


class TimestampMixin:
    """Mixin to add timestamp fields to models"""
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class JSONEncodedDict(db.TypeDecorator):
    """Represents an immutable structure as a json-encoded string"""
    impl = db.Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            value = json.dumps(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            value = json.loads(value)
        return value


# Database utility functions
def save_to_db(obj):
    """Save object to database"""
    try:
        db.session.add(obj)
        db.session.commit()
        return True, None
    except Exception as e:
        db.session.rollback()
        return False, str(e)


def delete_from_db(obj):
    """Delete object from database"""
    try:
        db.session.delete(obj)
        db.session.commit()
        return True, None
    except Exception as e:
        db.session.rollback()
        return False, str(e)


def commit_db():
    """Commit current transaction"""
    try:
        db.session.commit()
        return True, None
    except Exception as e:
        db.session.rollback()
        return False, str(e)


def rollback_db():
    """Rollback current transaction"""
    db.session.rollback()


# Pagination helper
class Pagination:
    """Pagination helper class"""
    def __init__(self, query, page, per_page, total, items):
        self.query = query
        self.page = page
        self.per_page = per_page
        self.total = total
        self.items = items
        
    @property
    def pages(self):
        """Total number of pages"""
        return (self.total + self.per_page - 1) // self.per_page
    
    @property
    def has_prev(self):
        """Check if there's a previous page"""
        return self.page > 1
    
    @property
    def has_next(self):
        """Check if there's a next page"""
        return self.page < self.pages
    
    @property
    def prev_num(self):
        """Previous page number"""
        return self.page - 1 if self.has_prev else None
    
    @property
    def next_num(self):
        """Next page number"""
        return self.page + 1 if self.has_next else None
    
    def to_dict(self):
        """Convert pagination to dictionary"""
        return {
            'page': self.page,
            'per_page': self.per_page,
            'total': self.total,
            'pages': self.pages,
            'has_prev': self.has_prev,
            'has_next': self.has_next,
            'prev_num': self.prev_num,
            'next_num': self.next_num
        }


def paginate_query(query, page=1, per_page=20):
    """Paginate a SQLAlchemy query"""
    if page < 1:
        page = 1
    if per_page < 1:
        per_page = 20
    if per_page > 100:
        per_page = 100
    
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return Pagination(query, page, per_page, total, items)
