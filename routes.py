import flask
import uuid
from flask import render_template, url_for, flash, redirect, request, abort, make_response
from internapp import app, ndb, bcrypt
from internapp.forms import LoginForm, PostForm
from internapp.models import Admin, Intern, Mentor, Task
from flask_login import login_user, current_user, logout_user, login_required
from google.cloud import ndb

client = ndb.Client()


# Functions

# for generating uuid
def generate_uid():
    new_uid = str(uuid.uuid4())
    return new_uid







@app.route('/', methods=['GET', 'POST'])
def login():
    login_form = LoginForm()
    if login_form.validate_on_submit():
        category = request.form.get('category')
        if category == 'Mentor':
            with client.context():
                mentor = Mentor.query().filter(Mentor.email == login_form.email.data).get()
            if mentor and bcrypt.check_password_hash(mentor.password, login_form.password.data):
                login_user(mentor, remember=login_form.remember.data)
                next_page = request.args.get('next')
                return redirect(next_page) if next_page else redirect(url_for('mentor_home'))
            else:
                flash(f" :( Login failed! Please check details you entered", 'danger')
        elif category == 'Admin':
            with client.context():
                admin = Admin.query().filter(Admin.email == login_form.email.data).get()
            if admin and (admin.password == login_form.password.data):
                login_user(admin, remember=login_form.remember.data)
                next_page = request.args.get('next')
                return redirect(next_page) if next_page else redirect(url_for('admin_home'))
            else:
                flash(f" :( Login failed! Please check details you entered", 'danger')
        else:
            with client.context():
                intern = Intern.query().filter(Intern.email == login_form.email.data).get()
            if intern and bcrypt.check_password_hash(intern.password, login_form.password.data):
                login_user(intern, remember=login_form.remember.data)
                next_page = request.args.get('next')
                return redirect(next_page) if next_page else redirect(url_for('intern_home'))
            else:
                flash(f" :(  Login failed! Please check details you entered", 'danger')
    return render_template('login.html', form=login_form)


# For Admin - Home page
@app.route('/home-admin', methods=['GET', 'POST'])
@login_required
def admin_home():
    if current_user.get_user_type() == 'Admin':
        return render_template('admin-home.html', title="Admin-Home")
    else:
        logout_user()
        abort(401)


# For Intern - Home page
@app.route('/home-intern', methods=['GET', 'POST'])
@login_required
def intern_home():
    if current_user.get_user_type() == 'Intern':
        return render_template('intern-home.html', title="Intern-Home")
    else:
        logout_user()
        abort(401)


# For Mentor - Home page
@app.route('/home-mentor', methods=['GET', 'POST'])
@login_required
def mentor_home():
    if current_user.get_user_type() == 'Mentor':
        return render_template('mentor-home.html', title="Mentor-Home")
    else:
        logout_user()
        abort(401)


@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('login'))


# For Admin - Create Mentor Account
@app.route('/create-mentor', methods=['POST'])
@login_required
def create_mentor_account():
    if current_user.get_user_type() == 'Admin':
        data = request.get_json()
        if request.method == 'POST':
            mentor_username = data.get('username')
            mentor_email = data.get('email')
            mentor_hashed_password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
            with client.context():
                mentor_data_for_username = Mentor.query().filter(Mentor.username == mentor_username).fetch()
                if len(mentor_data_for_username) == 0:
                    mentor_data_for_email = Mentor.query().filter(Mentor.email == mentor_email).fetch()
                    if len(mentor_data_for_email) == 0:
                        mentor = Mentor(uid=generate_uid(), username=mentor_username, email=mentor_email, password=mentor_hashed_password)
                        new_mentor = mentor.put()
                        created_mentor = Mentor.query().filter(Mentor.key == new_mentor).get()
                        return f"{created_mentor.username} | {created_mentor.email} Account created successfully"
                    else:
                        current_response = flask.Response(status=406, response="Mentor Account already exists with Email, Please choose another")
                        return current_response
                else:
                    current_response = flask.Response(status=406, response="Mentor Account already exists with Username, Please choose another")
                    return current_response
    else:
        logout_user()
        abort(401)


# for getting current existing mentors
@app.route('/mentors')
@login_required
def get_current_mentors():
    if current_user.get_user_type() == 'Admin':
        with client.context():
            available_mentors = Mentor.query().fetch()
            mentors_dict = dict()
            for each_mentor in available_mentors:
                mentors_dict[f"{each_mentor.username} | {each_mentor.email}"] = each_mentor.uid
        return mentors_dict
    else:
        logout_user()
        current_response = flask.Response(status=401, response='Access denied !! You are logged out, Please access using authorised credentials')
        return current_response


