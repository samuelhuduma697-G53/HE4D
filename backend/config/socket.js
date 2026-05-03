/**
 * Socket.IO Configuration
 * WebSocket server setup with authentication and room management
 */

const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/core/User');
const GuestSession = require('../models/core/GuestSession');
const logger = require('./logger');

class SocketManager {
  constructor(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.userSockets = new Map(); // userId -> Set(socketIds)
    this.rooms = new Map();
    
    this.setupMiddleware();
    this.setupEventHandlers();
    
    logger.info('Socket.IO manager initialized');
  }

  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.token;
        
        if (!token) {
          // Allow connection as unauthenticated for public features
          socket.user = null;
          socket.userId = null;
          return next();
        }

        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          
          // Handle guest users
          if (decoded.isGuest || decoded.role === 'guest') {
            const sessionId = decoded.sessionId || decoded.id;
            const guestSession = await GuestSession.findOne({
              sessionId,
              expiresAt: { $gt: new Date() }
            });
            
            if (guestSession) {
              socket.user = {
                id: sessionId,
                sessionId,
                name: decoded.name || guestSession.name,
                role: 'guest',
                isGuest: true
              };
              socket.userId = sessionId;
              return next();
            }
            
            socket.user = null;
            socket.userId = null;
            return next();
          }
          
          // Handle regular users
          const user = await User.findById(decoded.id).select('-passwordHash');
          
          if (user && user.isActive) {
            socket.user = user;
            socket.userId = user._id.toString();
          }
          
