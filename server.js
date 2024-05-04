const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory user storage
const users = [];

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    // Check if user already exists
    if (users.some(user => user.username === username)) {
        return res.status(400).send('User already exists');
    }
    // Create user object and add to users array
    const newUser = { username, password };
    users.push(newUser);
    res.redirect('/welcome');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Check if user exists
    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
        return res.status(401).send('Invalid username or password');
    }
    res.redirect('/welcome');
});

app.get('/welcome', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'welcome.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
