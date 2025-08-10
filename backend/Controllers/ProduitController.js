const Produit = require("../Models/produitSchema");
const mongoose = require("mongoose");

class ProduitController {

  static async createProduit(req, res) {
    try {
      // Log the request body to check incoming data
      console.log('Request Body:', req.body);
      const leadId = req.body.leadId;
  
      const {session, code, marque, modele, description, coutAchat, total, fraisGestion,  surface, taillePrixLabel} = req.body;
      console.log("body", req.body)
  
      // const userId = admin || commercial;
  
      // if (!userId) {
      //   return res.status(400).json({ message: "Admin or Commercial ID must be provided." });
      // }
      // const existingProduit = await Produit.findOne({ lead: leadId });
      // if (existingProduit) {
      //   return res.status(409).json({ message: "Ce produit existe déjà pour ce lead." });
      // }
      const newProduit = new Produit({
        session,
        lead: leadId,
        code,
        marque,
        modele,  // Ensure this field is being passed
        description,
        coutAchat,
        total,
        fraisGestion,
        surface,
        taillePrixLabel
      });
      console.log('newProduit', newProduit)
      await newProduit.save();
      res.status(201).json(newProduit);
    } catch (error) {
      console.error("Error creating produit:", error);
      res.status(500).json({ message: "Failed to create produit." });
    }
  }
  
  
  
  static async getAllProduits(req, res) {
    const { id } = req.params;
    const session = req.userId;
    console.log('session', session)
    try {
      const produits = await Produit.find({ lead: id, session: session }).sort({ createdAt: -1 });
      res.status(200).json(produits);
    } catch (error) {
      console.error("Error fetching produits:", error);
      res.status(500).json({ message: "Failed to fetch produits." });
    }
  }

  static async updateProduitById(req, res) {
    const { id } = req.params;
    const {
      code,
      marque,
      modèle,
      description,
      coutAchat,
      total,
      fraisGestion,
      surface, taillePrixLabel
    } = req.body;

    try {
      const updatedProduit = await Produit.findByIdAndUpdate(
        id,
        {
          code,
          marque,
          modèle,
          description,
          coutAchat,
          total,
          fraisGestion,
          surface, taillePrixLabel
        },
        { new: true }
      );

      if (!updatedProduit) {
        return res.status(404).json({ message: "Produit not found." });
      }

      res.status(200).json(updatedProduit);
    } catch (error) {
      console.error("Error updating produit:", error);
      res.status(500).json({ message: "Failed to update produit." });
    }
  }
  static async deleteProduitById(req, res) {
    const { id } = req.params;
    try {
      const deletedProduit = await Produit.findByIdAndDelete(id);
      if (!deletedProduit) {
        return res.status(404).json({ message: "Produit not found." });
      }
      res.status(200).json({ message: "Produit deleted successfully." });
    } catch (error) {
      console.error("Error deleting produit:", error);
      res.status(500).json({ message: "Failed to delete produit." });
    }
  }
  static async getProduitById(req, res) {
    const { id } = req.params;
    console.log("Fetching product with ID:", id);
    try {
    
  
      // Convert string ID to ObjectId explicitly
      const product = await Produit.findById(new mongoose.Types.ObjectId(id));
  
      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé." });
      }
      res.status(200).json(product); // Return the product (not an array)
    } catch (error) {
      console.error("Erreur lors de la récupération du produit:", error);
      res.status(500).json({ message: "Échec de la récupération du produit." });
    }
  }
}

module.exports = ProduitController;
