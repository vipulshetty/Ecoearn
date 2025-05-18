import dbConnect from '@/lib/mongodb';
import Trader from '@/models/Trader';

interface Location {
  type: string;
  coordinates: [number, number];
}

interface TraderWithDistance {
  _id: string;
  name: string;
  location: Location;
  distance: number;
}

export class TraderAssignmentService {
  private static calculateDistance(
    loc1: [number, number],
    loc2: [number, number]
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(loc2[0] - loc1[0]);
    const dLon = this.toRad(loc2[1] - loc1[1]);
    const lat1 = this.toRad(loc1[0]);
    const lat2 = this.toRad(loc2[0]);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static toRad(value: number): number {
    return value * Math.PI / 180;
  }

  static async findNearestTrader(userLocation: Location): Promise<TraderWithDistance | null> {
    await dbConnect();

    try {
      // Find all available traders
      const traders = await Trader.find({ status: 'Available' });

      if (traders.length === 0) {
        return null;
      }

      // Calculate distance for each trader
      const tradersWithDistance = traders.map(trader => ({
        _id: trader._id,
        name: trader.name,
        location: trader.location,
        distance: this.calculateDistance(
          userLocation.coordinates,
          trader.location.coordinates
        )
      }));

      // Sort by distance and get the nearest trader
      tradersWithDistance.sort((a, b) => a.distance - b.distance);
      
      return tradersWithDistance[0];
    } catch (error) {
      console.error('Error finding nearest trader:', error);
      throw new Error('Failed to find nearest trader');
    }
  }

  static async assignTrader(submissionId: string, location: Location) {
    try {
      const nearestTrader = await this.findNearestTrader(location);
      
      if (!nearestTrader) {
        throw new Error('No available traders found');
      }

      // Update the waste submission with the assigned trader
      await WasteSubmission.findByIdAndUpdate(submissionId, {
        assignedTrader: nearestTrader._id,
        status: 'Assigned'
      });

      // Update trader status
      await Trader.findByIdAndUpdate(nearestTrader._id, {
        status: 'Busy'
      });

      return nearestTrader;
    } catch (error) {
      console.error('Error assigning trader:', error);
      throw new Error('Failed to assign trader');
    }
  }
}
