const express = require('express');
const session = require('express-session');
const dotenv = require("dotenv").config();
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:4200',
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));
app.use(bodyParser.json());
app.use(session({
  secret: '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',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, sameSite: 'Lax' }
}));


app.use("/api/user", require("./routes/userRoutes"));

app.use('/api/product', require('./routes/productRoutes'));

app.use('/api/warehouse', require('./routes/warehouseRoutes'));

app.use('/api/session', require('./routes/sessionRoutes'));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});