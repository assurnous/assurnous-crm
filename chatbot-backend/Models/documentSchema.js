// models/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  family: {
    type: String,
    required: true,
    enum: ['client', 'devis', 'reclamation', 'sinistre', 'autres']
  },
  type: {
    type: String,
    required: true
  },
  referenceNumber: {
    type: String,
    required: function() {
      return this.family !== 'client' || this.type === 'Autre document';
    }
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  documentName: {
    type: String,
    required: function() {
      return this.type === 'Autre document';
    }
  },
  firebaseStorageUrl: {
    type: String,
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract'
  },
});

module.exports = mongoose.model('Document', documentSchema);