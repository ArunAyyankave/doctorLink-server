const users = require('../../models/usersModel');
const docs = require('../../models/doctorModel');
const Appointment = require('../../models/appointmentModel');
const mongoose = require('mongoose');

module.exports = {
    getInfo: async (req, res) => {
        try {
            const totalUsers = await users.countDocuments({});
            const totalDoctors = await docs.countDocuments({});
            const totalBookings = await Appointment.countDocuments({});

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const bookingsToday = await Appointment.countDocuments({
                appointmentDate: today,
            });

            const docsPending = await docs.find({ approved: false });

            res.json({ totalUsers, totalDoctors, totalBookings, bookingsToday, docsPending });
        } catch (error) {
            console.log(error);
        }
    }
}