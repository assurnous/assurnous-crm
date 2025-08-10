const mongoose = require("mongoose");

const programSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    title: { type: String, required: true },
    mainText: { type: String, required: true },
    imageUrl: { type: String },
    coutAchat: {
      type: Number
    }, 
    fraisGestion:{
      type: Number
    }, 
    total: {
      type: Number,
      required: true,
    },
    surface: {
      type: String,
      enum: ["G", "HG"], // G or HG
    },
    taillePrixLabel: {
      type: String, // e.g., "100 mm - 140€"
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Program", programSchema);
