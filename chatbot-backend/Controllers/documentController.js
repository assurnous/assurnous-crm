// controllers/documentController.js
const Document = require("../models/documentSchema");
const Chat = require("../Models/LeadsSchema");
const { bucket } = require("../firebase-storage");
const mongoose = require("mongoose");

// Upload document to Firebase Storage (same as before)
const uploadToFirebase = async (file) => {
  const blob = bucket.file(`documents/${Date.now()}_${file.originalname}`);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on("error", (err) => reject(err));
    blobStream.on("finish", async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      await blob.makePublic();
      resolve({
        url: publicUrl,
        name: file.originalname,
      });
    });
    blobStream.end(file.buffer);
  });
};
class DocumentController {
  // Create a new document for a specific chat/client
  static async createDocument(req, res) {
    try {
      const { family, type, referenceNumber, documentName, contractId, claimId } = req.body;
      const { id: chatId } = req.params; // Changed to match frontend
      const file = req.file;
  
      if (!file) {
        return res.status(400).json({ 
          success: false,
          message: "No file uploaded" 
        });
      }
  
      // Verify chat exists
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ 
          success: false,
          message: "Lead not found" 
        });
      }
  
      // Upload to Firebase Storage
      const { url, name } = await uploadToFirebase(file);
  
      const newDocument = new Document({
        family,
        type,
        referenceNumber: family === "client" && type !== "Autre document" ? 
          null : referenceNumber,
        documentName: type === "Autre document" ? documentName : null,
        firebaseStorageUrl: url,
        originalFileName: name,
        uploadedBy: req.user.id,
        chat: chatId,
        ...(family === "devis" && { contract: contractId }),
        ...(family === "reclamation" && { claim: claimId }),
      });
  
      await newDocument.save();
      
      res.status(201).json({
        success: true,
        data: newDocument
      });
      
    } catch (error) {
      console.error("Document creation error:", error);
      res.status(500).json({ 
        success: false,
        message: error.message || "Failed to create document"
      });
    }
  }

  // Get all documents for a specific chat/client
  static async getChatDocuments(req, res) {
    try {
      const { chatId } = req.params;
      const { family, type } = req.query;

      const filter = { chat: chatId };
      if (family) filter.family = family;
      if (type) filter.type = type;

      const documents = await Document.find(filter)
        .populate("uploadedBy", "name email")
        .populate("chat", "name") // Populate chat info
        .populate("contract", "referenceNumber")
        .populate("claim", "referenceNumber")
        .sort({ uploadDate: -1 });

      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get reference options for a specific chat
  static async getChatReferenceOptions(req, res) {
    try {
      const { chatId, family } = req.params;
      let options = [];

      switch (family) {
        case "devis":
          options = await mongoose
            .model("Contract")
            .find({ chat: chatId })
            .select("referenceNumber");
          break;
        case "reclamation":
          options = await mongoose
            .model("Claim")
            .find({ chat: chatId })
            .select("referenceNumber");
          break;
        case "sinistre":
          options = await mongoose
            .model("Incident")
            .find({ chat: chatId })
            .select("referenceNumber");
          break;
        default:
          return res.status(400).json({ error: "Invalid document family" });
      }

      res.json(
        options.map((opt) => ({
          id: opt._id,
          referenceNumber: opt.referenceNumber,
        }))
      );
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Other methods (getDocument, deleteDocument) remain the same as before
}

module.exports = DocumentController;
