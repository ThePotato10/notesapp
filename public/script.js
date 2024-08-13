const markdownConverter = new showdown.Converter();
const htmlConverter = new TurndownService();

function formatTimestamp(timestamp) {
    const currentDate = new Date();
    const inputDate = new Date(timestamp);

    // Check if the date is today
    if (
        currentDate.getDate() === inputDate.getDate() &&
        currentDate.getMonth() === inputDate.getMonth() &&
        currentDate.getFullYear() === inputDate.getFullYear()
    ) {
        // Format time in "hh:mm"
        const hours = inputDate.getHours() % 12 || 12; // Convert to 12-hour format
        const minutes = inputDate.getMinutes().toString().padStart(2, '0');
        const period = inputDate.getHours() < 12 ? 'AM' : 'PM';
        return `${hours}:${minutes} ${period}`;
    } else {
        // Check if the date is within the last seven days
        const timeDifference = currentDate.getTime() - inputDate.getTime();
        const daysDifference = Math.floor(timeDifference / (24 * 60 * 60 * 1000));

        if (daysDifference < 7) {
            // Return the day of the week
            const daysOfWeek = ['on sunday', 'on monday', 'on tuesday', 'on wednesday', 'on thursday', 'on friday', 'on saturday'];
            const dayOfWeek = daysOfWeek[inputDate.getDay()];
            return dayOfWeek;
        } else {
            // Format date in "dd-mm-yyyy"
            const day = inputDate.getDate().toString().padStart(2, '0');
            const month = (inputDate.getMonth() + 1).toString().padStart(2, '0');
            const year = inputDate.getFullYear();
            return `on ${day}-${month}-${year}`;
        }
    }
}

async function loadNotes() {
    return await fetch("http://localhost:3000/get-notes").then(res => res.json());
}

function displayNotes() {
    document.querySelector(".notes").innerHTML = "";

    loadNotes().then(noteObj => {
        console.log(noteObj);

        JSON.parse(noteObj).notes.reverse().forEach(note => {
            document.querySelector(".notes").innerHTML += `
            <div class="note" id="note-id-${note.id}">
                <div class="note-content-wrapper">
                    <span class="note-text">${markdownConverter.makeHtml(note.text)}</span>
                    <hr/>
                    <p class="note-date">Created ${formatTimestamp(note.dateCreated)} | Last edited ${formatTimestamp(note.dateLastEdited)}</p>
                </div>
                <div class="note-button-box">
                    <button class="note-edit-button" onclick="setupEditNote(${note.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                        </svg>
                    </button>
                    <button class="note-delete-button" onclick="handleNoteDelete(${note.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                        </svg>
                    </button>
                </div>
            </div>
            `;
        })
    });
}

function setupEditNote(noteId) {
    const editedNote = document.querySelector("#note-id-" + noteId);
    const editbox = document.createElement("div");
    const textarea = document.createElement("textarea");
    const cancelButton = document.createElement("button");
    const buttonBox = document.createElement("div");

    cancelButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/></svg>';

    console.log(editedNote.children[0].children[0]);

    cancelButton.setAttribute("onclick", `displayNotes()`);
    textarea.setAttribute("onkeypress", `handleKeyPressEditNote(event, ${noteId})`);
    textarea.setAttribute("oninput", "autoResizeTextarea(this)");
    textarea.value = htmlConverter.turndown(editedNote.children[0].children[0].innerHTML);

    buttonBox.append(cancelButton);
    editbox.append(textarea, buttonBox);

    editedNote.children[0].children[0].replaceWith(editbox);
    editedNote.children[1].remove();

    autoResizeTextarea(textarea);
    textarea.focus();
}

function handleKeyPressNewNote(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        const currText = event.target.value;

        fetch("http://localhost:3000/create-note", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "text": currText
            })
        }).then(displayNotes()).then(() => event.target.value = "");
    }
}

function handleKeyPressEditNote(event, noteId) {
    if (event.key === "Enter" && !event.shiftKey) {
        const currText = event.target.value;

        fetch("http://localhost:3000/edit-note", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: currText,
                noteId: noteId
            })
        }).then(displayNotes());
    }
}

function handleNoteDelete(noteId) {
    fetch("http://localhost:3000/delete-note", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            noteId: noteId
        })
    }).then(displayNotes);
}

function autoResizeTextarea(e) {
    e.style.height = 'auto';
    e.style.height = (e.scrollHeight + 10) + 'px';
}

displayNotes();