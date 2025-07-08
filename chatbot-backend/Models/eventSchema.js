const mongoose = require('mongoose');

// Event Schema for Calendar
const eventSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin", 
        required: true,
      },
      session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Commercial", // Referring to the Commercial model
        required: false, // If this is optional, you can make it not required
      },
  event_date: { type: String, required: true }, // Store the date in YYYY-MM-DD format
  event_time: { type: String, required: true }, // Store the time as HH:mm
  objective: { type: String, required: true },
  comment: { type: String, required: false },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  nom: { type: String, required: true },
  createdBy: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'createdBy.userType'
    },
    userType: {
      type: String,
      enum: ['Admin', 'Commercial']
    },
    name: String
  },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