# For Admin create intern
@app.route('/create-intern', methods=['POST'])
@login_required
def create_intern_account():
    if current_user.get_user_type() == 'Admin':
        data = request.get_json()
        if request.method == 'POST':
            intern_username = data.get('username')
            intern_email = data.get('email')
            intern_hashed_password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
            intern_mentor = data.get('mentor')
            with client.context():
                requested_mentor = Mentor.query().filter(Mentor.uid == intern_mentor).get()
                print(requested_mentor.key)
                intern_data_for_username = Intern.query().filter(Intern.username == intern_username).fetch()
                if len(intern_data_for_username) == 0:
                    intern_data_for_email = Intern.query().filter(Intern.email == intern_email).fetch()
                    if len(intern_data_for_email) == 0:
                        intern = Intern(uid=generate_uid(), username=intern_username, email=intern_email, password=intern_hashed_password, mentors=[requested_mentor.key])
                        new_intern = intern.put()
                        requested_mentor.interns.append(new_intern)
                        requested_mentor.put()
                        created_intern = Intern.query().filter(Intern.key == new_intern).get()
                        return f"{created_intern.username} Account created successfully and assigned to {requested_mentor.username}"
                    else:
                        current_response = flask.Response(status=406, response="Intern Account already exists with Email, Please choose another")
                        return current_response
                else:
                    current_response = flask.Response(status=406, response="Intern Account already exists with Username, Please choose another")
                    return current_response
    else:
        logout_user()
        abort(401)


# for getting current existing Interns and Mentors
@app.route('/interns-mentors', methods=['GET'])
@login_required
def get_interns_and_mentors():
    with client.context():
        interns = Intern.query().fetch()
        interns_dict = dict()
        for each_intern in interns:
            interns_dict[f"{each_intern.username} | {each_intern.email}"] = each_intern.uid
        mentors = Mentor.query().fetch()
        mentors_dict = dict()
        for each_mentor in mentors:
            mentors_dict[f"{each_mentor.username} | {each_mentor.email}"] = each_mentor.uid

        result_dict = {"interns": interns_dict, "mentors": mentors_dict}
    return result_dict


@app.route('/interns', methods=['GET'])
@login_required
def get_interns():
    with client.context():
        interns = Intern.query().fetch()
        interns_dict = dict()
        for each_intern in interns:
            interns_dict[f"{each_intern.username} | {each_intern.email}"] = each_intern.uid
    return interns_dict


@app.route('/mentors-for-intern', methods=['POST'])
@login_required
def get_mentors_for_intern():
    admin_data = request.get_json()
    requested_intern_uid = admin_data.get('selectedInternUid')
    with client.context():
        requested_intern = Intern.query().filter(Intern.uid == requested_intern_uid).get()
        if requested_intern:
            existing_mentors = [mentor_key.get() for mentor_key in requested_intern.mentors]
            if len(existing_mentors) == 0:
                current_response = flask.Response(status=406, response=f"Currently {requested_intern.username} have no assigned mentors", content_type="application/json")
                return current_response
            else:
                mentors_dict = dict()
                for each_existing_mentor in existing_mentors:
                    mentors_dict[f"{each_existing_mentor.username} | {each_existing_mentor.email}"] = each_existing_mentor.uid
                return mentors_dict
        else:
            current_response = flask.Response(status=406, response="Selected Intern does not exist", content_type="application/json")
            return current_response


# For Admin
# Assign Mentor to Intern and update intern and mentor accounts
@app.route('/assign-mentor', methods=['POST'])
@login_required
def assign_mentor():
    if current_user.get_user_type() == 'Admin':
        admin_data = request.get_json()
        requested_intern_uid = admin_data.get('intern')
        requested_mentor_uid = admin_data.get('mentor')

        if requested_intern_uid == "" or requested_mentor_uid == "":
            current_response = flask.Response(status=406, response="Please Choose both Intern and Mentor", content_type="application/json")
            return current_response
        else:
            with client.context():
                requested_intern = Intern.query().filter(Intern.uid == requested_intern_uid).get()
                requested_mentor = Mentor.query().filter(Mentor.uid == requested_mentor_uid).get()
                existing_interns = [intern_key.get().uid for intern_key in requested_mentor.interns]
                if requested_intern_uid in existing_interns:
                    current_response = flask.Response(status=406, response=f"{requested_intern.username} already assigned to {requested_mentor.username}", content_type="application/json")
                    return current_response
                else:
                    requested_intern_key = requested_intern.key
                    requested_mentor.interns.append(requested_intern_key)
                    requested_mentor.put()
                    requested_mentor_key = requested_mentor.key
                    requested_intern.mentors.append(requested_mentor_key)
                    requested_intern.put()
        return f'{requested_intern.username} assigned to {requested_mentor.username} successfully'
    else:
        abort(401)


