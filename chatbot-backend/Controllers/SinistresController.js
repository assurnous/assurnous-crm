const mongoose = require("mongoose");
const Sinistre = require("../Models/SinistreSchema");

class SinistresController {
  static async getAllSinistres(req, res) {
    try {
      const sinistres = await Sinistre.find()
        .populate("sinistreDetails")
        .populate("contratDetails")
        .populate({
          path: "session",
          options: { strictPopulate: false }, // Let refPath handle the model
        });
      console.log("Fetched sinistres:", sinistres);

      res
        .status(200)
        .json({ message: "Fetched all sinistres", data: sinistres });
    } catch (error) {
      console.error("Population error:", {
        message: error.message,
        stack: error.stack,
      });
      res.status(500).json({
        error: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }

  static async createSinistre(req, res) {
    try {
      console.log("Raw received data:", req.body);

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

      const data = await Sinistre.create(dataToSave);
      res.status(201).json({ message: "Sinistre created successfully", data });
    } catch (error) {
      console.error("Creation error:", {
        message: error.message,
        stack: error.stack,
        receivedData: req.body,
      });
      res.status(500).json({
        error: error.message,
      });
    }
  }

  // Get all sinistres for a specific lead
  static async getSinistreById(req, res) {
    const { id } = req.params;
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

      const query = { leadId: id };

      if (role !== "admin") {
        query.session = userId;
      }

      const devis = await Sinistre.find(query)
        .populate("leadId")
        .populate({
          path: "session",
          options: { strictPopulate: false }, // Let refPath handle the model
        })
        .populate("sinistreDetails")
        .populate("contratDetails")
        .sort({ date_creation: -1 });
      console.log("Fetched devis:", devis);

      res.status(200).json({
        success: true,
        data: devis,
      });
    } catch (error) {
      console.error("Error fetching lead devis:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching devis",
        error: error.message,
      });
    }
  }

  static async updateSinistreById(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const sinistre = await Sinistre.findByIdAndUpdate(
        new mongoose.Types.ObjectId(id),
        updateData,
        { new: true }
      );
      if (!sinistre) {
        return res.status(404).json({ message: "Sinistre not found" });
      }
      res
        .status(200)
        .json({ message: `Sinistre with ID: ${id} updated successfully` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  static async deleteSinistreById(req, res) {
    try {
      const { id } = req.params;
      console.log("Deleting sinistre with ID:", id);

      const sinistre = await Sinistre.findByIdAndDelete(
        new mongoose.Types.ObjectId(id)
      );
      if (!sinistre) {
        return res.status(404).json({ message: "Sinistre not found" });
      }
      res
        .status(200)
        .json({ message: `Sinistre with ID: ${id} deleted successfully` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = SinistresController;
