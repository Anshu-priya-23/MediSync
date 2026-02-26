require('dotenv').config();
const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();

app.use(cors());
app.use(express.json());

// --- Requirement (i): Inter-service Communication ---
// Change your proxy line to this:
app.use('/api/auth', proxy('http://127.0.0.1:5001', {
    proxyReqPathResolver: (req) => {
        // This ensures that /api/auth/register becomes /api/auth/register 
        // on the Auth Service side too.
        return `/api/auth${req.url}`; 
    }
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Gateway Complete & Running on Port ${PORT}`);
});