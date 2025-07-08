const {Admin} = require('../Models/adminModel');
const bcrypt = require('bcrypt');

class AdminController {
    static async createAdmin(req, res) {
        const { name, email, password } = req.body;
        try {
            // Check if the email is already in use
            const existingAdmin = await Admin.findOne({ email });
            if (existingAdmin) {
                return res.status(400).json({ message: 'Email already in use' });
            }
    
            const hashedPassword = await bcrypt.hash(password, 10);
            const newAdmin = new Admin({
                name,
                email,
                password: hashedPassword,
            
            });
            const savedAdmin = await newAdmin.save();
            res.status(201).json(savedAdmin);
        } catch (error) {
            res.status(400).json({ message: 'Error: ' + error.message });
        }
    }

    static async getAllAdmins(req, res) {
        try {
            const admins = await Admin.find();
            console.log("admins", admins);
            res.status(200).json(admins);
        } catch (error) {
            res.status(500).json({ message: 'Error: ' + error.message });
        }
    }

    static async getAdminById(req, res) {
        const { id } = req.params;
    try {
        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Error: ' + error.message });
    }
    }

    static async updateAdminById(req, res) {
        const { id } = req.params;
        const { name, email, password } = req.body;
    
        try {
            const admin = await Admin.findById(id);
            if (!admin) {
                return res.status(404).json({ message: 'Admin not found' });
            }
    
            const updateFields = { name, email };
    
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updateFields.password = hashedPassword;
                //console.log(updateFields);
            }
    
            const updatedAdmin = await Admin.findByIdAndUpdate(id, updateFields, { new: true });
            res.status(200).json(updatedAdmin);
        } catch (error) {
            res.status(500).json({ message: 'Error: ' + error.message });
        }
    }

    static async deleteAdminById(req, res) {
        const { id } = req.params;
    try {
        const deleteAdmin = await Admin.findByIdAndDelete(id);
        if (!deleteAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error: ' + error.message });
    }
    }
}

module.exports = AdminController;