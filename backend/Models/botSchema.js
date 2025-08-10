const botSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    botName: { type: String, required: true },
    botConfiguration: { type: Object }, // Store bot flow and settings
    createdAt: { type: Date, default: Date.now },
    // Additional bot properties (e.g., active status, type of bot)
  });
  
  const Bot = mongoose.model('Bot', botSchema);
  module.exports = Bot;
  