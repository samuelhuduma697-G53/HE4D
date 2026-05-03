const mongoose = require('mongoose');

const safetyReportSchema = new mongoose.Schema({
  helperId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  crisisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crisis', index: true },
  type: { type: String, enum: ['threat', 'unsafe_location', 'medical', 'harassment', 'other'], required: true },
  severity: { type: String, enum: ['low', 'moderate', 'high', 'critical'], required: true },
  description: { type: String, required: true, maxlength: 2000 },
  location: { type: { type: String, default: 'Point' }, coordinates: [Number], ward: String },
  status: { type: String, enum: ['reported', 'investigating', 'resolved'], default: 'reported' },
  adminNotes: String,
  resolvedAt: Date,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

safetyReportSchema.index({ status: 1, severity: 1 });
safetyReportSchema.index({ helperId: 1, createdAt: -1 });

module.exports = mongoose.model('SafetyReport', safetyReportSchema);
