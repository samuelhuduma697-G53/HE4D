const mongoose = require('mongoose');

const debriefingSchema = new mongoose.Schema({
  helperId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  crisisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crisis' },
  emotionalState: { type: String, enum: ['calm', 'anxious', 'stressed', 'overwhelmed', 'traumatized'], required: true },
  stressLevel: { type: Number, min: 1, max: 10, required: true },
  notes: { type: String, maxlength: 2000 },
  needsFollowUp: { type: Boolean, default: false },
  followUpDate: Date,
  status: { type: String, enum: ['pending', 'completed', 'followed_up'], default: 'pending' },
  adminNotes: String,
  completedAt: Date
}, { timestamps: true });

debriefingSchema.index({ helperId: 1, status: 1 });
debriefingSchema.index({ needsFollowUp: 1 });

module.exports = mongoose.model('Debriefing', debriefingSchema);
