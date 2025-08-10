const { bucket } = require('../firebase-storage');
const Devis = require('../Models/devisSchema');

class FileController {
  static async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          error: 'No file uploaded',
          details: 'Please provide a PDF file'
        });
      }

      const file = req.file;
      const sanitizedName = file.originalname.replace(/[^\w.-]/g, '_');
      const fileName = `${Date.now()}_${sanitizedName}`;
      const filePath = `devis-documents/${fileName}`;
      const fileUpload = bucket.file(filePath);

      // Create write stream with metadata
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
            uploadedBy: req.user?.id || 'anonymous' // If you have auth
          }
        }
      });

      blobStream.on('error', (error) => {
        console.error('Firebase upload error:', error);
        return res.status(500).json({
          success: false,
          error: 'Storage upload failed',
          details: error.message
        });
      });

      blobStream.on('finish', async () => {
        try {
          // Make file publicly accessible
          await fileUpload.makePublic();
          
          // Construct public URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

          // Respond with document metadata
          return res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            document: {
              url: publicUrl,
              name: file.originalname,
              path: filePath,
              size: file.size,
              type: file.mimetype,
              uploadedAt: new Date()
            }
          });
        } catch (error) {
          console.error('Error finalizing upload:', error);
          return res.status(500).json({
            success: false,
            error: 'Error finalizing upload',
            details: error.message
          });
        }
      });

      // Pipe the file buffer to Firebase
      blobStream.end(file.buffer);

    } catch (error) {
      console.error('Upload controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  }

  static async attachDocumentToDevis(req, res) {
    try {
      const { devisId, document } = req.body;

      if (!devisId || !document) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          details: 'Both devisId and document are required'
        });
      }

      const updatedDevis = await Devis.findByIdAndUpdate(
        devisId,
        { $push: { documents: document } },
        { new: true, runValidators: true }
      ).populate('gestionnaire createdBy');

      if (!updatedDevis) {
        return res.status(404).json({
          success: false,
          error: 'Devis not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Document attached successfully',
        devis: updatedDevis
      });

    } catch (error) {
      console.error('Attach document error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  }
}

module.exports = FileController;