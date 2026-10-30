import { useLogistics } from '../../contexts/LogisticsContext';
import { motion } from 'framer-motion';
import { 
  ChartLineIcon, 
  ActivityIcon, 
  SendIcon, 
  ClockIcon 
} from 'lucide-animated';
import { CountUp } from '../common/CountUp';
import { TypewriterText } from '../common/TypewriterText';
import { StaggerGrid, itemVariants } from '../common/StaggerGrid';
import { ScannedTitle } from '../common/ScannedTitle';

export default function AnalyticsView() {
  const { products, drivers } = useLogistics();

  const totalCapacity = 500;
  const currentInventory = products.reduce((acc, p) => acc + p.quantity, 0);
  const capacityPercent = Math.min((currentInventory / totalCapacity) * 100, 100);

  const activeDrivers = drivers.filter(d => d.status === 'On Route').length;
  const driverPercent = drivers.length > 0 ? (activeDrivers / drivers.length) * 100 : 66.7;

  // Past 7 Days delivery volume data
  const volumeData = [
    { day: 'Mon', vol: 48, label: '480T' },
    { day: 'Tue', vol: 64, label: '640T' },
    { day: 'Wed', vol: 52, label: '520T' },
    { day: 'Thu', vol: 88, label: '880T' },
    { day: 'Fri', vol: 74, label: '740T' },
    { day: 'Sat', vol: 92, label: '920T' },
    { day: 'Sun', vol: 81, label: '810T' },
  ];

  // Highway corridors throughput
  const corridorThroughput = [
    { corridor: 'Delhi NCR ↔ Mumbai JNPT (Western Expressway)', trucks: '1,420 Dispatches', efficiency: 98.6 },
    { corridor: 'Mumbai JNPT ↔ Bengaluru (NH 48)', trucks: '980 Dispatches', efficiency: 96.4 },
    { corridor: 'Bengaluru ↔ Chennai Port (NH 44 Feeder)', trucks: '840 Dispatches', efficiency: 97.2 },
    { corridor: 'Kolkata ↔ Hyderabad Central (Grand Trunk South)', trucks: '620 Dispatches', efficiency: 93.8 },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* 1. HEADER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="chip v">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff2e] animate-ping" />
              Platform Performance Telemetry
            </span>
            <span className="font-mono text-xs text-[#7f8a79]">
              ● Real-Time Metrics &amp; Corridors SLA
            </span>
          </div>

          <ScannedTitle>
            <h1 className="font-['Syne'] font-extrabold uppercase text-4xl sm:text-6xl tracking-tight leading-none">
              SYSTEM<br />
              <span className="text-[#c8ff2e]">ANALYTICS</span>
            </h1>
          </ScannedTitle>

          <p className="font-mono text-xs text-[#7f8a79] mt-3 max-w-xl">
            <TypewriterText text="PERFORMANCE ANALYTICS · 30-DAY CORRIDORS WINDOW · SLA MONITORED" className="font-mono text-xs text-[#7f8a79]" />
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="chip ok">● All 14 Hubs Operational</span>
        </div>
      </div>

      {/* 2. 4 METRIC CARDS */}
      <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <motion.div variants={itemVariants} className="card-bento p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79]">
              Network Space Utilized
            </span>
            <ChartLineIcon size={16} className="text-[#3ddc84]" animateOnHover={true} />
          </div>
          <div className="font-['Syne'] font-extrabold text-4xl text-[#eef2e6] leading-none">
            <CountUp target={capacityPercent} decimals={1} suffix="%" />
          </div>
          <div className="bar on mt-3 h-1.5 rounded-full bg-white/5 overflow-visible relative">
            <motion.div
              className="h-full rounded-full bar-glow-head"
              style={{ background: '#3ddc84' }}
              initial={{ width: '0%' }}
              animate={{ width: `${capacityPercent}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            />
          </div>
          <span className="font-mono text-[11px] text-[#7f8a79] block mt-2">
            {currentInventory || 340} pallets of {totalCapacity} max capacity
          </span>
        </motion.div>

        {/* Card 2 */}
        <motion.div variants={itemVariants} className="card-bento p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79]">
              Active Fleet Utilization
            </span>
            <ActivityIcon size={16} className="text-[#ff5a1f]" animateOnHover={true} />
          </div>
          <div className="font-['Syne'] font-extrabold text-4xl text-[#ff5a1f] leading-none">
            <CountUp target={driverPercent} decimals={1} suffix="%" />
          </div>
          <div className="bar on mt-3 h-1.5 rounded-full bg-white/5 overflow-visible relative">
            <motion.div
              className="h-full rounded-full bar-glow-head"
              style={{ background: '#ff5a1f' }}
              initial={{ width: '0%' }}
              animate={{ width: `${driverPercent}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            />
          </div>
          <span className="font-mono text-[11px] text-[#7f8a79] block mt-2">
            {activeDrivers || 3} of {drivers.length || 5} certified pilots in transit
          </span>
        </motion.div>

        {/* Card 3 */}
        <motion.div variants={itemVariants} className="card-bento p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79]">
              Dijkstra Optimization SLA
            </span>
            <SendIcon size={16} className="text-[#c8ff2e]" animateOnHover={true} />
          </div>
          <div className="font-['Syne'] font-extrabold text-4xl text-[#c8ff2e] leading-none">
            <CountUp target={98.4} decimals={1} suffix="%" />
          </div>
          <div className="bar on mt-3 h-1.5 rounded-full bg-white/5 overflow-visible relative">
            <motion.div
              className="h-full rounded-full bar-glow-head"
              style={{ background: '#c8ff2e' }}
              initial={{ width: '0%' }}
              animate={{ width: '98.4%' }}
              transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            />
          </div>
          <span className="font-mono text-[11px] text-[#7f8a79] block mt-2">
            12ms average single-source solve
          </span>
        </motion.div>

        {/* Card 4 */}
        <motion.div variants={itemVariants} className="card-bento p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79]">
              Avg Dispatch Turnaround
            </span>
            <ClockIcon size={16} className="text-[#00f0ff]" animateOnHover={true} />
          </div>
          <div className="font-['Syne'] font-extrabold text-4xl text-[#00f0ff] leading-none">
            <CountUp target={1.8} decimals={1} suffix="h" />
          </div>
          <div className="bar on mt-3 h-1.5 rounded-full bg-white/5 overflow-visible relative">
            <motion.div
              className="h-full rounded-full bar-glow-head"
              style={{ background: '#00f0ff' }}
              initial={{ width: '0%' }}
              animate={{ width: '85%' }}
              transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            />
          </div>
          <span className="font-mono text-[11px] text-[#7f8a79] block mt-2">
            Order creation to highway dispatch
          </span>
        </motion.div>

      </StaggerGrid>

      {/* 3. 7-DAY DELIVERY VOLUME BAR CHART */}
      <div className="card-bento p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-white/10">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block mb-1">
              Throughput Volume
            </span>
            <h3 className="font-['Syne'] font-extrabold text-2xl uppercase tracking-tight">
              Tonnage Dispatched (Past 7 Days)
            </h3>
          </div>
          <span className="chip ok text-xs">● +18.4% WoW Throughput</span>
        </div>

        <div className="h-64 flex items-end gap-3 sm:gap-6 pt-4 border-b border-white/10 pb-4">
          {volumeData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
              <div className="text-[10px] font-mono text-[#c8ff2e] opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                {d.label}
              </div>
              <div 
                className="w-full max-w-[54px] bg-white/10 hover:bg-[#c8ff2e] rounded-t-lg transition-all duration-300 relative group-hover:shadow-[0_0_20px_rgba(200,255,46,0.6)] cursor-pointer"
                style={{ height: `${d.vol}%` }}
              />
              <div className="font-mono text-xs text-[#7f8a79] mt-3 group-hover:text-white transition">
                {d.day}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CORRIDOR EFFICIENCY MATRIX */}
      <div className="card-bento p-6">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ChartLineIcon size={18} className="text-[#c8ff2e]" animateOnHover={true} />
            <h3 className="font-['Syne'] font-extrabold text-xl uppercase tracking-tight">
              Major Highway Freight Corridors
            </h3>
          </div>
          <span className="font-mono text-xs text-[#7f8a79]">Golden Quadrilateral Corridors</span>
        </div>

        <div className="space-y-4 font-mono text-xs">
          {corridorThroughput.map((c, i) => (
            <div key={i} className="p-4 bg-[#06080a] border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-[#eef2e6] text-sm block">{c.corridor}</span>
                <span className="text-[#7f8a79] text-[11px] mt-0.5 block">{c.trucks} logged</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] text-[#7f8a79] block">On-Time SLA</span>
                  <span className="font-bold text-[#3ddc84]">{c.efficiency}%</span>
                </div>
                <div className="w-24">
                  <div className="bar on h-1.5 rounded-full bg-white/5 overflow-visible relative">
                    <motion.div
                      className="h-full rounded-full bar-glow-head"
                      style={{ background: '#3ddc84' }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${c.efficiency}%` }}
                      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
