from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import os
import json

# Load environment variables from a .env file
from dotenv import load_dotenv
load_dotenv()

# Initialize Flask app and enable Cross-Origin Resource Sharing (CORS)
app = Flask(__name__)
CORS(app)

# Hardcoded "database" for demonstration
def read_data():
    file_path = 'data.json'
    with open(file_path, 'r') as f:
        data = json.load(f)
    return data

users = read_data()

def write_data(data):
    with open('data.json', 'w') as f:
        json.dump(data, f, indent=4)

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
@app.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    user = users.get(user_id)
    if user:
        # Calculate the total investment
        total_investment = sum(stock['shares'] * stock['purchase_price'] for stock in user['stocks'])
        user['total_investment'] = f"{total_investment:.2f}€"  # Format as string with two decimal places

        for stock in user['stocks']:
            latest_price = get_latest_stock_price(stock['symbol'])
            stock['current_price'] = latest_price
            stock['current_investment'] = latest_price * stock['shares']
            stock['roi'] = ((latest_price - stock['purchase_price']) / stock['purchase_price']) * 100
            stock['portfolio_percentage'] = (stock['current_investment'] / total_investment) * 100

        user['total_investment'] = total_investment
        response = jsonify(user)
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    else:
        return jsonify({'error': 'User not found'}), 404

    
# @app.route('/users/<user_id>/add_stock', methods=['POST'])
# def add_stock(user_id):
#     data = request.json  # Get data sent with POST request
#     users = read_data()  # Read the current data
#     # Check if user exists
#     if user_id not in users:
#         return jsonify({'error': 'User not found'}), 404
#     # Add the new stock to the user's portfolio
#     users[user_id]['stocks'].append(data)
#     # Save the updated data back to the JSON file
#     write_data(users)
#     return jsonify({'success': True, 'stock': data}), 200


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


if __name__ == '__main__':
    app.run()