          next();
        } catch (jwtError) {
          logger.warn('Invalid JWT token in socket connection:', jwtError.message);
          socket.user = null;
          socket.userId = null;
          next();
        }
      } catch (error) {
        logger.error('Socket authentication error:', error);
        socket.user = null;
        socket.userId = null;
        next();
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.userId;
      const user = socket.user;

      logger.info(`Socket connected: ${socket.id} - User: ${userId || 'anonymous'} - Role: ${user?.role || 'none'}`);

      // Store user socket mapping (only for authenticated users)
      if (userId) {
        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId).add(socket.id);

        // Join user's personal room
        socket.join(`user:${userId}`);
        
        // Join role-based room
        if (user && user.role) {
          socket.join(`role:${user.role}`);
        }
      }

      // ============ CRISIS ROOM MANAGEMENT ============
      
      socket.on('join-crisis', async (crisisId) => {
        socket.join(`crisis:${crisisId}`);
        logger.info(`User ${userId || 'anonymous'} joined crisis room: ${crisisId}`);
        
        // Send chat history to the user who just joined
        try {
          const Crisis = require('../models/core/Crisis');
          const crisis = await Crisis.findById(crisisId).select('chatHistory');
          if (crisis && crisis.chatHistory?.length > 0) {
            socket.emit('chat-history', { messages: crisis.chatHistory.map(m => ({
              senderId: m.senderId,
              message: m.message,
              type: m.type,
              sender: { id: m.senderId, name: m.senderId === userId ? 'You' : 'User', role: m.senderId === userId ? user?.role : 'other' },
              timestamp: m.timestamp
            })) });
          }
        } catch (err) {
          logger.error('Failed to load chat history:', err.message);
        }
      });

      socket.on('leave-crisis', (crisisId) => {
        socket.leave(`crisis:${crisisId}`);
        logger.info(`User ${userId || 'anonymous'} left crisis room: ${crisisId}`);
      });

      // ============ CHAT MESSAGING ============
      
      socket.on('send-message', async (data) => {
        const { crisisId, message, type = 'text' } = data;
        
        const msgObj = {
          crisisId,
          message,
          type,
          sender: {
            id: userId,
            name: user?.name || 'Anonymous',
            role: user?.role || 'user'
          },
          timestamp: new Date().toISOString()
        };
        
        // Broadcast to everyone in the crisis room (including sender)
        this.io.to(`crisis:${crisisId}`).emit('new-message', msgObj);
        
        // Save to database
        try {
          const Crisis = require('../models/core/Crisis');
          await Crisis.findByIdAndUpdate(crisisId, {
            $push: {
              chatHistory: {
                senderId: userId || 'anonymous',
                message,
                type,
                timestamp: new Date()
              }
            }
          });
        } catch (err) {
          logger.error('Failed to save chat message:', err.message);
        }
      });

      // ============ TYPING INDICATOR ============
      
      socket.on('typing', (data) => {
        const { crisisId, isTyping } = data;
        
        socket.to(`crisis:${crisisId}`).emit('user-typing', {
          userId: userId,
          name: user?.name || 'Anonymous',
          isTyping
        });
      });

      // ============ LOCATION TRACKING ============
      
      socket.on('location-update', (data) => {
        const { latitude, longitude, crisisId } = data;
        
        // Store location in memory for this user
        socket.location = { latitude, longitude, updatedAt: new Date() };
        
        // Broadcast to relevant rooms
        if (crisisId) {
          this.io.to(`crisis:${crisisId}`).emit('location-changed', {
            userId: userId,
            role: user?.role || 'user',
            location: { latitude, longitude },
            timestamp: new Date().toISOString()
          });
        }
        
        logger.info(`Location update from ${userId || 'anonymous'}: ${latitude}, ${longitude}`);
      });

      // ============ PANIC ALERT ============
      
      socket.on('panic-alert', (data) => {
        const { latitude, longitude, crisisId, seekerName } = data;
        
        // Broadcast emergency to all helpers
        this.io.to('role:helper').emit('emergency-panic', {
          crisisId,
          seekerName: seekerName || user?.name || 'Anonymous',
          location: { latitude, longitude },
          timestamp: new Date().toISOString()
        });
        
        // Also broadcast to admins
        this.io.to('role:admin').emit('emergency-panic', {
          crisisId,
          seekerName: seekerName || user?.name || 'Anonymous',
          location: { latitude, longitude },
          timestamp: new Date().toISOString()
        });
        
        logger.error(`PANIC ALERT triggered for crisis ${crisisId} by ${seekerName || 'anonymous'}`);
      });

      // ============ HELPER AVAILABILITY ============
      
      socket.on('helper-available', (data) => {
        const { isAvailable, location } = data;
        
        if (user?.role === 'helper') {
          if (isAvailable) {
            socket.join('helpers-queue');
          } else {
            socket.leave('helpers-queue');
          }
          
          logger.info(`Helper ${user?.name} is now ${isAvailable ? 'available' : 'unavailable'}`);
        }
      });

      // ============ CRISIS STATUS UPDATES ============
      
      socket.on('crisis-accepted', (data) => {
        const { crisisId, helperId, helperName, eta } = data;
        
        // Notify the seeker
        this.io.to(`crisis:${crisisId}`).emit('crisis-accepted', {
          crisisId,
          helperId,
          helperName,
          eta,
          message: `${helperName} has accepted your crisis and will arrive in ${eta} minutes`
        });
      });

      socket.on('crisis-resolved', (data) => {
        const { crisisId, resolution } = data;
        
        this.io.to(`crisis:${crisisId}`).emit('crisis-resolved', {
          crisisId,
          resolution,
          timestamp: new Date().toISOString()
        });
        
        logger.info(`Crisis ${crisisId} resolved`);
      });

      // ============ DISCONNECTION ============
      
      
      // ============ WEBRTC AUDIO CALL SIGNALING ============
      
      // Caller sends offer to callee
      socket.on('call-offer', (data) => {
        const { crisisId, offer, callerName } = data;
        socket.to(`crisis:${crisisId}`).emit('call-incoming', {
          offer,
          callerName: callerName || user?.name || 'User',
          callerId: userId
        });
        logger.info(`Call offer sent in crisis ${crisisId} by ${user?.name}`);
      });

      // Callee sends answer back to caller
      socket.on('call-answer', (data) => {
        const { crisisId, answer } = data;
        socket.to(`crisis:${crisisId}`).emit('call-answered', { answer });
      });

      // ICE candidates exchange
      socket.on('ice-candidate', (data) => {
        const { crisisId, candidate } = data;
        socket.to(`crisis:${crisisId}`).emit('ice-candidate', { candidate });
      });

      // End call
      socket.on('call-end', (data) => {
        const { crisisId } = data;
        socket.to(`crisis:${crisisId}`).emit('call-ended');
        logger.info(`Call ended in crisis ${crisisId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id} - User: ${userId || 'anonymous'}`);
        
        // Clean up user socket mapping
        if (userId && this.userSockets.has(userId)) {
          this.userSockets.get(userId).delete(socket.id);
          if (this.userSockets.get(userId).size === 0) {
            this.userSockets.delete(userId);
          }
        }
      });
    });
  }

  // ============ UTILITY METHODS ============
  
  /**
   * Emit event to specific user
   */
  emitToUser(userId, event, data) {
    if (userId && this.userSockets.has(userId.toString())) {
      this.io.to(`user:${userId.toString()}`).emit(event, data);
    }
  }

  /**
   * Emit event to all users in a crisis room
   */
  emitToCrisis(crisisId, event, data) {
    this.io.to(`crisis:${crisisId}`).emit(event, data);
  }

  /**
   * Emit event to all users with a specific role
   */
  emitToRole(role, event, data) {
    this.io.to(`role:${role}`).emit(event, data);
  }

  /**
   * Broadcast event to all connected users
   */
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  /**
   * Get count of online users
   */
  getOnlineCount() {
    return this.userSockets.size;
  }

  /**
   * Check if a specific user is online
   */
  isUserOnline(userId) {
    return userId ? this.userSockets.has(userId.toString()) : false;
  }

  /**
   * Get online users by role
   */
  getOnlineHelpers() {
    let count = 0;
    for (const [userId, sockets] of this.userSockets) {
      if (sockets.size > 0) count++;
    }
    return count;
  }

  /**
   * Get Socket.IO instance
   */
  getIO() {
    return this.io;
  }
}

module.exports = SocketManager;