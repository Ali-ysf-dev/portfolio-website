const express = require('express');
const path = require('path');
require('dotenv').config(); // This loads .env variables

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Serve config endpoint that returns .env variables
app.get('/api/config', (req, res) => {
    res.json({
        emailjs_public_key: process.env.EMAILJS_PUBLIC_KEY,
        emailjs_service_id: process.env.EMAILJS_SERVICE_ID,
        emailjs_template_id: process.env.EMAILJS_TEMPLATE_ID,
        contact_email: process.env.CONTACT_EMAIL
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment variables loaded from .env`);
});
