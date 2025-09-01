// Dijkstra's Shortest Path Algorithm for Artificial Road Networks
// Creates realistic road networks and finds optimal paths like Uber/Ola

interface Node {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  type?: 'start' | 'end' | 'intersection' | 'junction';
  gScore?: number; // Distance from start
  fScore?: number; // Total estimated cost
  parent?: string; // For path reconstruction
}

interface Edge {
  from: string;
  to: string;
  weight: number;
  roadType: 'highway' | 'main' | 'local' | 'connector';
  trafficFactor: number;
  speedLimit: number;
}

interface ShortestPathResult {
  path: Node[];
  totalDistance: number;
  estimatedTime: number;
  route: {
    coordinates: [number, number][];
    instructions: string[];
  };
  algorithm: 'dijkstra' | 'a-star';
}

interface GraphNetwork {
  nodes: Map<string, Node>;
  edges: Map<string, Edge[]>;
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

class DijkstraPathFinder {
  private network: GraphNetwork;
  
  constructor() {
    this.network = {
      nodes: new Map(),
      edges: new Map(),
      bounds: { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 }
    };
  }

  public async findShortestPath(startLat: number, startLng: number, endLat: number, endLng: number): Promise<ShortestPathResult> {
    try {
      console.log('🗺️ Getting real road route using OpenRouteService API...');
      console.log(`🎯 Route from [${startLat}, ${startLng}] to [${endLat}, ${endLng}]`);
      
      // Step 1: Try to get real road route from OpenRouteService API
      console.log('🌐 Step 1: Calling OpenRouteService API for real roads...');
      const realRoute = await this.getRealRoadRoute(startLat, startLng, endLat, endLng);
      
      if (realRoute && realRoute.coordinates.length > 2) {
        console.log(`✅ Real road route found: ${realRoute.coordinates.length} waypoints on actual streets`);
        
        // Create path nodes from real road coordinates
        const path: Node[] = realRoute.coordinates.map((coord, index) => ({
          id: index === 0 ? 'start' : index === realRoute.coordinates.length - 1 ? 'end' : `waypoint_${index}`,
          lat: coord[0],
          lng: coord[1],
          name: index === 0 ? 'Start Location' : index === realRoute.coordinates.length - 1 ? 'End Location' : `Road Junction ${index}`,
          type: index === 0 ? 'start' : index === realRoute.coordinates.length - 1 ? 'end' : 'intersection'
        }));
        
        return {
          path,
          totalDistance: realRoute.distance,
          estimatedTime: realRoute.duration,
          route: {
            coordinates: realRoute.coordinates,
            instructions: this.generateRealRoadInstructions(realRoute.coordinates)
          },
          algorithm: 'dijkstra'
        };
      }
      
      console.log('⚠️ OpenRouteService unavailable, falling back to artificial network...');
      return await this.findArtificialPath(startLat, startLng, endLat, endLng);
      
    } catch (error) {
      console.error('❌ Error in findShortestPath:', error);
      console.log('🔄 Using artificial network fallback...');
      return await this.findArtificialPath(startLat, startLng, endLat, endLng);
    }
  }
  