# For Admin
# Delete existing Mentor to Intern and update intern and mentor accounts
@app.route('/delete-assigned-mentor', methods=['POST'])
@login_required
def delete_assigned_mentor():
    if current_user.get_user_type() == 'Admin':
        admin_data = request.get_json()
        requested_intern_uid = admin_data.get('intern')
        requested_mentor_uid = admin_data.get('mentor')
        with client.context():
            requested_mentor = Mentor.query().filter(Mentor.uid == requested_mentor_uid).get()
            requested_intern = Intern.query().filter(Intern.uid == requested_intern_uid).get()
            requested_intern_key = requested_intern.key
            existing_mentors = [mentor_key.get() for mentor_key in requested_intern.mentors]
            if requested_mentor in existing_mentors:
                requested_mentor_key = requested_mentor.key
                updated_mentors_for_intern = [mentor_key for mentor_key in requested_intern.mentors if mentor_key != requested_mentor_key]
                updated_interns_for_mentor = [intern_key for intern_key in requested_mentor.interns if intern_key != requested_intern_key]
                requested_intern.mentors = updated_mentors_for_intern
                requested_intern.put()
                requested_mentor.interns = updated_interns_for_mentor
                requested_mentor.put()
                return f"{requested_intern.username} removed from mentorship of {requested_mentor.username}"
            else:
                current_response = flask.Response(status=406, response=f"{requested_intern.username} is not being mentored by {requested_mentor.username}", content_type="application/json")
                return current_response
    else:
        logout_user()
        abort(401)


# For Admin
# To change intern account password
@app.route('/change-intern-password', methods=['POST'])
@login_required
def change_intern_password():
    if current_user.get_user_type() == 'Admin':
        admin_data = request.get_json()
        requested_intern_uid = admin_data.get('intern')
        new_password = admin_data.get('password')
        new_hashed_password = bcrypt.generate_password_hash(new_password)
        with client.context():
            requested_intern = Intern.query().filter(Intern.uid == requested_intern_uid).get()
            requested_intern.password = new_hashed_password
            requested_intern.put()
            return f"{requested_intern.username} account password updated successfully"
    else:
        logout_user()
        abort(401)


# For Admin
# To delete intern account
@app.route('/delete-intern-account', methods=['POST'])
@login_required
def delete_intern_account():
    if current_user.get_user_type() == 'Admin':
        admin_data = request.get_json()
        requested_intern_uid = admin_data.get('intern')
        with client.context():
            requested_intern = Intern.query().filter(Intern.uid == requested_intern_uid).get()
            if requested_intern:
                tasks = Task.query().filter(Task.assigned_to == requested_intern.key).fetch()
                if tasks:
                    for task in tasks:
                        ndb.Key(Task, int(task.key.id())).delete()
                if requested_intern.mentors:
                    for mentor in requested_intern.mentors:
                        interns_list = mentor.get().interns
                        updated_interns_list = [intern for intern in interns_list if intern != requested_intern.key]
                        mentor.get().interns = updated_interns_list
                        mentor.get().put()
                ndb.Key(Intern, int(requested_intern.key.id())).delete()
                return f'{requested_intern.username} Account deleted successfully'
            else:
                current_response = flask.Response(status=406, response=f"{requested_intern.username} Account does not exist", content_type="application/json")
                return current_response
    else:
        logout_user()
        abort(401)


@app.route('/create-post', methods=['POST'])
@login_required
def create_post():
    if current_user.get_user_type() == 'Intern':
        data = request.get_json()
        if request.method == 'POST':
            title = data.get('title')
            content = data.get('content')
            with client.context():
                task = Task(uid=generate_uid(), title=title, content=content, assigned_to=current_user.key)
                task.put()
                return "Your task posted successfully"
    else:
        abort(401)


def get_tasks(current_user):
    desired_tasks = Task.query().filter(Task.assigned_to == current_user.key).fetch()
    result_dict = dict()
    for each_task in desired_tasks:
        each_task_dict = dict()
        each_task_dict['title'] = each_task.title
        each_task_dict['content'] = each_task.content
        each_task_dict['createdAt'] = each_task.created_at.strftime("%d %b %Y %I:%M %p")
        each_task_dict['author'] = current_user.username
        each_task_dict['taskUid'] = each_task.uid
        each_task_dict['authorUid'] = current_user.uid
        dict_key = generate_uid()
        result_dict[dict_key] = each_task_dict
    return result_dict


# For Intern to display his tasks
@app.route('/my-tasks')
@login_required
def get_my_tasks():
    if current_user.get_user_type() == "Intern":
        with client.context():
            result_dict = get_tasks(current_user)
            return result_dict
    else:
        abort(401)


