const { bucket } = require('../firebase-storage');
const Doc = require('../Models/listeconformiteModel');

class ListConfimiteController {
  static async uploadDocument(req, res) {
    try {
      console.log("Upload request received. Files:", req.file);
      console.log("Body:", req.body);
      
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      if (!req.body.category) {
        return res.status(400).json({ message: 'Category is required' });
      }

      const blob = bucket.file(`documents/${req.body.category}/${Date.now()}_${req.file.originalname}`);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      blobStream.on('error', (error) => {
        console.error('Upload error:', error);
        return res.status(500).json({ message: 'Error uploading file' });
      });

      blobStream.on('finish', async () => {
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

        const document = new Doc({
          name: req.body.name || req.file.originalname,
          url: publicUrl,
          path: blob.name,
          category: req.body.category,
          size: req.file.size,
          type: req.file.mimetype,
          createdBy: req.userId
        });

        await document.save();
        res.status(201).json(document);
      });

      blobStream.end(req.file.buffer);
    } catch (error) {
      console.error("Controller error:", error);
      res.status(500).json({ message: error.message });
    }
}
      
      static async getDocuments(req, res) {
        try {
          const { category } = req.query;
          const query = category ? { category } : {};
          const documents = await Doc.find(query);
          res.json(documents);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      };
      
      static async downloadDocument(req, res) {
        try {
          const document = await Doc.findById(req.params.id);
          if (!document) {
            return res.status(404).json({ message: 'Document not found' });
          }
      
          // Redirect to Firebase Storage URL
          res.redirect(document.url);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      };
      
      static async deleteDocument(req, res) {
        try {
          const document = await Doc.findByIdAndDelete(req.params.id);
          if (!document) {
            return res.status(404).json({ message: 'Document not found' });
          }
      
          // Delete file from Firebase Storage
          const file = bucket.file(document.path);
          await file.delete();
      
          res.json({ message: 'Document deleted successfully' });
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      };
    

}

module.exports = ListConfimiteController;