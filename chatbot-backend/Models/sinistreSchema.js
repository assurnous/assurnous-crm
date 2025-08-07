const mongoose = require('mongoose');

const sinistreSchema = new mongoose.Schema({
  // === INFORMATION ===
  numeroSinistre: {
    type: String,
    required: true,
    unique: true
  },

  // === LE SINISTRE ===
  sinistreExist: {
    type: String,
    enum: ['oui', 'non'],
    required: true
  },
  
  // When sinistré exists in CRM
  sinistreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: function() { return this.sinistreExist === 'oui'; }
  },
  
  // When sinistré doesn't exist in CRM
  sinistreNom: {
    type: String,
    required: function() { return this.sinistreExist === 'non'; }
  },
  sinistrePrenom: {
    type: String,
    required: function() { return this.sinistreExist === 'non'; }
  },
  sinistreInput: {
    type: String,
    required: function() { return this.sinistreExist === 'non'; }
  },

  // Contract information
  contratExist: {
    type: String,
    enum: ['oui', 'non'],
    required: false
  },
  contratId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contrat',
    required: function() { return this.contratExist === 'oui'; }
  },
  contratNumber: {
    type: String,
    required: function() { return this.contratExist === 'non'; }
  },

  // === DÉTAIL DU SINISTRE ===
  risque: {
    type: String,
    required: true,
  },
  assureur: {
    type: String,
    required: true,
  },
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
    required: true,
    enum: ['en_cours', 'clo', 'reouvert']
  },
  typeSinistre: {
    type: String,
    required: true,
    enum: ['dommage_corporel', 'dommage_materiel', 'dommage_corporel_matériel']
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
    required: true,
    enum: ['oui', 'non']
  },
  expert: {
    type: String
  },
    // session: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Commercial",
    //   required: false, // If this is optional, you can make it not required
    // },
    // session: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Admin", // Referring to the Commercial model
    //   required: false, // If this is optional, you can make it not required
    // },

    // session: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   refPath: 'sessionModel', // Dynamic reference
    //   required: false,
    // },
    // sessionModel: {
    //   type: String,
    //   enum: ['Admin', 'Commercial'],
    //   required: false,
    // },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'sessionModel',
      required: false,
      validate: {
        validator: function(v) {
          // Skip validation if null
          if (v === null) return true;
          
          // Check if valid ObjectId
          if (!mongoose.Types.ObjectId.isValid(v)) return false;
          
          // Check if reference exists
          return mongoose.model(this.sessionModel).exists({ _id: v });
        },
        message: props => `Invalid reference: ${props.value} for model ${this.sessionModel}`
      }
    },
    sessionModel: {
      type: String,
      enum: ['Admin', 'Commercial'],
      required: function() { return this.session !== null; }
    },

  // Metadata
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
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals for populated data
sinistreSchema.virtual('sinistreDetails', {
  ref: 'Chat',
  localField: 'sinistreId',
  foreignField: '_id',
  justOne: true
});

sinistreSchema.virtual('contratDetails', {
  ref: 'Contrat',
  localField: 'contratId',
  foreignField: '_id',
  justOne: true
});

const Sinistre = mongoose.model('Sinistre', sinistreSchema);

module.exports = Sinistre;