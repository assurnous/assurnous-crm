const mongoose = require("mongoose");

const PdfSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  date_debut: { type: Date, required: true }, 
  date_fin: { type: Date, required: true },    
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Pdf", PdfSchema);