const mongoose = require("mongoose");

class AppController {
  // Test the connection
   static async test(req, res) {
    mongoose.connect(process.env.MONGODB_URI);
    return res.json({ message: 'Test ok' });
  }
}

module.exports = AppController;