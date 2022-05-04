const express = require('express');
const path = require('path');
const { clog } = require('./middleware/clog');
const api = require('./routes/index.js');

const PORT = process.env.PORT || 3001;

const app = express();
// Middleware to style command line responses
app.use(clog);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', api);

// Static middleware for serving assets in public folder
app.use(express.static('public'));

// GET route to homepage
app.get('/', (req, res) => res.sendFile(path.join(__dirname, './public/index.html')));

// GET route to notes page
app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, './public/notes.html')));

// Wildcard route to direct to homepage
app.get('*', (req, res) => res.sendFile(path.join(__dirname, './public/index.html')));

app.listen(PORT, () => 
    console.log(`App listening at http://localhost:${PORT} 🛸`)
);