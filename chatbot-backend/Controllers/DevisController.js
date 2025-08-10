const mongoose = require("mongoose");
const Devis = require("../Models/devisSchema");

class DevisController {
  static async createDevis(req, res) {
    const data = new Devis(req.body);


    await data.save();

    res.status(201).json(data);
  }
  static async getDevisById(req, res) {
    const { id } = req.params;
    // Get user info from headers instead of body
    const userId = req.headers['x-user-id'];
    const role = req.headers['x-user-role'];
  
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid Lead ID format" 
        });
      }
  
      const query = { lead: id };
      
      if (role !== 'admin') {
        query.session = userId;
      }
  
      const devis = await Devis.find(query)
        .populate('lead')
        .populate('session')
        .sort({ date_creation: -1 });
      
      res.status(200).json({
        success: true,
        data: devis
      });
  
    } catch (error) {
      console.error("Error fetching lead devis:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching devis",
        error: error.message
      });
    }
  }
  static async getAllDevis(req, res) {
    try {
      const devis = await Devis.find().populate('lead').populate('session').sort({ date_creation: -1 });
      res.status(200).json(devis);
    } catch (error) {
      res.status(500).json({ message: "Error fetching devis", error });
    }
  }

  // static async updateDevisById(req, res) {
  //   const { id } = req.params;
  //   const updateData = req.body;
  //   console.log("Update Data:", updateData);
  //   console.log("Devis ID:", id);

  //   try {
  //     const updatedDevis = await Devis.findByIdAndUpdate(id, updateData, {
  //       new: true,
  //     });
  //     if (!updatedDevis) {
  //       return res.status(404).json({ message: "Devis not found" });
  //     }
  //     res.status(200).json(updatedDevis);
  //   } catch (error) {
  //     res.status(400).json({ message: "Error updating devis", error });
  //   }
  // }
  static async updateDevisById(req, res) {
    const { devisId } = req.params; // More explicit parameter name
    const updateData = req.body;
  
  
    if (!mongoose.Types.ObjectId.isValid(devisId)) {
      return res.status(400).json({ message: "Invalid devis ID format" });
    }
  
    try {
      const updatedDevis = await Devis.findOneAndUpdate(
        { _id: devisId, lead: updateData.lead }, // Ensure devis belongs to this lead
        updateData,
        { new: true }
      );
      
      if (!updatedDevis) {
        return res.status(404).json({ message: "Devis not found for this lead" });
      }
      
      res.status(200).json(updatedDevis);
    } catch (error) {
      console.error("Update error:", error);
      res.status(400).json({ message: "Error updating devis", error: error.message });
    }
  }
  static async deleteDevisById(req, res) {
    const { id } = req.params;

    try {
      const deletedDevis = await Devis.findByIdAndDelete(id);
      if (!deletedDevis) {
        return res.status(404).json({ message: "Devis not found" });
      }
      res.status(200).json({ message: "Devis deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting devis", error });
    }
  }
}

module.exports = DevisController;
