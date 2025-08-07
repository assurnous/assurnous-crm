const mongoose = require('mongoose');
const { Schema } = mongoose;

const DocumentSchema = new Schema({
  url: { type: String, required: true },
  name: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const ContratSchema = new Schema({
  // === GENERAL INFORMATION ===
  changeStatus: {
    type: String,
    enum: ['oui', 'non'],
    required: false
  },

  // === CONTRACT DETAILS ===
  contractNumber: {
    type: String,
    required: false,
  },
  riskType: {
    type: String,
    required: false
  },
  insurer: {
    type: String,
    required: false
  },
  effectiveDate: {
    type: Date,
    required: false
  },
  anniversary: {
    type: String
  },
  competitionContract: {
    type: String,
    enum: ['oui', 'non']
  },
  isForecast: {
    type: 'boolean',
    default: false
  },
  paymentType: {
    type: String,
    enum: ['mensuel', 'trimestriel', 'annuel', 'prime_unique', 'semestriel', 'versements_libres']
  },
  status: {
    type: String,
    enum: ['en_cours', 'mise_en_demeure', 'reduit', 'resilie', 'sans_effet', 'suspendu', 'temporaire'],
    required: false
  },
  paymentMethod: {
    type: String,
    enum: ['cb', 'cheque', 'prelevement'],
    required: false
  },
  prime: {
    type: Number,
    // default: 10000.00
  },
  type_origine: {
    type: String,
    enum: ['co_courtage', 'indicateur_affaires', 'weedo_market', 'recommandation', 'reseaux_sociaux', 'autre']
  },

  // === MANAGEMENT ===
  gestionnaire: {
    type: String,
    required: false
  },
  cree_par: {
    type: String,
    required: false
  },
  intermediaire: {
    type: String,
    required: false
  },

  // === COMMISSIONS ===
  commissionRate: {
    type: Number,
    required: [false, 'Le taux de commission est obligatoire'],
  },
  recurrentCommission: {
    type: Number,
    required: [false, 'La commission récurrente est obligatoire'],
  },
  brokerageFees: {
    type: Number,
    required: [false, 'Les frais de courtage sont obligatoires'],
  },
  clientId: {
    type: String,
    required: false
  },


  // === ATTACHMENT ===
  courtier: {
    type: String,
    default: "Assurnous EAB assurances"
  },
  documents: [DocumentSchema],

  // === METADATA ===
  lead: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Chat", 
    required: false 
  },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commercial', // Changed from 'User' to 'Commercial'
      required: false
    },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add text index for search
ContratSchema.index({
  'contractNumber': 'text',
  'courtier': 'text',
  'status': 'text'
});

module.exports = mongoose.model('Contrat', ContratSchema);