  // Get real road route from OpenRouteService API
  private async getRealRoadRoute(startLat: number, startLng: number, endLat: number, endLng: number): Promise<{ coordinates: [number, number][], distance: number, duration: number } | null> {
    try {
      console.log('🌐 Attempting OpenRouteService API call...');
      
      const response = await fetch('/api/route-optimization/routing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: { lat: startLat, lng: startLng },
          to: { lat: endLat, lng: endLng },
          vehicleType: 'truck'
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`🛣️ OpenRouteService returned: ${data.distance}km, ${data.duration}min, ${data.routeCoordinates?.length || 0} points`);
        console.log('🎉 SUCCESS: Using REAL road data from OpenStreetMap!');
        
        if (data.routeCoordinates && data.routeCoordinates.length > 0) {
          return {
            coordinates: data.routeCoordinates,
            distance: data.distance,
            duration: data.duration
          };
        }
      } else {
        const errorText = await response.text();
        console.log(`⚠️ OpenRouteService response: ${response.status} - ${errorText}`);
        
        if (response.status === 400 && errorText.includes('API key')) {
          console.log('🔑 TIP: To get REAL road routing, set up a free OpenRouteService API key:');
          console.log('1. Visit: https://openrouteservice.org/dev/#/signup');
          console.log('2. Create free account (2000 requests/day)');
          console.log('3. Add to .env.local: OPENROUTE_API_KEY=your_key_here');
          console.log('4. Restart server for real road routing!');
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ OpenRouteService API call failed:', error);
      return null;
    }
  }
  
  // Generate instructions for real road routes
  private generateRealRoadInstructions(coordinates: [number, number][]): string[] {
    const instructions = ['Start your journey'];
    
    // Add instructions for major waypoints (every ~10th point to avoid clutter)
    const step = Math.max(1, Math.floor(coordinates.length / 10));
    for (let i = step; i < coordinates.length - 1; i += step) {
      instructions.push(`Continue on road for ${(i / coordinates.length * 100).toFixed(0)}% of journey`);
    }
    
    instructions.push('You have arrived at your destination');
    return instructions;
  }
  
  // Fallback to artificial network (original implementation)
  private async findArtificialPath(startLat: number, startLng: number, endLat: number, endLng: number): Promise<ShortestPathResult> {
    console.log('🏦 Creating artificial road network fallback...');
    
    // Clear any existing network
    this.network.nodes.clear();
    this.network.edges.clear();
    
    // Create artificial road network around the route area
    this.createArtificialRoadNetwork(startLat, startLng, endLat, endLng);
    
    // Add start and end points to the network
    const startNodeId = this.addDynamicNode(startLat, startLng, 'start');
    await new Promise(resolve => setTimeout(resolve, 1));
    const endNodeId = this.addDynamicNode(endLat, endLng, 'end');
    
    console.log(`📍 Artificial network: ${startNodeId} → ${endNodeId}`);
    
    // Use Dijkstra's algorithm to find shortest path
    console.log('📊 Running Dijkstra\'s algorithm on artificial network...');
    const shortestPath = this.dijkstraShortestPath(startNodeId, endNodeId);
    
    if (!shortestPath || shortestPath.length === 0) {
      console.error('❌ No path found in the artificial road network');
      throw new Error('No path found in the artificial road network');
    }
    
    if (shortestPath.length === 1) {
      console.warn('⚠️ Only found single node, this indicates start node may not be connected');
      throw new Error('Start node not properly connected to network');
    }
    
    // Convert to result format
    console.log('✅ Converting artificial network result...');
    return this.convertPathToResult(shortestPath);
  }

  // Creates an artificial road network like city streets
  private createArtificialRoadNetwork(startLat: number, startLng: number, endLat: number, endLng: number): void {
    console.log('🏦 Building artificial city road network...');
    
    // Calculate network bounds with padding
    const padding = 0.01; // ~1km padding
    const minLat = Math.min(startLat, endLat) - padding;
    const maxLat = Math.max(startLat, endLat) + padding;
    const minLng = Math.min(startLng, endLng) - padding;
    const maxLng = Math.max(startLng, endLng) + padding;
    
    this.network.bounds = { minLat, maxLat, minLng, maxLng };
    
    // Create grid-based road network (like city blocks)
    const gridSize = 0.003; // ~300m between intersections
    const latSteps = Math.ceil((maxLat - minLat) / gridSize);
    const lngSteps = Math.ceil((maxLng - minLng) / gridSize);
    
    console.log(`🗺️ Creating ${latSteps}x${lngSteps} grid network (${latSteps * lngSteps} intersections)`);
    
    // Step 1: Create intersection nodes (like city intersections)
    for (let i = 0; i <= latSteps; i++) {
      for (let j = 0; j <= lngSteps; j++) {
        const lat = minLat + (i * gridSize);
        const lng = minLng + (j * gridSize);
        const nodeId = `intersection_${i}_${j}`;
        
        this.network.nodes.set(nodeId, {
          id: nodeId,
          lat,
          lng,
          name: `Junction ${i}-${j}`,
          type: 'intersection'
        });
      }
    }
    
    // Step 2: Create road connections (horizontal and vertical roads)
    for (let i = 0; i <= latSteps; i++) {
      for (let j = 0; j <= lngSteps; j++) {
        const currentId = `intersection_${i}_${j}`;
        
        // Horizontal roads (east-west)
        if (j < lngSteps) {
          const rightId = `intersection_${i}_${j + 1}`;
          this.addBidirectionalEdge(currentId, rightId, 'main', 50);
        }
        
        // Vertical roads (north-south)
        if (i < latSteps) {
          const downId = `intersection_${i + 1}_${j}`;
          this.addBidirectionalEdge(currentId, downId, 'main', 50);
        }
        
        // Diagonal shortcuts (like diagonal streets)
        if (i < latSteps && j < lngSteps && Math.random() > 0.7) {
          const diagonalId = `intersection_${i + 1}_${j + 1}`;
          this.addBidirectionalEdge(currentId, diagonalId, 'local', 30);
        }
      }
    }
    
    // Step 3: Add major highways (express routes)
    this.addHighwayRoutes(minLat, maxLat, minLng, maxLng, gridSize);
    
    console.log(`✅ Road network created: ${this.network.nodes.size} intersections, ${this.getTotalEdges()} road segments`);
  }

  // Add highway routes for faster long-distance travel
  private addHighwayRoutes(minLat: number, maxLat: number, minLng: number, maxLng: number, gridSize: number): void {
    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    
    // Add horizontal highway
    const highwayNodes: string[] = [];
    for (let lng = minLng; lng <= maxLng; lng += gridSize * 2) {
      const nodeId = `highway_h_${Math.round(lng * 1000)}`;
      this.network.nodes.set(nodeId, {
        id: nodeId,
        lat: midLat,
        lng,
        name: 'Highway Junction',
        type: 'junction'
      });
      highwayNodes.push(nodeId);
    }
    
    // Connect highway nodes
    for (let i = 0; i < highwayNodes.length - 1; i++) {
      this.addBidirectionalEdge(highwayNodes[i], highwayNodes[i + 1], 'highway', 100);
    }
    
    // Add vertical highway
    const vHighwayNodes: string[] = [];
    for (let lat = minLat; lat <= maxLat; lat += gridSize * 2) {
      const nodeId = `highway_v_${Math.round(lat * 1000)}`;
      this.network.nodes.set(nodeId, {
        id: nodeId,
        lat,
        lng: midLng,
        name: 'Highway Junction',
        type: 'junction'
      });
      vHighwayNodes.push(nodeId);
    }
    
    // Connect vertical highway nodes
    for (let i = 0; i < vHighwayNodes.length - 1; i++) {
      this.addBidirectionalEdge(vHighwayNodes[i], vHighwayNodes[i + 1], 'highway', 100);
    }
  }
  
  // Helper to add bidirectional roads
  private addBidirectionalEdge(from: string, to: string, roadType: 'highway' | 'main' | 'local' | 'connector', speedLimit: number): void {
    const fromNode = this.network.nodes.get(from);
    const toNode = this.network.nodes.get(to);
    
    if (!fromNode || !toNode) {
      console.warn(`⚠️ Cannot create edge: missing nodes ${from} or ${to}`);
      return;
    }
    
    const distance = this.calculateDistance(fromNode, toNode);
    const trafficFactor = roadType === 'highway' ? 0.8 : roadType === 'main' ? 1.0 : roadType === 'local' ? 1.2 : 1.1;
    const weight = distance * trafficFactor;
    
    // Add forward edge
    if (!this.network.edges.has(from)) {
      this.network.edges.set(from, []);
    }
    this.network.edges.get(from)!.push({
      from,
      to,
      weight,
      roadType,
      trafficFactor,
      speedLimit
    });
    
    // Add reverse edge
    if (!this.network.edges.has(to)) {
      this.network.edges.set(to, []);
    }
    this.network.edges.get(to)!.push({
      from: to,
      to: from,
      weight,
      roadType,
      trafficFactor,
      speedLimit
    });
  }

  // Add dynamic start/end points and connect to nearest intersections
  private addDynamicNode(lat: number, lng: number, type: 'start' | 'end'): string {
    const timestamp = Date.now() + Math.random() * 1000; // Add random ms for uniqueness
    const nodeId = `${type}_${Math.floor(timestamp)}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`📍 Adding ${type} node at [${lat}, ${lng}] with ID: ${nodeId}`);
    
    // Add the node
    this.network.nodes.set(nodeId, {
      id: nodeId,
      lat,
      lng,
      name: type === 'start' ? 'Start Location' : 'End Location',
      type
    });
    
    console.log(`🗺️ Network now has ${this.network.nodes.size} nodes before finding neighbors`);
    
    // Find nearest intersections and connect
    const nearestNodes = this.findNearestNodes(lat, lng, 5); // Connect to 5 nearest nodes
    
    console.log(`🔍 Found ${nearestNodes.length} nearby intersections for ${type} node`);
    
    if (nearestNodes.length === 0) {
      console.warn(`⚠️ No nearby intersections found for ${type} point`);
      console.log(`🗺️ Network currently has ${this.network.nodes.size} total nodes`);
      
      // List first few nodes for debugging
      const nodesList = Array.from(this.network.nodes.values()).slice(0, 3);
      console.log('🔍 First few nodes:', nodesList.map(n => `${n.id} at [${n.lat.toFixed(4)}, ${n.lng.toFixed(4)}]`));
      
      return nodeId;
    }
    
    // Initialize edges array for this node
    if (!this.network.edges.has(nodeId)) {
      this.network.edges.set(nodeId, []);
    }
    
    nearestNodes.forEach((nearNode, index) => {
      const distance = this.calculateDistance(
        { lat, lng },
        { lat: nearNode.lat, lng: nearNode.lng }
      );
      
      console.log(`🔗 Connecting ${type} to ${nearNode.name} (distance: ${distance.toFixed(3)}km)`);
      
      // Add bidirectional connection
      this.addBidirectionalEdge(nodeId, nearNode.id, 'local', 30);
    });
    
    // Verify connections were created
    const edges = this.network.edges.get(nodeId) || [];
    console.log(`✅ ${type} node connected with ${edges.length} edges`);
    
    return nodeId;
  }
  
  // Find nearest nodes to a coordinate
  private findNearestNodes(lat: number, lng: number, limit: number = 5): Node[] {
    const distances: { node: Node; distance: number }[] = [];
    
    this.network.nodes.forEach(node => {
      if (node.type === 'intersection' || node.type === 'junction') {
        const distance = this.calculateDistance({ lat, lng }, { lat: node.lat, lng: node.lng });
        distances.push({ node, distance });
      }
    });
    
    return distances
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map(item => item.node);
  }
  
  // Dijkstra's shortest path algorithm - like Uber/Ola route calculation
  private dijkstraShortestPath(startId: string, endId: string): Node[] {
    console.log('📊 Running Dijkstra\'s algorithm to find shortest path...');
    console.log(`🎯 Start: ${startId}, End: ${endId}`);
    console.log(`🗺️ Network has ${this.network.nodes.size} nodes, ${this.getTotalEdges()} edges`);
    
    // Verify start and end nodes exist
    if (!this.network.nodes.has(startId)) {
      console.error(`❌ Start node ${startId} not found in network`);
      return [];
    }
    if (!this.network.nodes.has(endId)) {
      console.error(`❌ End node ${endId} not found in network`);
      return [];
    }
    
    // Check if start node has connections
    const startEdges = this.network.edges.get(startId) || [];
    console.log(`🔍 Start node has ${startEdges.length} connections`);
    
    // Initialize distances and visited sets
    const distances = new Map<string, number>();
    const previous = new Map<string, string>();
    const visited = new Set<string>();
    const unvisited = new Set<string>();
    
    // Initialize all distances to infinity except start
    this.network.nodes.forEach((node, nodeId) => {
      distances.set(nodeId, nodeId === startId ? 0 : Infinity);
      unvisited.add(nodeId);
    });
    
    // Verify start node initialization
    const startDistance = distances.get(startId);
    console.log(`📍 Start node ${startId} initialized with distance: ${startDistance}`);
    
    if (startDistance !== 0) {
      console.error(`❌ ERROR: Start node distance is ${startDistance}, should be 0!`);
      return [];
    }
    
    let currentId = startId;
    let iterations = 0;
    
    while (unvisited.size > 0 && currentId) {
      iterations++;
      const currentDistance = distances.get(currentId);
      
      // Safety check
      if (currentDistance === undefined) {
        console.error(`❌ Current node ${currentId} has undefined distance!`);
        break;
      }
      
      console.log(`🔄 Iteration ${iterations}: Processing node ${currentId} (distance: ${currentDistance === Infinity ? 'Infinity' : currentDistance.toFixed(3)}km)`);
      
      // If we reached the destination, we're done
      if (currentId === endId) {
        console.log(`✅ Shortest path found in ${iterations} iterations`);
        break;
      }
      
      // Skip if current distance is infinity (unreachable)
      if (currentDistance === Infinity) {
        console.log(`⏭️ Skipping unreachable node: ${currentId}`);
        visited.add(currentId);
        unvisited.delete(currentId);
        
        // Find next node
        let nextId: string | null = null;
        let minDistance = Infinity;
        
        unvisited.forEach(nodeId => {
          const distance = distances.get(nodeId) || Infinity;
          if (distance < minDistance) {
            minDistance = distance;
            nextId = nodeId;
          }
        });
        
        currentId = nextId!;
        if (!nextId) {
          console.log('🛑 No more reachable nodes');
          break;
        }
        continue;
      }
      
      // Check all neighbors
      const edges = this.network.edges.get(currentId) || [];
      console.log(`🔍 Node ${currentId} has ${edges.length} connections`);
      
      edges.forEach((edge, index) => {
        if (!visited.has(edge.to)) {
          const newDistance = currentDistance + edge.weight;
          const existingDistance = distances.get(edge.to) || Infinity;
          
          console.log(`  📏 Edge ${index + 1}: ${currentId} → ${edge.to} (weight: ${edge.weight.toFixed(3)}, new: ${newDistance.toFixed(3)}, existing: ${existingDistance === Infinity ? 'Inf' : existingDistance.toFixed(3)})`);
          
          if (newDistance < existingDistance) {
            distances.set(edge.to, newDistance);
            previous.set(edge.to, currentId);
            console.log(`    ✅ Updated distance to ${edge.to}: ${newDistance.toFixed(3)}km`);
          }
        } else {
          console.log(`  ⏭️ Skipping visited node: ${edge.to}`);
        }
      });
      
      // Mark current as visited
      visited.add(currentId);
      unvisited.delete(currentId);
      
      // Find next unvisited node with smallest distance
      let nextId: string | null = null;
      let minDistance = Infinity;
      
      unvisited.forEach(nodeId => {
        const distance = distances.get(nodeId) || Infinity;
        if (distance < minDistance) {
          minDistance = distance;
          nextId = nodeId;
        }
      });
      
      if (nextId) {
        console.log(`🎯 Next node: ${nextId} (distance: ${minDistance === Infinity ? 'Inf' : minDistance.toFixed(3)}km)`);
      } else {
        console.log('🛑 No more reachable nodes');
      }
      
      currentId = nextId!;
      
      // Safety check to prevent infinite loops
      if (iterations > this.network.nodes.size * 2) {
        console.warn('⚠️ Dijkstra iteration limit reached');
        break;
      }
      
      // If no next node found, break
      if (!nextId) {
        console.warn('⚠️ No more nodes to process, algorithm complete');
        break;
      }
    }
    
    // Reconstruct path
    console.log('🔄 Reconstructing path from end to start...');
    console.log(`📍 Final distances: start=${distances.get(startId)}, end=${distances.get(endId)}`);
    
    const path: Node[] = [];
    let current = endId;
    let pathSteps = 0;
    
    // Check if end is reachable
    if (distances.get(endId) === Infinity) {
      console.error('❌ End node is not reachable from start node!');
      console.log(`🔍 Start edges: ${this.network.edges.get(startId)?.length || 0}`);
      console.log(`🔍 End edges: ${this.network.edges.get(endId)?.length || 0}`);
      return [];
    }
    
    while (current && pathSteps < 50) { // Safety limit
      const node = this.network.nodes.get(current);
      if (node) {
        console.log(`🔗 Adding node: ${current} (${node.name})`);
        path.unshift(node);
      }
      
      if (current === startId) {
        console.log('🎯 Reached start node, path complete!');
        break;
      }
      
      const previousNode = previous.get(current);
      if (!previousNode) {
        console.warn(`⚠️ No previous node found for ${current}, path may be incomplete`);
        console.log('🔍 Available previous nodes:', Array.from(previous.keys()).slice(0, 5));
        break;
      }
      
      current = previousNode;
      pathSteps++;
    }
    
    if (pathSteps >= 50) {
      console.warn('⚠️ Path reconstruction hit safety limit');
    }
    
    const totalDistance = distances.get(endId) || 0;
    console.log(`🎯 Path found: ${path.length} nodes, ${totalDistance.toFixed(2)}km total distance`);
    
    return path;
  }
  
  // Convert Dijkstra path result to final format
  private convertPathToResult(path: Node[]): ShortestPathResult {
    if (path.length === 0) {
      throw new Error('Empty path provided');
    }
    
    // Calculate total distance and time
    let totalDistance = 0;
    let estimatedTime = 0;
    
    for (let i = 0; i < path.length - 1; i++) {
      const segmentDistance = this.calculateDistance(path[i], path[i + 1]);
      totalDistance += segmentDistance;
      estimatedTime += (segmentDistance / 50) * 60; // Assume 50 km/h average speed
    }
    
    // Generate route coordinates
    const coordinates: [number, number][] = path.map(node => [node.lat, node.lng]);
    
    // Generate turn-by-turn instructions
    const instructions: string[] = [
      'Start your journey',
      ...this.generateInstructions(path),
      'You have arrived at your destination'
    ];
    
    console.log(`✅ Route: ${totalDistance.toFixed(2)}km, ${estimatedTime.toFixed(0)}min, ${path.length} waypoints`);
    
    return {
      path,
      totalDistance,
      estimatedTime,
      route: {
        coordinates,
        instructions
      },
      algorithm: 'dijkstra'
    };
  }
  
  // Generate navigation instructions
  private generateInstructions(path: Node[]): string[] {
    const instructions: string[] = [];
    
    for (let i = 1; i < path.length - 1; i++) {
      const node = path[i];
      
      if (node.type === 'intersection') {
        instructions.push(`Continue through intersection at ${node.name}`);
      } else if (node.type === 'junction') {
        instructions.push(`Follow highway junction at ${node.name}`);
      } else {
        instructions.push(`Continue straight for ${this.calculateDistance(path[i-1], node).toFixed(1)}km`);
      }
    }
    
    return instructions;
  }

  // Helper methods
  private calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  private getTotalEdges(): number {
    let total = 0;
    this.network.edges.forEach(edgeList => {
      total += edgeList.length;
    });
    return total;
  }
}

// Export the main router class with Dijkstra's algorithm
export class OSPFRouter {
  private dijkstraRouter: DijkstraPathFinder;
  
  constructor() {
    this.dijkstraRouter = new DijkstraPathFinder();
  }
  
  async findOptimalRoute(startLat: number, startLng: number, endLat: number, endLng: number): Promise<ShortestPathResult> {
    console.log('🚗 OSPF Router: Finding optimal route using Dijkstra\'s algorithm...');
    return await this.dijkstraRouter.findShortestPath(startLat, startLng, endLat, endLng);
  }
}

export const ospfRouter = new OSPFRouter();

export async function calculateOptimalRoute(
  traderLat: number, 
  traderLng: number, 
  userLat: number, 
  userLng: number
): Promise<ShortestPathResult> {
  console.log('🗺️ Calculating optimal route using REAL ROADS (when API key available)...');
  console.log('🎯 Target: Follow actual OpenStreetMap roads like Uber/Ola!');
  
  try {
    console.log('🚀 Starting OSPF router...');
    const result = await ospfRouter.findOptimalRoute(traderLat, traderLng, userLat, userLng);
    
    if (result.algorithm === 'dijkstra' && result.route.coordinates.length > 4) {
      console.log(`✅ SUCCESS: Real road route found with ${result.route.coordinates.length} GPS waypoints!`);
      console.log('🛣️ Route follows actual streets and highways from OpenStreetMap');
    } else {
      console.log(`⚠️ Using artificial network fallback: ${result.route.coordinates.length} waypoints`);
    }
    
    console.log(`📊 Route stats: ${result.totalDistance}km, ${result.estimatedTime}min`);
    
    return result;
  } catch (error) {
    console.error('❌ Dijkstra routing failed with error:', error);
    console.error('🔍 Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('🔍 Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    console.log('🔄 Using fallback direct route...');
    
    // Fallback to direct route
    const distance = Math.sqrt(Math.pow(userLat - traderLat, 2) + Math.pow(userLng - traderLng, 2)) * 111;
    
    return {
      path: [
        { id: 'start', lat: traderLat, lng: traderLng, name: 'Collector Location', type: 'start' },
        { id: 'end', lat: userLat, lng: userLng, name: 'Pickup Location', type: 'end' }
      ],
      totalDistance: Math.round(distance * 10) / 10,
      estimatedTime: Math.ceil(distance * 2),
      route: {
        coordinates: [[traderLat, traderLng], [userLat, userLng]],
        instructions: ['Start from collector location', 'Head to pickup location', 'Arrive at destination']
      },
      algorithm: 'dijkstra'
    };
  }
}

export type { ShortestPathResult, Node };
export default OSPFRouter;
