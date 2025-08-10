const Reclamation = require('../Models/reclamationSchema'); 
const mongoose = require('mongoose');

class ReclamationsController {
    static async getAllReclamations(req, res) {
        try {
            const reclamations = await Reclamation.find().populate('leadId').populate('session').sort({ date_creation: -1 });
            res.status(200).json({ message: "Fetched all reclamations", data: reclamations });
        } catch (error) {
        res.status(500).json({ error: error.message });
        }
    }
    
    static async createReclamation(req, res) {
     
        try {
           // Verify session model matches the actual user type
                if (req.body.session) {
                  const UserModel = mongoose.model(req.body.sessionModel);
                  const user = await UserModel.findById(req.body.session);
          
                  if (!user) {
                    throw new Error(`Referenced ${req.body.sessionModel} not found`);
                  }
          
                  console.log("Verified user:", {
                    id: user._id,
                    actualType: user.constructor.modelName,
                  });
                }
          
                const dataToSave = {
                  ...req.body,
                  session: req.body.session
                    ? new mongoose.Types.ObjectId(req.body.session)
                    : null,
                };
                console.log("Data to save:", dataToSave);
          
                const data = await Reclamation.create(dataToSave);
                console.log("Created reclamation:", data);
                res.status(201).json({ message: "Reclamation created successfully", data });
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
          console.log("Fetching rec for lead ID:", id);
          // Get user info from headers instead of body
          const userId = req.headers["x-user-id"];
          const role = req.headers["x-user-role"];
      
          try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
              return res.status(400).json({
                success: false,
                message: "Invalid Lead ID format",
              });
            }
      
            const query = { $or: [{ leadId: id }] };
      
            if (role !== "admin") {
              query.session = userId;
            }
      
            const reclamation = await Reclamation.find(query)
              .populate("leadId").populate("nom_reclamant")
              .populate({
                path: "session",
                options: { strictPopulate: false }, // Let refPath handle the model
              })
              .sort({ date_creation: -1 });   
              console.log("Fetched rec:", reclamation);  
      
            res.status(200).json({
              success: true,
              data: reclamation,
            });
          } catch (error) {
            console.error("Error fetching rec:", error);
            res.status(500).json({
              success: false,
              message: "Error fetching rec",
              error: error.message,
            });
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