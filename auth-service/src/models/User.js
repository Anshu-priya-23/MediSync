const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['patient', 'admin'], default: 'patient' }
}, { timestamps: true });

// Modern Pre-Save Hook (No 'next' needed!)
userSchema.pre('save', async function() {
    // If password isn't being modified, just stop and return
    if (!this.isModified('password')) return; 
    
    // Hash the password automatically
    const salt = await bcrypt.genSalt(10); 
    this.password = await bcrypt.hash(this.password, salt); 
});

module.exports = mongoose.model('User', userSchema);