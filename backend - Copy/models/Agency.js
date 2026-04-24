const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['Fire', 'Medical', 'Police', 'NDRF', 'NGO', 'Other'],
    default: 'Other'
  },
  registrationNumber: { type: String },
  contactPerson: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deployed'],
    default: 'active'
  },
  resources: [{ type: String }],
  verified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Agency', agencySchema);
