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
  // referenceNumber: {
  //   type: String,
  //   required: function() {
  //     return this.family !== 'client' || this.type === 'Autre document';
  //   }
  // },
  referenceNumber: {
    type: String,
    required: function() {
      // Only require referenceNumber for:
      // - Non-client documents
      // - OR client documents of type "Autre document"
      if (this.family === 'client') {
        return this.type === 'Autre document';
      }
      // For devis, reclamation, sinistre, autres - make optional
      return false;
    }
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: false
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

  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract'
  },
});

module.exports = mongoose.model('Document', documentSchema);