const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory user storage
// const users = [];

mongoose.connect('mongodb://localhost:27017/demo', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB');
});

const User = mongoose.model('User', {
    username: String,
    password: String,
    email: String,
    balance: Number
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.post('/signup', async (req, res) => {
    const { username, password, email } = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }
        // Create new user
        const newUser = new User({
            username,
            password,
            email,
            balance: 5000 // Set initial balance
        });
        await newUser.save();
        console.log('User created:', newUser);
        res.redirect('/welcome');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find user by username and password
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(401).send('Invalid username or password');
        }
        // Set cookie with user's username
        res.cookie('username', username);
        res.redirect('/welcome');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/logout', (req, res) => {
    // Clear the username cookie
    res.clearCookie('username');
    res.redirect('/login');
});

app.get('/welcome', (req, res) => {
    // Check if user is authenticated
    if (!req.cookies.username) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'views', 'welcome.html'));
});

// Add a route to fetch balance
app.get('/balance', async (req, res) => {
    try {
        const username = req.cookies.username; // Retrieve username from cookie
        if (!username) {
            return res.status(401).send('User not authenticated');
        }
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).send('User not found');
        }
        res.json({ balance: user.balance });
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add a route to handle sending money
app.post('/send-money', async (req, res) => {
    try {
        const { receiverUsername, amount } = req.body;
        console.log(receiverUsername, amount);
        const senderUsername = req.cookies.username; // Get sender's username from cookie
        console.log(senderUsername);
        if (!senderUsername) {
            return res.status(401).send('User not authenticated');
        }
        // Find sender and receiver by usernames
        const sender = await User.findOne({ username: senderUsername });
        const receiver = await User.findOne({ username: receiverUsername });
        if (!sender || !receiver) {
            return res.status(404).send('Sender or receiver not found');
        }
        // Check if sender has enough balance
        if (sender.balance < amount) {
            return res.status(400).send('Insufficient balance');
        }
        // Update balances
        sender.balance -= amount;
        receiver.balance += Number(amount);
        // Save updated balances
        await sender.save();
        await receiver.save();
        res.send('Money sent successfully');
    } catch (error) {
        console.error('Error sending money:', error);
        res.status(500).send('Internal Server Error');
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
