import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import NetworkCanvas from '../common/NetworkCanvas';
import { computeDijkstra, CITY_NAMES } from '../common/networkData';

export default function SplashView() {
  const navigate = useNavigate();
  const [activeFeed, setActiveFeed] = useState<string[]>([
    'TRK-4821 Pune → Hyderabad · On time',
    'TRK-1107 Delhi → Jaipur · In transit',
    'TRK-9034 Chennai → Kochi · On time',
  ]);

  // Routing engine interactive demo state
  const [demoFrom, setDemoFrom] = useState(0); // Delhi
  const [demoTo, setDemoTo] = useState(1);   // Mumbai
  const [demoResult, setDemoResult] = useState<{ path: number[]; dist: number }>({ path: [0, 9, 8, 1], dist: 1400 });

  useEffect(() => {
    const feeds = [
      'TRK-4821 Pune → Hyderabad · On time',
      'TRK-1107 Delhi → Jaipur · On time',
      'TRK-9034 Chennai → Kochi · On time',
      'TRK-2276 Mumbai → Indore · Priority transit',
      'TRK-7712 Kolkata → Lucknow · Cleared toll',
      'TRK-5540 Bengaluru → Hyderabad · Optimal route',
    ];

    const feedInterval = setInterval(() => {
      const next = feeds[Math.floor(Math.random() * feeds.length)];
      setActiveFeed(prev => [next, ...prev.slice(0, 2)]);
    }, 2800);

    return () => clearInterval(feedInterval);
  }, []);

  // Cycle the routing engine preview periodically if not manually changed
  useEffect(() => {
    const timer = setInterval(() => {
      const a = Math.floor(Math.random() * 14);
      let b = Math.floor(Math.random() * 14);
      while (b === a) b = Math.floor(Math.random() * 14);
      setDemoFrom(a);
      setDemoTo(b);
      setDemoResult(computeDijkstra(a, b));
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const handleSelectRoute = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    setDemoFrom(fromIdx);
    setDemoTo(toIdx);
    setDemoResult(computeDijkstra(fromIdx, toIdx));
  };

  return (
    <div className="min-h-screen bg-[#06080a] text-[#eef2e6] font-sans selection:bg-[#c8ff2e] selection:text-[#06080a]">
      {/* 1. TOP NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-4 backdrop-blur-xl bg-[#06080a]/80 border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <a href="#hero" className="logo">
            <s />
            <span className="font-extrabold text-base tracking-tight font-['Syne']">LOGISTICS//PRO</span>
          </a>

          <div className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-wider text-[#7f8a79]">
            <a href="#stats" className="hover:text-white transition">Network</a>
            <a href="#platform" className="hover:text-white transition">Platform</a>
            <a href="#engine" className="hover:text-white transition">Dijkstra Engine</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="btn-volt primary sm font-bold"
              data-mag
            >
              Launch Console →
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header id="hero" className="min-h-screen relative flex items-center overflow-hidden pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Animated Background Canvas */}
        <div className="absolute right-[-5%] top-0 w-full lg:w-[68%] h-full opacity-80 pointer-events-none">
          <NetworkCanvas ambientTrucks={8} showLabels={false} padding={34} />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <p className="font-mono text-xs uppercase tracking-widest text-[#7f8a79] mb-4 flex items-center gap-2">
            <span className="text-[#c8ff2e] font-bold text-sm">●</span> 14 Strategic Hubs Online · Pan-India Freight Grid
          </p>

          <h1 className="font-['Syne'] font-extrabold uppercase leading-[0.92] tracking-[-0.03em] text-[clamp(3.4rem,11vw,9.5rem)]">
            <span className="block">MOVE</span>
            <span className="block ol">INDIA</span>
            <span className="block v">FASTER.</span>
          </h1>

          <p className="max-w-xl my-7 text-[#b7c1ae] text-base sm:text-lg leading-relaxed">
            One shortest-path graph engine. Every freight vehicle, every regional hub, every inventory SKU — unified live on an autonomous network.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => navigate('/auth')}
              className="btn-volt primary px-8 py-4 text-base font-extrabold"
              data-mag
            >
              Launch Console →
            </button>
            <a
              href="#engine"
              className="btn-volt px-7 py-4 text-sm font-bold"
              data-mag
            >
              Watch the Engine ↓
            </a>
          </div>
        </div>

        {/* Live Activity Stream HUD (Bottom Left) */}
        <div className="absolute left-6 bottom-6 hidden lg:flex flex-col gap-2 font-mono text-xs z-10">
          {activeFeed.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-[#7f8a79]">
              <span className="w-2 h-2 rounded-full bg-[#3ddc84] animate-ping shrink-0" />
              <span className="text-[#eef2e6] font-medium">{item}</span>
            </div>
          ))}
        </div>

        {/* Scroll Cue (Bottom Right) */}
        <div className="absolute right-8 bottom-8 hidden lg:block font-mono text-[11px] uppercase tracking-widest text-[#7f8a79] [writing-mode:vertical-rl]">
          Scroll to explore ↓
        </div>
      </header>

      {/* 3. MARQUEE TICKER */}
      <div className="border-y border-white/10 bg-[#0d1114] py-5 overflow-hidden">
        <div className="flex gap-12 w-max font-['Syne'] font-extrabold text-2xl sm:text-3xl uppercase tracking-tight animate-[mq_30s_linear_infinite]">
          {CITY_NAMES.concat(CITY_NAMES).map((city, idx) => (
            <span key={idx} className={idx % 2 === 0 ? 'text-[#eef2e6]' : 'text-transparent [-webkit-text-stroke:1px_#7f8a79]'}>
              {city} Freight Hub ·
            </span>
          ))}
        </div>
      </div>
      <style>{`@keyframes mq { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>

      {/* 4. NETWORK IN NUMBERS SECTION */}
      <section id="stats" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-[#7f8a79] mb-2">Network Capacity</p>
          <h2 className="font-['Syne'] font-extrabold uppercase text-4xl sm:text-6xl tracking-tight mb-12">
            The Network,<br /><span className="ol">In Numbers</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-6 border-t border-white/10">
            <div>
              <b className="font-['Syne'] font-extrabold text-5xl sm:text-6xl text-[#c8ff2e] block leading-none mb-2">14</b>
              <span className="font-mono text-xs uppercase tracking-wider text-[#7f8a79]">Primary Freight Hubs</span>
            </div>
            <div>
              <b className="font-['Syne'] font-extrabold text-5xl sm:text-6xl text-[#eef2e6] block leading-none mb-2">44</b>
              <span className="font-mono text-xs uppercase tracking-wider text-[#7f8a79]">Live SKUs in MongoDB</span>
            </div>
            <div>
              <b className="font-['Syne'] font-extrabold text-5xl sm:text-6xl text-[#3ddc84] block leading-none mb-2">98.4%</b>
              <span className="font-mono text-xs uppercase tracking-wider text-[#7f8a79]">On-time SLA Dispatch</span>
            </div>
            <div>
              <b className="font-['Syne'] font-extrabold text-5xl sm:text-6xl text-[#00f0ff] block leading-none mb-2">3</b>
              <span className="font-mono text-xs uppercase tracking-wider text-[#7f8a79]">Role-Based Cockpits</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PLATFORM CAPABILITIES BENTO */}
      <section id="platform" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-[#7f8a79] mb-2">Architecture</p>
          <h2 className="font-['Syne'] font-extrabold uppercase text-4xl sm:text-6xl tracking-tight mb-12">
            Built to<br /><span className="text-[#c8ff2e]">Never Stand Still</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Bento Card 1 */}
            <div className="md:col-span-8 card-bento group">
              <span className="chip v mb-3">Live GIS Map</span>
              <h3 className="font-['Syne'] font-extrabold text-2xl sm:text-3xl tracking-tight mb-3">
                Every Truck. Right Now.
              </h3>
              <p className="text-[#7f8a79] text-sm max-w-lg mb-6">
                Hardware-accelerated 60 FPS HTML5 Canvas engine rendering active freight flows, road-winding Haversine paths, and pulse beacons.
              </p>
              <div className="h-16 relative border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-[#7f8a79]">Corridors: Golden Quadrilateral & Freight Lines</span>
                <span className="text-[#3ddc84] font-bold">● Active 60fps</span>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="md:col-span-4 card-bento">
              <span className="chip ok mb-3">Dijkstra Math</span>
              <h3 className="font-['Syne'] font-extrabold text-2xl tracking-tight mb-2">
                Shortest Path in 12ms
              </h3>
              <p className="text-[#7f8a79] text-xs leading-relaxed mb-6">
                Automated highway analysis eliminating dead-haul mileage and reducing fuel overhead.
              </p>
              <div className="h-20 bg-[#06080a] border border-white/10 rounded-xl p-3 flex flex-col justify-center font-mono text-xs">
                <span className="text-[#c8ff2e]">Algorithm: Single-Source Shortest</span>
                <span className="text-[#7f8a79] text-[10px] mt-1">PriorityQueue Min-Heap O(E + V log V)</span>
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="md:col-span-4 card-bento">
              <span className="chip hot mb-3">Capacity Control</span>
              <h3 className="font-['Syne'] font-extrabold text-2xl tracking-tight mb-3">
                Hub Load Factors
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#7f8a79]">Mumbai JNPT</span>
                    <span className="text-[#ff5a1f]">88%</span>
                  </div>
                  <div className="bar on h-1.5 rounded-full bg-white/5 overflow-visible relative">
                    <motion.div
                      className="h-full rounded-full bar-glow-head"
                      style={{ background: '#ff5a1f' }}
                      initial={{ width: '0%' }}
                      animate={{ width: '88%' }}
                      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#7f8a79]">Delhi Mega Hub</span>
                    <span className="text-[#c8ff2e]">72%</span>
                  </div>
                  <div className="bar on h-1.5 rounded-full bg-white/5 overflow-visible relative">
                    <motion.div
                      className="h-full rounded-full bar-glow-head"
                      style={{ background: '#c8ff2e' }}
                      initial={{ width: '0%' }}
                      animate={{ width: '72%' }}
                      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 4 */}
            <div className="md:col-span-4 card-bento">
              <span className="chip mb-3">Access Security</span>
              <h3 className="font-['Syne'] font-extrabold text-2xl tracking-tight mb-2">
                Role-Based Cockpits
              </h3>
              <p className="text-[#7f8a79] text-xs leading-relaxed">
                Superadmin, Facility Manager, and Customer portals with scoped JWT privileges and activity audit logs.
              </p>
            </div>

            {/* Bento Card 5 */}
            <div className="md:col-span-4 card-bento">
              <span className="chip v mb-3">Hybrid Persistence</span>
              <h3 className="font-['Syne'] font-extrabold text-2xl tracking-tight mb-2">
                MySQL + MongoDB
              </h3>
              <p className="text-[#7f8a79] text-xs leading-relaxed">
                Relational schema for hub topologies and user accounts, paired with high-throughput MongoDB event telemetry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ROUTING ENGINE DEMO ("WATCH IT THINK") */}
      <section id="engine" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[#7f8a79]">Routing Engine</span>
            <h2 className="font-['Syne'] font-extrabold uppercase text-4xl sm:text-6xl tracking-tight">
              Watch It<br /><span className="ol">Think.</span>
            </h2>
            <p className="text-[#7f8a79] text-sm leading-relaxed">
              Pick any two hubs or let the autonomous scheduler calculate. The engine evaluates every highway corridor and renders the optimal route in real time.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="font-mono text-[10px] uppercase text-[#7f8a79] block mb-1">From Hub</label>
                <select
                  value={demoFrom}
                  onChange={(e) => handleSelectRoute(Number(e.target.value), demoTo)}
                  className="input-dark text-xs font-mono"
                >
                  {CITY_NAMES.map((city, idx) => (
                    <option key={idx} value={idx}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase text-[#7f8a79] block mb-1">To Hub</label>
                <select
                  value={demoTo}
                  onChange={(e) => handleSelectRoute(demoFrom, Number(e.target.value))}
                  className="input-dark text-xs font-mono"
                >
                  {CITY_NAMES.map((city, idx) => (
                    <option key={idx} value={idx}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-5 bg-[#0d1114] border border-white/10 rounded-2xl space-y-2">
              <div className="font-['Syne'] font-extrabold text-2xl text-[#c8ff2e]">
                {CITY_NAMES[demoFrom]} → {CITY_NAMES[demoTo]}
              </div>
              <div className="font-mono text-xs text-[#eef2e6]">
                Distance: <strong>{demoResult.dist.toLocaleString()} KM</strong> · {demoResult.path.length} Corridor Nodes
              </div>
              <div className="font-mono text-[11px] text-[#7f8a79] pt-1">
                Via: {demoResult.path.map(i => CITY_NAMES[i]).join(' › ')}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 h-[480px] bg-[#0d1114] border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl">
            <NetworkCanvas
              ambientTrucks={4}
              showLabels={true}
              highlightPath={demoResult.path}
              highlightDuration={4000}
              className="w-full h-full block"
            />
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA & FOOTER */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#c8ff2e] text-[#06080a] rounded-3xl p-10 sm:p-16 text-center space-y-6">
            <h2 className="font-['Syne'] font-extrabold uppercase text-4xl sm:text-7xl tracking-tight leading-none">
              Ship Smarter<br />Today.
            </h2>
            <p className="font-medium text-sm sm:text-base max-w-md mx-auto text-[#06080a]/80">
              Access the live logistics control tower, monitor live Indian warehouses, and automate dispatches.
            </p>
            <div>
              <button
                onClick={() => navigate('/auth')}
                className="btn-volt px-8 py-4 bg-[#06080a] text-[#c8ff2e] hover:bg-white hover:text-black font-extrabold text-sm"
                data-mag
              >
                Enter the Console →
              </button>
            </div>
          </div>

          <footer className="pt-12 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono text-xs text-[#7f8a79]">
            <span>© 2026 LogisticsPro Platform. All rights reserved.</span>
            <span>React 19 · Node.js · MySQL · MongoDB · Dijkstra Engine</span>
          </footer>
        </div>
      </section>
    </div>
  );
}
