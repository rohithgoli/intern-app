
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

    let detailsContainerEl = document.getElementById('detailsContainer');
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





    // Home link selection

    let homeLinkEl = document.getElementById("homeLink");
    homeLinkEl.addEventListener('click', function() {
        statusContainerEl.innerHTML = "";

        if (detailsContainerEl.classList.contains('d-none') === false) {
            detailsContainerEl.classList.add("d-none");
        }

        if (createInternFormContainerEl.classList.contains('d-none') === false) {
            createInternFormContainerEl.classList.add("d-none");
        }

        if (createMentorFormContainerEl.classList.contains('d-none') === false) {
            createMentorFormContainerEl.classList.add("d-none");
        }

        if (updateInternAccContainerEl.classList.contains('d-none') === false) {
            updateInternAccContainerEl.classList.add("d-none");
        }

        if (deleteMentorAccountFormContainerEl.classList.contains('d-none') === false) {
            deleteMentorAccountFormContainerEl.classList.add("d-none");
        }

        if (tasksFeedContainerEl.classList.contains('d-none') === true) {
            tasksFeedContainerEl.classList.remove("d-none");
        }
        tasksFeedContainerEl.innerHTML = "";
        getTasks();
    });


    // create Mentor Account


    let createMentorAccBtnEl = document.getElementById("createMentorAccBtn");
    let createMentorFormContainerEl = document.getElementById("createMentorFormContainer");
    let createMentorAccountFormEl = document.getElementById("createMentorAccountForm");

    function onCreateMentorAcc() {
        statusContainerEl.innerHTML = "";

        if (detailsContainerEl.classList.contains('d-none') === false) {
            detailsContainerEl.classList.add("d-none");
        }

        if (createInternFormContainerEl.classList.contains('d-none') === false) {
            createInternFormContainerEl.classList.add("d-none");
        }

        if (tasksFeedContainerEl.classList.contains('d-none') === false) {
            tasksFeedContainerEl.classList.add("d-none");
        }

        if (updateInternAccContainerEl.classList.contains('d-none') === false) {
            updateInternAccContainerEl.classList.add("d-none");
        }

        if (deleteMentorAccountFormContainerEl.classList.contains('d-none') === false) {
            deleteMentorAccountFormContainerEl.classList.add("d-none");
        }

        statusContainerEl.innerHTML = "";

        createMentorFormContainerEl.classList.remove("d-none");
    }

    createMentorAccountFormEl.addEventListener('submit', function(event) {
        event.preventDefault();
        new FormData(createMentorAccountFormEl);
    })

    createMentorAccountFormEl.addEventListener('formdata', function(event){
        let data = event.formData;

        let formObj = {};

        for (eachData of data) {
            formObj[eachData[0]] = eachData[1];
        }

        let stringifiedData = JSON.stringify(formObj);

        let xhr = new XMLHttpRequest();
        xhr.open("POST", '/create-mentor');
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

        document.getElementById("createMentorUsername").value = "";
        document.getElementById("createMentorEmail").value = "";
        document.getElementById("createMentorPassword").value = "";
    });

    createMentorAccBtnEl.addEventListener('click', onCreateMentorAcc);


    // create Intern Account


    let createInternAccBtnEl = document.getElementById("createInternAccBtn");
    let createInternFormContainerEl = document.getElementById("createInternFormContainer");
    let createInternAccountFormEl = document.getElementById("createInternAccountForm");

    function onCreateInternAcc() {
        statusContainerEl.innerHTML = "";

        if (detailsContainerEl.classList.contains('d-none') === false) {
            detailsContainerEl.classList.add("d-none");
        }

        if (createMentorFormContainerEl.classList.contains('d-none') === false) {
            createMentorFormContainerEl.classList.add("d-none");
        }

        if (tasksFeedContainerEl.classList.contains('d-none') === false) {
            tasksFeedContainerEl.classList.add("d-none");
        }

        if (updateInternAccContainerEl.classList.contains('d-none') === false) {
            updateInternAccContainerEl.classList.add("d-none");
        }

        if (deleteMentorAccountFormContainerEl.classList.contains('d-none') === false) {
            deleteMentorAccountFormContainerEl.classList.add("d-none");
        }

        statusContainerEl.innerHTML = "";
        createInternFormContainerEl.classList.remove("d-none");

        getExistingMentors();
    }

    function getExistingMentors() {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', '/mentors');
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                existingMentorsObj = JSON.parse(xhr.response);
                existingMentors = Object.keys(existingMentorsObj);
            } else if (xhr.status == 406) {
                msg=xhr.responseText;
                displayOperationFailure(msg);
            }
        }

        xhr.send();
    }

    createInternAccBtnEl.addEventListener('click', onCreateInternAcc);

    let adminInputForMentorToInternEl = document.getElementById("selectedMentorForIntern");

    function doSuggestMentors() {

        let inputValue = adminInputForMentorToInternEl.value.toLowerCase();

        let suggestionsContainerEl = document.getElementById("mentorSuggestionsContainerForIntern");
        suggestionsContainerEl.innerHTML = "";

        if (inputValue !== "") {
            for (eachMentor of existingMentors) {
                if (eachMentor.toLowerCase().includes(inputValue)) {
                    let suggestionEl = document.createElement("li");
                    suggestionEl.style.listStyleType = "none";
                    suggestionEl.textContent = eachMentor;
                    suggestionEl.id = existingMentorsObj[eachMentor];
                    suggestionEl.addEventListener('click', onSuggestionSelectionForCreateInternAcc);
                    suggestionsContainerEl.appendChild(suggestionEl);
                }
            }
        }
    }

    function onSuggestionSelectionForCreateInternAcc(event) {
        adminInputForMentorToInternEl.value = event.target.textContent;
        let suggestionsContainerEl = document.getElementById("mentorSuggestionsContainerForIntern");
        suggestionsContainerEl.innerHTML = "";

        doNextForCreateInternAccount();
    }

    adminInputForMentorToInternEl.addEventListener('keyup', doSuggestMentors);

    adminInputForMentorToInternEl.addEventListener('change', doNextForCreateInternAccount);

    let isMentorSelectionValidForCreateInternAccount;

    function doNextForCreateInternAccount() {
        let selectMentorForInternErrMsgEl = document.getElementById("selectMentorForInternErrMsg");
        let adminInputValue = adminInputForMentorToInternEl.value;

        let submitBtnContainerForCreateInternAccEl = document.getElementById("submitBtnContainerForCreateInternAcc");

        if (adminInputValue !== "" && existingMentors.includes(adminInputValue)) {
            selectMentorForInternErrMsgEl.textContent = "";
            isMentorSelectionValidForCreateInternAccount = true;
            submitBtnContainerForCreateInternAccEl.classList.remove("d-none");
        } else {
            selectMentorForInternErrMsgEl.textContent = "Please select valid mentor to proceed";
            selectMentorForInternErrMsgEl.style.color = "red";
            isMentorSelectionValidForCreateInternAccount = false;
            submitBtnContainerForCreateInternAccEl.classList.add("d-none")
        }
    }

    createInternAccountFormEl.addEventListener("submit", function(event) {
        event.preventDefault();
        new FormData(createInternAccountFormEl);
    });

    createInternAccountFormEl.addEventListener("formdata", function(event) {
        let data = event.formData;

        let formObj = {};

        for (eachData of data) {
            if (eachData[0] === "mentor") {
                formObj[eachData[0]] = existingMentorsObj[eachData[1]];
            } else {
                formObj[eachData[0]] = eachData[1];
            }
        }

        let stringifiedData = JSON.stringify(formObj);

        let xhr = new XMLHttpRequest();
        xhr.open("POST", '/create-intern');
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                msg = xhr.responseText;
                displayOperationSuccess(msg);
            } else {
                msg = xhr.responseText;
                displayOperationFailure(msg);
            }
        }
        xhr.send(stringifiedData);

        document.getElementById("createInternUsername").value = "";
        document.getElementById("createInternEmail").value = "";
        document.getElementById("createInternPassword").value = "";
        document.getElementById("selectedMentorForIntern").value = "";
    });


    // Update Intern Account

    let updateInternAccContainerEl = document.getElementById("adminChoiceUpdateInternContainer");
    let updateInternAccBtnEl = document.getElementById("updateInternAccBtn");

    let assignMentorFormContainerEl = document.getElementById("assignMentorFormContainer");
    let deleteAssignedMentorFormContainerEl = document.getElementById("deleteAssignedMentorFormContainer");
    let changeInternPasswordFormContainerEl = document.getElementById("changeInternPasswordFormContainer");
    let deleteInternAccountFormContainerEl = document.getElementById("deleteInternAccountFormContainer");


    function onUpdateInternAcc() {
        statusContainerEl.innerHTML = "";

        if (detailsContainerEl.classList.contains('d-none') === false) {
            detailsContainerEl.classList.add("d-none");
        }

        if (createMentorFormContainerEl.classList.contains('d-none') === false) {
            createMentorFormContainerEl.classList.add("d-none");
        }

        if (tasksFeedContainerEl.classList.contains('d-none') === false) {
            tasksFeedContainerEl.classList.add("d-none");
        }

        if (createInternFormContainerEl.classList.contains('d-none') === false) {
            createInternFormContainerEl.classList.add("d-none");
        }

        if (deleteMentorAccountFormContainerEl.classList.contains('d-none') === false) {
            deleteMentorAccountFormContainerEl.classList.add("d-none");
        }

        if (assignMentorFormContainerEl.classList.contains('d-none') === false) {
            assignMentorFormContainerEl.classList.add("d-none");
        }

        if (deleteAssignedMentorFormContainerEl.classList.contains('d-none') === false) {
            deleteAssignedMentorFormContainerEl.classList.add("d-none");
        }

        if (changeInternPasswordFormContainerEl.classList.contains('d-none') === false) {
            changeInternPasswordFormContainerEl.classList.add("d-none");
        }

        if (deleteInternAccountFormContainerEl.classList.contains('d-none') === false) {
            deleteInternAccountFormContainerEl.classList.add("d-none");
        }

        if (updateInternAccContainerEl.classList.contains('d-none') === true) {
            updateInternAccContainerEl.classList.remove("d-none");
        }

    }
    updateInternAccBtnEl.addEventListener('click', onUpdateInternAcc);


    // update intern acc - Assign Mentor

    let assignMentorChoiceBtnEl = document.getElementById('assignMentorChoiceBtn');
    let assignMentorFormEl = document.getElementById('assignMentorForm');

    let adminInputInternForAssigningMentorEl = document.getElementById("selectedInternForAssignMentor");
    let selectInternForAssigningMentorErrMsgEl = document.getElementById("selectInternForAssigningMentorErrMsg");
    let internSuggestionsContainerForAssigningMentorEl = document.getElementById("internSuggestionsContainerForAssigningMentor");

    let adminInputMentorForAssigningMentorEl = document.getElementById("selectedMentorForAssignMentor");
    let selectMentorForAssigningMentorErrMsgEl = document.getElementById("selectMentorForAssigningMentorErrMsg");
    let mentorSuggestionsContainerForAssigningMentorEl = document.getElementById("mentorSuggestionsContainerForAssigningMentor");

    function onAssignMentorChoice() {
        statusContainerEl.innerHTML = "";

        if (deleteAssignedMentorFormContainerEl.classList.contains('d-none') === false) {
            deleteAssignedMentorFormContainerEl.classList.add("d-none");
        }

        if (changeInternPasswordFormContainerEl.classList.contains('d-none') === false) {
            changeInternPasswordFormContainerEl.classList.add("d-none");
        }

        if (deleteInternAccountFormContainerEl.classList.contains('d-none') === false) {
            deleteInternAccountFormContainerEl.classList.add("d-none");
        }

        if (assignMentorFormContainerEl.classList.contains('d-none') === true) {
            assignMentorFormContainerEl.classList.remove("d-none");
        }

        adminInputInternForAssigningMentorEl.value = "";
        adminInputMentorForAssigningMentorEl.value = "";
        getAssignMentorFormData();
    }

    function getAssignMentorFormData() {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', '/interns-mentors');
        xhr.send();

        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                resultObject = JSON.parse(xhr.response);

                allInternsObject = resultObject.interns;
                allInterns = Object.keys(allInternsObject);

                allMentorsObject = resultObject.mentors;
                allMentors = Object.keys(allMentorsObject);
            }
        }
    }

    assignMentorChoiceBtnEl.addEventListener('click', onAssignMentorChoice);

    function doSuggestInternsForAssignMentor() {
        let inputValue = adminInputInternForAssigningMentorEl.value.toLowerCase();
        let suggestionsContainerEl = document.getElementById("internSuggestionsContainerForAssigningMentor");
        suggestionsContainerEl.innerHTML = "";
        if (inputValue !== "") {
            for (eachIntern of allInterns) {
                if (eachIntern.toLowerCase().includes(inputValue)) {
                    let suggestionEl = document.createElement("li");
                    suggestionEl.style.listStyleType = "none";
                    suggestionEl.textContent = eachIntern;
                    suggestionEl.id = allInternsObject[eachIntern];
                    suggestionEl.addEventListener('click', onInternSuggestionSelectionForAssignMentor);
                    suggestionsContainerEl.appendChild(suggestionEl);
                }
            }
        }
    }

    function onInternSuggestionSelectionForAssignMentor(event) {
        adminInputInternForAssigningMentorEl.value = event.target.textContent;
        let suggestionsContainerEl = document.getElementById("internSuggestionsContainerForAssigningMentor");
        suggestionsContainerEl.innerHTML = "";

        doNextToInternForAssigningMentor();
    }

    let mentorSelectionContainerForAssigningMentorEl = document.getElementById("mentorSelectionContainerForAssigningMentor");

    function doNextToInternForAssigningMentor() {
        if (mentorSelectionContainerForAssigningMentorEl.classList.contains("d-none") === false) {
            mentorSelectionContainerForAssigningMentorEl.classList.add("d-none");
        }

        if (assignMentorSubmitBtnContainerEl.classList.contains("d-none") === false) {
            assignMentorSubmitBtnContainerEl.classList.add("d-none");
        }

        let selectInternForAssigningMentorErrMsgEl = document.getElementById("selectInternForAssigningMentorErrMsg");
        let adminInputValue = adminInputInternForAssigningMentorEl.value;
        let isSelectionValid;
        if (adminInputValue !== "" && allInterns.includes(adminInputValue)){
            selectInternForAssigningMentorErrMsgEl.textContent = "";
            isSelectionValid = true;

        } else {
            selectInternForAssigningMentorErrMsgEl.textContent = "Please Input Valid Intern to proceed";
            selectInternForAssigningMentorErrMsgEl.style.color = "red";
            isSelectionValid = false;
        }

        if (isSelectionValid === true) {
            mentorSelectionContainerForAssigningMentorEl.classList.remove("d-none");
            adminInputMentorForAssigningMentorEl.value = "";
        }
    }

    adminInputInternForAssigningMentorEl.addEventListener('keyup', doSuggestInternsForAssignMentor);

    adminInputInternForAssigningMentorEl.addEventListener('change', doNextToInternForAssigningMentor);

    function doSuggestMentorsForAssignMentor() {
        let inputValue = adminInputMentorForAssigningMentorEl.value.toLowerCase();
        let suggestionsContainerEl = document.getElementById("mentorSuggestionsContainerForAssigningMentor");
        suggestionsContainerEl.innerHTML = "";
        if (inputValue !== "") {
            for (eachMentor of allMentors) {
                if (eachMentor.toLowerCase().includes(inputValue)) {
                    let suggestionEl = document.createElement("li");
                    suggestionEl.style.listStyleType = "none";
                    suggestionEl.textContent = eachMentor;
                    suggestionEl.id = allMentorsObject[eachMentor];
                    suggestionEl.addEventListener('click', onMentorSuggestionSelectionForAssignMentor);
                    suggestionsContainerEl.appendChild(suggestionEl);
                }
            }
        }
    }

    function onMentorSuggestionSelectionForAssignMentor(event) {
        adminInputMentorForAssigningMentorEl.value = event.target.textContent;
        let suggestionsContainerEl = document.getElementById("mentorSuggestionsContainerForAssigningMentor");
        suggestionsContainerEl.innerHTML = "";

        doNextToMentorForAssigningMentor();
    }

    let assignMentorSubmitBtnContainerEl = document.getElementById("assignMentorSubmitBtnContainer");

    function doNextToMentorForAssigningMentor() {
        if (assignMentorSubmitBtnContainerEl.classList.contains("d-none") === false) {
            assignMentorSubmitBtnContainerEl.classList.add("d-none");
        }

        let selectMentorForAssigningMentorErrMsgEl = document.getElementById("selectMentorForAssigningMentorErrMsg");
        let adminInputValue = adminInputMentorForAssigningMentorEl.value;
        let isSelectionValid;
        if (adminInputValue !== "" && allMentors.includes(adminInputValue)){
            selectMentorForAssigningMentorErrMsgEl.textContent = "";
            isSelectionValid = true;

        } else {
            selectMentorForAssigningMentorErrMsgEl.textContent = "Please Input Valid Mentor to proceed";
            selectMentorForAssigningMentorErrMsgEl.style.color = "red";
            isSelectionValid = false;
        }

        if (isSelectionValid === true) {
            assignMentorSubmitBtnContainerEl.classList.remove("d-none");
        }
    }

    adminInputMentorForAssigningMentorEl.addEventListener('keyup', doSuggestMentorsForAssignMentor);

    adminInputMentorForAssigningMentorEl.addEventListener('change', doNextToMentorForAssigningMentor);



    assignMentorFormEl.addEventListener('submit', function(event){
        event.preventDefault();
        new FormData(assignMentorFormEl);
    });

    assignMentorFormEl.addEventListener('formdata', function(event){
        let data = event.formData;

        let formObj = {};
        for (eachData of data) {
            if (eachData[0] == "mentor") {
                formObj[eachData[0]] = allMentorsObject[eachData[1]];
            }else {
                formObj[eachData[0]] = allInternsObject[eachData[1]];
            }
        }

        let stringifiedData = JSON.stringify(formObj);

        let xhr = new XMLHttpRequest();
        xhr.open("POST", "/assign-mentor");
        xhr.setRequestHeader("Content-type", "application/json");

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

        document.getElementById("selectedInternForAssignMentor").value = "";
        document.getElementById("selectedMentorForAssignMentor").value = "";
    });


    // For deleting Assigned Mentor to an Intern


    let deleteAssignedMentorChoiceBtnEl = document.getElementById("deleteAssignedMentorChoiceBtn");

    let deleteAssignedMentorFormEl = document.getElementById("deleteAssignedMentorForm");

    let adminInputForDeletingAssignedMentorEl = document.getElementById("selectedInternForDeletingAssignedMentor");
    let mentorSelectionContainerForDeletingAssignedMentorEl = document.getElementById("mentorSelectionContainerForDeletingAssignedMentor");

    function onDeleteAssignedMentor() {
        statusContainerEl.innerHTML = "";

        if (changeInternPasswordFormContainerEl.classList.contains('d-none') === false) {
            changeInternPasswordFormContainerEl.classList.add("d-none");
        }

        if (deleteInternAccountFormContainerEl.classList.contains('d-none') === false) {
            deleteInternAccountFormContainerEl.classList.add("d-none");
        }

        if (assignMentorFormContainerEl.classList.contains('d-none') === false) {
            assignMentorFormContainerEl.classList.add("d-none");
        }

        if (deleteAssignedMentorFormContainerEl.classList.contains('d-none') === true) {
            deleteAssignedMentorFormContainerEl.classList.remove("d-none");
        }

        getExistingInternsData();
    }

    function getExistingInternsData() {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', '/interns');
        xhr.send();

        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                internsObject = JSON.parse(xhr.response);
                availableInterns = Object.keys(internsObject);
            }
        }
    }

    deleteAssignedMentorChoiceBtnEl.addEventListener('click', onDeleteAssignedMentor);

    function doSuggestInterns() {
        let inputValue = adminInputForDeletingAssignedMentorEl.value.toLowerCase();
        let suggestionsContainerEl = document.getElementById("internSuggestionsContainerForDeletingAssignedMentor");
        suggestionsContainerEl.innerHTML = "";
        if (inputValue !== "") {
            for (eachIntern of availableInterns) {
                if (eachIntern.toLowerCase().includes(inputValue)) {
                    let suggestionEl = document.createElement("li");
                    suggestionEl.style.listStyleType = "none";
                    suggestionEl.textContent = eachIntern;
                    suggestionEl.id = internsObject[eachIntern];
                    suggestionEl.addEventListener('click', onSuggestionSelection);
                    suggestionsContainerEl.appendChild(suggestionEl);
                }
            }
        }
    }

    function onSuggestionSelection(event) {
        adminInputForDeletingAssignedMentorEl.value = event.target.textContent;
        let suggestionsContainerEl = document.getElementById("internSuggestionsContainerForDeletingAssignedMentor");
        suggestionsContainerEl.innerHTML = "";

        doNextForDeletingAssignedMentor();
    }

    function doNextForDeletingAssignedMentor() {
        if (mentorSelectionContainerForDeletingAssignedMentorEl.classList.contains("d-none") === false) {
            mentorSelectionContainerForDeletingAssignedMentorEl.classList.add("d-none");
        }

        let selectInternForDeletingAssignedMentorErrMsgEl = document.getElementById("selectInternForDeletingAssignedMentorErrMsg");
        let adminInputValue = adminInputForDeletingAssignedMentorEl.value;
        let isSelectionValid;
        if (adminInputValue !== "" && availableInterns.includes(adminInputValue)){
            selectInternForDeletingAssignedMentorErrMsgEl.textContent = "";
            isSelectionValid = true;
            mentorSelectionContainerForDeletingAssignedMentorEl.classList.remove("d-none");
        } else {
            selectInternForDeletingAssignedMentorErrMsgEl.textContent = "Please Input Valid Intern to proceed";
            selectInternForDeletingAssignedMentorErrMsgEl.style.color = "red";
            isSelectionValid = false;
        }

        if (isSelectionValid === true) {
            getCurrentMentorsForSelectedIntern(internsObject[adminInputValue]);
            let selectedMentorForDeletingAssignedMentorEl = document.getElementById("selectedMentorForDeletingAssignedMentor");
            selectedMentorForDeletingAssignedMentorEl.innerHTML = "";
        }
    }

    adminInputForDeletingAssignedMentorEl.addEventListener('keyup', doSuggestInterns);

    adminInputForDeletingAssignedMentorEl.addEventListener('change', doNextForDeletingAssignedMentor);

    function getCurrentMentorsForSelectedIntern(selectedInternUid) {
        let data = {"selectedInternUid": selectedInternUid };
        let stringifiedData = JSON.stringify(data);

        let xhr = new XMLHttpRequest();
        xhr.open("POST", '/mentors-for-intern');
        xhr.setRequestHeader("Content-type", "application/json");

        xhr.onreadystatechange = () => {

            if (xhr.readyState == 4 && xhr.status == 200) {
                assignedMentorsObj = JSON.parse(xhr.response);
                assignedMentors = Object.keys(assignedMentorsObj);
                displayCurrentAssignedMentors(assignedMentors);
            } else if (xhr.status == 406) {
                msg=xhr.responseText;
                displayOperationFailure(msg);
            }
        }
        xhr.send(stringifiedData);
    }

    function displayCurrentAssignedMentors(currentAssignedMentors) {
        let selectedMentorForDeletingAssignedMentorEl = document.getElementById("selectedMentorForDeletingAssignedMentor");
        for (eachExistingMentor of currentAssignedMentors) {
            let assignedMentorOptionEl = document.createElement("option");
            assignedMentorOptionEl.textContent = eachExistingMentor;
            selectedMentorForDeletingAssignedMentorEl.appendChild(assignedMentorOptionEl);
        }
    }

    deleteAssignedMentorFormEl.addEventListener('submit', function(event){
        event.preventDefault();
        new FormData(deleteAssignedMentorFormEl);
    });

    deleteAssignedMentorFormEl.addEventListener('formdata', function(event){
        let data = event.formData;

        let formObj = {};
        for (eachData of data){
            if (eachData[0] == "mentor") {
                formObj[eachData[0]] = assignedMentorsObj[eachData[1]];
            }else {
                formObj[eachData[0]] = internsObject[eachData[1]];
            }
        }
        let stringifiedData = JSON.stringify(formObj);

        let xhr = new XMLHttpRequest();
        xhr.open("POST", '/delete-assigned-mentor');
        xhr.setRequestHeader("Content-type", "application/json");

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

        document.getElementById("selectedInternForDeletingAssignedMentor").value = "";
        if (mentorSelectionContainerForDeletingAssignedMentorEl.classList.contains('d-none') == false) {
            mentorSelectionContainerForDeletingAssignedMentorEl.classList.add("d-none");
        }
    });



    // To reset Intern Account Password



    let changeInternPasswordBtnEl = document.getElementById("changeInternPasswordBtn");

    let changeInternPasswordFormEl = document.getElementById("changeInternPasswordForm");

    let adminInputForChangingInternAccountPasswordEl = document.getElementById("selectedInternForChangingAccountPassword");
    let internAccountNewPasswordContainerForChangingInternAccountPasswordEl = document.getElementById("internAccountNewPasswordContainer");

    function onChangeInternPassword() {

        statusContainerEl.innerHTML = "";

        if (deleteInternAccountFormContainerEl.classList.contains('d-none') === false) {
            deleteInternAccountFormContainerEl.classList.add("d-none");
        }

        if (assignMentorFormContainerEl.classList.contains('d-none') === false) {
            assignMentorFormContainerEl.classList.add("d-none");
        }

        if (deleteAssignedMentorFormContainerEl.classList.contains('d-none') === false) {
            deleteAssignedMentorFormContainerEl.classList.add("d-none");
        }

        if (changeInternPasswordFormContainerEl.classList.contains('d-none') === true) {
            changeInternPasswordFormContainerEl.classList.remove("d-none");
        }

        getExistingInternsData();
    }

    changeInternPasswordBtnEl.addEventListener('click', onChangeInternPassword);

    function doSuggestInternsForChangeInternAccountPassword() {
        let inputValue = adminInputForChangingInternAccountPasswordEl.value.toLowerCase();
        let suggestionsContainerEl = document.getElementById("internSuggestionsContainerForChangingAccountPassword");
        suggestionsContainerEl.innerHTML = "";
        if (inputValue !== "") {
            for (eachIntern of availableInterns) {
                if (eachIntern.toLowerCase().includes(inputValue)) {
                    let suggestionEl = document.createElement("li");
                    suggestionEl.style.listStyleType = "none";
                    suggestionEl.textContent = eachIntern;
                    suggestionEl.id = internsObject[eachIntern];
                    suggestionEl.addEventListener('click', onSuggestionSelectionForChangeInternAccountPassword);
                    suggestionsContainerEl.appendChild(suggestionEl);
                }
            }
        }
    }

    function onSuggestionSelectionForChangeInternAccountPassword(event) {
        adminInputForChangingInternAccountPasswordEl.value = event.target.textContent;
        let suggestionsContainerEl = document.getElementById("internSuggestionsContainerForChangingAccountPassword");
        suggestionsContainerEl.innerHTML = "";

        doNextForChangeInternAccountPassword();
    }

    function doNextForChangeInternAccountPassword() {
        if (internAccountNewPasswordContainerForChangingInternAccountPasswordEl.classList.contains("d-none") == false) {
            internAccountNewPasswordContainerForChangingInternAccountPasswordEl.classList.add("d-none");
        }

        let selectInternForChangingAccountPasswordErrMsgEl = document.getElementById("selectInternForChangingAccountPasswordErrMsg");

        let adminInputValue = adminInputForChangingInternAccountPasswordEl.value;
        let isSelectionValid;
        if (adminInputValue !== "" && availableInterns.includes(adminInputValue)) {
            selectInternForChangingAccountPasswordErrMsgEl.textContent = "";
            isSelectionValid = true;
            internAccountNewPasswordContainerForChangingInternAccountPasswordEl.classList.remove("d-none");
        } else{
            selectInternForChangingAccountPasswordErrMsgEl.textContent = "Please Input Valid Intern to proceed";
            selectInternForChangingAccountPasswordErrMsgEl.style.color = "red";
            isSelectionValid = false;
        }

        if (isSelectionValid == true) {
            changeInternPasswordFormEl.addEventListener("submit", function(event){
                event.preventDefault();
                new FormData(changeInternPasswordFormEl);
            });
        }
    }


    adminInputForChangingInternAccountPasswordEl.addEventListener('keyup', doSuggestInternsForChangeInternAccountPassword);

    adminInputForChangingInternAccountPasswordEl.addEventListener('change', doNextForChangeInternAccountPassword);

    changeInternPasswordFormEl.addEventListener('formdata', function(event){
        let data = event.formData;

        let formObj = {};
        for (eachData of data) {
            if (eachData[0] === "intern") {
                formObj[eachData[0]] = internsObject[eachData[1]]
            } else {
                formObj[eachData[0]] = eachData[1];
            }
        }

        let stringifiedData = JSON.stringify(formObj);

        let xhr = new XMLHttpRequest();
        xhr.open("POST", '/change-intern-password');
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                msg = xhr.responseText;
                displayOperationSuccess(msg);
            } else {
                msg = xhr.responseText;
                displayOperationFailure(msg);
            }
        }
        xhr.send(stringifiedData);

        document.getElementById("selectedInternForChangingAccountPassword").value = "";
        if (internAccountNewPasswordContainerForChangingInternAccountPasswordEl.classList.contains("d-none") === false) {
            internAccountNewPasswordContainerForChangingInternAccountPasswordEl.classList.add("d-none");
        }
    });



    //  To Delete Intern Account



    let deleteInternAccountChoiceBtnEl = document.getElementById("deleteInternAccountChoiceBtn");
    let deleteInternAccountFormEl = document.getElementById("deleteInternAccountForm");

    let adminInputForDeletingInternAccountEl = document.getElementById("selectedInternForDeletingInternAccount");
    let deleteInternAccountSubmitContainerEl = document.getElementById("deleteInternAccountSubmitContainer");

    function onDeleteInternAccount() {
        statusContainerEl.innerHTML = "";

        let msg = "Deleting Intern Account also deletes all his updates permanently";
        displayOperationInfo(msg);

        if (assignMentorFormContainerEl.classList.contains('d-none') === false) {
            assignMentorFormContainerEl.classList.add("d-none");
        }

        if (deleteAssignedMentorFormContainerEl.classList.contains('d-none') === false) {
            deleteAssignedMentorFormContainerEl.classList.add("d-none");
        }

        if (changeInternPasswordFormContainerEl.classList.contains('d-none') === false) {
            changeInternPasswordFormContainerEl.classList.add("d-none");
        }

        if (deleteInternAccountFormContainerEl.classList.contains('d-none') === true) {
            deleteInternAccountFormContainerEl.classList.remove("d-none");
        }

        getExistingInternsData();
    }

    deleteInternAccountChoiceBtnEl.addEventListener('click', onDeleteInternAccount);

    function doSuggestInternsForDeleteInternAccount() {
        let inputValue = adminInputForDeletingInternAccountEl.value.toLowerCase();
        let suggestionsContainerEl = document.getElementById("internSuggestionsContainerForDeleteInternAccount");
        suggestionsContainerEl.innerHTML = "";
        if (inputValue !== "") {
            for (eachIntern of availableInterns) {
                if (eachIntern.toLowerCase().includes(inputValue)) {
                    let suggestionEl = document.createElement("li");
                    suggestionEl.style.listStyleType = "none";
                    suggestionEl.textContent = eachIntern;
                    suggestionEl.id = internsObject[eachIntern];
                    suggestionEl.addEventListener('click', onSuggestionSelectionForDeleteInternAccount);
                    suggestionsContainerEl.appendChild(suggestionEl);
                }
            }
        }
    }

    function onSuggestionSelectionForDeleteInternAccount() {
        adminInputForDeletingInternAccountEl.value = event.target.textContent;
        let suggestionsContainerEl = document.getElementById("internSuggestionsContainerForDeleteInternAccount");
        suggestionsContainerEl.innerHTML = "";

        doNextForDeleteInternAccount();
    }

    function doNextForDeleteInternAccount() {
        if (deleteInternAccountSubmitContainerEl.classList.contains("d-none") == false) {
            deleteInternAccountSubmitContainerEl.classList.add("d-none");
        }

        let selectInternForDeleteInternAccountErrMsgEl = document.getElementById("selectInternForDeleteInternAccountErrMsg");

        let adminInputValue = adminInputForDeletingInternAccountEl.value;
        let isSelectionValid;
        if (adminInputValue !== "" && availableInterns.includes(adminInputValue)) {
            selectInternForDeleteInternAccountErrMsgEl.textContent = "";
            isSelectionValid = true;
            deleteInternAccountSubmitContainerEl.classList.remove("d-none");
        } else{
            selectInternForDeleteInternAccountErrMsgEl.textContent = "Please Input Valid Intern to proceed";
            selectInternForDeleteInternAccountErrMsgEl.style.color = "red";
            isSelectionValid = false;
        }

        if (isSelectionValid == true) {
            deleteInternAccountFormEl.addEventListener("submit", function(event){
                event.preventDefault();
                new FormData(deleteInternAccountFormEl);
            });
        }
    }


    adminInputForDeletingInternAccountEl.addEventListener('keyup', doSuggestInternsForDeleteInternAccount);

    adminInputForDeletingInternAccountEl.addEventListener('change', doNextForDeleteInternAccount);


    deleteInternAccountFormEl.addEventListener("formdata", function(event) {
        let data = event.formData;

        let formObj = {};
        for (eachValue of data) {
            formObj[eachValue[0]] = internsObject[eachValue[1]];
        }

        let stringifiedData = JSON.stringify(formObj);

        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/delete-intern-account');
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                msg = xhr.responseText;
                console.log(msg);
                displayOperationSuccess(msg);
            } else {
                msg = xhr.responseText;
                displayOperationFailure(msg);
            }
        }
        xhr.send(stringifiedData);

        document.getElementById("selectedInternForDeletingInternAccount").value = "";
        if (deleteInternAccountSubmitContainerEl.classList.contains("d-none") === false) {
            deleteInternAccountSubmitContainerEl.classList.add("d-none");
        }
    });



    // Delete Mentor Account


    let deleteMentorAccBtnEl = document.getElementById("deleteMentorAccBtn");
    let deleteMentorAccountFormContainerEl = document.getElementById("deleteMentorAccountFormContainer");
    let deleteMentorAccountFormEl = document.getElementById("deleteMentorAccountForm");

    let adminInputForDeletingMentorAccountEl = document.getElementById("selectedMentorForDeletingMentorAccount");
    let deleteMentorAccountSubmitContainerEl = document.getElementById("deleteMentorAccountSubmitContainer");

    function onDeleteMentorAccount() {
        statusContainerEl.innerHTML = "";

        let msg = "Please Make Sure that Mentor does not have any assigned Interns";
        displayOperationInfo(msg);

        if (detailsContainerEl.classList.contains('d-none') === false) {
            detailsContainerEl.classList.add("d-none");
        }

        if (createMentorFormContainerEl.classList.contains('d-none') === false) {
            createMentorFormContainerEl.classList.add("d-none");
        }

        if (createInternFormContainerEl.classList.contains('d-none') === false) {
            createInternFormContainerEl.classList.add("d-none");
        }

        if (tasksFeedContainerEl.classList.contains('d-none') === false) {
            tasksFeedContainerEl.classList.add("d-none");
        }

        if (updateInternAccContainerEl.classList.contains('d-none') === false) {
            updateInternAccContainerEl.classList.add("d-none");
        }

        if (deleteMentorAccountFormContainerEl.classList.contains('d-none') === true) {
            deleteMentorAccountFormContainerEl.classList.remove("d-none");
        }

        getExistingMentors();
    }

    deleteMentorAccBtnEl.addEventListener('click', onDeleteMentorAccount);

    function doSuggestMentorsForDeleteMentorAccount() {
        let inputValue = adminInputForDeletingMentorAccountEl.value.toLowerCase();
        let suggestionsContainerEl = document.getElementById("mentorSuggestionsContainerForDeleteMentorAccount");
        suggestionsContainerEl.innerHTML = "";
        if (inputValue !== "") {
            for (eachMentor of existingMentors) {
                if (eachMentor.toLowerCase().includes(inputValue)) {
                    let suggestionEl = document.createElement("li");
                    suggestionEl.style.listStyleType = "none";
                    suggestionEl.textContent = eachMentor;
                    suggestionEl.id = existingMentorsObj[eachMentor];
                    suggestionEl.addEventListener('click', onSuggestionSelectionForDeleteMentorAccount);
                    suggestionsContainerEl.appendChild(suggestionEl);
                }
            }
        }
    }

    function onSuggestionSelectionForDeleteMentorAccount() {
        adminInputForDeletingMentorAccountEl.value = event.target.textContent;
        let suggestionsContainerEl = document.getElementById("mentorSuggestionsContainerForDeleteMentorAccount");
        suggestionsContainerEl.innerHTML = "";

        doNextForDeleteMentorAccount();
    }

    function doNextForDeleteMentorAccount() {
        if (deleteMentorAccountSubmitContainerEl.classList.contains("d-none") == false) {
            deleteMentorAccountSubmitContainerEl.classList.add("d-none");
        }

        let selectMentorForDeleteMentorAccountErrMsgEl = document.getElementById("selectMentorForDeleteMentorAccountErrMsg");

        let adminInputValue = adminInputForDeletingMentorAccountEl.value;
        let isSelectionValid;
        if (adminInputValue !== "" && existingMentors.includes(adminInputValue)) {
            selectMentorForDeleteMentorAccountErrMsgEl.textContent = "";
            isSelectionValid = true;
            deleteMentorAccountSubmitContainerEl.classList.remove("d-none");
        } else{
            selectMentorForDeleteMentorAccountErrMsgEl.textContent = "Please Input Valid Mentor to proceed";
            selectMentorForDeleteMentorAccountErrMsgEl.style.color = "red";
            isSelectionValid = false;
        }

        if (isSelectionValid == true) {
            deleteMentorAccountFormEl.addEventListener("submit", function(event){
                event.preventDefault();
                new FormData(deleteMentorAccountFormEl);
            });
        }
    }


    adminInputForDeletingMentorAccountEl.addEventListener('keyup', doSuggestMentorsForDeleteMentorAccount);

    adminInputForDeletingMentorAccountEl.addEventListener('change', doNextForDeleteMentorAccount);


    deleteMentorAccountFormEl.addEventListener("formdata", function(event) {
        let data = event.formData;

        let formObj = {};
        for (eachValue of data) {
            formObj[eachValue[0]] = existingMentorsObj[eachValue[1]];
        }

        let stringifiedData = JSON.stringify(formObj);
        console.log(stringifiedData);
        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/delete-mentor-account');
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                msg = xhr.responseText;
                console.log(msg);
                displayOperationSuccess(msg);
            } else {
                msg = xhr.responseText;
                displayOperationFailure(msg);
            }
        }
        xhr.send(stringifiedData);

        document.getElementById("selectedMentorForDeletingMentorAccount").value = "";
        if (deleteMentorAccountSubmitContainerEl.classList.contains("d-none") === false) {
            deleteMentorAccountSubmitContainerEl.classList.add("d-none");
        }
    });





});
