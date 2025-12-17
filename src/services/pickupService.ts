import { createClient } from '@supabase/supabase-js';
import { NotificationService } from './notificationService';
import { Location, PickupTicket, EstimationResult } from '@/types/pickup';

export class PickupService {
  private supabase;
  private notificationService: NotificationService;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
    );
    this.notificationService = new NotificationService();
  }

  async createPickupRequest(estimation: EstimationResult): Promise<PickupTicket> {
    try {
      // Create pickup ticket
      const { data: ticket, error: ticketError } = await this.supabase
        .from('pickup_tickets')
        .insert({
          user_id: estimation.user_id,
          location: estimation.location,
          waste_type: estimation.waste_type,
          estimated_weight: estimation.weight,
          points: estimation.points,
          status: 'PENDING'
        })
        .select()
        .single();

      if (ticketError) throw new Error('Failed to create pickup ticket');

      // Find nearest collector
      const collector = await this._assignCollector(ticket);
      
      if (collector) {
        await this._updateTicketStatus(ticket.id, 'ASSIGNED', collector.id);
        await this._sendConfirmations(ticket, collector);
      } else {
        await this._initiateManualAssignment(ticket);
      }

      return ticket;
    } catch (error) {
      console.error('Pickup request failed:', error);
      throw error;
    }
  }

  private async _assignCollector(ticket: PickupTicket) {
    const { data: collectors } = await this.supabase
      .from('collectors')
      .select('*')
      .eq('status', 'AVAILABLE')
      .order('last_active_at', { ascending: false })
      .limit(1);

    return collectors?.[0] || null;
  }

  private async _updateTicketStatus(
    ticketId: string, 
    status: string, 
    collectorId?: string
  ) {
    await this.supabase
      .from('pickup_tickets')
      .update({ 
        status,
        collector_id: collectorId,
        updated_at: new Date()
      })
      .eq('id', ticketId);
  }

  private async _sendConfirmations(ticket: PickupTicket, collector: any) {
    await this.notificationService.sendPush(
      ticket.user_id,
      'Pickup Confirmed',
      `Your pickup request has been confirmed. Collector will arrive shortly.`
    );

    await this.notificationService.sendSMS(
      collector.phone,
      `New pickup assigned: ${ticket.waste_type} at ${ticket.location.address}`
    );
  }

  private async _initiateManualAssignment(ticket: PickupTicket) {
    await this._updateTicketStatus(ticket.id, 'MANUAL_ASSIGNMENT_NEEDED');
    
    // Notify operations team
    await this.notificationService.notifyOps({
      type: 'MANUAL_ASSIGNMENT_NEEDED',
      ticketId: ticket.id
    });
  }
}
