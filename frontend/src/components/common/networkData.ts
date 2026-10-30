// 14 Strategic Indian Freight Hubs [Name, Lng, Lat]
export const INDIAN_HUBS: [string, number, number][] = [
  ['Delhi', 77.2, 28.6],
  ['Mumbai', 72.9, 19.1],
  ['Pune', 73.9, 18.5],
  ['Kolhapur', 74.2, 16.7],
  ['Bengaluru', 77.6, 13.0],
  ['Chennai', 80.3, 13.1],
  ['Hyderabad', 78.5, 17.4],
  ['Kolkata', 88.4, 22.6],
  ['Ahmedabad', 72.6, 23.0],
  ['Jaipur', 75.8, 26.9],
  ['Lucknow', 80.9, 26.8],
  ['Chandigarh', 76.8, 30.7],
  ['Indore', 75.9, 22.7],
  ['Kochi', 76.3, 9.9]
];

export const CITY_NAMES = INDIAN_HUBS.map(c => c[0]);

// Highway Edges between cities
export const HIGHWAY_EDGES: [number, number][] = "Delhi-Chandigarh,Delhi-Jaipur,Delhi-Lucknow,Jaipur-Ahmedabad,Jaipur-Indore,Ahmedabad-Mumbai,Ahmedabad-Indore,Indore-Mumbai,Indore-Hyderabad,Mumbai-Pune,Pune-Kolhapur,Pune-Hyderabad,Kolhapur-Bengaluru,Bengaluru-Chennai,Bengaluru-Hyderabad,Bengaluru-Kochi,Chennai-Hyderabad,Chennai-Kochi,Hyderabad-Kolkata,Lucknow-Kolkata,Lucknow-Indore"
  .split(',').map(e => e.split('-').map(n => CITY_NAMES.indexOf(n)) as [number, number]);

// Coastline Coordinates for India map border
export const INDIA_COASTLINE: [number, number][] = [
  [74, 34.5], [77, 35.5], [79, 33], [78.5, 31], [81, 30], [80, 28.5], [84, 27.5], [88, 27], [88.5, 28],
  [92, 27], [96, 28.2], [97, 27], [95, 25], [93, 22], [92, 24], [90, 22], [89, 21.7], [87, 21.5], [85, 19.5],
  [82, 16.5], [80.3, 15], [80.3, 13], [79.8, 10.3], [78, 8.3], [77.5, 8.1], [76.3, 9.5], [75, 12], [74, 15],
  [72.8, 19], [72.7, 21], [70.5, 20.8], [69, 22.3], [70.5, 23.3], [68.2, 23.7], [69.5, 25.5], [70, 27.5],
  [72, 29], [74.5, 31], [74, 32.5]
];

// Road-winding Haversine calculation
export const haversineKm = (a: [number, number, number], b: [number, number, number]): number => {
  const rad = (x: number) => (x * Math.PI) / 180;
  const dl = rad(b[2] - a[2]);
  const dg = rad(b[1] - a[1]);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a[2])) * Math.cos(rad(b[2])) * Math.sin(dg / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h)) * 1.28;
};

// Graph Adjacency List
export const GRAPH_WEIGHTS: [number, number][][] = INDIAN_HUBS.map(() => []);
HIGHWAY_EDGES.forEach(([a, b]) => {
  const d = haversineKm([0, INDIAN_HUBS[a][1], INDIAN_HUBS[a][2]], [0, INDIAN_HUBS[b][1], INDIAN_HUBS[b][2]]);
  GRAPH_WEIGHTS[a].push([b, d]);
  GRAPH_WEIGHTS[b].push([a, d]);
});

// Client-side Dijkstra pathfinder
export function computeDijkstra(s: number, t: number): { path: number[]; dist: number } {
  const D = INDIAN_HUBS.map(() => 1e9);
  const P: (number | undefined)[] = [];
  const Q = new Set(INDIAN_HUBS.map((_, i) => i));
  D[s] = 0;

  while (Q.size) {
    let u = -1;
    Q.forEach(i => {
      if (u < 0 || D[i] < D[u]) u = i;
    });
    Q.delete(u);
    if (u === t) break;

    GRAPH_WEIGHTS[u].forEach(([v, w]) => {
      if (D[u] + w < D[v]) {
        D[v] = D[u] + w;
        P[v] = u;
      }
    });
  }

  const path: number[] = [];
  for (let x: number | undefined = t; x !== undefined; x = P[x]) {
    path.unshift(x);
    if (x === s) break;
  }
  return { path, dist: Math.round(D[t]) };
}
