const mongoose = require('mongoose');
const { Schema } = mongoose;

const DocumentSchema = new Schema({
  url: { type: String, required: true },       // Firebase download URL
  name: { type: String, required: true },     // Original filename
  path: { type: String, required: true },     // Firebase storage path
  size: { type: Number, required: true },     // File size in bytes
  type: { type: String, required: true },     // MIME type
  uploadedAt: { type: Date, default: Date.now }
});

const DevisSchema = new Schema({
  // === INFORMATION GENERALE ===
  courtier: {
    type: String,
    default: "Assurnous EAB assurances"
  },

  // === RISQUE ET ASSUREUR ===
  risque: {
    type: String,
    required: [false, 'Le risque est obligatoire']
  },
  assureur: {
    type: String,
    required: [false, "L'assureur est obligatoire"]
  },

  // === STATUT ET NUMERO ===
  statut: {
    type: String,
    enum: ['etude', 'devis_envoye', 'attente_signature', 'cloture_sans_suite'],
    required: [false, 'Le statut est obligatoire'],
    default: 'etude'
  },
  numero_devis: {
    type: String,
    required: [false, 'Le numéro de devis est obligatoire'],
    unique: true
  },

  // === DATES ===
  date_effet: {
    type: Date,
    required: [false, 'La date effet est obligatoire']
  },
  date_creation: {
    type: Date,
    default: Date.now
  },

  // === GESTION ET ORIGINE ===
  gestionnaire: {
   type: String,
    required: [false, 'Le gestionnaire est obligatoire']
  },
  type_origine: {
    type: String,
    enum: ['co_courtage', 'indicateur_affaires', 'weedo_market', 'recommandation', 'reseaux_sociaux', 'autre'],
    required: false
  },
  cree_par: {
    type: String,
    required: false
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commercial', // Changed from 'User' to 'Commercial'
    required: false
  },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: false },
  intermediaire: {
    type: String,
    required: false
  },


  // === BUDGET ===
  prime_proposee: {
    type: Number,
    required: [false, 'La prime proposée est obligatoire'],
    min: 0
  },
  prime_actuelle: {
    type: Number,
    min: 0
  },
  variation: {
    type: Number,
    default: 0
  },

  // === DOCUMENTS ===
  documents: [DocumentSchema],

  // Metadata
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
  timestamps: true,  // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// Add text index for search
DevisSchema.index({
  'numero_devis': 'text',
  'courtier': 'text',
  'statut': 'text'
});

module.exports = mongoose.model('Devis', DevisSchema);