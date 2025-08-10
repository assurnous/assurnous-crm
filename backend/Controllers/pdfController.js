const fs = require("fs");
const path = require("path");
const Pdf = require("../Models/pdfModel"); 
const multer = require("multer");

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage }).single("pdf");

class PdfController {
  static async uploadPdf (req, res) {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: "File upload failed" });
    }
    try {
      const newPdf = new Pdf({
        filename: req.file.originalname,
        path: req.file.path,
        date_debut: req.body.date_debut,
        date_fin: req.body.date_fin, 
      });
      await newPdf.save();
      res.status(201).json({ message: "PDF uploaded successfully!", pdf: newPdf });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });
};

// Download PDF
  static async downloadPdf(req, res) {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) {
      return res.status(404).json({ error: "PDF not found" });
    }
    res.download(pdf.path, pdf.filename); // Send the file
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
}

module.exports = PdfController;