from flask import Flask, jsonify
from flask_cors import CORS
import requests
import os

from dotenv import load_dotenv
load_dotenv()
print(f"Environment: {os.getenv('FLASK_ENV')}")
print(f"API Key: {os.getenv('ALPHAVANTAGE_API_KEY')}")

app = Flask(__name__)
CORS(app)

# Hardcoded "database" for demonstration
users = {
    'user1': {
        'total_investment': '150.000€',
        'stocks': [
            {'symbol': 'AAPL', 'name': 'Apple Inc.', 'portfolio_percentage': 25, 'value': '37.500€'},
            {'symbol': 'GOOG', 'name': 'Alphabet Inc.', 'portfolio_percentage': 25, 'value': '37.500€'},
            {'symbol': 'AMZN', 'name': 'Amazon.com Inc.', 'portfolio_percentage': 25, 'value': '37.500€'},
            {'symbol': 'MSFT', 'name': 'Microsoft Corporation', 'portfolio_percentage': 25, 'value': '37.500€'}
        ]
    },
    'user2': {
        'total_investment': '150.000€',
        'stocks': [
            {'symbol': 'IBM', 'name': 'International Business Machines Corporation', 'portfolio_percentage': 25, 'value': '37.500€'},
            {'symbol': 'INTC', 'name': 'Intel Corporation', 'portfolio_percentage': 25, 'value': '37.500€'},
            {'symbol': 'ORCL', 'name': 'Oracle Corporation', 'portfolio_percentage': 25, 'value': '37.500€'},
            {'symbol': 'SAP', 'name': 'SAP SE', 'portfolio_percentage': 25, 'value': '37.500€'}
        ]
    }
}

@app.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    user = users.get(user_id)
    if user:
        response = jsonify(users)
        response.headers.add("Access-Control-Allow-Origin","*")
        return response
    else:
        return jsonify({'error': 'User not found'}), 404

@app.route('/stock/<symbol>', methods=['GET'])
def get_stock(symbol):
    base_url = "https://www.alphavantage.co/query"
    api_key = os.getenv('ALPHAVANTAGE_API_KEY')  # Environment variable for API key
    params = {
        'function': 'TIME_SERIES_MONTHLY',
        'symbol': symbol,
        'apikey': api_key
    }
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        data = response.json()
        monthly_data = data.get('Monthly Time Series', {})
        if not monthly_data:
            return jsonify({'error': 'No monthly data found for symbol'}), 404
        last_month = list(monthly_data.keys())[0]
        closing_price = monthly_data[last_month]['4. close']
        return jsonify({
            'symbol': symbol,
            'last_month_closing_price': closing_price
        }), 200
    else:
        return jsonify({'error': 'Failed to fetch stock data'}), response.status_code

if __name__ == '__main__':
    # Load environment variables from .env file in a non-production environment
    # if os.environ.get('FLASK_ENV') != 'production':
    #      from dotenv import load_dotenv
    #      load_dotenv()

    # Run the application
    app.run()
