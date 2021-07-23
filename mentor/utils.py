import uuid
from internapp.models import Task


# for generating uuid
def generate_uid():
    new_uid = str(uuid.uuid4())
    return new_uid


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


def create_mentor_dict(mentors_list):
    mentors_dict = dict()
    for i in range(len(mentors_list)):
        mentor_dict = dict()
        mentor_dict['username'] = mentors_list[i].username
        mentor_dict['uid'] = mentors_list[i].uid
        mentors_dict[str(i)] = mentor_dict
    return mentors_dict
