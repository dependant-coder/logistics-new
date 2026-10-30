import { useEffect, useRef } from 'react';
import { 
  INDIAN_HUBS, 
  HIGHWAY_EDGES, 
  INDIA_COASTLINE, 
  computeDijkstra 
} from './networkData';

export interface NetworkCanvasProps {
  ambientTrucks?: number;
  showLabels?: boolean;
  padding?: number;
  highlightPath?: number[] | null;
  highlightDuration?: number;
  onNodeClick?: (cityIndex: number) => void;
  className?: string;
}

export default function NetworkCanvas({
  ambientTrucks = 6,
  showLabels = true,
  padding = 28,
  highlightPath = null,
  highlightDuration = 4500,
  onNodeClick,
  className = 'w-full h-full block'
}: NetworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const routeRef = useRef<{ path: number[]; t0: number; dur: number } | null>(null);

  useEffect(() => {
    if (highlightPath && highlightPath.length > 1) {
      routeRef.current = {
        path: highlightPath,
        t0: performance.now(),
        dur: highlightDuration
      };
    } else {
      routeRef.current = null;
    }
  }, [highlightPath, highlightDuration]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    let scale = 1;
    let originX = 0;
    let originY = 0;
    let hoveredNode = -1;

    // Projected Coordinate helper
    const project = (lng: number, lat: number): [number, number] => {
      return [
        originX + (lng - 68.5) * 0.92 * scale,
        originY + (35.8 - lat) * scale
      ];
    };

    const nodeCoord = (idx: number): [number, number] => {
      const hub = INDIAN_HUBS[idx];
      return project(hub[1], hub[2]);
    };

    // Resize observer for crisp HiDPI canvas rendering
    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(10, width * dpr);
      canvas.height = Math.max(10, height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      scale = Math.min(
        (width - 2 * padding) / (29 * 0.92),
        (height - 2 * padding) / 28
      );
      originX = (width - 29 * 0.92 * scale) / 2;
      originY = (height - 28 * scale) / 2;
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(canvas);
    handleResize();

    // Node proximity check
    const findNearestNode = (clientX: number, clientY: number): number => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      let closestIdx = -1;
      let minDistance = 24;

      INDIAN_HUBS.forEach((_, idx) => {
        const [nx, ny] = nodeCoord(idx);
        const dist = Math.hypot(nx - x, ny - y);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = idx;
        }
      });
      return closestIdx;
    };

    const handleMouseMove = (e: MouseEvent) => {
      hoveredNode = findNearestNode(e.clientX, e.clientY);
      canvas.style.cursor = hoveredNode >= 0 ? 'pointer' : 'default';
    };

    const handleClick = (e: MouseEvent) => {
      const nearest = findNearestNode(e.clientX, e.clientY);
      if (nearest >= 0 && onNodeClick) {
        onNodeClick(nearest);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    // Active ambient freight trucks simulation
    interface TruckState {
      path: number[];
      progress: number;
      speed: number;
    }

    const trucks: TruckState[] = [];

    const spawnTruck = (fromIdx?: number, initialProgress = 0) => {
      const a = fromIdx ?? Math.floor(Math.random() * INDIAN_HUBS.length);
      let b = Math.floor(Math.random() * INDIAN_HUBS.length);
      while (b === a) b = Math.floor(Math.random() * INDIAN_HUBS.length);
      const res = computeDijkstra(a, b);
      trucks.push({
        path: res.path,
        progress: initialProgress,
        speed: 0.045 + Math.random() * 0.04
      });
    };

    for (let i = 0; i < ambientTrucks; i++) {
      spawnTruck(undefined, Math.random());
    }

    // Interpolate coordinate along path
    const getPointAlongPath = (path: number[], f: number) => {
      const points = path.map(i => nodeCoord(i));
      const lengths = [0];
      for (let i = 1; i < points.length; i++) {
        lengths[i] = lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
      }
      const totalLen = lengths[lengths.length - 1];
      const targetDist = f * totalLen;
      let seg = 1;
      while (seg < points.length - 1 && lengths[seg] < targetDist) seg++;
      const segLen = lengths[seg] - lengths[seg - 1] || 1;
      const k = (targetDist - lengths[seg - 1]) / segLen;
      return {
        x: points[seg - 1][0] + (points[seg][0] - points[seg - 1][0]) * k,
        y: points[seg - 1][1] + (points[seg][1] - points[seg - 1][1]) * k,
        angle: Math.atan2(points[seg][1] - points[seg - 1][1], points[seg][0] - points[seg - 1][0]),
        points,
        lengths,
        targetDist
      };
    };

    const drawTruckMarker = (x: number, y: number, angle: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.fillRect(-7, -4, 14, 8);
      ctx.fillStyle = '#06080a';
      ctx.fillRect(3, -3, 3, 6);
      ctx.restore();
    };

    // Main 60 FPS Render Loop
    const render = (now: number) => {
      animId = requestAnimationFrame(render);
      if (!canvas.offsetParent) return;

      const T = now / 1000;
      ctx.clearRect(0, 0, width, height);

      // 1. Coastline
      ctx.beginPath();
      INDIA_COASTLINE.forEach((p, idx) => {
        const [a, b] = project(...p);
        if (idx) {
          ctx.lineTo(a, b);
        } else {
          ctx.moveTo(a, b);
        }
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(200, 255, 46, 0.025)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(200, 255, 46, 0.2)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 6]);
      ctx.lineDashOffset = -T * 6;
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Arterial Highway Corridors
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      HIGHWAY_EDGES.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(...nodeCoord(a));
        ctx.lineTo(...nodeCoord(b));
        ctx.stroke();
      });

      // 3. Highlighted Dispatched Route Vector
      const activeRt = routeRef.current;
      if (activeRt && activeRt.path && activeRt.path.length > 1) {
        const routeProgress = Math.min(1, (now - activeRt.t0) / activeRt.dur);
        const routeData = getPointAlongPath(activeRt.path, routeProgress);

        // Dashed full route track
        ctx.lineCap = 'round';
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(200, 255, 46, 0.35)';
        ctx.setLineDash([3, 7]);
        ctx.beginPath();
        routeData.points.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
        ctx.stroke();
        ctx.setLineDash([]);

        // Glowing illuminated progress line
        ctx.strokeStyle = '#c8ff2e';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#c8ff2e';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(...routeData.points[0]);
        for (let i = 1; i < routeData.points.length && routeData.lengths[i] < routeData.targetDist; i++) {
          ctx.lineTo(...routeData.points[i]);
        }
        ctx.lineTo(routeData.x, routeData.y);
        ctx.stroke();
        ctx.shadowBlur = 0;

        drawTruckMarker(routeData.x, routeData.y, routeData.angle, '#ffffff');

        // Loop route if completed
        if (routeProgress >= 1) {
          activeRt.t0 = now;
        }
      }

      // 4. Ambient Freight Trucks
      for (let i = trucks.length - 1; i >= 0; i--) {
        const t = trucks[i];
        t.progress += t.speed / 60;
        if (t.progress >= 1) {
          const lastHub = t.path[t.path.length - 1];
          trucks.splice(i, 1);
          spawnTruck(lastHub, 0);
          continue;
        }
        const q = getPointAlongPath(t.path, t.progress);
        const prev = getPointAlongPath(t.path, Math.max(0, t.progress - 0.05));
        ctx.strokeStyle = 'rgba(200, 255, 46, 0.45)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();

        drawTruckMarker(q.x, q.y, q.angle, '#c8ff2e');
      }

      // 5. Hub Nodes and Radar Pulses
      INDIAN_HUBS.forEach((hub, idx) => {
        const [nx, ny] = nodeCoord(idx);
        const isRouteNode = activeRt && activeRt.path && activeRt.path.includes(idx);
        const isHovered = hoveredNode === idx;
        const pulse = (Math.sin(T * 2.2 + idx) + 1) / 2;

        // Radar ripple
        ctx.beginPath();
        ctx.arc(nx, ny, 5 + pulse * 10, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 255, 46, ${0.12 * (1 - pulse)})`;
        ctx.fill();

        // Solid Hub Dot
        ctx.beginPath();
        ctx.arc(nx, ny, isRouteNode || isHovered ? 6 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isRouteNode || isHovered ? '#c8ff2e' : '#eef2e6';
        if (isRouteNode || isHovered) {
          ctx.shadowColor = '#c8ff2e';
          ctx.shadowBlur = 16;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label typography
        if (showLabels || isHovered || isRouteNode) {
          ctx.font = '700 11px JetBrains Mono, monospace';
          ctx.fillStyle = isRouteNode || isHovered ? '#c8ff2e' : '#7f8a79';
          ctx.fillText(hub[0].toUpperCase(), nx + 10, ny + 4);
        }
      });
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [ambientTrucks, showLabels, padding, onNodeClick]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
    />
  );
}
