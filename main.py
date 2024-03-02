from flask import Flask, jsonify
import requests

app = Flask(__name__)

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

def get_stock_info(symbol):
    base_url = "https://www.alphavantage.co/query"
    params = {
        'function': 'TIME_SERIES_MONTHLY',
        'symbol': symbol,
        'apikey': 'W5GNQVIAT6ZNULOG'  
    }
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        data = response.json()
        last_month = list(data['Monthly Time Series'].keys())[0]
        closing_price = data['Monthly Time Series'][last_month]['4. close']
        return {'symbol': symbol, 'last_month_closing_price': closing_price}
    else:
        return {'error': 'Failed to fetch stock data, investment values are currently being updated'}

@app.route('/')
def index():
    return '''
    <html>
        <head>
            <title>Stock Tracker</title>
        </head>
        <body>
            <h1>Welcome to the Stock Tracker</h1>
            <p>Please choose which user you are:</p>
            <ul>
                <li><a href="/user/user1">User 1</a></li>
                <li><a href="/user/user2">User 2</a></li>
            </ul>
        </body>
    </html>
    '''

@app.route('/user/<user_id>')
def user_page(user_id):
    if user_id not in users:
        return jsonify({'error': 'User not found'}), 404
    user = users[user_id]
    # Generate HTML table for stocks information with links
    stocks_table = '<table><tr><th>Company Name</th><th>Symbol</th><th>% of Portfolio</th><th>Value</th></tr>'
    for stock in user['stocks']:
        stocks_table += f"<tr><td>{stock['name']}</td><td><a href='/stock/{stock['symbol']}'>{stock['symbol']}</a></td><td>{stock['portfolio_percentage']}%</td><td>{stock['value']}</td></tr>"
    stocks_table += '</table>'
    
    # Structured display using HTML
    return f'''
    <html>
        <head>
            <title>{user_id} Portfolio</title>
            <style>
                table {{
                    width: 60%;
                    border-collapse: collapse;
                }}
                th, td {{
                    text-align: left;
                    padding: 8px;
                    border-bottom: 1px solid #ddd;
                }}
                th {{
                    background-color: #f2f2f2;
                }}
                a {{
                    text-decoration: none;
                    color: blue;
                }}
                a:hover {{
                    text-decoration: underline;
                }}
            </style>
        </head>
        <body>
            <h1>{user_id} - Total Investment: {user['total_investment']}</h1>
            <h2>Stocks Breakdown:</h2>
            {stocks_table}
            <a href="/">Back to Home</a>
        </body>
    </html>
    '''

@app.route('/stock/<symbol>')
def stock_info(symbol):
    base_url = "https://www.alphavantage.co/query"
    params = {
        'function': 'TIME_SERIES_MONTHLY',
        'symbol': symbol,
        'apikey': 'YOUR_API_KEY'  # Replace 'YOUR_API_KEY' with your actual API key
    }
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        data = response.json()
        monthly_data = data.get('Monthly Time Series', {})
        # Extract the last 12 months of data
        last_12_months_keys = sorted(list(monthly_data.keys()))[-12:]
        closing_prices = {date: monthly_data[date]['4. close'] for date in last_12_months_keys}
        
        # Return a JSON response with the data
        return jsonify({
            'symbol': symbol,
            'closing_prices_last_12_months': closing_prices
        })
    else:
        return jsonify({'error': 'Failed to fetch stock data, please try again later'}), 500



if __name__ == '__main__':
    app.run(debug=True)
