const mongoose = require("mongoose");
const Contrat = require("../Models/contratSchema");

class ContratController {
  static async createContrat(req, res) {
    const data = new Contrat(req.body);

    await data.save();

    res.status(201).json(data);
  }
  static async getContratById(req, res) {
    const { id } = req.params;
    // Get user info from headers instead of body
    const userId = req.headers['x-user-id'];
    const role = req.headers['x-user-role'];
  
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid Contrat ID format"
        });
      }
  
      const query = { lead: id };
      
      if (role !== 'admin') {
        query.session = userId;
      }
  
      const contrat = await Contrat.find(query)
        .populate('lead')
        .populate('session')
        .sort({ date_creation: -1 });
      
      res.status(200).json({
        success: true,
        data: contrat
      });

  
    } catch (error) {
      console.error("Error fetching contrat:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching contrat",
        error: error.message
      });
    }
  }
  static async getAllContrats(req, res) {
    try {
      const contrats = await Contrat.find().populate('lead').populate('session').sort({ date_creation: -1 });
      res.status(200).json(contrats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching contrats", error });
    }
  }

 
  static async updateContratById(req, res) { // Updated method name
    const { contratId } = req.params; // More explicit parameter name
    const updateData = req.body;
   

  
    if (!mongoose.Types.ObjectId.isValid(contratId)) {
      return res.status(400).json({ message: "Invalid devis ID format" });
    }
  
    try {
      const updatedContrat = await Contrat.findOneAndUpdate( // Corrected to use Contrat model
        { _id: contratId, lead: updateData.lead }, // Ensure contrat belongs to this lead
        updateData,
        { new: true }
      );
      
      if (!updatedContrat) {
        return res.status(404).json({ message: "Contrat not found for this lead" });
      }
      
      res.status(200).json(updatedContrat);
    } catch (error) {
      console.error("Update error:", error);
      res.status(400).json({ message: "Error updating contrat", error: error.message });
    }
  }
  static async deleteContratById(req, res) {
    const { id } = req.params;

    try {
      const deletedContrat = await Contrat.findByIdAndDelete(id);
      if (!deletedContrat) {
        return res.status(404).json({ message: "Contrat not found" });
      }
      res.status(200).json({ message: "Contrat deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting contrat", error });
    }
  }
}

module.exports = ContratController;
