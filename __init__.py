from flask import Flask
from google.cloud import ndb
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
import os
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "my-internproject-remotekey.json"

client = ndb.Client()


bcrypt = Bcrypt()
login_manager = LoginManager()
login_manager.login_view = 'admin.login'
login_manager.login_message_category = 'warning'


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = '720492c0cd0d3b1e711f048b8958e977022368588674c68da028c0a5c1f483a4'

    bcrypt.init_app(app)
    login_manager.init_app(app)

    from internapp.admin.routes import admin
    from internapp.intern.routes import intern
    from internapp.mentor.routes import mentor

    app.register_blueprint(admin)
    app.register_blueprint(intern)
    app.register_blueprint(mentor)

    return app
