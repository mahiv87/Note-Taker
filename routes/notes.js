const notes = require('express').Router();
const fs = require('fs');
const util = require('util');
const uuid = require('../helpers/uuid');

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
notes.get('/', (req, res) => {
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

// POST request to add a note
notes.post('/', (req, res) => {
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
notes.delete('/:id', (req, res) => {
    readFromFile('./db/db.json').then((data) => {
        let parsedData = JSON.parse(data);
        parsedData = parsedData.filter(({ id }) => id !== req.params.id);

        writeToFile('./db/db.json', parsedData);
        
        res.json(parsedData)
    })
    .catch((err) => { if (err) {console.error(err)} });
});

module.exports = notes;