const doc = require('../../models/doctorModel');
const Appointment = require('../../models/appointmentModel');
const mongoose = require('mongoose');

module.exports = {
    completeprofile: async (req, res) => {
        const _id = req._id;
        const { name, email, facility, spec, qual, exp, fees, place, imageUrl } = req.body;
        try {
            await doc.updateOne({ _id }, { $set: { name, email, facility, qualification: qual, experience: exp, fees, place, imageUrl, specialisation: spec } }).then(response => {
                res.json({ response });
            });
        } catch (error) {
            console.log(error.message);
        }
    },

    addSlot: async (req, res) => {
        try {
            const _id = req._id;
            const { start, end, isAvailable = true } = req.body;

            const doctor = await doc.findById({ _id });
            doctor.timeSlots.push({
                start,
                end,
                isAvailable,
            });

            await doctor.save();

            res.status(201).send('Time slot added successfully');
        } catch (error) {
            console.log(error);
        }
    },

    getSlots: async (req, res) => {
        try {
            const _id = req._id;
            const doctor = await doc.findById(_id);

            const timeSlots = doctor.timeSlots;
            return res.json({ timeSlots: timeSlots });
        } catch (error) {
            console.log(error);
        }
    },

    getAps: async (req, res) => {
        try {
            const doctorId = req._id;

            const appointments = await Appointment.aggregate([
                {
                    $match: {
                        doctorId: mongoose.Types.ObjectId(doctorId),
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user",
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
                    $unwind: "$user",
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
                        timeSlotStart: {
                            $arrayElemAt: [
                                {
                                    $map: {
                                        input: {
                                            $filter: {
                                                input: "$doctor.timeSlots",
                                                as: "timeSlot",
                                                cond: {
                                                    $eq: ["$$timeSlot._id", "$timeSlotId"],
                                                },
                                            },
                                        },
                                        as: "timeSlot",
                                        in: "$$timeSlot.start",
                                    },
                                },
                                0,
                            ],
                        },
                        timeSlotEnd: {
                            $arrayElemAt: [
                                {
                                    $map: {
                                        input: {
                                            $filter: {
                                                input: "$doctor.timeSlots",
                                                as: "timeSlot",
                                                cond: {
                                                    $eq: ["$$timeSlot._id", "$timeSlotId"],
                                                },
                                            },
                                        },
                                        as: "timeSlot",
                                        in: "$$timeSlot.end",
                                    },
                                },
                                0,
                            ],
                        },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        appointmentDate: 1,
                        timeSlotStart: 1,
                        timeSlotEnd: 1,
                        "user.name": 1,
                        "user.mobile": 1,
                        "doctor.name": 1,
                    },
                },
            ]);

            res.json(appointments);
        } catch (error) {
            console.log(error.message);
        }
    },

    getInfo: async (req, res) => {
        try {
            const doctorId = req._id;
            const timeSlots = await doc.aggregate([
                { $match: { _id: mongoose.Types.ObjectId(doctorId) } },
                { $unwind: "$timeSlots" },
                { $match: { "timeSlots.isAvailable": true } },
                { $replaceRoot: { newRoot: "$timeSlots" } },
            ]);

            const today = new Date();
            today.setHours(0, 0, 0, 0); // set time to 00:00:00.000
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1); // set time to 23:59:59.999

            const apDetails = await Appointment.aggregate([
                { $match: { doctorId: mongoose.Types.ObjectId(doctorId) } },
                {
                    $group: {
                        _id: '$userId',
                        totalAppointments: { $sum: 1 },
                        todayAppointments: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $gte: ['$appointmentDate', today] },
                                            { $lt: ['$appointmentDate', tomorrow] }
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        uniqueUsers: { $sum: 1 },
                        totalAppointments: { $sum: '$totalAppointments' },
                        todayAppointments: { $sum: '$todayAppointments' }
                    }
                }
            ])

            const currentDateTime = new Date();

            const appointments = await Appointment.aggregate([
                {
                    $match: {
                        doctorId: mongoose.Types.ObjectId(doctorId),
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user",
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
                    $unwind: "$user",
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
                        timeSlotStart: {
                            $arrayElemAt: [
                                {
                                    $map: {
                                        input: {
                                            $filter: {
                                                input: "$doctor.timeSlots",
                                                as: "timeSlot",
                                                cond: {
                                                    $eq: ["$$timeSlot._id", "$timeSlotId"],
                                                },
                                            },
                                        },
                                        as: "timeSlot",
                                        in: "$$timeSlot.start",
                                    },
                                },
                                0,
                            ],
                        },
                        timeSlotEnd: {
                            $arrayElemAt: [
                                {
                                    $map: {
                                        input: {
                                            $filter: {
                                                input: "$doctor.timeSlots",
                                                as: "timeSlot",
                                                cond: {
                                                    $eq: ["$$timeSlot._id", "$timeSlotId"],
                                                },
                                            },
                                        },
                                        as: "timeSlot",
                                        in: "$$timeSlot.end",
                                    },
                                },
                                0,
                            ],
                        },
                    },
                },
                {
                    $match: {
                        timeSlotStart: { $gte: currentDateTime },
                    },
                },
                {
                    $sort: {
                        timeSlotStart: 1,
                    },
                },
                {
                    $project: {
                        _id: 1,
                        appointmentDate: 1,
                        timeSlotStart: 1,
                        timeSlotEnd: 1,
                        "user.name": 1,
                        "user.mobile": 1,
                    },
                },
            ]);
            res.json({ timeSlots, apDetails, appointments });
        } catch (error) {
            console.log(error);
        }
    }
}