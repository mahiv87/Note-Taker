const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const uuid = require('./helpers/uuid');
const { clog } = require('./middleware/clog');

const PORT = process.env.PORT || 3001;

const app = express();
// Middleware to style command line responses
app.use(clog);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static middleware for serving assets in public folder
app.use(express.static('public'));

// GET route to homepage
app.get('/', (req, res) => res.sendFile(path.join(__dirname, './public/index.html')));

// GET route to notes page
app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, './public/notes.html')));

const readFromFile = util.promisify(fs.readFile);

// Function to write to json
const writeToFile = (destination, content) =>
    fs.writeFile(destination, JSON.stringify(content, null, '\t'), (err) =>
        err ? console.error(err) : console.info(`\nData written to ${destination}`)
);

// Function to read and append json
const readAndAppend = (content, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            const parsedData = JSON.parse(data);
            parsedData.push(content);
            writeToFile(file, parsedData);
        }
    });
};

// GET request for notes
app.get('/api/notes', (req, res) => {
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

// POST request to add a note
app.post('/api/notes', (req, res) => {
    const { title, text } = req.body;

    if (req.body) {
        const newNote = {
            title,
            text,
            id: uuid(),
        };

        readAndAppend(newNote, './db/db.json');
        res.json(`Note added successfully ✅`);
    } else {
        res.error(`Error in adding note ❌`);
    }
});

// Delete request to remove a specific note
app.delete('/api/notes/:id', (req, res) => {
    readFromFile('./db/db.json').then((data) => {
        let parsedData = JSON.parse(data);
        parsedData = parsedData.filter(({ id }) => id !== req.params.id);

        writeToFile('./db/db.json', parsedData);
        
        res.json(parsedData)
    })
    .catch((err) => { if (err) {console.error(err)} });
});

// Wildcard route to direct to homepage
app.get('*', (req, res) => res.sendFile(path.join(__dirname, './public/index.html')));

app.listen(PORT, () => 
    console.log(`App listening at http://localhost:${PORT} 🛸`)
);