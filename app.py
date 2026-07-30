import uuid
from flask import Flask, render_template, request, redirect, url_for, abort

app = Flask(__name__)

# In-memory storage for birthday site data
# In a real application, you would use a database (e.g., SQLite, PostgreSQL)
birthday_sites = {}

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        recipient = request.form.get('recipient_name')
        sender = request.form.get('sender_name')
        message = request.form.get('birthday_message')
        bg_color = request.form.get('background_color', '#f0f8ff') # Default to AliceBlue

        if not recipient or not sender or not message:
            return render_template('index.html', error="All fields except background color are required.")

        site_id = str(uuid.uuid4()) # Generate a unique ID for the birthday site
        birthday_sites[site_id] = {
            'recipient': recipient,
            'sender': sender,
            'message': message,
            'bg_color': bg_color
        }
        return redirect(url_for('show_link', site_id=site_id))
    return render_template('index.html')

@app.route('/link/<site_id>')
def show_link(site_id):
    if site_id not in birthday_sites:
        abort(404) # Birthday site not found

    # Generate the full URL for the personalized birthday site
    birthday_url = url_for('birthday_site', site_id=site_id, _external=True)
    return render_template('link.html', birthday_url=birthday_url)

@app.route('/birthday/<site_id>')
def birthday_site(site_id):
    site_data = birthday_sites.get(site_id)
    if not site_data:
        abort(404) # Birthday site not found

    return render_template('birthday.html', **site_data)

@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html'), 404

if __name__ == '__main__':
    # For development, set debug=True. In production, use a WSGI server.
    app.run(debug=True)