const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed password
  subscriptionPlan: { type: String, required: true }, // e.g., Basic, Pro, Premium
  createdAt: { type: Date, default: Date.now },
  // Other relevant fields
});

const Client = mongoose.model('Client', clientSchema);
module.exports = Client;
