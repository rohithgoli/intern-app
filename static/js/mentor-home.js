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

        let titleEl = document.createElement("h2");
        titleEl.textContent = title;
        taskContainerEl.appendChild(titleEl);

        let taskDetailsContainerEl = document.createElement("div");
        taskDetailsContainerEl.classList.add("task-details");
        taskContainerEl.appendChild(taskDetailsContainerEl);

        let authorEl = document.createElement("p");
        authorEl.textContent = author;
        taskDetailsContainerEl.appendChild(authorEl);

        let dateTimeEl = document.createElement("p");
        dateTimeEl.textContent = createdAt;
        taskDetailsContainerEl.appendChild(dateTimeEl);

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


    // get interns under his mentorship and upon clicking intern display intern details and feed by choosen intern

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

        internDetailsContainerEl.innerHTML = "";

        if (statusContainerEl.classList.contains("d-none") === false) {
            statusContainerEl.classList.add("d-none")
        }

        tasksFeedContainerEl.innerHTML = "";

        getDesiredInternData(internUid);
    }

    function getDesiredInternData(internId) {
        let url = `/intern-data?intern_id=${internId}`;
        let xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader("Content-type", 'application/json');
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                responseObj = JSON.parse(xhr.response);
                showInternData(responseObj);
            }
        }
        xhr.send();
    }

    let internDetailsContainerEl = document.getElementById('internDetailsContainer');

    function showInternData(internObj) {
        spinnerEl.classList.add("d-none");

        let {username, email, tasks} = internObj;

        if (internDetailsContainerEl.classList.contains("d-none") === true) {
            internDetailsContainerEl.classList.remove("d-none");
        }

        let internInfoContainerEl = document.createElement("div");
        internInfoContainerEl.classList.add("intern-info-card", "shadow");
        internDetailsContainerEl.appendChild(internInfoContainerEl);

        let usernameEl = document.createElement("h4");
        usernameEl.textContent = username;
        internInfoContainerEl.appendChild(usernameEl);

        let emailEl = document.createElement("p");
        emailEl.textContent = email;
        internInfoContainerEl.appendChild(emailEl);

        internTasks = Object.values(tasks);
        displayTasks(internTasks);
    }



    // Home link selection


    let homeLinkEl = document.getElementById("homeLink");
    homeLinkEl.addEventListener('click', function() {

        statusContainerEl.innerHTML = "";

        if (internDetailsContainerEl.classList.contains('d-none') === false) {
            internDetailsContainerEl.classList.add("d-none");
        }

        if (tasksFeedContainerEl.classList.contains('d-none') === true) {
            tasksFeedContainerEl.classList.remove("d-none");
        }

        tasksFeedContainerEl.innerHTML = "";
        spinnerEl.classList.remove("d-none");
        getTasks();

    });


});
