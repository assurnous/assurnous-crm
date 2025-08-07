const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  path: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['documents-courtier', 'documents-interlocuteurs', 'procedures-internes', 'archives']
  },
  size: { type: Number, required: true },
  type: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
});

module.exports = mongoose.model('Doc', documentSchema);