/**
 * WebSocket Hook
 * Real-time communication with backend via Socket.io
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { toast } from 'sonner';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

interface UseSocketOptions {
  /**
   * Auto-connect on mount (default: true)
   */
  autoConnect?: boolean;
  /**
   * Reconnection attempts (default: 5)
   */
  reconnectionAttempts?: number;
  /**
   * Reconnection delay in ms (default: 1000)
   */
  reconnectionDelay?: number;
}

interface SocketState {
  connected: boolean;
  connecting: boolean;
  error: Error | null;
}

/**
 * Hook to manage WebSocket connection with Socket.io
 * Provides real-time communication with backend
 */
export function useSocket(options: UseSocketOptions = {}) {
  const {
    autoConnect = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const [state, setState] = useState<SocketState>({
    connected: false,
    connecting: false,
    error: null,
  });

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    setState((prev) => ({ ...prev, connecting: true, error: null }));

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      socketRef.current = io(WS_URL, {
        reconnectionAttempts,
        reconnectionDelay,
        transports: ['websocket', 'polling'],
        auth: {
          token,
        },
      });

      const socket = socketRef.current;

      // Connection events
      socket.on('connect', () => {
        setState({ connected: true, connecting: false, error: null });
      });

      socket.on('disconnect', (reason) => {
        setState({ connected: false, connecting: false, error: new Error(reason) });
      });

      socket.on('connect_error', (error) => {
        setState({ connected: false, connecting: false, error });
        toast.error('Erreur WebSocket', {
          description: 'Impossible de se connecter au serveur temps réel',
        });
      });

      socket.on('reconnect', (attemptNumber) => {
        toast.success('Reconnecté', {
          description: `Connexion rétablie après ${attemptNumber} tentative(s)`,
        });
        setState({ connected: true, connecting: false, error: null });
      });

      socket.on('reconnect_failed', () => {
        toast.error('Reconnexion échouée', {
          description: 'Impossible de rétablir la connexion',
        });
        setState({ connected: false, connecting: false, error: new Error('Reconnection failed') });
      });
    } catch (error) {
      setState({ connected: false, connecting: false, error: error as Error });
    }
  }, [reconnectionAttempts, reconnectionDelay]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setState({ connected: false, connecting: false, error: null });
    }
  }, []);

  // Subscribe to an event
  const on = useCallback(<T = unknown>(event: string, callback: (data: T) => void) => {
    if (!socketRef.current) {
      return;
    }

    socketRef.current.on(event, callback);

    // Return cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    };
  }, []);

  // Emit an event
  const emit = useCallback(<T = unknown>(event: string, data?: T) => {
    if (!socketRef.current?.connected) {
      toast.error('Non connecté', {
        description: 'La connexion temps réel n\'est pas active',
      });
      return;
    }

    socketRef.current.emit(event, data);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    ...state,
    socket: socketRef.current,
    connect,
    disconnect,
    on,
    emit,
  };
}

/**
 * Hook to listen to moderation events
 * Automatically invalidates queries on events
 */
export function useModerationSocket() {
  const queryClient = useQueryClient();
  const { connected, on } = useSocket();
  const [newContentCount, setNewContentCount] = useState(0);

  useEffect(() => {
    if (!connected) return;

    // Listen to new content event
    const unsubscribeNewContent = on<{ contentId: string }>('moderation:new-content', (data) => {
      // Invalidate moderation queue
      queryClient.invalidateQueries({ queryKey: ['admin', 'moderation'] });

      // Increment counter
      setNewContentCount((prev) => prev + 1);

      // Show toast notification
      toast.info('Nouveau contenu', {
        description: 'Un nouveau contenu est en attente de modération',
      });
    });

    // Listen to status changed event
    const unsubscribeStatusChanged = on<{ contentId: string; status: string }>('moderation:status-changed', (data) => {
      // Invalidate specific content and queue
      queryClient.invalidateQueries({ queryKey: ['admin', 'moderation'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'moderation', data.contentId] });
    });

    // Cleanup
    return () => {
      unsubscribeNewContent?.();
      unsubscribeStatusChanged?.();
    };
  }, [connected, on, queryClient]);

  // Reset counter
  const resetNewContentCount = useCallback(() => {
    setNewContentCount(0);
  }, []);

  return {
    connected,
    newContentCount,
    resetNewContentCount,
  };
}
