export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface EstimationResult {
  user_id: string;
  location: Location;
  waste_type: string;
  weight: number;
  points: number;
}

export interface PickupTicket {
  id: string;
  user_id: string;
  collector_id?: string;
  location: Location;
  waste_type: string;
  estimated_weight: number;
  points: number;
  status: 'PENDING' | 'ASSIGNED' | 'MANUAL_ASSIGNMENT_NEEDED' | 'COMPLETED';
  created_at: Date;
  updated_at: Date;
}

// Update src/services/pickupService.ts

export class PickupService {
  private supabase;
  private notificationService: NotificationService;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.notificationService = new NotificationService();
  }

  async createPickupRequest(submissionId: number, location: Location): Promise<void> {
    try {
      // Update waste submission with pickup details
      const { error: updateError } = await this.supabase
        .from('waste_submissions')
        .update({ 
          pickup_status: 'PENDING',
          pickup_location: location
        })
        .eq('id', submissionId);

      if (updateError) throw new Error('Failed to update submission with pickup details');

      // Find and assign collector
      const collector = await this._findNearestCollector(location);
      if (collector) {
        await this._assignCollector(submissionId, collector);
      } else {
        await this._initiateManualAssignment(submissionId);
      }
    } catch (error) {
      console.error('Pickup request failed:', error);
      throw error;
    }
  }

  private async _findNearestCollector(location: Location) {
    const { data: collectors } = await this.supabase
      .from('collectors')
      .select('*')
      .eq('status', 'AVAILABLE')
      .order('last_active_at', { ascending: false })
      .limit(1);

    return collectors?.[0] || null;
  }

  private async _assignCollector(submissionId: number, collector: any) {
    const { error } = await this.supabase
      .rpc('assign_collector', {
        submission_id: submissionId,
        collector_id: collector.id
      });

    if (error) throw new Error('Failed to assign collector');

    await this._sendConfirmations(submissionId, collector);
  }

  private async _initiateManualAssignment(submissionId: number) {
    const { error } = await this.supabase
      .from('waste_submissions')
      .update({ pickup_status: 'MANUAL_ASSIGNMENT_NEEDED' })
      .eq('id', submissionId);

    if (error) throw new Error('Failed to update pickup status');

    await this.notificationService.notifyOps({
      type: 'MANUAL_ASSIGNMENT_NEEDED',
      submissionId
    });
  }

  private async _sendConfirmations(submissionId: number, collector: any) {
    const { data: submission } = await this.supabase
      .from('waste_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (submission) {
      await this.notificationService.sendPush(
        submission.user_id,
        'Pickup Confirmed',
        `Your waste pickup request has been confirmed. Collector will arrive shortly.`
      );

      await this.notificationService.sendSMS(
        collector.phone,
        `New pickup assigned: ${submission.type} waste at ${JSON.stringify(submission.pickup_location)}`
      );
    }
  }
}