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
      const { family, type, referenceNumber, documentName } = req.body;
      const { id } = req.params; 
      const file = req.file;

      console.log("Received file:", file);
      console.log("Request body:", req.body);
      console.log("Chat ID:", id);
  
      if (!file) {
        return res.status(400).json({ 
          success: false,
          message: "No file uploaded" 
        });
      }
  
      // Validate file type
      if (file.mimetype !== 'application/pdf') {
        return res.status(400).json({
          success: false,
          message: "Only PDF files are allowed"
        });
      }
  
      // Upload to Firebase
      const firebaseResponse = await uploadToFirebase(file);
  
      const newDocument = new Document({
        family,
        type,
        referenceNumber: referenceNumber || undefined,
        documentName: documentName || undefined,
        firebaseStorageUrl: firebaseResponse.url,
        originalFileName: firebaseResponse.name,
        chat: id
      });
  
      await newDocument.save();
      
      res.status(201).json({
        success: true,
        data: {
          _id: newDocument._id,
          family: newDocument.family,
          type: newDocument.type,
          referenceNumber: newDocument.referenceNumber,
          documentName: newDocument.documentName,
          firebaseStorageUrl: newDocument.firebaseStorageUrl,
          uploadDate: newDocument.uploadDate
        }
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
        .populate("contract", "referenceNumber")
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

  // Delete a document
static async deleteDocument(req, res) {
  try {
    const { id } = req.params;
    
    // First get the document to delete (for Firebase cleanup if needed)
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: "Document not found" 
      });
    }
    await Document.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Document deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Failed to delete document"
    });
  }
}
}

module.exports = DocumentController;
