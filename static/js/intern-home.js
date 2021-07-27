
document.addEventListener('DOMContentLoaded', function() {

    let spinnerEl = document.getElementById("spinner");

    let statusContainerEl = document.getElementById("operationStatusContainer");
    let noMoreFeedMsgContainerEl = document.getElementById("noMoreFeedMsgContainer");

    function displayOperationSuccess(message){

        statusContainerEl.innerHTML = "";

        let msgContainerEl = document.createElement("div");
        msgContainerEl.classList.add("alert", "alert-success");
        msgContainerEl.role = "alert";
        msgContainerEl.textContent = message;
        statusContainerEl.appendChild(msgContainerEl);
    }

    function displayOperationInfo(message) {

        statusContainerEl.innerHTML = "";

        let msgContainerEl = document.createElement("div");
        msgContainerEl.classList.add("alert", "alert-warning");
        msgContainerEl.role = "alert";
        msgContainerEl.textContent = message;
        statusContainerEl.appendChild(msgContainerEl);
    }

    function displayOperationFailure(message) {


        statusContainerEl.innerHTML = "";

        let msgContainerEl = document.createElement("div");
        msgContainerEl.classList.add("alert", "alert-danger");
        msgContainerEl.role = "alert";
        msgContainerEl.textContent = message;
        statusContainerEl.appendChild(msgContainerEl);
    }

    // create Post

    let postTaskBtnEl = document.getElementById("postTaskBtn");

    let createPostFormContainerEl = document.getElementById("createPostFormContainer");
    let createPostFormEl = document.getElementById("createPostForm");

    let postTitleEl = document.getElementById("postTitle");
    let postContentEl = document.getElementById("postContent");

    function onPostTask() {
        if (detailsContainerEl.classList.contains('d-none') === false) {
            detailsContainerEl.classList.add("d-none");
        }

        if (tasksFeedContainerEl.classList.contains("d-none") === false) {
            tasksFeedContainerEl.classList.add("d-none");
        }

        statusContainerEl.innerHTML = "";
        noMoreFeedMsgContainerEl.innerHTML = "";

        postTitleEl.value = "";
        postContentEl.value = "";
        createPostFormContainerEl.classList.remove("d-none");
    }

    postTaskBtnEl.addEventListener('click', onPostTask);

    createPostFormEl.addEventListener('submit', function(event) {
        event.preventDefault();
        new FormData(createPostFormEl);
    });

    createPostFormEl.addEventListener('formdata', function(event) {
        let data = event.formData;

        let formObj = {};
        for (eachData of data) {
            formObj[eachData[0]] = eachData[1];
        }

        let stringifiedData = JSON.stringify(formObj);

        let xhr = new XMLHttpRequest();
        xhr.open("POST", '/create-post');
        xhr.setRequestHeader("Content-type", 'application/json');
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                msg=xhr.responseText;
                displayOperationSuccess(msg);
                postTitleEl.value = "";
                postContentEl.textContent = "";
            } else if (xhr.status == 406) {
                msg=xhr.responseText;
                displayOperationFailure(msg);
            }
        }
        xhr.send(stringifiedData);

    });


    // My tasks


    let myTasksBtnEl = document.getElementById("myTasksBtn");

    let tasksFeedContainerEl = document.getElementById("tasksFeedContainer");

    function onDisplayMyTasks() {
        if (detailsContainerEl.classList.contains('d-none') === false) {
            detailsContainerEl.classList.add("d-none");
        }

        if (createPostFormContainerEl.classList.contains("d-none") === false) {
            createPostFormContainerEl.classList.add("d-none");
        }

        if (tasksFeedContainerEl.classList.contains("d-none") === true) {
            tasksFeedContainerEl.classList.remove("d-none");
        }

        statusContainerEl.innerHTML = "";
        tasksFeedContainerEl.innerHTML = "";
        noMoreFeedMsgContainerEl.innerHTML = "";

        spinnerEl.classList.remove("d-none");
        getRequestedInternTasks();

    }

    function getRequestedInternTasks() {
        let xhr = new XMLHttpRequest();
        xhr.open('GET','/my-tasks');
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                responseObj = JSON.parse(xhr.response);
                myTasks = Object.values(responseObj);
                displayMyTasks(myTasks)
                spinnerEl.classList.add("d-none");
            }
        }
        xhr.send();
    }

    function createAndAppendTask(eachTask) {
        let  {title, content, createdAt, author, authorUid, taskUid } = eachTask;

        let taskContainerEl = document.createElement("div");
        taskContainerEl.classList.add("shadow", "task");
        tasksFeedContainerEl.appendChild(taskContainerEl);

        let taskDetailsContainerEl = document.createElement("div");
        taskDetailsContainerEl.classList.add("task-details");
        taskContainerEl.appendChild(taskDetailsContainerEl);

        let authorEl = document.createElement("p");
        authorEl.textContent = author;
        taskDetailsContainerEl.appendChild(authorEl);

        let dateTimeEl = document.createElement("p");
        dateTimeEl.textContent = createdAt;
        taskDetailsContainerEl.appendChild(dateTimeEl);

        let titleEl = document.createElement("h4");
        titleEl.textContent = title;
        taskContainerEl.appendChild(titleEl);

        let contentEl = document.createElement("p");
        contentEl.textContent = content;
        taskContainerEl.appendChild(contentEl);

    }

    function displayMyTasks(tasks) {
        if (tasks.length === 0) {
            let noTaskEl = document.createElement("h3");
            noTaskEl.textContent = "Currently No Tasks to display";
            tasksFeedContainerEl.appendChild(noTaskEl);
        }else {
            for (eachTask of tasks) {
                createAndAppendTask(eachTask);
            }
        }
    }

    myTasksBtnEl.addEventListener('click', onDisplayMyTasks);


    // Task feed in home page


    let detailsContainerEl = document.getElementById('detailsContainer');

    var cursor = '';
    var loadingFeed = false;
    var exists = true;


    getTasks();

    let homeContentEl = document.getElementById("homeContent");

    homeContentEl.addEventListener('scroll', function(){
        let sh = homeContentEl.scrollHeight;
        let st = homeContentEl.scrollTop;
        let ch = homeContentEl.clientHeight;

        let scrolledHeight = st+ch;
        if (scrolledHeight === sh && exists && !loadingFeed) {
            spinnerEl.classList.remove("d-none");
            getTasks();
        }

    });

    function getTasks() {
        if (loadingFeed) return;

        loadingFeed = true;

        spinnerEl.classList.remove("d-none");
        const URL = '/all-tasks?cursor='+ cursor;
        let xhr = new XMLHttpRequest();
        xhr.open("GET", URL)
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                responseObj = JSON.parse(xhr.response);
                // console.log(responseObj);
                let tasksDict = responseObj.tasksDict;
                cursor = responseObj.cursor;
                exists = responseObj.exists;
                tasks = Object.values(tasksDict);
                // console.log(tasks);
                // console.log(cursor);
                // console.log(exists);
                spinnerEl.classList.add("d-none");
                displayTasks(tasks);
            }
        }
        xhr.send();
    }

    function createAndAppendTask(eachTask) {
        let  {title, content, createdAt, author, authorUid, taskUid } = eachTask;

        let taskContainerEl = document.createElement("div");
        taskContainerEl.classList.add("shadow", "task");
        tasksFeedContainerEl.appendChild(taskContainerEl);

        let taskDetailsContainerEl = document.createElement("div");
        taskDetailsContainerEl.classList.add("task-details");
        taskContainerEl.appendChild(taskDetailsContainerEl);

        let authorEl = document.createElement("p");
        authorEl.textContent = author;
        authorEl.setAttribute('id', authorUid);
        authorEl.addEventListener('click', function(event) {
            let uid = event.target.id;
            displaySelectedIntern(uid);
        });
        authorEl.style.cursor = "pointer";
        authorEl.addEventListener('mouseover', function(event) {
            event.target.style.color = "goldenrod";
        });
        authorEl.addEventListener('mouseout', function(event) {
            event.target.style.color = 'black';
        });
        taskDetailsContainerEl.appendChild(authorEl);

        let dateTimeEl = document.createElement("p");
        dateTimeEl.textContent = createdAt;
        taskDetailsContainerEl.appendChild(dateTimeEl);

        let titleEl = document.createElement("h4");
        titleEl.textContent = title;
        taskContainerEl.appendChild(titleEl);

        let contentEl = document.createElement("p");
        contentEl.textContent = content;
        taskContainerEl.appendChild(contentEl);
    }

    function displayTasks(tasks) {
        if (tasks.length === 0) {
            let noTaskEl = document.createElement("h3");
            noTaskEl.textContent = "Currently No Feed available to display";
            tasksFeedContainerEl.appendChild(noTaskEl);
        }else {
            for (eachTask of tasks) {
                createAndAppendTask(eachTask);
            }
        }

        if (!exists) {
            let noFeedMsgEl = document.createElement("p");
            noFeedMsgEl.textContent = "No more feed available to display";
            noFeedMsgEl.style.color = "red";
            noFeedMsgEl.style.textAlign = "center";
            noMoreFeedMsgContainerEl.appendChild(noFeedMsgEl);
        }

        loadingFeed = false;
    }
