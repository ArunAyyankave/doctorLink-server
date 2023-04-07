const Appointment = require('../../models/appointmentModel');
const mongoose = require('mongoose');

module.exports = {
    getAps: async (req, res) => {
        try {
            const appointments = await Appointment.aggregate([
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
                        "doctor.mobile": 1,
                        "doctor.name": 1,
                    },
                },
            ]);

            res.json(appointments);
        } catch (error) {
            console.log(error);
        }
    }
}