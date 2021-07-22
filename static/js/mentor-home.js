document.addEventListener('DOMContentLoaded', function() {

    let statusContainerEl = document.getElementById("operationStatusContainer");

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

    // scroll for content
    /*
    let homeContentEl = document.getElementById("homeContent");

    homeContentEl.addEventListener('scroll', function() {
        console.log(homeContentEl.scrollY);
        console.log(homeContentEl.innerHeight);
        console.log(homeContentEl.scrollHeight);
        console.log(homeContentEl.clientHeight);
    })
    */


    // Display Tasks Feed on logging in

    const cursor = null;

    let tasksFeedContainerEl = document.getElementById("tasksFeedContainer");
    let spinnerEl = document.getElementById("spinner");

    getTasks();

    function getTasks() {
        spinnerEl.classList.remove("d-none");
        const URL = '/all-tasks?cursor='+ cursor;
        let xhr = new XMLHttpRequest();
        xhr.open("GET", URL)
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                responseObj = JSON.parse(xhr.response);
                // console.log(responseObj);
                let {tasksDict, cursor, exists} = responseObj;
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
        spinnerEl.classList.add("d-none");
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


    // get interns under his mentorship and upon clicking intern, display intern details and feed by choosen intern

    getMyInterns();

    function getMyInterns() {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', '/my-interns');
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                responseObj = JSON.parse(xhr.response);
                if (responseObj.internsAssigned === true) {
                    displayMyInternsList(responseObj.myInterns);
                }else {
                    displayMyInternsMsg();
                }
            }
        }
        xhr.send();
    }

    let myInternsListContainerEl = document.getElementById("myInternsListContainer");

    function displayMyInternsMsg() {
        let msgEl = document.createElement('li');
        msgEl.textContent = "Currently No Interns assigned to you";
        msgEl.style.color = 'red';
        myInternsListContainerEl.appendChild(msgEl);
    }

    function displayMyInternsList(internsData) {

        for (eachIntern of Object.values(internsData)) {
            let {username, uid} = eachIntern;

            let internEl = document.createElement('li');
            internEl.textContent = username;
            internEl.setAttribute('id', uid);
            internEl.style.cursor = 'pointer';
            internEl.addEventListener('click', function(event){
                let uid = event.target.id;
                displaySelectedIntern(uid);
            });
            myInternsListContainerEl.appendChild(internEl);
        }
    }

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

    let detailsContainerEl = document.getElementById('detailsContainer');

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
                console.log(responseObj);
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

    // Home link selection


    let homeLinkEl = document.getElementById("homeLink");
    homeLinkEl.addEventListener('click', function() {

        statusContainerEl.innerHTML = "";

        if (detailsContainerEl.classList.contains('d-none') === false) {
            detailsContainerEl.classList.add("d-none");
        }

        if (tasksFeedContainerEl.classList.contains('d-none') === true) {
            tasksFeedContainerEl.classList.remove("d-none");
        }

        tasksFeedContainerEl.innerHTML = "";
        getTasks();

    });


});
