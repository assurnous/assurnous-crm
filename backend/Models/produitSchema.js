const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  coutAchat: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  fraisGestion: {
    type: Number,
    default: 0,
  },
  tva: {
    type: Number,
    default: 10.00,
  },
  surface: {
    type: String,
  },
  taillePrixLabel: {
    type: String, // e.g., "100 mm -
    // 140€"
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: false,
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Commercial", // Referring to the Commercial model
    required: false, // If this is optional, you can make it not required
  },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }, 
}, {
  timestamps: true,
});

const Produit = mongoose.model('Produit', produitSchema);
module.exports = Produit;
