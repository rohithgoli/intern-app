from internapp import ndb, client, login_manager


@login_manager.user_loader
def load_user(uid):
    with client.context():
        qry = Admin.query().filter(Admin.uid == uid).get()
        if qry == None:
            qry = Mentor.query().filter(Mentor.uid == uid).get()
            if qry == None:
                qry = Intern.query().filter(Intern.uid == uid).get()
        return qry


class Admin(ndb.Model):
    uid = ndb.StringProperty(required=True)
    username = ndb.StringProperty(required=True)
    email = ndb.StringProperty(required=True)
    password = ndb.StringProperty(required=True)

    def __repr__(self):
        return f"Admin('{self.username}', '{self.email}')"

    def is_active(self):
        return True

    def get_id(self):
        return self.uid

    def is_authenticated(self):
        return self.authenticated

    def is_anonymous(self):
        return False

    def get_user_type(self):
        return 'Admin'


class Intern(ndb.Model):
    uid = ndb.StringProperty(required=True)
    username = ndb.StringProperty(required=True)
    email = ndb.StringProperty(required=True)
    password = ndb.StringProperty(required=True)
    mentors = ndb.KeyProperty(kind="Mentor", repeated=True)

    def __repr__(self):
        return f"Intern('{self.username}', '{self.email}')"

    def is_active(self):
        return True

    def get_id(self):
        return self.uid

    def is_authenticated(self):
        return self.authenticated

    def is_anonymous(self):
        return False

    def get_user_type(self):
        return 'Intern'


class Mentor(ndb.Model):
    uid = ndb.StringProperty(required=True)
    username = ndb.StringProperty(required=True)
    email = ndb.StringProperty(required=True)
    password = ndb.StringProperty(required=True)
    interns = ndb.KeyProperty(kind="Intern", repeated=True)

    def __repr__(self):
        return f"Mentor('{self.username}', '{self.email}')"

    def is_active(self):
        return True

    def get_id(self):
        return self.uid

    def is_authenticated(self):
        return self.authenticated

    def is_anonymous(self):
        return False

    def get_user_type(self):
        return 'Mentor'


class Task(ndb.Model):
    uid = ndb.StringProperty(required=True)
    title = ndb.StringProperty(required=True)
    content = ndb.TextProperty(required=True)
    created_at = ndb.DateTimeProperty(auto_now_add=True)
    updated_at = ndb.DateTimeProperty(auto_now=True)
    # assigned_by = ndb.KeyProperty(kind="Mentor")
    assigned_to = ndb.KeyProperty(kind="Intern")

    def __repr__(self):
        return f"Task('{self.title}', '{self.assigned_to}')"
