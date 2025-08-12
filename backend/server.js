const router = require("./Routes/index");
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const cookieParser = require('cookie-parser')
const mongoose = require("mongoose");
require('dotenv').config();
// Connecter à MongoDB
const uri = process.env.MONGODB_URI;

// Connection to the database
mongoose
    .connect(uri)
    .then(() => {
        console.log('Connected to database');
    })
    .catch((error) => {
        console.log('Error connecting to database: ', error);
    });

// middleware to parse incoming requests

// middleware to parse cookies
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cookieParser());
// middleware to connect with frontend
app.use(cors({
    origin: ["https://extranet.assurnous.com"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-User-Role']
}));

// middleware to load routes
app.use('/', router);

const PORT = process.env.API_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;





