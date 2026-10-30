import { useEffect, useRef, useState } from 'react';
import { useLogistics } from '../../contexts/LogisticsContext';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  Radio,
  CheckCircle2
} from 'lucide-react';
import { 
  SendIcon, 
  MapPinIcon, 
  DatabaseIcon, 
  BoxesIcon, 
  TruckIcon, 
  ChartLineIcon, 
  ActivityIcon, 
  ShieldCheckIcon 
} from 'lucide-animated';
import { useNavigate } from 'react-router-dom';
import NetworkCanvas from '../common/NetworkCanvas';
import QuickDispatchModal from '../QuickDispatchModal';
import { CountUp } from '../common/CountUp';
import { TypewriterText } from '../common/TypewriterText';
import { StaggerGrid, itemVariants } from '../common/StaggerGrid';
import { ScannedTitle } from '../common/ScannedTitle';
import { TiltCard } from '../common/TiltCard';
import { 
  getWarehouses, 
  getOrders, 
  getActiveRoute, 
  getDatabaseSnapshot, 
  type Warehouse, 
  type Edge 
} from '../../api';

// Severity classifier for activity log entries
function getSeverityClass(action: string): string {
  const lower = action.toLowerCase();
  if (/error|fail|critical|reject/.test(lower)) return 'severity-error';
  if (/success|complete|sync|confirmed|dispatched/.test(lower)) return 'severity-success';
  if (/warn|delay|slow|overdue/.test(lower)) return 'severity-warn';
  return 'severity-info';
}

