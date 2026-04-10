require('dotenv').config();
const app = require('./src/app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5001;

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Auth Service is running on port ${PORT}`);
});

// Connect to Database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('📦 Connected to MongoDB!'))
    .catch((err) => console.error('MongoDB connection error:', err));