/*
    getTasks();

    function getTasks() {
        spinnerEl.classList.remove("d-none");
        let xhr = new XMLHttpRequest();
        xhr.open("GET", '/all-tasks')
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                responseObj = JSON.parse(xhr.response);
                let {tasksDict, cursor, exists} = responseObj;
                tasks = Object.values(tasksDict);
                spinnerEl.classList.add("d-none");
                displayTasks(tasks)
            }
        }
        xhr.send();
    }

    function displayTasks(tasks) {
        if (tasks.length === 0) {
            let noTaskEl = document.createElement("h3");
            noTaskEl.textContent = "Currently No Feed available to display";
            tasksFeedContainerEl.appendChild(noTaskEl);
        }else {
            for (eachTask of tasks) {
                createAndAppendTask(eachTask);
            }
        }
    }

    function createAndAppendTask(eachTask) {
        let  {title, content, createdAt, author, authorUid, taskUid } = eachTask;

        let taskContainerEl = document.createElement("div");
        taskContainerEl.classList.add("shadow", "task");
        tasksFeedContainerEl.appendChild(taskContainerEl);

        let taskDetailsContainerEl = document.createElement("div");
        taskDetailsContainerEl.classList.add("task-details");
        taskContainerEl.appendChild(taskDetailsContainerEl);

        let authorEl = document.createElement("p");
        authorEl.textContent = author;
        authorEl.setAttribute('id', authorUid);
        authorEl.addEventListener('click', function(event) {
            let uid = event.target.id;
            displaySelectedIntern(uid);
        });
        authorEl.style.cursor = "pointer";
        authorEl.addEventListener('mouseover', function(event) {
            event.target.style.color = "goldenrod";
        });
        authorEl.addEventListener('mouseout', function(event) {
            event.target.style.color = 'black';
        });
        taskDetailsContainerEl.appendChild(authorEl);

        let dateTimeEl = document.createElement("p");
        dateTimeEl.textContent = createdAt;
        taskDetailsContainerEl.appendChild(dateTimeEl);

        let titleEl = document.createElement("h4");
        titleEl.textContent = title;
        taskContainerEl.appendChild(titleEl);

        let contentEl = document.createElement("p");
        contentEl.textContent = content;
        taskContainerEl.appendChild(contentEl);
    }
*/

    // When user clicks on intern username in feed -- do display intern info and feed by chosen intern


    function displaySelectedIntern(internUid) {
        spinnerEl.classList.remove("d-none");

        detailsContainerEl.innerHTML = "";

        if (statusContainerEl.classList.contains("d-none") === false) {
            statusContainerEl.classList.add("d-none")
        }

        tasksFeedContainerEl.innerHTML = "";

        getDesiredInternData(internUid);
    }

    function getDesiredInternData(internId) {
        let url = `/intern-data?intern_id=${internId}`;
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        //xhr.setRequestHeader("Content-type", 'application/json');
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                responseObj = JSON.parse(xhr.response);
                showInternData(responseObj);
            }
        }
        xhr.send();
    }


    function showInternData(internObj) {
        spinnerEl.classList.add("d-none");

        let {username, email,mentors, tasks} = internObj;

        if (detailsContainerEl.classList.contains("d-none") === true) {
            detailsContainerEl.classList.remove("d-none");
        }

        let internInfoContainerEl = document.createElement("div");
        internInfoContainerEl.classList.add("intern-info-card", "shadow");
        detailsContainerEl.appendChild(internInfoContainerEl);

        let usernameEl = document.createElement("h4");
        usernameEl.textContent = username;
        internInfoContainerEl.appendChild(usernameEl);

        let emailEl = document.createElement("p");
        emailEl.textContent = email;
        internInfoContainerEl.appendChild(emailEl);

        mentorship = Object.values(mentors);
        if (mentorship.length !== 0) {

            let myMentorsHeadingEl = document.createElement("h6");
            myMentorsHeadingEl.textContent = "My Mentors";
            internInfoContainerEl.appendChild(myMentorsHeadingEl);

            for (eachMentor of mentorship) {
                let {username, uid} = eachMentor;

                let mentorEl = document.createElement("a");
                mentorEl.textContent = username;
                mentorEl.setAttribute('id',uid);
                mentorEl.style.cursor = 'pointer';
                mentorEl.style.color = 'blue';
                mentorEl.addEventListener('click', function(event) {
                    let uid = event.target.id;
                    displaySelectedMentor(uid);
                });
                internInfoContainerEl.appendChild(mentorEl);
            }

        }

        internTasks = Object.values(tasks);
        displayTasks(internTasks);
    }

    // When user clicks on mentor username in intern info -- do display mentor info and posts by interns under his mentorship

    function displaySelectedMentor(mentor_uid) {
        spinnerEl.classList.remove("d-none");

        detailsContainerEl.innerHTML = "";

        if (statusContainerEl.classList.contains("d-none") === false) {
            statusContainerEl.classList.add("d-none")
        }

        tasksFeedContainerEl.innerHTML = "";

        getDesiredMentorData(mentorUid=mentor_uid);
    }


    function getDesiredMentorData(mentorId) {
        let url = `/mentor-data?mentor_id=${mentorId}`;
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        //xhr.setRequestHeader("Content-type", 'application/json');
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                responseObj = JSON.parse(xhr.response);
                //console.log(responseObj);
                showMentorData(responseObj);
            }
        }
        xhr.send();
    }

    function showMentorData(mentorObj) {
        spinnerEl.classList.add("d-none");

        let {username, email, interns, tasks} = mentorObj;

        if (detailsContainerEl.classList.contains("d-none") === true) {
            detailsContainerEl.classList.remove("d-none");
        }

        let mentorInfoContainerEl = document.createElement("div");
        mentorInfoContainerEl.classList.add("intern-info-card", "shadow");
        detailsContainerEl.appendChild(mentorInfoContainerEl);

        let usernameEl = document.createElement("h4");
        usernameEl.textContent = username;
        mentorInfoContainerEl.appendChild(usernameEl);

        let emailEl = document.createElement("p");
        emailEl.textContent = email;
        mentorInfoContainerEl.appendChild(emailEl);

        internship = Object.values(interns);
        if (internship.length !== 0) {

            let myInternsHeadingEl = document.createElement("h6");
            myInternsHeadingEl.textContent = "Mentoring";
            mentorInfoContainerEl.appendChild(myInternsHeadingEl);

            for (eachIntern of internship) {
                let {username, uid} = eachIntern;

                let internEl = document.createElement("a");
                internEl.textContent = username;
                internEl.setAttribute('id',uid);
                internEl.style.cursor = 'pointer';
                internEl.style.color = 'blue';
                internEl.addEventListener('click', function(event) {
                    let uid = event.target.id;
                    displaySelectedIntern(uid);
                });
                mentorInfoContainerEl.appendChild(internEl);
            }

        }

        internTasksUnderMentor = Object.values(tasks);
        displayTasks(internTasksUnderMentor);
    }


    // on Home link selection


    let homeLinkEl = document.getElementById("homeLink");
    homeLinkEl.addEventListener('click', function() {
        if (detailsContainerEl.classList.contains('d-none') === false) {
            detailsContainerEl.classList.add("d-none");
        }


        if (createPostFormContainerEl.classList.contains("d-none") === false) {
            createPostFormContainerEl.classList.add("d-none");
        }

        if (tasksFeedContainerEl.classList.contains("d-none") === true) {
            tasksFeedContainerEl.classList.remove("d-none");
        }

        statusContainerEl.innerHTML = "";
        tasksFeedContainerEl.innerHTML = "";
        noMoreFeedMsgContainerEl.innerHTML = "";
        cursor = '';
        exists = true;
        getTasks();
    });
})