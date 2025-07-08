// const mongoose = require("mongoose");

// const commentSchema = new mongoose.Schema({
//   text: { type: String, required: true },
//   addedBy: {
//     name: { type: String, required: true }, // Ensure `name` is marked as required
//   },
//   addedAt: { type: Date, default: Date.now },
// });

// const chatSchema = new mongoose.Schema(
//   {
//     nom: {
//       type: String,
//       // required: true,
//     },
//     codepostal: {
//       type: String,
//     },
//     address: {
//       type: String,
//     },
//     ville: {
//       type: String,
//     },
//     document: {
//       type: String,
//     },

//     email: {
//       type: String,
//       // required: true,
//       match: /.+\@.+\..+/, // Basic email format validation
//     },
//     email1: {
//       type: String,
//       // required: true,
//       match: /.+\@.+\..+/,
//     },
//     phone: {
//       type: String,
//       required: false,
//       default: "",
//       // unique: true,
//     },
//     // phone1: {
//     //   type: String,
//     //   required: false,
//     //   default: "",
//     //   // unique: true,
//     // },
//     phoneFix: {
//       type: String,
//       default: "",
//     },
//     prestation: {
//       type: String,
//       default: "",
//     },
//     societe: {
//       type: String,
//       default: "",
//     },

//     siret: {
//       type: Number,
//       default: "",
//     },
//     reglement: {
//       type: String,
//       default: "",
//     },
//     date: {
//       type: String,
//       required: false,
//     },

//     initial: {
//       type: String,
//       required: false,
//     },
//     type_propriété: {
//       type: String,
//       required: false,
//     },
//     logement: {
//       type: String,
//       required: false,
//     },
//     détails_logement: {
//       type: String,
//       required: false,
//     },
//     request_hot_water: {
//       type: String,
//       required: false,
//     },
//     request_heating_system: {
//       type: String,
//       required: false,
//     },
//     facture: {
//       type: String,
//       required: false,
//     },

//     type: { type: String, default: "prospect" },
//     // phone1: { type: String, default: "" },
//     // email1: { type: String, default: "" },
//     commentaires: [commentSchema],
//     commercial: { type: mongoose.Schema.Types.ObjectId, ref: "Commercial" },
//     // manager: { type: mongoose.Schema.Types.ObjectId, ref: "Manager" },
//   },
//   { timestamps: true }
// );

// const Chat = mongoose.model("Chat", chatSchema);

// module.exports = Chat;















