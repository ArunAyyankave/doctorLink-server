const users = require('../../models/usersModel');
const bcrypt = require('bcrypt');
const { create } = require('../../models/usersModel');
const jwt = require('jsonwebtoken');
require('dotenv/config');

module.exports = {
    mobileExist: async (req, res) => {
        try {
            users.findOne({ mobile: req.body.mobile }).then(async (response) => {
                if (response) {
                    return res.sendStatus(409);
                } else {
                    return res.sendStatus(200);
                }
            });
        } catch (error) {
            console.log(error.message);
        }
    },

    userSignup: async (req, res) => {
        try {
            users.findOne({ mobile: req.body.mobile }).then(async (response) => {
                if (response) {
                    return res.sendStatus(409);
                } else {
                    req.body.password = await bcrypt.hash(req.body.password, 10);
                    await users.create(req.body).then((response) => {
                        const accessToken = jwt.sign({
                            id: response._id
                        }, process.env.JWT_SECRET,
                            { expiresIn: '7d' }
                        );
                        res.status(201).json({ accessToken });
                    })
                }
            });
        } catch (error) {
            console.log(error.message);
        }
    },

    userSignin: async (req, res) => {
        try {
            const { mobile, password } = req.body;

            if (!mobile || !password) return res.status(400).json({ message: 'Mobile number and password required.' })
            else {
                const foundUser = await users.findOne({ mobile });

                if (!foundUser) res.status(401).json({ message: 'The mobile number you entered is incorrect.' })
                else {
                    const match = await bcrypt.compare(password, foundUser.password);

                    if (!match) {
                        return res.status(401).json({ message: 'The password you entered is incorrect.' });
                    } else if (foundUser.blockStatus) {
                        return res.status(401).json({ message: 'Your account has been blocked!' });
                    } else {
                        const accessToken = jwt.sign({ id: foundUser._id, }, process.env.JWT_SECRET, { expiresIn: '7d' });
                        return res.status(200).json({ accessToken, name: foundUser.name, mobile: foundUser.mobile });
                    }
                }
            }
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    },

    getUser: (req, res) => {
        const token = req.headers['x-access-token'];
        try {
            const { id } = jwt.verify(token, process.env.JWT_SECRET);
            return res.status(200).json({ id });
        } catch (error) {
            res.status(401).json({ error: 'invalid token' });
        }
    },

    MobileExistForForgot: (req, res) => {
        try {
            users.findOne(req.query).then(async (response) => {
                if (response) {
                    return res.sendStatus(200);
                } else {
                    return res.sendStatus(404);
                }
            })
        } catch (error) {
            console.log(error.message);
        }
    },

    newPassSet: async (req, res) => {
        try {
            req.body.pwd = await bcrypt.hash(req.body.pwd, 10);
            users.updateOne({ mobile: req.body.mobile }, { $set: { password: req.body.pwd } }).then(response => {
                res.sendStatus(200);
            })
        } catch (error) {
            console.log(error.message);
        }
    },

    googleSignin: async (req, res) => {
        if (!req.body.email || !req.body.fullName) return res.status(400).json({ message: 'email, fullName - fields is required' });
        const { email, fullName } = req.body;
        users.findOne({ email }).then(async (response) => {
            if (response) {
                const accessToken = jwt.sign({ id: response._id, }, process.env.JWT_SECRET, { expiresIn: '7d' });
                res.status(200).json({ accessToken, name: response.name, mobile: response.email });
            } else {
                let data = await users.create({ email, name: fullName });
                const accessToken = jwt.sign({ id: data._id, }, process.env.JWT_SECRET, { expiresIn: '7d' });
                res.status(200).json({ accessToken, name: data.name, mobile: data.email });
            }
        })
    }
}