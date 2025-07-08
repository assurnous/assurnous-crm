const mongoose = require('mongoose');

const reclamationSchema = new mongoose.Schema({
  // === INFORMATION ===
  numero_reclamation: {
    type: String,
    required: true,
    unique: true
  },
  date_reclamation: {
    type: Date,
    required: true
  },
  canal_reclamation: {
    type: String,
    enum: ['email', 'telephone', 'autre'],
    required: true
  },
  date_accuse: {
    type: Date
  },
  declarant: {
    type: String,
    required: true
  },

  existe_crm: {
    type: String,
    enum: ['oui', 'non'],
    required: true
  },
  // Conditional fields based on existe_crm
  nom_reclamant: {
    type: String,
    required: function() { return this.existe_crm === 'oui'; }
  },
  nom_reclamant_input: {
    type: String,
    required: function() { return this.existe_crm === 'non'; }
  },
  prenom_reclamant_input: {
    type: String,
    required: function() { return this.existe_crm === 'non'; }
  },

  // === DÉTAIL DE LA RÉCLAMATION ===
  assureur: {
    type: String,
    required: true
  },
  motif: {
    type: String,
    required: true
  },
  service_concerne: {
    type: String,
    required: true
  },
  prise_en_charge_par: {
    type: String,
    required: true
  },
  niveau_traitement: {
    type: String,
    required: true
  },
  reference: {
    type: String
  },
  commentaire: {
    type: String
  },
  issue: {
    type: String,
    enum: ['resolue', 'en_attente']
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
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  attachments: [{
    name: String,
    url: String,
    uploadedAt: Date
  }]
}, { timestamps: true });

const Reclamation = mongoose.model('Reclamation', reclamationSchema);

module.exports = Reclamation;