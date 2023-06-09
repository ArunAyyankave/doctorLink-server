const admins = require('../../models/adminsModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
    adminLogin: async (req, res) => {
        try {
            await admins.findOne({ name: req.body.name }).then(admin => {
                if (!admin) {
                    return res.sendStatus(401); //unauthorized
                } else {
                    bcrypt.compare(req.body.password, admin.password).then(response => {
                        if (!response) {
                            return res.sendStatus(401); //unauthorized
                        } else {
                            const accessToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
                            return res.status(200).json({ accessToken });
                        }
                    })
                }
            })
        } catch (error) {
            console.log(error.message);
        }
    }
}