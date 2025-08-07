const mongoose = require('mongoose');

// const reclamationSchema = new mongoose.Schema({
//   // === INFORMATION ===
//   numero_reclamation: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   date_reclamation: {
//     type: Date,
//     required: true
//   },
//   canal_reclamation: {
//     type: String,
//     enum: ['email', 'telephone', 'autre'],
//     required: true
//   },
//   date_accuse: {
//     type: Date
//   },
//   declarant: {
//     type: String,
//     required: true
//   },

//   existe_crm: {
//     type: String,
//     enum: ['oui', 'non'],
//     required: true
//   },
//   // Conditional fields based on existe_crm
//   nom_reclamant: {
//     type: String,
//     required: function() { return this.existe_crm === 'oui'; }
//   },
//   nom_reclamant_input: {
//     type: String,
//     required: function() { return this.existe_crm === 'non'; }
//   },
//   prenom_reclamant_input: {
//     type: String,
//     required: function() { return this.existe_crm === 'non'; }
//   },

//   // === DÉTAIL DE LA RÉCLAMATION ===
//   assureur: {
//     type: String,
//     required: true
//   },
//   motif: {
//     type: String,
//     required: true
//   },
//   service_concerne: {
//     type: String,
//     required: true
//   },
//   prise_en_charge_par: {
//     type: String,
//     required: true
//   },
//   niveau_traitement: {
//     type: String,
//     required: true
//   },
//   reference: {
//     type: String
//   },
//   commentaire: {
//     type: String
//   },
//   issue: {
//     type: String,
//     enum: ['resolue', 'en_attente']
//   },
//   session: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Commercial", // Referring to the Commercial model
//     required: false, // If this is optional, you can make it not required
//   },
//   session: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Admin", // Referring to the Commercial model
//     required: false, // If this is optional, you can make it not required
//   },
//   leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
//   // Metadata
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   updatedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
  
//   attachments: [{
//     name: String,
//     url: String,
//     uploadedAt: Date
//   }]
// }, { timestamps: true });

// const Reclamation = mongoose.model('Reclamation', reclamationSchema);

// module.exports = Reclamation;


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
    enum: ['courrier', 'mail', 'oral', 'telephone'],
    required: true
  },
  date_accuse: {
    type: Date,
    required: true
  },
  declarant: {
    type: String,
    enum: ['acpr', 'association_consommateurs', 'avocat', 'cnil', 'ddpp', 'mandataire', 'reclamant'],
    required: true
  },

  // === LE RÉCLAMANT ===
  statut_reclamant: {
    type: String,
    enum: ['ancient_client', 'ayant_droit', 'beneficiaire', 'client', 'prospect'],
    required: true
  },
  existe_crm: {
    type: String,
    enum: ['oui', 'non'],
    required: true
  },
  // Conditional fields
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
    enum: [
      // All your motif options from the form
      'demarchage', 'engagement_conteste', 'documents_contractuels', 
      'abus_faiblesse', 'premier_contrat_non_resilie', 'signature_contrat',
      // Add all other motif options...
    ],
    required: true
  },
  service_concerne: {
    type: String,
    enum: ['assureur', 'cabinet', 'courtier', 'partenaire', 'autre'],
    required: true
  },
  autre_service: {
    type: String,
    required: function() { return this.service_concerne === 'autre'; }
  },
  prise_en_charge_par: {
    type: String,
    required: true
  },
  niveau_traitement: {
    type: String,
    enum: ['1', '2', '2S', '3'],
    required: true
  },
  reference: String,
  commentaire: {
    type: String,
    required: true
  },
  issue: {
    type: String,
    enum: ['defavorable', 'defense_portefeuille', 'favorable', 'partielle'],
    required: true
  },

  // Session tracking (fixed duplicate field)
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

  // References
  leadId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Chat",
    required: false
  },
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
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for client details when exists in CRM
reclamationSchema.virtual('clientDetails', {
  ref: 'Client',
  localField: 'nom_reclamant',
  foreignField: '_id',
  justOne: true
});

const Reclamation = mongoose.model('Reclamation', reclamationSchema);
module.exports = Reclamation;