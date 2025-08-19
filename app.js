require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const auth = require('./middleware/auth');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');
});

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));
app.get('/dashboard', auth, (req, res) => {
  const username = req.user && req.user.username ? req.user.username : 'User';
  res.render('dashboard', { username });
});

app.get('/approval', auth, (req, res) => {
  const approvalLevel = req.user && typeof req.user.approvalLevel === 'number' ? req.user.approvalLevel : 0;
  res.render('approval', { approvalLevel });
});


const meetingsRoutes = require('./routes/meetings');
const adminRoutes = require('./routes/admin');
const spendingsRoutes = require('./routes/spendings');
const vaultRoutes = require('./routes/vault');
const licenseRoutes = require('./routes/license');
app.use('/', authRoutes);
app.use('/', meetingsRoutes);
app.use('/', adminRoutes);
app.use('/', spendingsRoutes);
app.use('/', vaultRoutes);
app.use('/', licenseRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