@app.route('/all-tasks')
@login_required
def get_all_tasks():
    cursor = request.args.get('cursor')
    with client.context():
        page_size = 5
        if cursor:
            desired_tasks, cursor, more = Task.query().order(-Task.created_at).fetch_page(page_size)
        desired_tasks, cursor, more = Task.query().order(-Task.created_at).fetch_page(page_size)

        cursor = cursor.urlsafe().decode("utf-8")
        exists = more
        result_dict = dict()
        for i in range(len(desired_tasks)):
            task_dict = dict()
            task = desired_tasks[i]
            task_dict['title'] = task.title
            task_dict['content'] = task.content
            task_dict['createdAt'] = task.created_at.strftime("%d %b %Y %I:%M %p")
            author = ndb.Key(Intern, task.assigned_to.id()).get().username
            author_uid = ndb.Key(Intern, task.assigned_to.id()).get().uid
            task_dict['author'] = author
            task_dict['taskUid'] = task.uid
            task_dict['authorUid'] = author_uid
            result_dict[i] = task_dict
        response_dict = {"tasksDict": result_dict, "cursor": cursor, "exists": exists}
        return response_dict

"""
@app.route('/cursor-tasks')
@login_required
def get_tasks():
"""


@app.route('/my-interns')
@login_required
def get_my_interns():
    if current_user.get_user_type() == 'Mentor':
        with client.context():
            requested_interns = current_user.interns
            response_dict = dict()
            if requested_interns:
                response_dict['internsAssigned'] = True
                interns_list = [Intern.get_by_id(each_intern.id()) for each_intern in requested_interns]
                my_interns = dict()
                for i in range(len(interns_list)):
                    intern_dict = dict()
                    intern_dict['username'] = interns_list[i].username
                    intern_dict['uid'] = interns_list[i].uid
                    intern_dict['email'] = interns_list[i].email
                    my_interns[str(i)] = intern_dict
                response_dict['myInterns'] = my_interns
            else:
                response_dict['internsAssigned'] = False
            return response_dict
    else:
        logout_user()
        abort(401)


def create_mentor_dict(mentors_list):
    mentors_dict = dict()
    for i in range(len(mentors_list)):
        mentor_dict = dict()
        mentor_dict['username'] = mentors_list[i].username
        mentor_dict['uid'] = mentors_list[i].uid
        mentors_dict[str(i)] = mentor_dict
    return mentors_dict


@app.route('/intern-data', methods=['GET'])
@login_required
def get_intern_data():
    requested_intern_uid = request.args.get('intern_id')
    with client.context():
        requested_intern = Intern.query().filter(Intern.uid == requested_intern_uid).get()
        if requested_intern:
            requested_intern_dict = dict()
            requested_intern_dict['username'] = requested_intern.username
            requested_intern_dict['email'] = requested_intern.email
            requested_intern_mentors = requested_intern.mentors
            requested_intern_mentors_list = [Mentor.get_by_id(each_mentor.id()) for each_mentor in requested_intern_mentors]
            mentors_dict = dict()
            for i in range(len(requested_intern_mentors_list)):
                mentor_dict = dict()
                mentor_dict['username'] = requested_intern_mentors_list[i].username
                mentor_dict['uid'] = requested_intern_mentors_list[i].uid
                mentors_dict[str(i)] = mentor_dict
            requested_intern_dict['mentors'] = mentors_dict
            requested_intern_dict['tasks'] = get_tasks(requested_intern)
            return requested_intern_dict
        else:
            abort(404)


@app.route('/mentor-data')
@login_required
def get_mentor_data():
    requested_mentor_uid = request.args.get('mentor_id')
    with client.context():
        requested_mentor = Mentor.query().filter(Mentor.uid == requested_mentor_uid).get()
        if requested_mentor:
            requested_mentor_dict = dict()
            requested_mentor_dict['username'] = requested_mentor.username
            requested_mentor_dict['email'] = requested_mentor.email
            requested_mentor_interns = requested_mentor.interns
            requested_mentor_interns_list = [Intern.get_by_id(each_intern.id()) for each_intern in
                                             requested_mentor_interns]
            interns_tasks_dict_list = []
            for each_intern in requested_mentor_interns_list:
                each_intern_task_dict = get_tasks(each_intern)
                interns_tasks_dict_list.append(each_intern_task_dict)

            tasks_dict = dict()
            for intern_tasks_dict_count in range(len(interns_tasks_dict_list)-1):
                tasks_dict = interns_tasks_dict_list[intern_tasks_dict_count] | interns_tasks_dict_list[intern_tasks_dict_count+1]

            interns_dict = dict()
            for i in range(len(requested_mentor_interns_list)):
                intern_dict = dict()
                intern_dict['username'] = requested_mentor_interns_list[i].username
                intern_dict['uid'] = requested_mentor_interns_list[i].uid
                interns_dict[str(i)] = intern_dict
            requested_mentor_dict['interns'] = interns_dict
            requested_mentor_dict['tasks'] = tasks_dict
            return requested_mentor_dict
        else:
            abort(404)
