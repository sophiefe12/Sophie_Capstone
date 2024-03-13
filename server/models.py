from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Sequence

db = SQLAlchemy()

# Define the User model
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, Sequence('user_id_seq'), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    hashed_password = db.Column(db.String(256), nullable=False)
    stocks = db.relationship('Stock', backref='user')

# Define the Stock model
class Stock(db.Model):
    __tablename__ = 'stocks'
    id = db.Column(db.Integer, Sequence('stock_id_seq'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    symbol = db.Column(db.String(10))
    shares = db.Column(db.Integer)
    purchase_price = db.Column(db.Numeric(10, 2))


