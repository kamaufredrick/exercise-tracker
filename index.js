const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Serve the HTML file on the root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

const users = [];
const exercises = {};

// Create a new user
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const userId = Math.random().toString(36).substring(2, 15);
  const newUser = { username, _id: userId };
  users.push(newUser);
  res.json(newUser);
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Add exercises for a user
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(404).send('User not found');

  const exerciseDate = date ? new Date(date).toDateString() : new Date().toDateString();
  const exercise = {
    description,
    duration: parseInt(duration),
    date: exerciseDate,
  };

  if (!exercises[_id]) exercises[_id] = [];
  exercises[_id].push(exercise);

  res.json({
    ...user,
    ...exercise,
  });
});

// Get user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(404).send('User not found');

  let logs = exercises[_id] || [];

  if (from) {
    const fromDate = new Date(from);
    logs = logs.filter(log => new Date(log.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    logs = logs.filter(log => new Date(log.date) <= toDate);
  }

  if (limit) {
    logs = logs.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: logs.length,
    _id: user._id,
    log: logs,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
