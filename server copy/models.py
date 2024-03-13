from db import db
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    password_hash = db.Column(db.String(128))  # Assuming you use a 128 characters hash
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)    
    stocks = db.relationship('Stock', backref='user', lazy=True)  # Relationship to Stock model

class Stock(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)  # Combined foreign key and primary key
    user = db.relationship('User', backref='stocks')  # Relationship to User model
    symbol = db.Column(db.String(50), nullable=False)
    shares = db.Column(db.Float, nullable=False)
    purchase_price = db.Column(db.Float, nullable=False)
