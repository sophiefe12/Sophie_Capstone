from flask import Flask, request, jsonify, session, make_response
from flask_cors import CORS
from models import db, User, Stock  # Import from models.py
from sqlalchemy.pool import NullPool
from datetime import timedelta
import requests
import os
import oracledb
import hashlib

# Load environment variables from a .env file
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config['SECRET_KEY'] = 'f9bf78b9a18ce6d46a0cd2b0b86df9da'

app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True

un = 'ADMIN'
pw = 'Capstone2024'
dsn = '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.eu-madrid-1.oraclecloud.com))(connect_data=(service_name=g73db8b01b7e944_capstoneorm_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'


pool = oracledb.create_pool(user=un, password=pw, dsn=dsn)

app.config['SQLALCHEMY_DATABASE_URI'] = 'oracle+oracledb://'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'creator': pool.acquire,
    'poolclass': NullPool
}
app.config['SQLALCHEMY_ECHO'] = False

db.init_app(app)

with app.app_context():
    db.create_all()


@app.route("/handle_register", methods=["POST"])
def handle_register():
    data = request.get_json()
    username = data['username']
    password = data['password']

    hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()
    user_exists = User.query.filter_by(name=username).first() is not None

    if user_exists:
        return jsonify({"error": "Username already taken"}), 409

    new_user = User(name=username, hashed_password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    # session['user_id'] = new_user.id
    return jsonify({"message": "User registered and logged in successfully", "user_id": new_user.id}), 201


@app.route("/handle_login", methods=["POST"])
def handle_login():
    data = request.get_json()
    username = data['username']
    password = data['password']

    hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()
    user = User.query.filter_by(name=username).first()

    if user and user.hashed_password == hashed_password:
        session.permanent = True
        session['user_id'] = user.id
        # session.modified = True  # Makes the session persistent
        return jsonify({"message": "Login successful", "user_id": user.id}), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401
    

@app.route("/logout", methods=["POST"])
def logout():
    print("HERE IS", session)
    if 'user_id' in session:
        session.clear()
        response = make_response(jsonify({'message': 'Logged out successfully'}))
        return response, 200
    else:
        return jsonify({'error': 'No user is currently logged in.'}), 401


@app.route("/is_logged_in", methods=["GET"])
def is_logged_in():
    print(request.headers)
    if 'user_id' in session:
        # user_id = session['user_id']
        user_id = session.get("user_id")
        print(user_id)
        user = User.query.get(user_id)
        if user:
            return jsonify({"username": user.name, "logged_in": True})
        else:
            # The user_id was in the session, but no user was found in the database.
            # This could indicate a stale session, so we clear it for safety.
            session.clear()
            return jsonify({"message": "No user found, session cleared."}), 400
    else:
        return jsonify({"message": "Not logged in, or no cookie being attached."}), 400


# fetch the latest stock price from the Alpha Vantage API
def get_latest_stock_price(symbol):
    api_key = os.getenv('ALPHAVANTAGE_API_KEY')
    params = {
        'function': 'GLOBAL_QUOTE',
        'symbol': symbol,
        'apikey': api_key
    }
    response = requests.get("https://www.alphavantage.co/query", params=params)
    if response.status_code == 200:
        quote_data = response.json().get('Global Quote', {})
        return float(quote_data.get('05. price', 0))
    return 0  # Return 0 if the request fails or no price data is found


# Define a route to get details of a specific user including their stocks and investments
@app.route('/users', methods=['GET'])
def get_user():
    user_id =  session.get('user_id')
    user = User.query.get(user_id)
    if user:
        stocks = Stock.query.filter_by(user_id=user.id).all()

        # Initialize total_investment and total_current_value to 0
        total_investment = 0
        total_current_value = 0  # Used for overall ROI calculation if needed

        stock_details = []
        for stock in stocks:
            # Skip stocks that do not have shares or purchase_price set
            if stock.shares is None or stock.purchase_price is None:
                continue
            
            latest_price = get_latest_stock_price(stock.symbol)
            current_investment = latest_price * stock.shares
            total_investment += stock.shares * stock.purchase_price
            total_current_value += current_investment  # Update total_current_value
            roi = ((latest_price - float(stock.purchase_price)) / float(stock.purchase_price)) * 100
            portfolio_percentage = (current_investment / float(total_investment)) * 100 if total_investment > 0 else 0

            # Fetch the company name for each stock
            company_name, _ = get_stock_details_from_alpha_vantage(stock.symbol)

            stock_details.append({
                'id': stock.id,  # Include the stock's ID here
                'symbol': stock.symbol,
                'name': company_name,  # Include the stock's company name
                'current_price': latest_price,
                'current_investment': current_investment,
                'roi': roi,
                'portfolio_percentage': portfolio_percentage,
                'shares': stock.shares,
                'purchase_price': stock.purchase_price
            })

        user_details = {
            'name': user.name,
            'total_investment': f"{total_investment:.2f}€",
            'stocks': stock_details,
        }

        return jsonify(user_details)
    else:
        return jsonify({'error': 'User not found'}), 404


    
@app.route('/users/add_stock', methods=['POST'])
def add_stock():
    user_id =  session.get('user_id')
    data = request.json
    symbol = data['symbol']

    # Fetch stock details from Alpha Vantage
    company_name, latest_price = get_stock_details_from_alpha_vantage(symbol)

    # Proceed only if the stock details were successfully fetched
    if company_name is None or latest_price is None:
        return jsonify({'error': 'Failed to fetch stock details'}), 500

    new_stock = Stock(
        user_id=user_id,
        symbol=symbol,
        shares=data['shares'],
        purchase_price=data['purchase_price']
    )

    db.session.add(new_stock)
    db.session.commit()

    return jsonify({
        'message': 'Stock added successfully',
        'stock': {
            'id': new_stock.id,  
            'name': company_name,
            'symbol': symbol,
            'current_price': latest_price,
        }
    }), 201

def get_stock_details_from_alpha_vantage(symbol):
    api_key = os.getenv('ALPHAVANTAGE_API_KEY')

    # Fetch the latest stock price
    price_response = requests.get(f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={api_key}")
    if price_response.status_code != 200:
        return None, None
    price_data = price_response.json().get('Global Quote', {})
    latest_price = float(price_data.get('05. price', 0))

    # Fetch the company name
    search_response = requests.get(f"https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords={symbol}&apikey={api_key}")
    if search_response.status_code != 200:
        return None, None
    search_data = search_response.json()
    company_name = search_data.get('bestMatches', [{}])[0].get('2. name', 'Unknown')

    return company_name, latest_price


@app.route('/users/remove_stock/<int:stock_id>', methods=['DELETE'])
def remove_stock(stock_id):
    user_id = session.get('user_id')
    stock = Stock.query.filter_by(id=stock_id, user_id=user_id).first()
    if stock:
        db.session.delete(stock)
        db.session.commit()
        return jsonify({'message': 'Stock removed successfully'}), 200
    else:
        return jsonify({'error': 'Stock not found'}), 404


# Define a route to get details of a specific stock including its current price and company name
@app.route('/stock_details/<symbol>', methods=['GET'])
def get_stock_details(symbol):
    api_key = os.getenv('ALPHAVANTAGE_API_KEY')

    # First, try to get the company name by searching for the symbol
    search_params = {
        'function': 'SYMBOL_SEARCH',
        'keywords': symbol,
        'apikey': api_key
    }
    search_response = requests.get("https://www.alphavantage.co/query", params=search_params)
    if search_response.status_code == 200:
        search_data = search_response.json()
        best_matches = search_data.get('bestMatches', [])
        # Take the first match's name (if available) as the company name
        company_name = best_matches[0].get('2. name') if best_matches else 'Name not found'

        # Now, get the latest price
        quote_params = {
            'function': 'GLOBAL_QUOTE',
            'symbol': symbol,
            'apikey': api_key
        }
        quote_response = requests.get("https://www.alphavantage.co/query", params=quote_params)
        if quote_response.status_code == 200:
            quote_data = quote_response.json().get('Global Quote', {})
            stock_details = {
                'symbol': symbol,
                'name': company_name,
                'price': quote_data.get('05. price', '0'),  # Default to '0' if not found
            }
            return jsonify(stock_details), 200
        else:
            return jsonify({'error': 'Failed to fetch stock quote data'}), quote_response.status_code
    else:
        return jsonify({'error': 'Failed to fetch company name'}), search_response.status_code


# Define a route to get the monthly stock data for the last 12 months of a specific stock
@app.route('/stock/<symbol>', methods=['GET'])
def get_stock(symbol):
    base_url = "https://www.alphavantage.co/query"
    api_key = os.getenv('ALPHAVANTAGE_API_KEY') 
    params = {
        'function': 'TIME_SERIES_MONTHLY',
        'symbol': symbol,
        'apikey': api_key
    }
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        data = response.json()
        monthly_data = data.get('Monthly Time Series', {})

        # Extract last 12 months of data
        last_12_months = list(monthly_data.items())[:12]  # Get the most recent 12 entries
        print("Last 12 months")
        closing_prices = [
            {
                'date': month,
                'closing_price': details['4. close']
            }
            for month, details in last_12_months
        ]

        return jsonify(closing_prices), 200
    else:
        return jsonify({'error': 'Failed to fetch stock data'}), response.status_code


@app.errorhandler(404)
def resource_not_found(e):
    return jsonify(error=str(e)), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify(error=str(e)), 500

@app.before_request
def before_request():
    app.logger.debug('Session before request: %s', session)

@app.after_request
def after_request(response):
    app.logger.debug('Session after request: %s', session)
    return response

if __name__ == '__main__':
    app.run(debug = True)