const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  addedBy: {
    name: { type: String, required: true },
  },
  addedAt: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema(
  {
    // ===== GENERAL INFORMATION =====
    categorie: {
      type: String,
      required: true,
      enum: ["particulier", "professionnel", "entreprise"],
    },
    commercial: { type: mongoose.Schema.Types.ObjectId, ref: "Commercial" },
    statut: {
      type: String,
      required: true,
      enum: ["client", "prospect"],
    },
    civilite: {
      type: String,
      required: true,
      enum: ["monsieur", "madame", "mademoiselle", "societe"],
    },

    // ===== PERSONAL INFORMATION =====
    nom: {
      type: String,
      required: true,
    },
    commentaires: [commentSchema],
    nom_naissance: String,
    prenom: {
      type: String,
      required: true,
    },
    date_naissance: {
      type: Date,
      required: true,
    },
    pays_naissance: {
      type: String,
      required: true,
      enum: ["france", "belgique", "suisse", "autre"],
    },
    code_postal_naissance: String,
    commune_naissance: String,
    situation_famille: {
      type: String,
      required: true,
      enum: ["celibataire", "marie", "pacsé", "divorce", "veuf", "concubinage"],
    },
    enfants_charge: Number,

    // ===== ADDRESS INFORMATION =====
    numero_voie: {
      type: String,
      required: true,
    },
    complement_adresse: String,
    lieu_dit: String,
    code_postal: {
      type: String,
      required: true,
    },
    ville: {
      type: String,
      required: true,
    },
    bloctel: {
      type: String,
      required: true,
      enum: ["oui", "non"],
    },

    // ===== CONTACT INFORMATION =====
    portable: {
      type: String,
      required: true,
    },
    fixe: String,
    email: {
      type: String,
      required: true,
      match: /.+\@.+\..+/,
    },

    // ===== PROFESSIONAL INFORMATION =====
    // Fields for both professionnel and entreprise
    activite_entreprise: {
      type: String,
      required: function() { return this.categorie !== 'particulier'; }
    },
    categorie_professionnelle: {
      type: String,
      required: function() { return this.categorie !== 'particulier'; },
      enum: ["agriculteur", "artisan", "cadre", "prof_interm", "employe", "ouvrier", "retraite", "sans_activite"]
    },
    domaine_activite: {
      type: String,
      required: function() { return this.categorie !== 'particulier'; },
      enum: ["agriculture", "industrie", "construction", "commerce", "transport", "information", 
             "finance", "immobilier", "scientifique", "administratif", "public", "enseignement", 
             "sante", "art", "autre"]
    },

    // Fields specific to entreprise
    statut_juridique: {
      type: String,
      required: function() { return this.categorie === 'entreprise'; },
      enum: ["sarl", "eurl", "sas", "sasu", "sa", "sci", "micro", "ei", "autre"]
    },
    denomination_commerciale: {
      type: String,
      required: function() { return this.categorie === 'entreprise'; }
    },
    raison_sociale: String,
    date_creation: Date,
    siret: {
      type: String,
      required: function() { return this.categorie === 'entreprise'; },
      validate: {
        validator: function(v) {
          return /^\d{14}$/.test(v);
        },
        message: props => `${props.value} n'est pas un numéro SIRET valide!`
      }
    },
    forme_juridique: {
      type: String,
      enum: ["sarl", "eurl", "sas", "sa", "sci", "ei", "autre"]
    },
    telephone_entreprise: {
      type: String,
      required: function() { return this.categorie !== 'particulier'; }
    },
    email_entreprise: {
      type: String,
      required: function() { return this.categorie !== 'particulier'; },
      match: /.+\@.+\..+/
    },
    site_internet: {
      type: String,
      validate: {
        validator: function(v) {
          return /^(http|https):\/\/[^ "]+$/.test(v);
        },
        message: props => `${props.value} n'est pas une URL valide!`
      }
    },
    code_naf: {
      type: String,
      required: function() { return this.categorie !== 'particulier'; }
    },
    idcc: String,
    beneficiaires_effectifs: String,
    chiffre_affaires: Number,
    effectif: Number,
    periode_cloture: {
      type: String,
      enum: ["31/12", "30/06", "31/03", "30/09", "autre"]
    },

    // ===== SOCIAL SECURITY INFORMATION =====
    regime_securite_sociale: {
      type: String,
      required: true,
      enum: ["general", "agricole", "independant", "fonctionnaire", "autre"]
    },
    num_secu: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^[12][0-9]{2}[0-1][0-9](2[AB]|[0-9]{2})[0-9]{3}[0-9]{3}[0-9]{2}$/.test(v);
        },
        message: props => `${props.value} n'est pas un numéro de sécurité sociale valide!`
      }
    },

    // ===== MANAGEMENT INFORMATION =====
    type_origine: {
      type: String,
      required: true,
      enum: ["web", "reseau", "recommandation", "salon", "publicite", "autre"]
    },
    gestionnaire: {
      type: String,
      required: true
    },
    cree_par: {
      type: String,
      required: true,
    },
    intermediaire: [{
      type: String,
      enum: ["partenaire1", "partenaire2", "agent", "courtier"]
    }],
  },
  
  
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add index for better query performance
chatSchema.index({ nom: 1, prenom: 1 });
chatSchema.index({ email: 1 }, { unique: true, sparse: true });
chatSchema.index({ siret: 1 }, { unique: true, sparse: true });

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;