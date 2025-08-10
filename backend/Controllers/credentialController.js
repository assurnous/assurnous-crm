const Credential = require('../Models/credentialModel');

class CredentialController {
    static async createCredential(req, res) {
        try {
          // Validate required fields
          if (!req.body.itemValue || !req.body.itemLabel || !req.body.type) {
            return res.status(400).json({ message: "Missing required fields" });
          }
      
          const credential = new Credential({
            itemId: req.body.itemId,
            itemValue: req.body.itemValue,
            itemLabel: req.body.itemLabel,
            type: req.body.type,
            identifiant: req.body.identifiant,
            motDePasse: req.body.motDePasse,
            url: req.body.url
          });
      console.log("Creating credential:", credential);
          const newCredential = await credential.save();
          res.status(201).json(newCredential);
        } catch (err) {
          res.status(400).json({ 
            message: err.message,
            errors: err.errors // Include validation errors in response
          });
        }
      }
   static async getAllCredentials(req, res) {
    try {
        const credentials = await Credential.find();
        res.json(credentials);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
   }
   static async updateCredentialById(req, res) {
    try {
        const updatedCredential = await Credential.findByIdAndUpdate(
          req.params.id,
          {
            identifiant: req.body.identifiant,
            motDePasse: req.body.motDePasse,
            url: req.body.url,
            updatedAt: Date.now()
          },
          { new: true }
        );
        res.json(updatedCredential);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
   }
}

module.exports = CredentialController;