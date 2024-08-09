from flask import Flask
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure upload and output folders
app.config['UPLOAD_FOLDER'] = 'app/static/uploads'
app.config['OUTPUT_FOLDER'] = 'app/static/outputs'

# Ensure the directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

# Import the routes at the end to avoid circular imports
from app import main
