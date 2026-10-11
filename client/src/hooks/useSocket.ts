import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { Notification } from '../types/notification.types';

const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:5000');

/**
 * Custom hook for Socket.IO real-time connection with strict lifecycle management
 * Refinement 1: Implements explicit cleanup to prevent React 18 strict mode memory leaks and duplicate toasts
 * Edge Case Patch 3: Re-attaches latest Zustand JWT on reconnect attempts and auto-syncs missed alerts
 */
export const useSocket = (onNotificationReceived?: (notification: Notification) => void) => {
  const { token, isAuthenticated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Keep a mutable ref of the callback to avoid re-triggering the useEffect when callback reference changes
  const callbackRef = useRef(onNotificationReceived);
  useEffect(() => {
    callbackRef.current = onNotificationReceived;
  }, [onNotificationReceived]);

  useEffect(() => {
    // If not authenticated or token is missing, ensure disconnected state
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Initialize Socket.IO connection with JWT in handshake
    const socket: Socket = io(SOCKET_SERVER_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Edge Case Patch 3: Refresh auth credentials before reconnection handshake
    socket.io.on('reconnect_attempt', () => {
      const freshToken = useAuthStore.getState().token;
      if (freshToken) {
        socket.auth = { token: freshToken };
      }
    });

    // When connection is recovered, auto-sync missed notifications from MongoDB
    socket.io.on('reconnect', () => {
      setIsConnected(true);
      useNotificationStore.getState().fetchNotifications();
    });

    // Real-time notification handler
    const handleNotification = (payload: Notification) => {
      // Sync into centralized Zustand store
      useNotificationStore.getState().addNotification(payload);

      // Trigger toast with appropriate icon/styling
      if (payload.type === 'grading') {
        toast(payload.message, {
          icon: '🎓',
          duration: 6000,
          style: {
            background: '#1e293b',
            color: '#ffffff',
            border: '1px solid #3b82f6',
          },
        });
      } else if (payload.type === 'meeting') {
        toast(payload.message, {
          icon: '📅',
          duration: 6000,
          style: {
            background: '#1e293b',
            color: '#ffffff',
            border: '1px solid #10b981',
          },
        });
      } else {
        toast(payload.message, {
          icon: '🔔',
          duration: 5000,
          style: {
            background: '#1e293b',
            color: '#ffffff',
            border: '1px solid #64748b',
          },
        });
      }

      if (callbackRef.current) {
        callbackRef.current(payload);
      }
    };

    socket.on('notification', handleNotification);

    // CRITICAL: React 18 Strict Mode Cleanup
    return () => {
      socket.io.off('reconnect_attempt');
      socket.io.off('reconnect');
      socket.off('notification', handleNotification);
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [token, isAuthenticated]);

  return {
    socket: socketRef.current,
    isConnected,
  };
};

export default useSocket;
