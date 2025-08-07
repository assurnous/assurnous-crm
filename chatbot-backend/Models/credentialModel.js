// const mongoose = require('mongoose');

// const credentialSchema = new mongoose.Schema({
//   itemId: { type: Number, required: true },
//   itemValue: { type: String, required: true }, // This will store the 'value' from your constants
//   itemLabel: { type: String, required: true }, // This will store the 'label' from your constants
//   type: { type: String, required: true, enum: ['assureurs', 'risques'] },
//   identifiant: { type: String, required: true },
//   motDePasse: { type: String, required: true },
//   url: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Credential', credentialSchema);
const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema({
  itemId: { type: Number, required: true },
  itemValue: { type: String, required: function() { return this.isNew; } }, // Only required for new docs
  itemLabel: { type: String, required: true },
  type: { type: String, required: true, enum: ['assureurs', 'risques'] },
  identifiant: { type: String, required: true },
  motDePasse: { type: String, required: true },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Credential', credentialSchema);