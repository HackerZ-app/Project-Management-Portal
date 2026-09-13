import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { logger } from '../config/logger';

let io: SocketIOServer | null = null;

/**
 * Initialize Socket.IO with native http.Server and JWT authentication middleware
 */
export const initSocket = (httpServer: http.Server): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // JWT Authentication Middleware for WebSockets
  io.use((socket, next) => {
    try {
      let token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        socket.handshake.headers?.authorization;

      if (!token) {
        return next(new Error('Authentication required for socket connection'));
      }

      if (typeof token === 'string' && token.startsWith('Bearer ')) {
        token = token.slice(7).trim();
      }

      const decoded = jwt.verify(token as string, ENV.JWT_SECRET) as any;
      socket.data.user = decoded;
      next();
    } catch (err) {
      logger.warn('[Socket.IO Auth] Failed socket authentication handshake:', err);
      next(new Error('Invalid or expired socket authentication token'));
    }
  });

  // Client Connection Handler
  io.on('connection', (socket) => {
    const user = socket.data.user;
    const userId = user?.id || user?._id;

    if (userId) {
      // Room named after user ID enables direct targeting: io.to(userId).emit(...)
      socket.join(userId.toString());
      logger.info(
        `[Socket.IO Connected] User: ${user.email} (${user.role}) connected on socket ${socket.id} (Room: ${userId})`
      );
    }

    socket.on('disconnect', (reason) => {
      logger.info(
        `[Socket.IO Disconnected] User: ${user?.email || 'Unknown'} disconnected. Reason: ${reason}`
      );
    });
  });

  logger.info('✅ Socket.IO server initialized with JWT room authentication.');
  return io;
};

/**
 * Retrieves active Socket.IO server instance
 */
export const getIO = (): SocketIOServer | null => {
  return io;
};

/**
 * Emit an event to a specific user's private room
 */
export const emitToUser = (userId: string, event: string, payload: any): void => {
  if (io) {
    io.to(userId.toString()).emit(event, payload);
  }
};
