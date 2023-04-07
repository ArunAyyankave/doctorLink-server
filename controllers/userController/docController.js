const doc = require('../../models/doctorModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
    mobileExist: (req, res) => {
        try {
            doc.findOne({ mobile: req.body.mobile }).then(async (response) => {
                if (response) {
                    return res.sendStatus(409); //user already exist
                } else {
                    return res.sendStatus(200);
                }
            })
        } catch (error) {
            console.log(error.message);
        }
    },

    docSignup: async (req, res) => {
        try {
            doc.findOne({ mobile: req.body.mobile }).then(async (response) => {
                if (response) {
                    return res.sendStatus(409); //user already exist
                } else {
                    req.body.password = await bcrypt.hash(req.body.password, 10);
                    await doc.create(req.body).then((response) => {
                        const accessToken = jwt.sign({
                            id: response._id
                        }, 'secretKey',
                            { expiresIn: '7d' }
                        );
                        res.status(201).json({ accessToken });
                    })
                }
            })
        } catch (error) {
            console.log(error.message);
        }
    },

    getDoctors: async (req, res) => {
        try {
            doc.find({ approved: true }).then(docDatas => {
                res.status(200).json({ docDatas });
            });
        } catch (error) {
            console.log(error.message);
        }
    },

    getDoctor: async (req, res) => {
        const { _id } = req.params;
        doc.findOne({ _id }).then(response => {
            res.status(200).json(response);
        }).catch(err => {
            console.log(err);
            res.status(400).json({ message: 'error occured' });
        });
    },

    searchDoctor: async (req, res) => {
        try {
            const { query } = req.query;
            const results = await doc.find({
                $or: [
                    { name: { $regex: new RegExp(query, 'i') } },
                    { specialisation: { $regex: new RegExp(query, 'i') } },
                    { place: { $regex: new RegExp(query, 'i') } },
                ]
            });
            res.json(results);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred while searching.' });
        }
    }
}