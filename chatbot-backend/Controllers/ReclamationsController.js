const Reclamation = require('../Models/reclamationSchema'); 
const mongoose = require('mongoose');

class ReclamationsController {
    static async getAllReclamations(req, res) {
        try {
            const reclamations = await Reclamation.find().sort({ createdAt: -1 });
            console.log("Fetched all reclamations:", reclamations);
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

    static async getReclamationById(req, res) {
        try {
            const { id } = req.params;
            console.log("Fetching reclamation with ID:", id);
            
            const reclamation = await Reclamation.findById(new mongoose.Types.ObjectId(id));
            if (!reclamation) {
                return res.status(404).json({ message: "Reclamation not found" });
            }

            res.status(200).json({ message: `Fetched reclamation with ID: ${id}`, reclamation });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async updateReclamationById(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            console.log("Updating reclamation with ID:", id, "with data:", updateData);

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