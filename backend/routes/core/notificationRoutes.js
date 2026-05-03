const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/core/notificationController');
const { protect } = require('../../middleware/auth/auth');

router.use(protect);

const safe = (fn, name) => (req, res, next) => {
  if (typeof fn === 'function') return fn(req, res, next);
  res.status(501).json({ error: `${name} not implemented` });
};

router.get('/', safe(notificationController.getNotifications, 'getNotifications'));
router.get('/unread-count', safe(notificationController.getUnreadCount, 'getUnreadCount'));
router.patch('/:id/read', safe(notificationController.markAsRead, 'markAsRead'));
router.patch('/read-all', safe(notificationController.markAllAsRead, 'markAllAsRead'));
router.delete('/:id', safe(notificationController.deleteNotification, 'deleteNotification'));

module.exports = router;
