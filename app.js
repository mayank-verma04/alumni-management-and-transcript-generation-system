require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

// Setup database
const db = require('./db');

// Setup body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Setup EJS
app.set('view engine', 'ejs');

// Setup static files
app.use(
  '/public',
  express.static(path.join(__dirname, 'public'), {
    maxAge: '1m',
    etag: true,
  })
);

// Routes
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');

app.use('/student', studentRoutes);
app.use('/admin', adminRoutes);

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/html/index.html'));
});

// For Wrong Routes redirect the user to " / "
app.use((req, res) => {
  res.redirect('/');
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(3000, () => {
  console.log(`Server started on port ${PORT}`);
});
