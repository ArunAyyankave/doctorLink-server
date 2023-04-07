const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
  start: Date,
  end: Date,
  isAvailable: Boolean,
});

const DoctorSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  password: String,
  image: String,
  imageUrl: String,
  email: String,
  facility: String,
  specialisation: String,
  qualification: String,
  experience: String,
  fees: Number,
  place: String,
  approved: {
    type: Boolean,
    default: false,
  },
  blockStatus: {
    type: Boolean,
    default: false,
  },
  timeSlots: [TimeSlotSchema],
});

module.exports = mongoose.model('doctors', DoctorSchema);
