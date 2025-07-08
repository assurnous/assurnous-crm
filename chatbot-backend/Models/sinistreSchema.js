const mongoose = require('mongoose');

const sinistreSchema = new mongoose.Schema({
  // Information section
  numeroSinistre: {
    type: String,
    required: true,
    unique: true
  },

  // Sinistre section
  sinistreExist: {
    type: String,
    enum: ['oui', 'non'],
    required: true
  },
  sinistreSelect: {
    type: String,
    required: function() { return this.sinistreExist === 'oui'; }
  },
  sinistreInput: {
    type: String,
    required: function() { return this.sinistreExist === 'non'; }
  },

  // Contract section
  contratExist: {
    type: String,
    enum: ['oui', 'non'],
    required: true
  },
  contratSelect: {
    type: String,
    required: function() { return this.contratExist === 'oui'; }
  },
  contratInput: {
    type: String,
    required: function() { return this.contratExist === 'non'; }
  },

  // Details
  risque: {
    type: String,
    required: true
  },
  assureur: {
    type: String,
    required: true
  },

  // Détail du sinistre
  dateSinistre: {
    type: Date,
    required: true
  },
  dateDeclaration: {
    type: Date,
    required: true
  },
  statutSinistre: {
    type: String,
    enum: ['ouvert', 'ferme', 'attente'],
    required: true
  },
  typeSinistre: {
    type: String,
    required: true
  },
  responsabilite: {
    type: String,
    required: true
  },
  montantSinistre: {
    type: Number,
    required: true
  },
  delegation: {
    type: String,
    enum: ['oui', 'non'],
    required: true
  },
  expert: {
    type: String
  },
  gestionnaire: {
    type: String,
    required: true
  },

  // Timestamps and references
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commercial", // Referring to the Commercial model
      required: false, // If this is optional, you can make it not required
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // Referring to the Commercial model
      required: false, // If this is optional, you can make it not required
    },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
}, { timestamps: true });

const Sinistre = mongoose.model('Sinistre', sinistreSchema);

module.exports = Sinistre;