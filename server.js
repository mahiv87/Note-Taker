const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const uuid = require('./helpers/uuid');
const { clog } = require('./middleware/clog');


const PORT = process.env.port || 3001;

const app = express();

app.use(clog);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, './public/notes.html')));

const readFromFile = util.promisify(fs.readFile);

const writeToFile = (destination, content) =>
    fs.writeFile(destination, JSON.stringify(content, null, '\t'), (err) =>
        err ? console.error(err) : console.info(`\nData written to ${destination}`)
);

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

app.get('/api/notes', (req, res) => {
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

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

app.delete('/api/notes/:id', (req, res) => {
    readFromFile('./db/db.json').then((data) => {
        let parsedData = JSON.parse(data);
        parsedData = parsedData.filter(({ id }) => id !== req.params.id);

        writeToFile('./db/db.json', parsedData);
        
        res.json(parsedData)
    });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, './public/index.html')));

app.listen(PORT, () => 
    console.log(`App listening at http://localhost:${PORT} 🛸`)
);