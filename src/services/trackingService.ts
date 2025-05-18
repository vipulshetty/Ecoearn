import { io, Socket } from 'socket.io-client';

export class TrackingService {
  private socket: Socket | null = null;
  private submissionId: string | null = null;

  constructor() {
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
    
    this.socket.on('connect', () => {
      console.log('Connected to tracking service');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from tracking service');
    });
  }

  startTracking(submissionId: string, onLocationUpdate: (location: any) => void) {
    this.submissionId = submissionId;
    
    if (this.socket) {
      this.socket.emit('start-tracking', { submissionId });
      
      this.socket.on(`location-update-${submissionId}`, (data) => {
        onLocationUpdate(data);
      });
    }
  }

  stopTracking() {
    if (this.socket && this.submissionId) {
      this.socket.emit('stop-tracking', { submissionId: this.submissionId });
      this.socket.off(`location-update-${this.submissionId}`);
      this.submissionId = null;
    }
  }

  updateTraderLocation(traderId: string, location: { lat: number; lng: number }) {
    if (this.socket) {
      this.socket.emit('update-location', {
        traderId,
        location
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
