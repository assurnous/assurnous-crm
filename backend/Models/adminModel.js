const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    commercial: { type: mongoose.Schema.Types.ObjectId, ref: 'Commercial' }, 
}, {timestamps: true});

const Admin = mongoose.model('Admin', adminSchema);
exports.Admin = Admin;