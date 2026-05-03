const Notification = require('../../models/core/Notification');
const logger = require('../../config/logger');

class NotificationService {
  async sendNotification(userId, type, title, body, data = {}, broadcast = false) {
    try {
      const notification = new Notification({ userId, type, title, body, data });
      await notification.save();
      
      // Emit via Socket.IO if available
      try {
        const { getIO } = require('../../config/socket');
        const io = getIO();
        if (broadcast) {
          io.emit('notification', { id: notification._id, type, title, body, data });
        } else if (userId) {
          io.to(`user:${userId}`).emit('notification', { id: notification._id, type, title, body, data });
        }
      } catch (e) {
        // Socket not available, that's ok
      }
      
      return notification;
    } catch (error) {
      logger.error('Notification failed:', error);
      return null;
    }
  }

  async notifyHelperNewCrisis(helperId, crisisId, acuityScore, distance) {
    return this.sendNotification(helperId, 'crisis_assigned',
      'New Crisis',
      `A crisis (acuity: ${acuityScore}/10) was reported ${distance ? distance.toFixed(1) + 'km' : 'nearby'}.`,
      { crisisId, acuityScore, distance }
    );
  }

  async notifySeekerHelperAccepted(seekerId, crisisId, helperName, eta) {
    return this.sendNotification(seekerId, 'helper_accepted',
      'Helper Assigned',
      `${helperName} is on the way. ETA: ${eta} minutes.`,
      { crisisId, helperName, eta }
    );
  }

  async notifySeekerStatusUpdate(seekerId, crisisId, status, notes) {
    return this.sendNotification(seekerId, 'status_update',
      'Status Updated',
      `Crisis status: ${status}. ${notes || ''}`,
      { crisisId, status, notes }
    );
  }

  async notifyAdminNoHelpers(crisisId) {
    return this.sendNotification(null, 'system_alert',
      'No Helpers Available',
      `Crisis ${crisisId} has no available helpers.`,
      { crisisId }, true
    );
  }

  async notifyAdminPanicAlert(crisisId, seekerId) {
    return this.sendNotification(null, 'panic_alert',
      '🚨 PANIC ALERT',
      `A user has activated the panic button.`,
      { crisisId, seekerId }, true
    );
  }

  async notifyAdminSafetyIncident(reportId, helperId, crisisId) {
    return this.sendNotification(null, 'safety_incident',
      'Safety Incident Reported',
      `Helper ${helperId} reported an incident for crisis ${crisisId}.`,
      { reportId, helperId, crisisId }, true
    );
  }

  async triggerEmergencyAlert(seekerId, crisisId, latitude, longitude) {
    logger.info('Emergency alert triggered', { seekerId, crisisId, latitude, longitude });
    return this.sendNotification(seekerId, 'emergency',
      '🚨 Emergency Alert Sent',
      'Emergency contacts have been notified of your location.',
      { crisisId, latitude, longitude }
    );
  }
}

module.exports = new NotificationService();
