const mongoose = require("mongoose");

const CommandeSchema = new mongoose.Schema({
  command: {
    type: String,
    required: true,
    default: 'devis' // Default value if not provided
  },
  command_type: { type: String, enum: ["commande", "devis"], required: true },
  date: { type: Date, required: true },
  nom: String,
  siret: String,
  email: String,
  phone: String,
  codepostal: String,
  raissociale: String,
  ville: String,
  address: String,
  commercialName: { type: String },
  code: {
    type: [String],
    required: false,
  },
  description: {
    type: [String],
    required: false,
  },
  numCommand: {
    type: String,
    required: true,
  },
  originalNumCommand: {
    type: String,
    default: null,
  },
marque: String, 
  TVA: {
    type: Number,
  },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: false,
  },
  totalHT: {
    type: Number,
  },
  marge: {
    type: Number,
  },
  totalTTC: {
    type: Number,
  },
  totalTVA: {
    type: Number,
  },
  quantite: {
    type: Number,
  },

  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Commercial", // Referring to the Commercial model
    required: false, // If this is optional, you can make it not required
  },
});


module.exports = mongoose.model("Commande", CommandeSchema);
