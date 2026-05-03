const User = require('../../models/core/User');
const Crisis = require('../../models/core/Crisis');
const SafetyReport = require('../../models/safety/SafetyReport');
const Debriefing = require('../../models/safety/Debriefing');
const { asyncHandler } = require('../../middleware/logging/errorHandler');

const adminController = {
  getDashboard: asyncHandler(async (req, res) => {
    const [totalSeekers, totalHelpers, activeCrises, pendingVerifications] = await Promise.all([
      User.countDocuments({ role: 'seeker' }),
      User.countDocuments({ role: 'helper' }),
      Crisis.countDocuments({ status: { $ne: 'resolved' } }),
      User.countDocuments({ role: 'helper', 'helperProfile.verificationStatus': 'pending' })
    ]);

    const recentCrises = await Crisis.find().sort({ createdAt: -1 }).limit(5).lean();
    for (const c of recentCrises) {
      const seeker = await User.findById(c.seekerId).select('name').catch(() => null);
      c.seekerId = seeker || { name: 'Anonymous' };
    }

    res.json({ stats: { users: { totalSeekers, totalHelpers }, crises: { activeCrises }, verifications: { pending: pendingVerifications } }, recentCrises });
  }),

  getPendingVerifications: asyncHandler(async (req, res) => {
    const pendingHelpers = await User.find({ role: 'helper', 'helperProfile.verificationStatus': 'pending' }).select('name email phone createdAt helperProfile');
    res.json({ pendingHelpers, total: pendingHelpers.length });
  }),

  verifyHelper: asyncHandler(async (req, res) => {
    const { helperId } = req.params;
    const { approve, notes } = req.body;
    const helper = await User.findOne({ _id: helperId, role: 'helper' });
    if (!helper) return res.status(404).json({ error: 'Helper not found' });
    helper.helperProfile.verificationStatus = approve ? 'verified' : 'rejected';
    if (approve) { helper.helperProfile.verifiedAt = new Date(); helper.isActive = true; }
    await helper.save();
    res.json({ message: `Helper ${approve ? 'verified' : 'rejected'}`, status: helper.helperProfile.verificationStatus });
  }),

  getUsers: asyncHandler(async (req, res) => {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 }).limit(50);
    res.json({ users });
  }),

  getUserDetails: asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  }),

  updateUserStatus: asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.params.userId, { isActive: req.body.isActive });
    res.json({ message: 'User status updated' });
  }),

  getAuditLogs: asyncHandler(async (req, res) => {
    res.json({ logs: [], total: 0 });
  }),

  getSystemHealth: asyncHandler(async (req, res) => {
    res.json({ database: 'connected', uptime: process.uptime(), timestamp: new Date() });
  }),

  verifyResolution: asyncHandler(async (req, res) => {
    const { crisisId } = req.params;
    const { approve } = req.body;
    const crisis = await Crisis.findById(crisisId);
    if (!crisis) return res.status(404).json({ error: 'Crisis not found' });
    
    if (approve) {
      crisis.status = 'resolved';
      crisis.resolutionVerifiedBy = req.admin._id;
      crisis.resolutionVerifiedAt = new Date();
      await User.findByIdAndUpdate(crisis.match.helperId, { $inc: { 'helperProfile.totalCases': 1, 'helperProfile.resolvedCases': 1 } });
      const Match = require('../../models/core/Match');
      await Match.findOneAndUpdate({ crisisId: crisis._id }, { status: 'completed', 'journey.completedAt': new Date() });
    } else {
      crisis.status = 'in_progress';
    }
    await crisis.save();
    res.json({ message: approve ? 'Crisis resolved' : 'Resolution rejected', status: crisis.status });
  }),

  requestSuccessStory: asyncHandler(async (req, res) => {
    const { crisisId } = req.body;
    const crisis = await Crisis.findById(crisisId);
    if (!crisis) return res.status(404).json({ error: 'Crisis not found' });
    const notificationService = require('../../services/internal/notificationService');
    const msg = 'Share your success story! Your crisis was resolved. Tell us how Huduma helped you.';
    if (crisis.seekerId) await notificationService.sendNotification(crisis.seekerId, 'success_story_request', 'Share Your Story', msg);
    if (crisis.match?.helperId) await notificationService.sendNotification(crisis.match.helperId, 'success_story_request', 'Share Your Story', msg);
    res.json({ message: 'Success story requests sent' });
  }),

  getSafetyReports: asyncHandler(async (req, res) => {
    const reports = await SafetyReport.find().populate('helperId', 'name phone').sort({ createdAt: -1 }).limit(50);
    res.json({ reports });
  }),

  updateSafetyReport: asyncHandler(async (req, res) => {
    const { reportId } = req.params;
    const { status, adminNotes } = req.body;
    const update = { status, adminNotes };
    if (status === 'resolved') Object.assign(update, { resolvedAt: new Date(), resolvedBy: req.admin._id });
    await SafetyReport.findByIdAndUpdate(reportId, update);
    res.json({ message: 'Report updated' });
  }),

  getDebriefings: asyncHandler(async (req, res) => {
    const debriefings = await Debriefing.find().populate('helperId', 'name phone').sort({ createdAt: -1 }).limit(50);
    res.json({ debriefings });
  }),

  followUpDebriefing: asyncHandler(async (req, res) => {
    const { debriefingId } = req.params;
    await Debriefing.findByIdAndUpdate(debriefingId, { status: 'followed_up', adminNotes: req.body.adminNotes, completedAt: new Date() });
    res.json({ message: 'Follow-up recorded' });
  })
};


  elevateToAdmin: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.role = 'admin';
    await user.save();
    
    // Also create Admin record
    const Admin = require('../../models/admin/Admin');
    const bcrypt = require('bcryptjs');
    const existing = await Admin.findOne({ email: user.email });
    if (!existing) {
      await Admin.create({
        name: user.name,
        email: user.email,
        phone: user.phone,
        passwordHash: user.passwordHash || await bcrypt.hash('Admin@123!', 12),
        role: { role: 'senior_admin', permissions: ['verify_helpers', 'view_audit_logs', 'manage_content', 'view_analytics'] },
        assignedRegion: user.location?.county || 'Kilifi',
        isActive: true
      });
    }
    
    res.json({ message: 'User elevated to admin' });
  }),

module.exports = adminController;
