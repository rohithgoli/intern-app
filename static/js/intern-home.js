
document.addEventListener('DOMContentLoaded', function() {

    let spinnerEl = document.getElementById("spinner");

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

    // create Post

    let postTaskBtnEl = document.getElementById("postTaskBtn");

    let createPostFormContainerEl = document.getElementById("createPostFormContainer");
    let createPostFormEl = document.getElementById("createPostForm");

    function onPostTask() {
        if (tasksFeedContainerEl.classList.contains("d-none") === false) {
            tasksFeedContainerEl.classList.add("d-none");
        }

        statusContainerEl.innerHTML = "";
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
        if (createPostFormContainerEl.classList.contains("d-none") === false) {
            createPostFormContainerEl.classList.add("d-none");
        }

        if (tasksFeedContainerEl.classList.contains("d-none") === true) {
            tasksFeedContainerEl.classList.remove("d-none");
        }

        statusContainerEl.innerHTML = "";
        tasksFeedContainerEl.innerHTML = "";
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

    getTasks();

    function getTasks() {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", '/all-tasks')
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                responseObj = JSON.parse(xhr.response);
                let {tasksDict, cursor, exists} = responseObj;
                tasks = Object.values(tasksDict);
                //console.log(tasks)
                displayMyTasks(tasks)
            }
        }
        xhr.send();
    }


    // on Home link selection


    let homeLinkEl = document.getElementById("homeLink");
    homeLinkEl.addEventListener('click', function() {
        if (createPostFormContainerEl.classList.contains("d-none") === false) {
            createPostFormContainerEl.classList.add("d-none");
        }

        if (tasksFeedContainerEl.classList.contains("d-none") === true) {
            tasksFeedContainerEl.classList.remove("d-none");
        }

        tasksFeedContainerEl.innerHTML = "";
        getTasks();
    });
})