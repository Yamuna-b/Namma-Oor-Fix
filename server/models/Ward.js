const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
  wardNumber: { type: String, required: true },
  zoneNumber: { type: String, required: true },
  name: { type: String },
  city: { type: String, required: true, default: 'Madurai' }
}, { timestamps: true });

wardSchema.index({ city: 1, wardNumber: 1, zoneNumber: 1 }, { unique: true });

module.exports = mongoose.model('Ward', wardSchema);



