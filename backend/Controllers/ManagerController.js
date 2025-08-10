const ManagerSchema = require("../Models/managerModel");
const bcrypt = require("bcrypt");

class ManagerController {
    static createManager = async (req, res) => {
        const { nom, prenom, email, password } = req.body;
    
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          const newCommercial = new ManagerSchema({
            nom,
            prenom,
            email,
            password: hashedPassword,
          });
          const savedCommercial = await newCommercial.save();
          res.status(201).json(savedCommercial);
        } catch (error) {
          res
            .status(400)
            .json({
              message: "Erreur lors de la création du commercial",
              details: error.message,
            });
        }
      };
    
      static getAllManager = async (req, res) => {
        try {
          const commercials = await ManagerSchema.find();
          res.status(200).json(commercials);
        } catch (error) {
          res
            .status(500)
            .json({ message: "Erreur serveur", details: error.message });
        }
      };
    
    
      static getManagerById = async (req, res) => {
        try {
          const commercial = await ManagerSchema.findById(req.params.id);
          console.log("commercial", commercial);
          if (!commercial) {
            return res.status(404).json({ message: "Commercial not found" });
          }
          res.json(commercial);
        } catch (error) {
          res.status(500).json({ message: "Error fetching commercial", error });
        }
      };
    
      static updateManagerById = async (req, res) => {
        const { id } = req.params;
        const { nom, prenom, email, password } = req.body;
    
        try {
          const updateData = { nom, prenom, email };
          if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
          }
    
          const updatedCommercial = await ManagerSchema.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
          );
    
          if (!updatedCommercial) {
            return res.status(404).json({ message: "Commercial non trouvé" });
          }
    
          res.status(200).json(updatedCommercial);
        } catch (error) {
          res
            .status(400)
            .json({
              message: "Erreur lors de la mise à jour du commercial",
              details: error.message,
            });
        }
      };
    
      static deleteManagerById = async (req, res) => {
        const { id } = req.params;
        try {
          const deletedCommercial = await ManagerSchema.findByIdAndDelete(id);
          if (!deletedCommercial) {
            return res.status(404).json({ message: "Commercial non trouvé" });
          }
          res.status(200).json({ message: "Commercial supprimé avec succès" });
        } catch (error) {
          res
            .status(500)
            .json({ message: "Erreur serveur", details: error.message });
        }
      };
}

module.exports = ManagerController;