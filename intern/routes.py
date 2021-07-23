from flask import render_template, url_for, flash, redirect, request, abort, Blueprint
from internapp import bcrypt
from internapp.intern.forms import LoginForm
from internapp.models import Admin, Intern, Mentor, Task
from flask_login import login_user, current_user, logout_user, login_required
from google.cloud import ndb
from internapp.intern.utils import generate_uid, get_tasks

client = ndb.Client()

intern = Blueprint('intern', __name__)


@intern.route('/', methods=['GET', 'POST'])
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
                return redirect(next_page) if next_page else redirect(url_for('mentor.mentor_home'))
            else:
                flash(f" :( Login failed! Please check details you entered", 'danger')
        elif category == 'Admin':
            with client.context():
                admin = Admin.query().filter(Admin.email == login_form.email.data).get()
            if admin and (admin.password == login_form.password.data):
                login_user(admin, remember=login_form.remember.data)
                next_page = request.args.get('next')
                return redirect(next_page) if next_page else redirect(url_for('admin.admin_home'))
            else:
                flash(f" :( Login failed! Please check details you entered", 'danger')
        else:
            with client.context():
                intern = Intern.query().filter(Intern.email == login_form.email.data).get()
            if intern and bcrypt.check_password_hash(intern.password, login_form.password.data):
                login_user(intern, remember=login_form.remember.data)
                next_page = request.args.get('next')
                return redirect(next_page) if next_page else redirect(url_for('intern.intern_home'))
            else:
                flash(f" :(  Login failed! Please check details you entered", 'danger')
    return render_template('login.html', form=login_form)


# For Intern - Home page
@intern.route('/home-intern', methods=['GET', 'POST'])
@login_required
def intern_home():
    if current_user.get_user_type() == 'Intern':
        return render_template('intern-home.html', title="Intern-Home")
    else:
        logout_user()
        abort(401)


@intern.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('intern.login'))


@intern.route('/create-post', methods=['POST'])
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


# For Intern to display his tasks
@intern.route('/my-tasks')
@login_required
def get_my_tasks():
    if current_user.get_user_type() == "Intern":
        with client.context():
            result_dict = get_tasks(current_user)
            return result_dict
    else:
        abort(401)


@intern.route('/all-tasks')
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


@intern.route('/intern-data', methods=['GET'])
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


@intern.route('/mentor-data')
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
