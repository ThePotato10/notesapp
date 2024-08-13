import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const port = 3000;

const __dirname = path.resolve(path.dirname(""));

app.use(express.static("public"));
app.use(express.json());
app.use(cors());

app.get("/", (_req, res, _next) => {
    console.log(__dirname);
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/get-notes", (_req, res, _next) => {
    fs.readFile("notes.json", "utf-8", (_err, data) => {
        res.json(data);
    });
});

app.post("/create-note", (req, res, next) => {
    function generateUID() {
        let uid = 0;

        for (let i = 0; i < 8; i++) {
            uid += (Math.floor(Math.random() * 10) * (10 ** i));
        }

        return uid;
    }

    let notes = JSON.parse(fs.readFileSync("notes.json").toString());

    let newNote = {
        id: generateUID(),
        dateCreated: Date.now(),
        dateLastEdited: Date.now(),
        text: req.body.text
    }

    notes.notes.push(newNote);

    fs.writeFileSync("notes.json", JSON.stringify(notes));
    res.sendStatus(204);
});

app.post("/edit-note", (req, res, next) => {
    let notes = JSON.parse(fs.readFileSync("notes.json").toString());

    let editedNote = notes.notes.map(note => {
        if (note.id === req.body.noteId) {
            note.text = req.body.text;
        }

        return note;
    });

    fs.writeFileSync("notes.json", JSON.stringify({notes: editedNote }));
    res.sendStatus(204);
});

app.post("/delete-note", (req, res, next) => {
    let notes = JSON.parse(fs.readFileSync("notes.json").toString());

    let deletedNote = notes.notes.filter(note => note.id !== req.body.noteId);

    console.log(deletedNote);

    fs.writeFileSync("notes.json", JSON.stringify({notes: deletedNote }));
    res.sendStatus(204);
});

app.listen(port, () => console.log("Server running on port " + port));