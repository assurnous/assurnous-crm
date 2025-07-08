const mongoose = require('mongoose');

const ManagerSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true });

const modelName = 'Manager';

if (mongoose.models[modelName]) {
    module.exports = mongoose.model(modelName);
} else {
    module.exports = mongoose.model(modelName, ManagerSchema);
}