const Doctor = require('../../models/doctorModel');
const Appointment = require('../../models/appointmentModel');
const mongoose = require('mongoose');

module.exports = {
    bookAppointment: async (req, res) => {
        const { doctorId, timeSlotId } = req.body;
        const userId = req.user;
        try {
            const doctor = await Doctor.findById(doctorId);
            const timeSlotIndex = doctor.timeSlots.findIndex(
                (slot) => slot._id.toString() === timeSlotId
            );

            if (timeSlotIndex === -1) {
                return res.status(404).json({ message: 'Time slot not found' });
            }

            if (!doctor.timeSlots[timeSlotIndex].isAvailable) {
                return res.status(400).json({ message: 'Time slot not available' });
            }

            doctor.timeSlots[timeSlotIndex].isAvailable = false;
            const appointment = new Appointment({
                doctorId,
                timeSlotId,
                userId,
            });
            await Promise.all([doctor.save(), appointment.save()]);

            return res.status(200).json({ message: 'Appointment booked successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }
    },

    getAps: async (req, res) => {
        try {
            const userId = req.user;
            const { page = 1, pageSize = 10 } = req.query;
            const skip = (page - 1) * pageSize;
            console.log(req.query);

            const appointments = await Appointment.aggregate([
                {
                    $match: {
                        userId: mongoose.Types.ObjectId(userId),
                    },
                },
                {
                    $lookup: {
                        from: "doctors",
                        localField: "doctorId",
                        foreignField: "_id",
                        as: "doctor",
                    },
                },
                {
                    $unwind: "$doctor",
                },
                {
                    $addFields: {
                        timeSlot: {
                            $filter: {
                                input: "$doctor.timeSlots",
                                as: "timeSlot",
                                cond: {
                                    $eq: ["$$timeSlot._id", "$timeSlotId"],
                                },
                            },
                        },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        appointmentDate: 1,
                        "doctor._id": 1,
                        "doctor.name": 1,
                        "doctor.mobile": 1,
                        "doctor.email": 1,
                        "doctor.specialisation": 1,
                        "doctor.place": 1,
                        "doctor.fees": 1,
                        "doctor.imageUrl": 1,
                        "timeSlot.start": { $first: "$timeSlot.start" },
                        "timeSlot.end": { $first: "$timeSlot.end" },
                    },
                },
                { $skip: skip },
                { $limit: pageSize },
            ]);

            const totalCount = await Appointment.aggregate([
                {
                    $match: {
                        userId: mongoose.Types.ObjectId(userId),
                    },
                },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 },
                    },
                },
            ]);

            const totalPages = Math.ceil(totalCount[0].count / pageSize);

            if (!appointments.length) {
                return res.status(404).json({ msg: "Appointment not found" });
            }
            res.json({ appointments, totalPages });
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Server Error");
        }
    }

}