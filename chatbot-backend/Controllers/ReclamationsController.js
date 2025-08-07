const Reclamation = require('../Models/reclamationSchema'); 
const mongoose = require('mongoose');

class ReclamationsController {
    static async getAllReclamations(req, res) {
        try {
            const reclamations = await Reclamation.find().sort({ createdAt: -1 });
            res.status(200).json({ message: "Fetched all reclamations", data: reclamations });
        } catch (error) {
        res.status(500).json({ error: error.message });
        }
    }
    
    static async createReclamation(req, res) {
        try {
         const data = new Reclamation(req.body);
         await data.save();
        res.status(201).json({ message: "Reclamation created successfully" });
        } catch (error) {
        res.status(500).json({ error: error.message });
        }
    }

    // static async getReclamationById(req, res) {
    //   const { id } = req.params;
    //     // Get user info from headers instead of body
    //     const userId = req.headers["x-user-id"];
    //     const role = req.headers["x-user-role"];
    
    //     try {
    //       if (!mongoose.Types.ObjectId.isValid(id)) {
    //         return res.status(400).json({
    //           success: false,
    //           message: "Invalid Lead ID format",
    //         });
    //       }
    
    //       const query = { leadId: id };
    
    //       if (role !== "admin") {
    //         query.session = userId;
    //       }
    
    //       const reclamation = await Reclamation.find(query)
    //         .populate("leadId")
    //         .populate({
    //           path: "session",
    //           options: { strictPopulate: false }, // Let refPath handle the model
    //         })
    //         .populate("clientDetails")
    //         .sort({ date_creation: -1 });
    //       console.log("Fetched reclamations:", reclamation);
    
    //       res.status(200).json({
    //         success: true,
    //         data: reclamation,
    //       });
    //     } catch (error) {
    //       console.error("Error fetching lead reclamations:", error);
    //       res.status(500).json({
    //         success: false,
    //         message: "Error fetching devis",
    //         error: error.message,
    //       });
    //     }
    // }
    static async getReclamationById(req, res) {
        const { id } = req.params;
        const userId = req.headers["x-user-id"];
        const role = req.headers["x-user-role"];
      
        try {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Lead ID format" });
          }
      
          // Debug: Check if any reclamations exist for this lead
          const count = await Reclamation.countDocuments({ leadId: id });
          console.log(`Found ${count} reclamations for lead ${id}`);
      
          const query = { leadId: id };
          
          // Modified session filtering
          if (role !== "admin") {
            query.$or = [
              { session: userId },
              { 'session._id': userId }
            ];
          }
      
          const reclamations = await Reclamation.find(query)
            .populate({
              path: "leadId",
              model: "Chat" // Ensure this matches your model name
            })
            .populate({
              path: "session",
              options: { strictPopulate: false }
            })

            .sort({ date_creation: -1 });
      
          console.log("Raw query results:", reclamations);
          
          if (!reclamations.length) {
            return res.status(404).json({
              success: false,
              message: "No reclamations found for this lead",
              debug: {
                leadId: id,
                queryUsed: query
              }
            });
          }
      
          res.status(200).json({ success: true, data: reclamations });
      
        } catch (error) {
          console.error("Error:", error);
          res.status(500).json({ success: false, error: error.message });
        }
      }
    static async updateReclamationById(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            console.log("Update Data:", updateData);
            console.log("Reclamation ID:", id);

            const reclamation = await Reclamation.findByIdAndUpdate(new mongoose.Types.ObjectId(id), updateData, { new: true });
            if (!reclamation) {
                return res.status(404).json({ message: "Reclamation not found" });
            }
            res.status(200).json({ message: `Reclamation with ID: ${id} updated successfully` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteReclamationById(req, res) {
        try {
            const { id } = req.params;
           
            const reclamation = await Reclamation.findByIdAndDelete(new mongoose.Types.ObjectId(id));
            if (!reclamation) {
                return res.status(404).json({ message: "Reclamation not found" });
            }
            res.status(200).json({ message: `Reclamation with ID: ${id} deleted successfully` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ReclamationsController;