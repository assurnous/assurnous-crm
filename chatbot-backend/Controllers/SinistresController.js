const mongoose = require('mongoose');
const Sinistre = require('../Models/SinistreSchema'); // Adjust the path as necessary

class SinistresController {
    static async getAllSinistres(req, res) {
        try {
            const sinistres = await Sinistre.find().sort({ createdAt: -1 });
            console.log("Fetched all sinistres:", sinistres);
            res.status(200).json({ message: "Fetched all sinistres", data: sinistres });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async createSinistre(req, res) {
        try {
            const data = new Sinistre(req.body);
            await data.save();
            res.status(201).json({ message: "Sinistre created successfully" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getSinistreById(req, res) {
        try {
            const { id } = req.params;
            console.log("Fetching sinistre with ID:", id);
            
            const sinistre = await Sinistre.findById(new mongoose.Types.ObjectId(id));
            if (!sinistre) {
                return res.status(404).json({ message: "Sinistre not found" });
            }

            res.status(200).json({ message: `Fetched sinistre with ID: ${id}`, sinistre });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateSinistreById(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            console.log("Updating sinistre with ID:", id, "with data:", updateData);

            const sinistre = await Sinistre.findByIdAndUpdate(new mongoose.Types.ObjectId(id), updateData, { new: true });
            if (!sinistre) {
                return res.status(404).json({ message: "Sinistre not found" });
            }
            res.status(200).json({ message: `Sinistre with ID: ${id} updated successfully` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async deleteSinistreById(req, res) {
        try {
            const { id } = req.params;
            
            const sinistre = await Sinistre.findByIdAndDelete(new mongoose.Types.ObjectId(id));
            if (!sinistre) {
                return res.status(404).json({ message: "Sinistre not found" });
            }
            res.status(200).json({ message: `Sinistre with ID: ${id} deleted successfully` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = SinistresController;