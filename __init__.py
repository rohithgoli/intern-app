from flask import Flask
from google.cloud import ndb
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
import os
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "my-internproject-remotekey.json"

client = ndb.Client()

app = Flask(__name__)
app.config['SECRET_KEY'] = '720492c0cd0d3b1e711f048b8958e977022368588674c68da028c0a5c1f483a4'


bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'warning'

from internapp import routes