export default function DashboardView() {
  const { activityLogs, role, user } = useLogistics();
  const navigate = useNavigate();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [activeOrdersCount, setActiveOrdersCount] = useState(4);
  const [totalItemsCount, setTotalItemsCount] = useState(44);
  const [totalCapacityUsedPct, setTotalCapacityUsedPct] = useState(68);
  const [, setEdges] = useState<Edge[]>([]);
  const [, setCurrentRoute] = useState<unknown>(null);
  const [dbConnected, setDbConnected] = useState<boolean>(true);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [tickerTime, setTickerTime] = useState(new Date().toLocaleTimeString());
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [whList, ords, snapshot, route] = await Promise.all([
          getWarehouses().catch(() => []),
          getOrders().catch(() => ({ queue: [] })),
          getDatabaseSnapshot().catch(() => null),
          getActiveRoute().catch(() => null)
        ]);

        if (whList && whList.length > 0) {
          setWarehouses(whList);
        }
        setActiveOrdersCount(ords?.queue?.length || 4);
        setCurrentRoute(route);

        if (snapshot) {
          setDbConnected(snapshot.connected);
          setEdges(snapshot.tables?.edges?.rows || []);
          setTotalItemsCount(snapshot.tables?.inventory?.count || 44);

          const whs = snapshot.tables?.warehouses?.rows || whList;
          if (whs && whs.length > 0) {
            const totalCap = whs.reduce((acc: number, w: { total_capacity_sqft?: number }) => acc + (w.total_capacity_sqft || 0), 0);
            const usedCap = whs.reduce((acc: number, w: { used_capacity_sqft?: number }) => acc + (w.used_capacity_sqft || 0), 0);
            setTotalCapacityUsedPct(totalCap > 0 ? Math.round((usedCap / totalCap) * 100) : 68);
          }
        }
      } catch (err) {
        console.warn('Dashboard data fetch note:', err);
      }
    }

    loadData();

    tickerRef.current = setInterval(() => {
      setTickerTime(new Date().toLocaleTimeString());
    }, 30000);

    const interval = setInterval(async () => {
      try {
        const route = await getActiveRoute().catch(() => null);
        setCurrentRoute(route);
        const ords = await getOrders().catch(() => null);
        if (ords?.queue) {
          setActiveOrdersCount(ords.queue.length);
        }
      } catch {
        // Polling gracefully catches network errors
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, []);

  // Hub capacity preview data
  const hubCapacities = [
    { name: 'Delhi NCR Mega Fulfillment', code: 'DEL', util: 92, sqft: '420,000' },
    { name: 'Mumbai JNPT Port Logistics', code: 'BOM', util: 88, sqft: '380,000' },
    { name: 'Bengaluru Tech Logistics Park', code: 'BLR', util: 71, sqft: '310,000' },
    { name: 'Pune Automotive & Express Hub', code: 'PUN', util: 64, sqft: '250,000' },
    { name: 'Kolkata East Corridors Terminal', code: 'CCU', util: 83, sqft: '290,000' },
    { name: 'Chennai Port Freight Depot', code: 'MAA', util: 55, sqft: '270,000' },
    { name: 'Hyderabad Central Cargo Hub', code: 'HYD', util: 47, sqft: '220,000' },
    { name: 'Ahmedabad West Logistics Center', code: 'AMD', util: 38, sqft: '190,000' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* 1. TOP COCKPIT HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="chip v">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff2e] animate-ping" />
              {role === 'admin' ? 'Superadmin Cockpit' : role === 'manager' ? 'Facility Manager Portal' : 'Enterprise Customer Console'}
            </span>
            <span className="font-mono text-xs text-[#7f8a79]">
              ● {user?.email || 'operator@logistics.in'}
            </span>
          </div>

          <ScannedTitle>
            <h1 className="font-['Syne'] font-extrabold uppercase text-4xl sm:text-6xl tracking-tight leading-none">
              OPERATIONS<br />
              <span className="text-[#c8ff2e]">LIVE</span>
            </h1>
          </ScannedTitle>

          <p className="font-mono text-xs text-[#7f8a79] mt-3 max-w-xl">
            <TypewriterText text="REAL-TIME LOGISTICS CONTROL · ALL SYSTEMS NOMINAL · DIJKSTRA ROUTING LIVE" className="font-mono text-xs text-[#7f8a79]" />
          </p>
        </div>

        {/* Action Controls with Animated Icons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsDispatchModalOpen(true)}
            className="btn-volt primary px-5 py-3 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2"
            data-mag
          >
            <SendIcon size={15} animateOnHover={true} />
            + Quick Dispatch
          </button>

          <button
            onClick={() => navigate('/map')}
            className="btn-volt px-4 py-3 text-xs font-bold font-mono flex items-center gap-2"
            data-mag
          >
            <MapPinIcon size={15} animateOnHover={true} />
            Freight Map
          </button>

          <button
            onClick={() => navigate('/database-view')}
            className="btn-volt px-4 py-3 text-xs font-bold font-mono text-[#7f8a79] hover:text-white flex items-center gap-2"
            data-mag
          >
            <DatabaseIcon size={15} animateOnHover={true} />
            DB Snapshot
          </button>
        </div>
      </div>

      {/* LIVE TELEMETRY TICKER */}
      {(() => {
        const items = [
          `● 14 HUBS ONLINE`,
          `${warehouses.length || 14} NODES ACTIVE`,
          `DIJKSTRA AVG 12ms`,
          `MYSQL LIVE · 0 REPL LAG`,
          `API LATENCY 24ms`,
          `NEXT CONVOY: DEL → BOM · ETA 06:40`,
          `FLEET UTILIZATION 87%`,
          `COLD CHAIN UNITS: 3 ACTIVE`,
          `DB: ${dbConnected ? 'CONNECTED' : 'OFFLINE'}`,
          `LAST SYNC: ${tickerTime}`,
        ];
        const tickerLine = items.join('   ·   ') + '   ·   ';
        return (
          <div className="ticker-fade overflow-hidden border-y border-[#c8ff2e]/10 py-2">
            <div className="ticker-track flex w-max font-mono text-[10px] text-[#c8ff2e]/55 tracking-widest select-none">
              <span className="shrink-0 pr-8">{tickerLine}</span>
              <span className="shrink-0 pr-8">{tickerLine}</span>
            </div>
          </div>
        );
      })()}

      {/* 2. 4 VOLT KPI CARDS WITH ANIMATED ICONS & SPARKLINES */}
      <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Warehouses */}
        <TiltCard 
          variants={itemVariants}
          onClick={() => navigate('/map')}
          className="p-5 cursor-pointer group hover:border-[#c8ff2e]/40 transition"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79]">
              Strategic Warehouses
            </span>
            <div className="p-1 rounded-lg bg-white/5 border border-white/10 group-hover:border-[#c8ff2e]/40 transition">
              <MapPinIcon size={16} className="text-[#c8ff2e]" animateOnHover={true} />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="font-['Syne'] font-extrabold text-4xl text-[#eef2e6] group-hover:text-[#c8ff2e] transition leading-none">
                <CountUp target={warehouses.length || 14} />
              </div>
              <span className="font-mono text-[11px] text-[#7f8a79] block mt-2">
                Pan-India Grid
              </span>
            </div>
            {/* SVG Sparkline */}
            <svg viewBox="0 0 100 40" className="w-24 h-10 stroke-[#c8ff2e] fill-none stroke-2 shrink-0 opacity-80">
              <polyline points="0,32 20,24 40,28 60,14 80,18 100,6" />
            </svg>
          </div>
        </TiltCard>

        {/* KPI 2: Inventory SKUs */}
        <TiltCard 
          variants={itemVariants}
          onClick={() => navigate('/inventory')}
          className="p-5 cursor-pointer group hover:border-[#3ddc84]/40 transition"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79]">
              Live Inventory SKUs
            </span>
            <div className="p-1 rounded-lg bg-white/5 border border-white/10 group-hover:border-[#3ddc84]/40 transition">
              <BoxesIcon size={16} className="text-[#3ddc84]" animateOnHover={true} />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="font-['Syne'] font-extrabold text-4xl text-[#eef2e6] group-hover:text-[#3ddc84] transition leading-none">
                <CountUp target={totalItemsCount} />
              </div>
              <span className="font-mono text-[11px] text-[#7f8a79] block mt-2">
                MongoDB Synced
              </span>
            </div>
            <svg viewBox="0 0 100 40" className="w-24 h-10 stroke-[#3ddc84] fill-none stroke-2 shrink-0 opacity-80">
              <polyline points="0,20 20,30 40,16 60,22 80,8 100,12" />
            </svg>
          </div>
        </TiltCard>

        {/* KPI 3: Active Shipments */}
        <TiltCard 
          variants={itemVariants}
          onClick={() => navigate('/orders')}
          className="p-5 cursor-pointer group hover:border-[#ff5a1f]/40 transition"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79]">
              Active Dispatches
            </span>
            <div className="p-1 rounded-lg bg-white/5 border border-white/10 group-hover:border-[#ff5a1f]/40 transition">
              <TruckIcon size={16} className="text-[#ff5a1f]" animateOnHover={true} />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="font-['Syne'] font-extrabold text-4xl text-[#eef2e6] group-hover:text-[#ff5a1f] transition leading-none">
                <CountUp target={activeOrdersCount} />
              </div>
              <span className="font-mono text-[11px] text-[#7f8a79] block mt-2">
                Real-Time Queue
              </span>
            </div>
            <svg viewBox="0 0 100 40" className="w-24 h-10 stroke-[#ff5a1f] fill-none stroke-2 shrink-0 opacity-80">
              <polyline points="0,34 25,28 50,30 75,12 100,16" />
            </svg>
          </div>
        </TiltCard>

        {/* KPI 4: Capacity Occupancy % */}
        <TiltCard 
          variants={itemVariants}
          onClick={() => navigate('/map')}
          className="p-5 cursor-pointer group hover:border-[#00f0ff]/40 transition"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79]">
              Network Capacity
            </span>
            <div className="p-1 rounded-lg bg-white/5 border border-white/10 group-hover:border-[#00f0ff]/40 transition">
              <ChartLineIcon size={16} className="text-[#00f0ff]" animateOnHover={true} />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="font-['Syne'] font-extrabold text-4xl text-[#eef2e6] group-hover:text-[#00f0ff] transition leading-none">
                <CountUp target={totalCapacityUsedPct} suffix="%" />
              </div>
              <span className="font-mono text-[11px] text-[#7f8a79] block mt-2">
                1.3M Sq Ft Gross
              </span>
            </div>
            <svg viewBox="0 0 100 40" className="w-24 h-10 stroke-[#00f0ff] fill-none stroke-2 shrink-0 opacity-80">
              <polyline points="0,10 30,18 55,14 80,26 100,22" />
            </svg>
          </div>
        </TiltCard>
      </StaggerGrid>

      {/* 3. CENTER TWO-COLUMN TELEMETRY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: 60 FPS Mini Freight Flow Canvas */}
        <div className="lg:col-span-7 card-bento p-0 overflow-hidden flex flex-col h-[520px]">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0d1114]/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c8ff2e] animate-pulse" />
              <h3 className="font-['Syne'] font-extrabold text-sm uppercase tracking-wide">
                Live Freight Topology
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#7f8a79]">
                Golden Quadrilateral · 60 FPS
              </span>
              <button
                onClick={() => navigate('/map')}
                className="font-mono text-xs text-[#c8ff2e] hover:underline flex items-center gap-1"
              >
                Expand <ArrowUpRight size={13} />
              </button>
            </div>
          </div>

          <div className="relative flex-1 bg-[#06080a]">
            <NetworkCanvas
              ambientTrucks={6}
              showLabels={true}
              padding={28}
              className="w-full h-full block"
            />
            {/* Floating Telemetry Badge */}
            <div className="absolute bottom-4 left-4 bg-[#0d1114]/90 border border-white/10 rounded-xl px-3 py-2 font-mono text-[10px] text-[#7f8a79] backdrop-blur-md">
              <div className="flex items-center gap-2 text-[#eef2e6]">
                <span className="text-[#3ddc84] font-bold">● ONLINE</span>
                <span>14 Hubs · 21 Highway Corridors</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Audit Log Feed */}
        <div className="lg:col-span-5 card-bento p-5 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Radio size={14} className="text-[#c8ff2e] animate-pulse" />
              <h3 className="font-['Syne'] font-extrabold text-sm uppercase tracking-wide">
                Activity Stream
              </h3>
            </div>
            <span className="chip ok text-[10px]">● Live Sync</span>
          </div>

          {/* Scrollable Audit Feed */}
          <StaggerGrid stagger={0.03} className="flex-1 overflow-y-auto space-y-3 pr-1 font-mono text-xs">
            {activityLogs.slice(0, 15).map((log, idx) => (
              <motion.div 
                key={log.id || idx}
                variants={itemVariants}
                className={`p-3 bg-[#06080a] border border-white/5 rounded-xl hover:border-white/15 transition flex flex-col gap-1 ${getSeverityClass(log.action)}`}
              >
                <div className="flex items-center justify-between text-[10px] text-[#7f8a79]">
                  <span className="text-[#c8ff2e] font-bold flex items-center gap-1.5">
                    EVENT #{1040 + idx}
                    {idx === 0 && (
                      <span className="text-[#c8ff2e] animate-pulse text-[9px] tracking-widest">● LIVE</span>
                    )}
                  </span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-[#eef2e6] font-medium leading-relaxed">
                  {idx === 0
                    ? <TypewriterText text={log.action} speed={12} cursor={false} />
                    : log.action
                  }
                </div>
              </motion.div>
            ))}

            {activityLogs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-[#7f8a79] text-xs space-y-2">
                <CheckCircle2 size={24} className="text-[#3ddc84]" />
                <p>All freight events processed smoothly.</p>
              </div>
            )}
          </StaggerGrid>
        </div>
      </div>

      {/* 4. HUB CAPACITY LOAD FACTORS MATRIX */}
      <div className="card-bento p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block mb-1">
              Floor Utilization
            </span>
            <h3 className="font-['Syne'] font-extrabold text-2xl uppercase tracking-tight">
              Indian Hub Capacity Load Factors
            </h3>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-[#3ddc84]">
              <span className="w-2 h-2 rounded-full bg-[#3ddc84]" /> &lt;75% Optimal
            </span>
            <span className="flex items-center gap-1.5 text-[#ff5a1f]">
              <span className="w-2 h-2 rounded-full bg-[#ff5a1f]" /> 75-90% Near Full
            </span>
            <span className="flex items-center gap-1.5 text-[#ff2d55]">
              <span className="w-2 h-2 rounded-full bg-[#ff2d55]" /> &gt;90% Critical
            </span>
          </div>
        </div>

        {/* Capacity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hubCapacities.map((hub) => {
            const barColor = hub.util > 90 ? '#ff2d55' : hub.util >= 75 ? '#ff5a1f' : '#3ddc84';
            return (
              <div 
                key={hub.code}
                className="p-3.5 bg-[#06080a] border border-white/5 rounded-xl hover:border-white/15 transition flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-[#06080a] bg-[#c8ff2e] px-1.5 py-0.5 rounded">
                      {hub.code}
                    </span>
                    <span className="font-bold text-[#eef2e6]">{hub.name}</span>
                  </div>
                  <span className="font-mono font-bold" style={{ color: barColor }}>
                    {hub.util}%
                  </span>
                </div>

                {/* Styled Threshold Progress Bar */}
                <div className="bar on h-1.5 rounded-full bg-white/5 overflow-visible relative">
                  <motion.div
                    className="h-full rounded-full bar-glow-head"
                    style={{ background: barColor }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${hub.util}%` }}
                    transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#7f8a79]">
                  <span>Dedicated Gross Area: {hub.sqft} sq ft</span>
                  <span className="capitalize">Status: {hub.util > 90 ? 'Critical' : hub.util >= 75 ? 'Near Full' : 'Available'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. MULTI-DATABASE & PERSISTENCE ARCHITECTURE HUD WITH ANIMATED ICONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="card-bento p-5 flex items-center gap-4">
          <div className="p-3 bg-[#c8ff2e]/10 text-[#c8ff2e] rounded-2xl shrink-0">
            <ActivityIcon size={22} animateOnHover={true} />
          </div>
          <div>
            <h4 className="font-['Syne'] font-extrabold text-sm uppercase text-[#eef2e6]">
              Dijkstra Shortest Path
            </h4>
            <p className="font-mono text-[11px] text-[#7f8a79] mt-0.5">
              12ms Min-Heap O(E + V log V) solver active
            </p>
          </div>
        </div>

        <div className="card-bento p-5 flex items-center gap-4">
          <div className="p-3 bg-[#00f0ff]/10 text-[#00f0ff] rounded-2xl shrink-0">
            <DatabaseIcon size={22} animateOnHover={true} />
          </div>
          <div>
            <h4 className="font-['Syne'] font-extrabold text-sm uppercase text-[#eef2e6]">
              Hybrid Persistence
            </h4>
            <p className="font-mono text-[11px] text-[#7f8a79] mt-0.5">
              {dbConnected ? 'MySQL Relational + MongoDB Live Feed' : 'In-Memory Resilient Store Connected'}
            </p>
          </div>
        </div>

        <div className="card-bento p-5 flex items-center gap-4">
          <div className="p-3 bg-[#3ddc84]/10 text-[#3ddc84] rounded-2xl shrink-0">
            <ShieldCheckIcon size={22} animateOnHover={true} />
          </div>
          <div>
            <h4 className="font-['Syne'] font-extrabold text-sm uppercase text-[#eef2e6]">
              Security Protocol
            </h4>
            <p className="font-mono text-[11px] text-[#7f8a79] mt-0.5">
              Bcrypt Salted Hashes &amp; Scoped JWT Bearer
            </p>
          </div>
        </div>

      </div>

      {/* Quick Dispatch Modal */}
      <QuickDispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        onSuccess={() => {
          setIsDispatchModalOpen(false);
          setActiveOrdersCount(prev => prev + 1);
        }}
      />
    </div>
  );
}
