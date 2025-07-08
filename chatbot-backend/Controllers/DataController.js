const Chat = require("../Models/LeadsSchema");
const mongoose = require("mongoose");
const Ticket = require("../Models/ticketModel");

class DataController {
  
  static async data(req, res) {
    try {
      const data = new Chat(req.body);

      await data.save();

      res.status(201).json(data);
    } catch (error) {
      console.error("Error saving chat data:", error);
      res.status(500).json({ message: "Error saving chat data", error });
    }
  }

  // Retrieve chat data
  static async getdata(req, res) {
    try {
      // Retrieve all chat documents from the database
      const chatData = await Chat.find();

      // Send the chat data back to the client
      res.status(200).json({ chatData });
    } catch (error) {
      console.error("Error retrieving chat data:", error);
      res.status(500).json({ message: "Error retrieving chat data", error });
    }
  }
  static async getdataById(req, res) {
    try {
      const { id } = req.params;
      // console.log("id", id)
      const chat = await Chat.findById(id);

      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      res.status(200).json({ chat });
    } catch (error) {
      console.error("Error retrieving chat by ID:", error);
      res.status(500).json({ message: "Error retrieving chat by ID", error });
    }
  }
  static async updateDataById(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }
      const updatedData = req.body;

      const chat = await Chat.findByIdAndUpdate(id, updatedData, { new: true });

      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      res.status(200).json({ chat });
    } catch (error) {
      console.error("Error updating chat:", error);
      res.status(500).json({ message: "Error updating chat", error });
    }
  }

  // static async addComment(req, res) {
  //   const { id } = req.params; // Lead ID
  //   const { text, name } = req.body;
  //   console.log("Adding comment to lead:", id, "Comment:", text, "User:", name);
  //   if (!name) {
  //     return res
  //       .status(400)
  //       .json({ message: "Name is required for the comment" });
  //   }

  //   try {
  //     // Trouver le lead par ID
  //     const lead = await Chat.findById(id);
  //     if (!lead) {
  //       return res.status(404).json({ message: "Lead not found" });
  //     }

  //     // Vérifier ou initialiser les commentaires
  //     if (!lead.commentaires) {
  //       lead.commentaires = [];
  //     }

  //     // Ajouter un nouveau commentaire
  //     const newComment = {
  //       text,
  //       addedBy: { name },
  //       addedAt: new Date(),
  //     };
  //     // lead.commentaires.push(newComment);
  //     lead.commentaires.unshift(newComment);

  //     // Sauvegarder le lead avec le nouveau commentaire
  //     await lead.save();

  //     return res
  //       .status(200)
  //       .json({
  //         message: "Comment added successfully",
  //         commentaires: lead.commentaires,
  //       });
  //   } catch (error) {
  //     console.error("Error adding comment:", error);
  //     return res.status(500).json({ message: "Internal Server Error" });
  //   }
  // }
  static async addComment(req, res) {
    const { id } = req.params;
    const { text, name } = req.body;
  
    if (!text || !name) {
      return res.status(400).json({ message: "Text and name are required" });
    }
  
    try {
      const lead = await Chat.findByIdAndUpdate(
        id,
        {
          $push: {
            commentaires: {
              text,
              addedBy: { name },
              addedAt: new Date()
            }
          }
        },
        { new: true, runValidators: true }
      );
  
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
  
      return res.status(200).json({
        message: "Comment added successfully",
        commentaires: lead.commentaires
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async deleteDataById(req, res) {
    try {
      const { id } = req.params;
      const updatedData = req.body;

      const chat = await Chat.findByIdAndDelete(id, updatedData, { new: true });

      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      res.status(200).json({ message: "Chat deleted successfully", chat });
    } catch (error) {
      console.error("Error deleting chat:", error);
      res.status(500).json({ message: "Error deleting chat", error });
    }
  }

 

static async searchData(req, res) {
  try {
    const { query, columnKey } = req.query;

    if (!query || !columnKey) {
      return res.status(400).json({ error: "Query and columnKey are required" });
    }

    let filter = {};

    if (columnKey === "commercial") {
      // Populate the `commercial` field and search by its `nom` or `email`
      const results = await Chat.find()
        .populate({
          path: "commercial",
          match: {
            $or: [
              { prenom: { $regex: query, $options: "i" } },
              { nom: { $regex: query, $options: "i" } }
            ],
          },
        })
        .then((chats) => chats.filter((chat) => chat.commercial !== null)); // Filter out unmatched results

      return res.status(200).json(results);
    }

    const schemaPaths = Chat.schema.paths;

    if (!schemaPaths[columnKey]) {
      return res.status(400).json({ error: `Invalid columnKey: ${columnKey}` });
    }

    const fieldType = schemaPaths[columnKey].instance;

    if (fieldType === "String") {
      filter = { [columnKey]: { $regex: query, $options: "i" } };
    } else if (columnKey === "createdAt") {
      const dateQuery = new Date(query);
      if (!isNaN(dateQuery.getTime())) {
        filter = {
          [columnKey]: {
            $gte: new Date(dateQuery.setHours(0, 0, 0, 0)),
            $lt: new Date(dateQuery.setHours(23, 59, 59, 999)),
          },
        };
      } else {
        return res.status(400).json({ message: "Invalid date format." });
      }
    } else {
      return res.status(400).json({
        error: `Cannot apply regex to field ${columnKey} of type ${fieldType}`,
      });
    }

    const results = await Chat.find(filter);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error in search:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

  
static async updateStatusLead(req, res) {
  const { id } = req.params;
  const { statut } = req.body; // Changed from statusLead to statut

  // Validate the new status value - removed "nouveau" since it's not an option
  const validStatuses = ["prospect", "client"];
  if (!validStatuses.includes(statut)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    // Update the 'statut' field to match schema
    const updatedLead = await Chat.findByIdAndUpdate(
      id,
      { statut }, // Changed from type to statut
      { new: true }
    );

    if (!updatedLead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.status(200).json(updatedLead);
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}


  static deleteComment = async (req, res) => {
    const { id, commentId } = req.params;
  
    try {
      const result = await Chat.findByIdAndUpdate(
        id,
        {
          $pull: {
            commentaires: { _id: commentId }
          }
        },
        { new: true }
      );
  
      if (!result) {
        return res.status(404).json({ message: "Chat not found" });
      }
  
      return res.status(200).json({
        message: "Comment deleted successfully",
        commentaires: result.commentaires
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  };
  static async importLeads(req, res) {
    const leads = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
        return res.status(400).json({ message: 'No leads provided for import' });
    }

    try {
        const existingPhones = await Chat.find({ 
            phone: { $in: leads.map(l => l.phone) } 
        }).select('phone -_id').lean();

        if (existingPhones.length > 0) {
            const existingPhoneNumbers = existingPhones.map(l => l.phone);
            return res.status(400).json({
                message: 'Some phone numbers already exist in database',
                duplicatePhones: existingPhoneNumbers
            });
        }

        // Step 4: Import with transaction for atomicity
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const importedLeads = await Chat.insertMany(leads, { session });
            await session.commitTransaction();
            
            return res.status(200).json({
                message: 'Leads imported successfully',
                count: importedLeads.length,
                leads: importedLeads
            });
        } catch (insertError) {
            await session.abortTransaction();
            throw insertError;
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('Error importing leads:', error.message);
        
        if (error.code === 11000) { // MongoDB duplicate key error
            const duplicateKey = error.keyValue?.phone || 'unknown';
            return res.status(400).json({
                message: `Duplicate phone number found: ${duplicateKey}`,
                error: 'DUPLICATE_KEY'
            });
        }
        
        return res.status(500).json({ 
            message: 'Error importing leads',
            error: error.message 
        });
    }
}


static async getAllTickets(req, res) {
  try {
    const tickets = await Ticket.find()
      .populate('client', 'nom phone email')
      .populate('commercial', 'nom prenom');
    res.send(tickets);
  } catch (error) {
    res.status(500).send();
  }
}

static async createTicket(req, res) {
  try {
    const { title, description, clientId, priority, createdBy } = req.body;
    
    // Validate required fields
    if (!title || !description || !clientId) {
      return res.status(400).json({ 
        success: false,
        message: 'Title, description, and client ID are required' 
      });
    }

    // Create the ticket
    const ticket = new Ticket({
      title,
      description,
      client: clientId,
      commercial: createdBy.role === 'Commercial' ? createdBy.id : null,
      createdBy: {
        user: createdBy.id,
        userType: createdBy.role,
        name: createdBy.name
      },
      priority: priority || 'medium',
      status: 'open'
    });

    // Save the ticket
    await ticket.save();

    // Add ticket reference to the client
    await Chat.findByIdAndUpdate(clientId, {
      $push: { tickets: ticket._id }
    });

    // Add ticket reference to the commercial if applicable
    if (createdBy.role === 'Commercial') {
      await Commercial.findByIdAndUpdate(createdBy.id, {
        $push: { tickets: ticket._id }
      });
    }

    // Populate the response
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('client', 'nom phone email')
      .populate('commercial', 'prenom nom');

    return res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: populatedTicket
    });

  } catch (error) {
    console.error('Error creating ticket:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while creating ticket',
      error: error.message 
    });
  }
}


static async updateTicket(req, res) {
  const updates = req.body;
  
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, updates, { new: true });
    
    if (updates.status === 'closed') {
      ticket.closedAt = new Date();
      ticket.closedBy = req.user._id; // From authentication
      await ticket.save();
    }
    
    res.send(ticket);
  } catch (error) {
    res.status(400).send(error);
  }
}

static async getTicketById(req, res) {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('client')
      .populate('commercial')
      .populate('comments.postedBy');
    res.send(ticket);
  } catch (error) {
    res.status(500).send();
  }
}

static async deleteTicket(req, res) {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Remove ticket reference from client
    await Chat.findByIdAndUpdate(ticket.client, {
      $pull: { tickets: ticket._id }
    });

    // Remove ticket reference from commercial if applicable
    if (ticket.commercial) {
      await Commercial.findByIdAndUpdate(ticket.commercial, {
        $pull: { tickets: ticket._id }
      });
    }

    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ message: 'Server error while deleting ticket' });
  }
}
}

module.exports = DataController;
