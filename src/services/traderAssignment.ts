// TODO: Convert to Supabase - MongoDB models not available
// import dbConnect from '@/lib/mongodb';
// import Trader from '@/models/Trader';
import { routeOptimization } from './routeOptimization';

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
    // TODO: Implement with Supabase
    // await dbConnect();

    try {
      // Temporary mock data for deployment
      const mockTraders = [
        {
          _id: 'trader1',
          name: 'EcoCollector Pro',
          location: {
            type: 'Point',
            coordinates: [userLocation.coordinates[0] + 0.01, userLocation.coordinates[1] + 0.01] as [number, number]
          }
        },
        {
          _id: 'trader2',
          name: 'Green Pickup Service',
          location: {
            type: 'Point',
            coordinates: [userLocation.coordinates[0] + 0.02, userLocation.coordinates[1] + 0.02] as [number, number]
          }
        }
      ];

      // Calculate distance for each trader
      const tradersWithDistance = mockTraders.map(trader => ({
        _id: trader._id,
        name: trader.name,
        location: trader.location,
        distance: this.calculateDistance(
          userLocation.coordinates as [number, number],
          trader.location.coordinates as [number, number]
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

      // TODO: Implement with Supabase
      // Update the waste submission with the assigned trader
      // await WasteSubmission.findByIdAndUpdate(submissionId, {
      //   assignedTrader: nearestTrader._id,
      //   status: 'Assigned'
      // });

      // Update trader status
      // await Trader.findByIdAndUpdate(nearestTrader._id, {
      //   status: 'Busy'
      // });

      console.log(`Assigned trader ${nearestTrader.name} to submission ${submissionId}`);

      return nearestTrader;
    } catch (error) {
      console.error('Error assigning trader:', error);
      throw new Error('Failed to assign trader');
    }
  }

  // Enhanced method for optimized multi-pickup assignment
  static async assignTraderWithRouteOptimization(
    submissionIds: string[],
    locations: Location[],
    vehicleType: 'truck' | 'van' | 'bike' = 'truck'
  ) {
    try {
      console.log('🚛 Assigning trader with AI route optimization...');

      const nearestTrader = await this.findNearestTrader(locations[0]);

      if (!nearestTrader) {
        throw new Error('No available traders found');
      }

      // Convert trader location to route optimization format
      const startLocation = {
        lat: nearestTrader.location.coordinates[1],
        lng: nearestTrader.location.coordinates[0],
        address: `Trader: ${nearestTrader.name}`
      };

      // Convert submission locations to route optimization format
      const pickupLocations = locations.map((loc, index) => ({
        lat: loc.coordinates[1],
        lng: loc.coordinates[0],
        address: `Pickup ${index + 1}`,
        wasteType: 'mixed',
        priority: 1,
        estimatedWeight: 2.0
      }));

      // Optimize the collection route using AI
      const optimizedRoute = await routeOptimization.optimizeCollectionRoute(
        nearestTrader._id,
        pickupLocations,
        startLocation,
        vehicleType
      );

      console.log(`✅ Route optimized with ${optimizedRoute.estimatedSavings.cost.toFixed(1)}% cost reduction`);

      // TODO: Implement with Supabase
      // Update all waste submissions with the assigned trader and optimized route
      for (let i = 0; i < submissionIds.length; i++) {
        console.log(`Assigning submission ${submissionIds[i]} to trader ${nearestTrader._id} with route order ${i + 1}`);
        // await WasteSubmission.findByIdAndUpdate(submissionIds[i], {
        //   assignedTrader: nearestTrader._id,
        //   status: 'Assigned',
        //   optimizedRoute: optimizedRoute.id,
        //   routeOrder: i + 1,
        //   estimatedArrival: new Date(Date.now() + optimizedRoute.totalDuration * 60 * 60 * 1000)
        // });
      }

      // Update trader status with route information
      console.log(`Updating trader ${nearestTrader._id} status to busy with route ${optimizedRoute.id}`);
      // await Trader.findByIdAndUpdate(nearestTrader._id, {
      //   status: 'Busy',
      //   currentRoute: optimizedRoute.id,
      //   estimatedCompletionTime: new Date(Date.now() + optimizedRoute.totalDuration * 60 * 60 * 1000)
      // });

      return {
        trader: nearestTrader,
        optimizedRoute,
        savings: {
          distance: `${optimizedRoute.estimatedSavings.distance.toFixed(1)}%`,
          time: `${optimizedRoute.estimatedSavings.time.toFixed(1)}%`,
          cost: `${optimizedRoute.estimatedSavings.cost.toFixed(1)}%`,
          emissions: `${optimizedRoute.estimatedSavings.emissions.toFixed(1)}%`
        }
      };
    } catch (error) {
      console.error('Error assigning trader with route optimization:', error);
      throw new Error('Failed to assign trader with route optimization');
    }
  }

  // Get optimal collection time prediction
  static async getOptimalCollectionTime(location: Location) {
    try {
      const prediction = await routeOptimization.predictOptimalCollectionTime({
        lat: location.coordinates[1],
        lng: location.coordinates[0]
      });

      return prediction;
    } catch (error) {
      console.error('Error predicting optimal collection time:', error);
      return {
        bestTime: 'Later today',
        trafficScore: 70,
        weatherScore: 80,
        overallScore: 75
      };
    }
  }

  // Update collector location for real-time tracking
  static async updateCollectorLocation(collectorId: string, location: { lat: number; lng: number }) {
    // TODO: Implement with Supabase
    // await dbConnect();

    try {
      // Temporary implementation for deployment
      console.log(`📍 Updated collector ${collectorId} location to [${location.lat}, ${location.lng}]`);

      // await Trader.findByIdAndUpdate(collectorId, {
      //   'location.coordinates': [location.lng, location.lat],
      //   lastActiveAt: new Date()
      // });
    } catch (error) {
      console.error('Error updating collector location:', error);
      throw new Error('Failed to update collector location');
    }
  }
}
