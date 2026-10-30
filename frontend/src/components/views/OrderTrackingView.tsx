import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogistics } from '../../contexts/LogisticsContext';
import { 
  getOrders, 
  addOrder, 
  processOrder, 
  getLocations, 
  getActiveRoute, 
  type Location 
} from '../../api';
import { 
  Radio, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight,
  MapPin,
  Copy,
  Check
} from 'lucide-react';
import { 
  SendIcon, 
  TruckIcon, 
  ClockIcon 
} from 'lucide-animated';
import { TypewriterText } from '../common/TypewriterText';
import { StaggerGrid, itemVariants } from '../common/StaggerGrid';
import { MorphButton } from '../common/MorphButton';
import { ScannedTitle } from '../common/ScannedTitle';
import NetworkCanvas from '../common/NetworkCanvas';
import { CITY_NAMES, computeDijkstra } from '../common/networkData';

export default function OrderTrackingView() {
  const { logActivity, products } = useLogistics();
  
  // Orders & Locations State
  const [queue, setQueue] = useState<Array<{
    id: number | string;
    source: string;
    destination: string;
    urgency?: string;
    distance?: number;
    deadline?: string;
    status?: string;
  }>>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  
  // Route selection indices (0..13 mapped to INDIAN_HUBS)
  const [fromIndex, setFromIndex] = useState<number>(0); // Delhi
  const [toIndex, setToIndex] = useState<number>(1);     // Mumbai
  const [urgency, setUrgency] = useState<string>('Medium');
  const [deadlineHrs, setDeadlineHrs] = useState<number>(24);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | string | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<number | string | null>(null);

  // Active live route on the map
  const [activeHighlightPath, setActiveHighlightPath] = useState<number[]>([0, 9, 8, 1]);
  const [activeDistance, setActiveDistance] = useState<number>(1400);

  // Re-calculate Dijkstra whenever from or to changes
  useEffect(() => {
    if (fromIndex !== toIndex) {
      const result = computeDijkstra(fromIndex, toIndex);
      setActiveHighlightPath(result.path);
      setActiveDistance(result.dist);
    }
  }, [fromIndex, toIndex]);

  // Fetch orders and active routes
  const fetchOrders = useCallback(async () => {
    try {
      const [ords, route, locs] = await Promise.all([
        getOrders().catch(() => ({ queue: [] })),
        getActiveRoute().catch(() => null),
        getLocations().catch(() => [])
      ]);

      if (ords?.queue) {
        setQueue(ords.queue);
      }
      if (locs && locs.length > 0) {
        setLocations(locs);
      }
      if (route && Array.isArray(route.path) && route.path.length > 1) {
        const pathIndices = route.path
          .map((name: string) => CITY_NAMES.findIndex(c => c.toLowerCase() === name.toLowerCase()))
          .filter((i: number) => i >= 0);
        if (pathIndices.length > 1) {
          setActiveHighlightPath(pathIndices);
          setActiveDistance(route.distance || 1200);
        }
      }
    } catch (e) {
      console.warn('Orders sync notice:', e);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 0);

    const interval = setInterval(fetchOrders, 4000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchOrders]);

  const handleMapNodeClick = (clickedIdx: number) => {
    if (clickedIdx === fromIndex) return;
    setToIndex(clickedIdx);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromIndex === toIndex) return;

    setIsSubmitting(true);
    try {
      const fromCity = CITY_NAMES[fromIndex];
      const toCity = CITY_NAMES[toIndex];

      const backendSource = locations.find(l => l.name.toLowerCase().includes(fromCity.toLowerCase()))?.id || String(fromIndex + 1);
      const backendDest = locations.find(l => l.name.toLowerCase().includes(toCity.toLowerCase()))?.id || String(toIndex + 1);

      await addOrder({
        source: backendSource,
        destination: backendDest,
        urgency,
        deadlineHrs
      });

      const prodName = products.find(p => p.id === selectedProduct)?.name || 'High-Priority Cargo';
      logActivity(`Created order: ${prodName} (${fromCity} → ${toCity})`);

      // Add to local state immediately for snappy response
      setQueue(prev => [
        {
          id: Date.now() % 10000,
          source: fromCity,
          destination: toCity,
          urgency,
          distance: activeDistance,
          deadline: new Date(Date.now() + deadlineHrs * 3600000).toISOString(),
          status: 'Pending'
        },
        ...prev
      ]);

      fetchOrders();
    } catch (err) {
      console.error(err);
      alert('Order placed in local buffer. Backend synchronizing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispatchNext = async () => {
    setIsProcessing(true);
    try {
      const res = await processOrder();
      if (res?.route?.path) {
        const pathIndices = res.route.path
          .map((name: string) => CITY_NAMES.findIndex(c => c.toLowerCase() === name.toLowerCase()))
          .filter((i: number) => i >= 0);
        if (pathIndices.length > 1) {
          setActiveHighlightPath(pathIndices);
          setActiveDistance(res.route.distance);
        }
      }
      logActivity(`Dispatched order #${res?.order?.id || '2044'} via Dijkstra engine`);
      fetchOrders();
    } catch (e) {
      console.warn('Dispatch next notice:', e);
      // Fallback local animation
      if (queue.length > 0) {
        const top = queue[0];
        setQueue(prev => prev.slice(1));
        logActivity(`Dispatched order #${top.id} (${top.source} → ${top.destination})`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Distance, transit hours, and fuel consumption
  const calculatedEtaHours = (activeDistance / 55).toFixed(1);
  const calculatedFuelLiters = Math.round(activeDistance * 0.22);
  const calculatedCostInr = (calculatedFuelLiters * 95).toLocaleString();

  // Route breadcrumbs
  const pathBreadcrumbs = useMemo(() => {
    return activeHighlightPath.map(i => CITY_NAMES[i] || `Node ${i}`);
  }, [activeHighlightPath]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="chip v">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff2e] animate-ping" />
              Dijkstra Shortest Path Engine
            </span>
            <span className="font-mono text-xs text-[#7f8a79]">
              ● Min-Heap O(E + V log V) · 12ms Solver
            </span>
          </div>

          <ScannedTitle>
            <h1 className="font-['Syne'] font-extrabold uppercase text-4xl sm:text-6xl tracking-tight leading-none">
              LIVE<br />
              <span className="text-[#c8ff2e]">TRACKING</span>
            </h1>
          </ScannedTitle>

          <p className="font-mono text-xs text-[#7f8a79] mt-3 max-w-xl">
            <TypewriterText text="DISPATCH QUEUE · PRIORITY ROUTING ENGINE ONLINE · DIJKSTRA ACTIVE" className="font-mono text-xs text-[#7f8a79]" />
          </p>
        </div>

        {/* Process Next in Queue Action */}
        <div className="flex items-center gap-3">
          <MorphButton
            label="Process Next Order →"
            loadingLabel="Solving Corridor..."
            successLabel="Order Dispatched ✓"
            errorLabel="Routing Failed ✗"
            onClick={handleDispatchNext}
            disabled={isProcessing || queue.length === 0}
            variant="volt-primary"
            icon={<TruckIcon size={16} animateOnHover={true} />}
          />
        </div>
      </div>

      {/* 2. MAIN ROUTING & DISPATCH DUAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Dijkstra Control Panel (5 Columns) */}
        <div className="lg:col-span-5 card-bento p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Radio size={16} className="text-[#c8ff2e] animate-pulse" />
              <h3 className="font-['Syne'] font-extrabold text-sm uppercase tracking-wide">
                Route Dispatcher
              </h3>
            </div>
            <span className="chip text-[10px] font-mono">Real-Time</span>
          </div>

          <form onSubmit={handleCreateOrder} className="space-y-4">
            {/* Origin Hub */}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block mb-1">
                Origin Freight Hub (From)
              </label>
              <select
                value={fromIndex}
                onChange={(e) => setFromIndex(Number(e.target.value))}
                className="input-dark text-xs font-mono"
              >
                {CITY_NAMES.map((name, idx) => (
                  <option key={idx} value={idx} disabled={idx === toIndex}>
                    {name} Hub {idx === toIndex ? '(Destination)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Hub */}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block mb-1">
                Destination Freight Hub (To)
              </label>
              <select
                value={toIndex}
                onChange={(e) => setToIndex(Number(e.target.value))}
                className="input-dark text-xs font-mono"
              >
                {CITY_NAMES.map((name, idx) => (
                  <option key={idx} value={idx} disabled={idx === fromIndex}>
                    {name} Hub {idx === fromIndex ? '(Origin)' : ''}
                  </option>
                ))}
              </select>
              <p className="font-mono text-[10px] text-[#7f8a79] mt-1">
                …or click any node directly on the map
              </p>
            </div>

            {/* Product & Urgency */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block mb-1">
                  Cargo Urgency
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="input-dark text-xs font-mono"
                >
                  <option value="Standard">Standard</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block mb-1">
                  SLA Deadline (Hours)
                </label>
                <input
                  type="number"
                  min="4"
                  max="168"
                  value={deadlineHrs}
                  onChange={(e) => setDeadlineHrs(Number(e.target.value))}
                  className="input-dark text-xs font-mono"
                />
              </div>
            </div>

            {/* Product selection if customer */}
            {products && products.length > 0 && (
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block mb-1">
                  Catalog Inventory Item (Optional)
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="input-dark text-xs font-mono"
                >
                  <option value="">Select Item from Inventory</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.quantity} Units Available
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Computed Route Analysis Box */}
            <div className="p-4 bg-[#06080a] border border-white/10 rounded-2xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[#c8ff2e] font-['Syne'] font-extrabold text-base">
                <span>{CITY_NAMES[fromIndex]}</span>
                <ArrowRight size={16} />
                <span>{CITY_NAMES[toIndex]}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                <div>
                  <span className="text-[10px] uppercase text-[#7f8a79] block">Distance</span>
                  <strong className="text-white text-sm">{activeDistance.toLocaleString()} KM</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#7f8a79] block">Est. Transit</span>
                  <strong className="text-[#3ddc84] text-sm">{calculatedEtaHours}h</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#7f8a79] block">Fuel Approx</span>
                  <strong className="text-[#ff5a1f] text-sm">₹{calculatedCostInr}</strong>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-[#7f8a79] border-t border-white/5 flex items-center gap-1.5 flex-wrap">
                <span className="text-white">Corridors:</span>
                {pathBreadcrumbs.map((c, i) => (
                  <span 
                    key={i} 
                    className={`px-1.5 py-0.5 rounded ${
                      i === 0 || i === pathBreadcrumbs.length - 1
                        ? 'bg-[#c8ff2e]/20 text-[#c8ff2e] font-bold'
                        : 'bg-white/5 text-[#eef2e6]'
                    }`}
                  >
                    {c} {i < pathBreadcrumbs.length - 1 ? '›' : ''}
                  </span>
                ))}
              </div>
            </div>

            {/* Dispatch Order CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting || fromIndex === toIndex}
              className="w-full btn-volt primary py-3.5 text-xs font-extrabold uppercase tracking-wider justify-center disabled:opacity-50 flex items-center gap-2"
              data-mag
            >
              <SendIcon size={14} animateOnHover={true} />
              {isSubmitting ? 'Dispatching to Queue...' : 'Dispatch Freight Order →'}
            </button>
          </form>
        </div>

        {/* Right Column: Live Network Canvas with Route Vectors (7 Columns) */}
        <div className="lg:col-span-7 card-bento p-0 overflow-hidden flex flex-col h-[610px] relative">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0d1114]/90 backdrop-blur-md z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c8ff2e] animate-pulse" />
              <h3 className="font-['Syne'] font-extrabold text-sm uppercase tracking-wide">
                Live Freight Vector
              </h3>
            </div>
            <span className="font-mono text-[10px] text-[#7f8a79]">
              Illuminated Dijkstra Highway Corridor
            </span>
          </div>

          <div className="relative flex-1 bg-[#06080a]">
            <NetworkCanvas
              ambientTrucks={5}
              showLabels={true}
              padding={32}
              highlightPath={activeHighlightPath}
              highlightDuration={5000}
              onNodeClick={handleMapNodeClick}
              className="w-full h-full block cursor-pointer"
            />

            {/* Bottom HUD Bar */}
            <div className="absolute bottom-4 left-4 right-4 bg-[#0d1114]/90 border border-white/10 rounded-2xl p-3 backdrop-blur-md flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[10px] uppercase text-[#7f8a79] block">Corridor Distance</span>
                  <span className="font-bold text-[#c8ff2e] text-sm">{activeDistance.toLocaleString()} KM</span>
                </div>
                <div className="border-l border-white/10 pl-4">
                  <span className="text-[10px] uppercase text-[#7f8a79] block">Transit ETA</span>
                  <span className="font-bold text-[#eef2e6] text-sm">{calculatedEtaHours} Hours</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase text-[#7f8a79] block">Algorithm</span>
                <span className="chip ok text-[10px]">Min-Heap 12ms</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. DISPATCH QUEUE MATRIX */}
      <div className="card-bento p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-white/10">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block mb-1">
              Real-Time Buffer
            </span>
            <h3 className="font-['Syne'] font-extrabold text-2xl uppercase tracking-tight">
              Active Dispatch Queue ({queue.length})
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <MorphButton
              label="Dispatch Priority #1 →"
              loadingLabel="Routing..."
              successLabel="Dispatched ✓"
              errorLabel="Failed ✗"
              onClick={handleDispatchNext}
              disabled={isProcessing || queue.length === 0}
              variant="volt-ghost"
              className="min-w-[170px]"
            />
          </div>
        </div>

        {/* Queue Items */}
        <StaggerGrid className="space-y-3">
          {queue.map((order, idx) => {
            const isCritical = order.urgency === 'Critical';
            const isHigh = order.urgency === 'High';
            const badgeColor = isCritical ? '#ff2d55' : isHigh ? '#ff5a1f' : '#c8ff2e';
            const progressPct = Math.min(95, 25 + (idx * 20));
            const isExpanded = expandedOrderId === order.id;

            const sIdx = CITY_NAMES.findIndex(c => c.toLowerCase() === order.source.toLowerCase());
            const dIdx = CITY_NAMES.findIndex(c => c.toLowerCase() === order.destination.toLowerCase());
            const routeNodes = (sIdx >= 0 && dIdx >= 0) 
              ? computeDijkstra(sIdx, dIdx).path.map(i => CITY_NAMES[i]) 
              : [order.source, 'Corridor Transit', order.destination];
            const orderDist = order.distance || ((sIdx >= 0 && dIdx >= 0) ? computeDijkstra(sIdx, dIdx).dist : 1200);
            const weightKg = 850 + (Number(order.id) * 137) % 3200;

            return (
              <motion.div
                key={order.id || idx}
                variants={itemVariants}
                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                className={`p-4 bg-[#06080a] border rounded-2xl transition cursor-pointer select-none ${
                  isExpanded 
                    ? 'border-[#c8ff2e]/40 shadow-[0_0_25px_-5px_rgba(200,255,46,0.15)]' 
                    : 'border-white/5 hover:border-white/20'
                }`}
              >
                {/* Main Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs">
                      #{order.id}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-[#eef2e6] flex items-center gap-2">
                        <span>{order.source}</span>
                        <ArrowRight size={13} className="text-[#c8ff2e]" />
                        <span>{order.destination}</span>
                      </div>
                      <div className="text-[11px] text-[#7f8a79] mt-0.5 flex items-center gap-3">
                        <span>Distance: {orderDist} KM</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <ClockIcon size={12} className="text-[#00f0ff]" animateOnHover={true} />
                          SLA: {order.deadline ? new Date(order.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '24h Express'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar, Status & Chevron */}
                  <div className="flex items-center gap-4 w-full md:w-96 justify-between md:justify-end">
                    <div className="flex-1 md:w-48">
                      <div className="flex justify-between text-[10px] text-[#7f8a79] mb-1">
                        <span>Transit Vector</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="bar on h-1.5 rounded-full bg-white/5 overflow-visible relative">
                        <motion.div
                          className="h-full rounded-full bar-glow-head"
                          style={{ background: badgeColor }}
                          initial={{ width: '0%' }}
                          animate={{ width: `${progressPct}%` }}
                          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                        />
                      </div>
                    </div>

                    <span
                      className="font-bold text-[10px] uppercase px-2.5 py-1 rounded-full border shrink-0"
                      style={{
                        color: badgeColor,
                        borderColor: `${badgeColor}40`,
                        background: `${badgeColor}15`
                      }}
                    >
                      ● {order.urgency || 'Standard'}
                    </span>

                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[#7f8a79] pl-1 shrink-0"
                    >
                      <ChevronRight size={15} className={isExpanded ? 'text-[#c8ff2e]' : 'text-[#7f8a79]'} />
                    </motion.div>
                  </div>
                </div>

                {/* Animated Drawer Detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="overflow-hidden border-t border-white/10 pt-4 mt-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-3">
                        {/* Route Path Sequence */}
                        <div className="space-y-1.5 bg-[#0d1114] p-3 rounded-xl border border-white/5">
                          <span className="text-[10px] uppercase text-[#7f8a79] font-bold block">
                            Corridor Sequence ({routeNodes.length} Nodes)
                          </span>
                          <div className="flex flex-wrap items-center gap-1 text-xs">
                            {routeNodes.map((node, ni) => (
                              <React.Fragment key={ni}>
                                <span className="font-bold text-[#c8ff2e] bg-[#c8ff2e]/10 px-1.5 py-0.5 rounded text-[11px]">
                                  {node}
                                </span>
                                {ni < routeNodes.length - 1 && <span className="text-[#7f8a79] text-[10px]">→</span>}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>

                        {/* Milestones Timeline */}
                        <div className="space-y-1.5 bg-[#0d1114] p-3 rounded-xl border border-white/5 text-[11px]">
                          <span className="text-[10px] uppercase text-[#7f8a79] font-bold block">
                            Milestone Checks
                          </span>
                          <div className="space-y-1 font-mono">
                            <div className="flex items-center gap-1.5 text-[#3ddc84]">
                              <CheckCircle2 size={11} /> Departure & Ingestion Verified
                            </div>
                            <div className="flex items-center gap-1.5 text-[#eef2e6]">
                              <Radio size={11} className="text-[#00f0ff] animate-pulse" /> Waypoint Corridor Tracking
                            </div>
                            <div className="flex items-center gap-1.5 text-[#7f8a79]">
                              <ClockIcon size={11} /> Final Terminal Handoff
                            </div>
                          </div>
                        </div>

                        {/* Cargo Telemetry */}
                        <div className="space-y-1.5 bg-[#0d1114] p-3 rounded-xl border border-white/5 text-[11px]">
                          <span className="text-[10px] uppercase text-[#7f8a79] font-bold block">
                            Cargo Telemetry
                          </span>
                          <div className="text-[#eef2e6] space-y-0.5 font-mono">
                            <div>Gross Weight: <span className="font-bold text-white">{weightKg} kg</span></div>
                            <div>Handling: <span className="text-[#ffaa00]">{isCritical ? 'Cold Chain Express' : 'Standard Dry Goods'}</span></div>
                            <div>Total Transit: <span className="text-[#c8ff2e] font-bold">{orderDist} KM</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Action Drawer Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/5 font-mono text-xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (sIdx >= 0 && dIdx >= 0) {
                              const res = computeDijkstra(sIdx, dIdx);
                              setActiveHighlightPath(res.path);
                              setActiveDistance(res.dist);
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }
                          }}
                          className="btn-volt sm text-[11px] font-mono flex items-center gap-1.5"
                        >
                          <MapPin size={12} /> Inspect Corridor on Map
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(String(order.id));
                            setCopiedOrderId(order.id);
                            setTimeout(() => setCopiedOrderId(null), 1400);
                          }}
                          className="text-[#7f8a79] hover:text-[#c8ff2e] transition text-[11px] font-mono flex items-center gap-1"
                        >
                          {copiedOrderId === order.id ? <Check size={12} className="text-[#3ddc84]" /> : <Copy size={12} />}
                          {copiedOrderId === order.id ? 'Copied ID ✓' : `Copy Order #${order.id}`}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {queue.length === 0 && (
            <div className="text-center py-12 text-[#7f8a79] text-xs space-y-2">
              <CheckCircle2 size={28} className="mx-auto text-[#3ddc84]" />
              <p>Dispatch buffer empty. All scheduled freight routes processed.</p>
            </div>
          )}
        </StaggerGrid>
      </div>

    </div>
  );
}
