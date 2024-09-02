var uid = new ShortUniqueId();
const addBtn = document.querySelector(".add-btn")
const modalContainer = document.querySelector(".modal-cont");
const textArea = document.querySelector(".textarea-cont");
const colors = ["lightblue", "lightgreen", "pink", "orange"];
let priorityColor = colors[colors.length - 1]; //lightblue
const allPriorityColors = document.querySelectorAll(".priority-color");
const mainContainer = document.querySelector(".main-cont");
const toolBoxColors = document.querySelectorAll(".colors>*");
let ticketsArr = [];
const removeButton = document.querySelector(".fa-xmark");

var isModalPresent = false;

addBtn.addEventListener("click", function () {
    if (!isModalPresent){ // Display Modal
        modalContainer.style.display = "flex";
    }
    else{ // Hide the Modal
        modalContainer.style.display = "none";
    }
    isModalPresent = !isModalPresent;
});

// Creating tickets
window.addEventListener("keydown", function(event) {
    if (event.key == "Shift" && isModalPresent){
        // 1. Create a ticket
        createTicket(priorityColor, textArea.value);

        // 2. Clear the modal
        modalContainer.style.display = "none";
        isModalPresent = false;
        textArea.value = "";
    }
});

function createTicket(ticketColor, info, ticketID) {
    let id = ticketID || uid.rnd();                     
    let ticketContainer = document.createElement("div");
    ticketContainer.setAttribute("class", "ticket-cont");
    ticketContainer.innerHTML = `
        <div class = "ticket-color ${ticketColor}"></div>
        <div class = "ticket-id">${id}</div>
        <div class = "task-area">${info}</div>
        <div class = "lock">
            <i class="fa-solid fa-lock"></i>
        </div>
    `;
    mainContainer.appendChild(ticketContainer);

    // if ticket is created for first time, save it to local storage
    if (!ticketID){
        ticketsArr.push({
            ticketID : id,
            ticketColor,
            ticketTask: info
        });
        localStorage.setItem("tickets", JSON.stringify(ticketsArr));
    }

    handleRemoval(ticketContainer, id);
    handlePriorityColor(ticketContainer, id);
    handleLock(ticketContainer, id);
};

// Getting data from localStorage to re render the tickets
if (localStorage.getItem("tickets")){
    ticketsArr = JSON.parse(localStorage.getItem("tickets"));
    ticketsArr.forEach(ticketObj => {
        createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
    });
};

allPriorityColors.forEach(colorElement => {
    colorElement.addEventListener("click", function() {
        allPriorityColors.forEach(element => {
            element.classList.remove("active");
        });
        colorElement.classList.add("active");
        priorityColor = colorElement.classList[0];
    });
});



// getting the tickets based on ticket colors
for (let i = 0; i < toolBoxColors.length; i++){
    toolBoxColors[i].addEventListener("click", function() {
        let currColor = toolBoxColors[i].classList[0];
        let sortedTickets = ticketsArr.filter(ticketObj => ticketObj.ticketColor == currColor);

        let allTickets = document.querySelectorAll(".ticket-cont");
        allTickets.forEach(ticket => ticket.remove());

        sortedTickets.forEach(ticket => createTicket(ticket.ticketColor, ticket.ticketTask, ticket.ticketID));
    });

    // display all the tickets of all colors by double clicking any priority color
    toolBoxColors[i].addEventListener("dblclick", function() {
        // remove tickets of specific color from UI
        let uiTickets = document.querySelectorAll(".ticket-cont");
        uiTickets.forEach(ticket => ticket.remove());

        // display all the tickets
        ticketsArr.forEach(ticket => createTicket(ticket.ticketColor, ticket.ticketTask, ticket.ticketID));
    });
};


var isRemoveActive = false;

removeButton.addEventListener("click", function () {
    if (!isRemoveActive){ // if remove Button is not activated, activate it
        removeButton.style.color = "red";
    }
    else{  // de-activate it if it was already in use
        removeButton.style.color = "white";
    }
    isRemoveActive = !isRemoveActive;
});

// returns the index of ticket present in ticketsArr
function getTicketIdx(id) {
    let idx = ticketsArr.findIndex(ticketObj => {
        return ticketObj.ticketID == id;
    })
    return idx;
};

// Helps in removing the ticket from the frontend and saving in localstorage
function handleRemoval(ticketContainer, id) {
    ticketContainer.addEventListener("click", function () {
        if (!isRemoveActive) return;

        // Remove from ticketsArr
        let idx = getTicketIdx(id);
        ticketsArr.splice(idx, 1);
        // Update local Storage
        localStorage.setItem("tickets", JSON.stringify(ticketsArr));
        // Remove from UI
        ticketContainer.remove();
    });
};

// Change Priority of tickets when clicking on the color
function handlePriorityColor(ticketCont, id){
    let ticketColor = ticketCont.querySelector(".ticket-color");
    ticketColor.addEventListener("click", function (){
        let currColor = ticketColor.classList[1];
        let currColorIdx = colors.indexOf(currColor);
        let newColorIdx = (currColorIdx + 1) % 4;
        let newColor = colors[newColorIdx];
        ticketColor.classList.remove(currColor);
        ticketColor.classList.add(newColor);

        // Upddate local storage
        let idx = getTicketIdx(id);
        // Update the new ticket color in ticketArr
        ticketsArr[idx].ticketColor = newColor;
        localStorage.setItem("tickets", JSON.stringify(ticketsArr));
    });
};

// Unlock  class -> fa-lock-open
const unlock = "fa-lock-open";
function handleLock(ticketCont, id) {
    let ticketLock = ticketCont.querySelector(".lock");
    let lock = ticketLock.children[0];
    let lockClass = lock.classList[1]; 
    let ticketTaskArea = ticketCont.querySelector(".task-area");

    ticketLock.addEventListener("click", function () {
        if (lock.classList.contains(lockClass)) {
            // Remove lock class
            lock.classList.remove(lockClass);
            // Add unlock class
            lock.classList.add(unlock);
            // Make content editable
            ticketTaskArea.setAttribute("contenteditable", "true");
        } 
        else {
            lock.classList.remove(unlock);
            lock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable", "false");
        }

        let idx = getTicketIdx(id);
        ticketsArr[idx].ticketTask = ticketTaskArea.innerText;
        localStorage.setItem("tickets", JSON.stringify(ticketsArr));
    });
}
