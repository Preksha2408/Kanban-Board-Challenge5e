const taskDisplayEl = $(".swim-lanes");
const taskFormEl = $("#task-form");
const taskNameInputEl = $("#task-name-input");
const taskDateInputEl = $("#task-Due-Date");
const taskTypeInputEl = $("#task-description");

// Retrieve tasks and nextId from localStorage

function readTasksFromStorage() {
    let taskList = JSON.parse(localStorage.getItem("taskList"));
    if (!taskList) {
        taskList = [];
    }
    return taskList;
}

//Created a function that accepts an array of projects, stringifys them, and saves them in localStorage.

function saveTasksToStorage(taskList) {
    localStorage.setItem("taskList", JSON.stringify(taskList));
}

// created a function to generate a unique task id

function generateTaskId(event) {
    event.preventDefault();
    const taskName = taskNameInputEl.val();
    const taskType = taskTypeInputEl.val();
    const taskDate = taskDateInputEl.val();
    const newTask = {
        id: crypto.randomUUID(),
        name: taskName,
        type: taskType,
        dueDate: taskDate,
        status: "to-do",
    };
    const tasks = readTasksFromStorage();
    tasks.push(newTask);
    saveTasksToStorage(tasks);
    renderTaskList();
    taskNameInputEl.val("");
    taskTypeInputEl.val("");
    taskDateInputEl.val("");
}

// created a function to create a task card

function createTaskCard(task) {
    const newTaskCard = $("<div>");
    newTaskCard.addClass("card task-card draggable my-3");
    newTaskCard.attr("data-task-id", task.id);
    const cardHeader = $("<h4>");
    cardHeader.addClass("card-header h4");
    cardHeader.text(task.name);
    const cardBody = $("<div>");
    cardBody.addClass("card-body");
    const cardPara = $("<p>");
    cardPara.addClass("card-text");
    cardPara.text(task.type);
    const duePara = $("<p>");
    duePara.addClass("card-text");
    duePara.text(task.dueDate);
    const delBtn = $("<button>");
    delBtn.addClass("btn btn-danger delete");
    delBtn.text("Delete");
    delBtn.attr("data-task-id", task.id);

    if (task.dueDate && task.status !== "done") {
        const now = dayjs();
        const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");
        if (now.isSame(taskDueDate, "day")) {
            newTaskCard.addClass("bg-warning text-white");
        } else if (now.isAfter(taskDueDate)) {
            newTaskCard.addClass("bg-danger text-white");
            delBtn.addClass("border-light");
        }
    }

    cardBody.append(cardPara, duePara, delBtn);
    newTaskCard.append(cardHeader, cardBody);
    return newTaskCard;
}

//created a function to render the task list and make cards draggable
function renderTaskList() {
    const taskList = readTasksFromStorage();
    const todoList = $("#todo-cards");
    todoList.empty();
    const inProgressList = $("#in-progress-cards");
    inProgressList.empty();
    const doneList = $("#done-cards");
    doneList.empty();
    for (let task of taskList) {
        const newCard = createTaskCard(task);
        if (task.status === "to-do") {
            todoList.append(newCard);
        } else if (task.status === "in-progress") {
            inProgressList.append(newCard);
        } else {
            doneList.append(newCard);
        }
    }

    $(".draggable").draggable({
        opacity: 0.7,
        zIndex: 100,
        helper: function (e) {
            const original = $(e.target).hasClass("ui-draggable")
                ? $(e.target)
                : $(e.target).closest(".ui-draggable");
            return original.clone().css({
                width: original.outerWidth(),
            });
        },
    });
}

//created a function to handle deleting a task
function handleDeleteTask(event) {
    const taskId = $(this).attr("data-task-id");
    const taskList = readTasksFromStorage();
    for (let i = 0; i < taskList.length; i++) {
        if (taskList[i].id === taskId) {
            taskList.splice(i, 1);
        }
    }
    saveTasksToStorage(taskList);
    renderTaskList();
}

//create a function to handle dropping a task into a new status lane

function handleDrop(event, ui) {
    const taskList = readTasksFromStorage();
    const taskId = ui.draggable[0].dataset.taskId;
    const newStatus = event.target.id;
    for (let task of taskList) {
        if (task.id === taskId) {
            task.status = newStatus;
        }
    }
    saveTasksToStorage(taskList);
    renderTaskList();
}

taskFormEl.on("submit", generateTaskId);
taskDisplayEl.on("click", ".delete", handleDeleteTask);

//when the page loads, render's the task list, add's event listeners, make lanes droppable, and make the due date field a date picker

$(document).ready(function () {
    $("#task-Due-Date").datepicker({
        changeMonth: true,
        changeYear: true,
    });
    $(".lane").droppable({
        accept: ".draggable",
        drop: handleDrop,
    });
    $('#add-task-button').on('click', function() {
        $('#taskForm').collapse('toggle');
    });
    renderTaskList();
});


