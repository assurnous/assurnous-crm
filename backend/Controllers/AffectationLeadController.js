const ChatSchema = require("../Models/LeadsSchema");

class AffectationLeadController {
  static async affectLead(req, res) {
    const { id, commercialId } = req.body;

    try {
      await ChatSchema.updateMany(
        { _id: { $in: id } },
        { commercial: commercialId },
        { new: true }
      );

      const updatedLeads = await ChatSchema.find({ _id: { $in: id } }).populate(
        "commercial"
      );

      res.status(200).json(updatedLeads);
    } catch (error) {
      console.error("Error assigning leads to commercial:", error.message);
      res
        .status(500)
        .json({ message: "Error assigning leads to commercial", error });
    }
  }
  static async getLeadsByCommercial(req, res) {
    const { commercialId } = req.params;

    try {
      const assignedLeades = await ChatSchema.find({
        commercial: commercialId,
      }).populate("commercial");

      res.status(200).json(assignedLeades);
    } catch (error) {
      console.error("Error fetching assigned leads:", error.message);
      res.status(500).json({ message: "Error fetching assigned leads", error });
    }
  }
  static async desaffectLead(req, res) {
    const { id } = req.body;

    try {
      await ChatSchema.updateMany(
        { _id: { $in: id } },
        { $unset: { commercial: "" } },
        { new: true }
      );

      const updatedLeads = await ChatSchema.find({ _id: { $in: id } }).populate(
        "commercial"
      );

      res.status(200).json(updatedLeads);
    } catch (error) {
      console.error("Error unassigning leads from commercial:", error.message);
      res
        .status(500)
        .json({ message: "Error unassigning leads from commercial", error });
    }
  }
}

module.exports = AffectationLeadController;
