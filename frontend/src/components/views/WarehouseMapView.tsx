import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Radio
} from 'lucide-react';
import { 
  SendIcon, 
  MapPinIcon, 
  BoxesIcon 
} from 'lucide-animated';
import NetworkCanvas from '../common/NetworkCanvas';
import { INDIAN_HUBS, HIGHWAY_EDGES } from '../common/networkData';
import MapUI from '../MapUI';
import QuickDispatchModal from '../QuickDispatchModal';
import { StaggerGrid, itemVariants } from '../common/StaggerGrid';
import { TypewriterText } from '../common/TypewriterText';
import { ScannedTitle } from '../common/ScannedTitle';
import { TiltCard } from '../common/TiltCard';
import { getWarehouses, type Warehouse } from '../../api';

// City metadata for Indian freight terminals
const CITY_CODES = ['DEL', 'BOM', 'PUN', 'KLH', 'BLR', 'MAA', 'HYD', 'CCU', 'AMD', 'JAI', 'LKO', 'IXC', 'IDR', 'COK'];
const CITY_STATES = [
  'Delhi NCR', 'Maharashtra', 'Maharashtra', 'Maharashtra', 'Karnataka',
  'Tamil Nadu', 'Telangana', 'West Bengal', 'Gujarat', 'Rajasthan',
  'Uttar Pradesh', 'Punjab', 'Madhya Pradesh', 'Kerala'
];

export default function WarehouseMapView() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedHubIndex, setSelectedHubIndex] = useState<number>(0); // Default Delhi
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'near_full' | 'critical'>('all');
  const [viewMode, setViewMode] = useState<'canvas' | 'leaflet'>('canvas');
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  useEffect(() => {
    getWarehouses()
      .then(data => {
        if (data && data.length > 0) {
          setWarehouses(data);
        }
      })
      .catch(() => {});
  }, []);

  const availableCount = warehouses.filter(w => w.status === 'available' || w.utilization < 60).length || 6;
  const nearFullCount = warehouses.filter(w => w.status === 'near_full' || (w.utilization >= 60 && w.utilization <= 85)).length || 5;
  const criticalCount = warehouses.filter(w => w.status === 'full' || w.utilization > 85).length || 3;

  // Selected Hub details
  const selectedHub = INDIAN_HUBS[selectedHubIndex] || INDIAN_HUBS[0];
  const selectedCityName = selectedHub[0];
  const selectedCityLng = selectedHub[1];
  const selectedCityLat = selectedHub[2];
  const selectedCityCode = CITY_CODES[selectedHubIndex] || 'HUB';
  const selectedCityState = CITY_STATES[selectedHubIndex] || 'India';

  const matchingWarehouse = warehouses.find(
    w => w.city.toLowerCase() === selectedCityName.toLowerCase() ||
         w.code.toLowerCase() === selectedCityCode.toLowerCase()
  );

  const hubUtilization = matchingWarehouse ? matchingWarehouse.utilization : (selectedHubIndex === 0 ? 92 : selectedHubIndex === 1 ? 88 : 65);
  const hubSqftUsed = matchingWarehouse ? matchingWarehouse.used_capacity_sqft : Math.round(250000 * (hubUtilization / 100));
  const hubSqftTotal = matchingWarehouse ? matchingWarehouse.total_capacity_sqft : 250000;

  // Find connected corridors for the selected hub
  const connectedCorridors = useMemo(() => {
    return HIGHWAY_EDGES
      .filter(([a, b]) => a === selectedHubIndex || b === selectedHubIndex)
      .map(([a, b]) => (a === selectedHubIndex ? INDIAN_HUBS[b][0] : INDIAN_HUBS[a][0]));
  }, [selectedHubIndex]);

  // Filtered warehouse list (Phase 14: <60% green, 60-85% amber, >85% red)
  const filteredWarehouses = useMemo(() => {
    if (filterStatus === 'all') return warehouses;
    if (filterStatus === 'available') {
      return warehouses.filter(w => w.status === 'available' || w.utilization < 60);
    }
    if (filterStatus === 'near_full') {
      return warehouses.filter(w => w.status === 'near_full' || (w.utilization >= 60 && w.utilization <= 85));
    }
    return warehouses.filter(w => w.status === 'full' || w.utilization > 85);
  }, [warehouses, filterStatus]);

  const getStatusColor = (util: number) => {
    if (util > 85) return '#ff4444';
    if (util >= 60) return '#ffaa00';
    return '#c8ff2e';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* 1. HEADER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="chip v">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff2e] animate-ping" />
              Pan-India Freight Grid
            </span>
            <span className="font-mono text-xs text-[#7f8a79]">
              ● 14 Primary Hubs · 21 Freight Corridors
            </span>
          </div>

          <ScannedTitle>
            <h1 className="font-['Syne'] font-extrabold uppercase text-4xl sm:text-6xl tracking-tight leading-none">
              WAREHOUSES &amp;<br />
              <span className="text-[#c8ff2e]">HUBS MAP</span>
            </h1>
          </ScannedTitle>

          <p className="font-mono text-xs text-[#7f8a79] mt-3 max-w-xl">
            <TypewriterText text="TERMINAL GRID OVERVIEW · 14 NODES ACTIVE · DIJKSTRA ROUTING LIVE" className="font-mono text-xs text-[#7f8a79]" />
          </p>
        </div>

        {/* View Mode & Legend Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          
          {/* View Mode Switcher */}
          <div className="flex bg-[#0d1114] border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('canvas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                viewMode === 'canvas' ? 'bg-[#c8ff2e] text-[#06080a]' : 'text-[#7f8a79] hover:text-white'
              }`}
            >
              60 FPS Canvas
            </button>
            <button
              onClick={() => setViewMode('leaflet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                viewMode === 'leaflet' ? 'bg-[#c8ff2e] text-[#06080a]' : 'text-[#7f8a79] hover:text-white'
              }`}
            >
              Tile Map (OSM)
            </button>
          </div>

          {/* Status Counts (Phase 14 Ramp) */}
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <button 
              onClick={() => setFilterStatus('available')}
              className={`chip text-[10px] text-[#c8ff2e] border-[#c8ff2e]/40 ${filterStatus === 'available' ? 'ring-1 ring-[#c8ff2e]' : ''}`}
            >
              ● &lt;60%: {availableCount}
            </button>
            <button 
              onClick={() => setFilterStatus('near_full')}
              className={`chip hot text-[10px] text-[#ffaa00] border-[#ffaa00]/40 ${filterStatus === 'near_full' ? 'ring-1 ring-[#ffaa00]' : ''}`}
            >
              ● 60-85%: {nearFullCount}
            </button>
            <button 
              onClick={() => setFilterStatus('critical')}
              className={`chip text-[10px] text-[#ff4444] border-[#ff4444]/40 ${filterStatus === 'critical' ? 'ring-1 ring-[#ff4444]' : ''}`}
            >
              ● &gt;85%: {criticalCount}
            </button>
          </div>
        </div>
      </div>

      {/* 2. QUICK CITY FOCUS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono text-xs">
        <span className="text-[#7f8a79] uppercase text-[10px] tracking-wider shrink-0 mr-1">
          Quick Focus:
        </span>
        {INDIAN_HUBS.map((hub, idx) => (
          <button
            key={CITY_CODES[idx]}
            onClick={() => setSelectedHubIndex(idx)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold shrink-0 transition ${
              selectedHubIndex === idx
                ? 'bg-[#c8ff2e] text-[#06080a] border-[#c8ff2e]'
                : 'bg-[#0d1114] text-[#7f8a79] border-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            {CITY_CODES[idx]} · {hub[0]}
          </button>
        ))}
      </div>

      {/* 3. MAIN INTERACTIVE MAP & HUB INSPECTOR DUAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Map Viewport (8 Columns) */}
        <div className="lg:col-span-8 card-bento p-0 overflow-hidden flex flex-col h-[580px] relative">
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0d1114]/90 backdrop-blur-md z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c8ff2e] animate-pulse" />
              <h3 className="font-['Syne'] font-extrabold text-sm uppercase tracking-wide">
                {viewMode === 'canvas' ? 'Autonomous Indian Network Grid' : 'OpenStreetMap Satellite Tiles'}
              </h3>
            </div>
            <span className="font-mono text-[10px] text-[#7f8a79]">
              Click any node to inspect terminal
            </span>
          </div>

          <div className="relative flex-1 bg-[#06080a]">
            {viewMode === 'canvas' ? (
              <NetworkCanvas
                ambientTrucks={8}
                showLabels={true}
                padding={32}
                onNodeClick={(idx) => setSelectedHubIndex(idx)}
                className="w-full h-full block cursor-crosshair"
              />
            ) : (
              <div className="w-full h-full">
                <MapUI
                  heightClass="h-[520px]"
                  onWarehouseSelect={(w) => {
                    const idx = INDIAN_HUBS.findIndex(h => h[0].toLowerCase() === w.city.toLowerCase());
                    if (idx >= 0) setSelectedHubIndex(idx);
                  }}
                />
              </div>
            )}

            {/* Map Overlay Badge */}
            <div className="absolute bottom-4 left-4 bg-[#0d1114]/90 border border-white/10 rounded-xl px-3 py-2 font-mono text-[10px] text-[#7f8a79] backdrop-blur-md flex items-center gap-3">
              <span className="text-[#c8ff2e] font-bold">● ACTIVE FOCUS: {selectedCityName.toUpperCase()}</span>
              <span>GPS: {selectedCityLat.toFixed(1)}° N, {selectedCityLng.toFixed(1)}° E</span>
            </div>
          </div>
        </div>

        {/* Right Hub Inspector Panel (4 Columns) */}
        <div className="lg:col-span-4 card-bento p-6 flex flex-col justify-between h-[580px]">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Radio size={16} className="text-[#c8ff2e] animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-wider text-[#7f8a79] font-bold">
                  Terminal Inspector
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-[#06080a] bg-[#c8ff2e] px-2 py-0.5 rounded">
                {selectedCityCode}
              </span>
            </div>

            {/* Hub Title */}
            <div className="space-y-1 mb-6">
              <h2 className="font-['Syne'] font-extrabold text-2xl uppercase tracking-tight text-[#eef2e6]">
                {matchingWarehouse?.name || `${selectedCityName} Freight Hub`}
              </h2>
              <p className="font-mono text-xs text-[#7f8a79] flex items-center gap-1.5">
                <MapPinIcon size={13} className="text-[#c8ff2e]" animateOnHover={true} />
                {selectedCityState}, India
              </p>
            </div>

            {/* Coordinates & Geometry */}
            <div className="grid grid-cols-2 gap-3 mb-5 p-3.5 bg-[#06080a] border border-white/5 rounded-xl font-mono text-xs">
              <div>
                <span className="text-[10px] uppercase text-[#7f8a79] block mb-0.5">Latitude</span>
                <span className="text-[#eef2e6] font-bold">{selectedCityLat.toFixed(4)}° N</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#7f8a79] block mb-0.5">Longitude</span>
                <span className="text-[#eef2e6] font-bold">{selectedCityLng.toFixed(4)}° E</span>
              </div>
            </div>

            {/* Capacity Meter */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-[#7f8a79]">Facility Load Factor</span>
                <span className="font-bold" style={{ color: getStatusColor(hubUtilization) }}>
                  {hubUtilization}%
                </span>
              </div>
              
              <div className="bar on h-1.5 rounded-full bg-white/5 overflow-visible relative">
                <motion.div
                  className="h-full rounded-full bar-glow-head"
                  style={{ background: getStatusColor(hubUtilization) }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${hubUtilization}%` }}
                  transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                />
              </div>

              <div className="flex items-center justify-between font-mono text-[10px] text-[#7f8a79]">
                <span>Occupied: {(hubSqftUsed / 1000).toFixed(0)}k sq ft</span>
                <span>Total: {(hubSqftTotal / 1000).toFixed(0)}k sq ft</span>
              </div>
            </div>

            {/* Highway Corridors */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79] block">
                Direct Highway Corridors ({connectedCorridors.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {connectedCorridors.map(c => (
                  <span 
                    key={c}
                    className="font-mono text-[10px] px-2 py-1 rounded-md bg-[#06080a] border border-white/10 text-[#eef2e6]"
                  >
                    ↔ {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => setIsDispatchModalOpen(true)}
              className="w-full btn-volt primary py-3 text-xs font-extrabold uppercase tracking-wider justify-center flex items-center gap-2"
              data-mag
            >
              <SendIcon size={15} animateOnHover={true} />
              Dispatch Freight To This Hub →
            </button>
          </div>
        </div>
      </div>

      {/* 4. ALL 14 OPERATIONAL FACILITIES BENTO GRID */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <BoxesIcon size={20} className="text-[#c8ff2e]" animateOnHover={true} />
            <h3 className="font-['Syne'] font-extrabold text-2xl uppercase tracking-tight">
              All 14 Operational Terminals
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#7f8a79]">Filter:</span>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition ${
                filterStatus === 'all'
                  ? 'bg-[#c8ff2e] text-[#06080a] border-[#c8ff2e]'
                  : 'bg-[#0d1114] text-[#7f8a79] border-white/10'
              }`}
            >
              All ({warehouses.length || 14})
            </button>
            <button
              onClick={() => setFilterStatus('available')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition ${
                filterStatus === 'available'
                  ? 'bg-[#c8ff2e] text-[#06080a] border-[#c8ff2e]'
                  : 'bg-[#0d1114] text-[#7f8a79] border-white/10 hover:text-white'
              }`}
            >
              Available (&lt;60%)
            </button>
            <button
              onClick={() => setFilterStatus('near_full')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition ${
                filterStatus === 'near_full'
                  ? 'bg-[#ffaa00] text-[#06080a] border-[#ffaa00]'
                  : 'bg-[#0d1114] text-[#7f8a79] border-white/10 hover:text-white'
              }`}
            >
              Near Full (60-85%)
            </button>
            <button
              onClick={() => setFilterStatus('critical')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition ${
                filterStatus === 'critical'
                  ? 'bg-[#ff4444] text-white border-[#ff4444]'
                  : 'bg-[#0d1114] text-[#7f8a79] border-white/10 hover:text-white'
              }`}
            >
              Critical (&gt;85%)
            </button>
          </div>
        </div>

        {/* Facilities Grid (Phase 14 Urgency Differentiation & Dramatic Selected Lift) */}
        <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(filteredWarehouses.length > 0 ? filteredWarehouses : warehouses).map((w: Warehouse) => {
            const isCritical = w.status === 'full' || w.utilization > 85;
            const isNearFull = !isCritical && (w.status === 'near_full' || w.utilization >= 60);
            const statusColor = isCritical ? '#ff4444' : isNearFull ? '#ffaa00' : '#c8ff2e';
            const statusLabel = isCritical ? 'Critical (>85%)' : isNearFull ? 'Near Full (60-85%)' : 'Optimal Capacity';

            const hubIdx = INDIAN_HUBS.findIndex(h => h[0].toLowerCase() === w.city.toLowerCase());
            const isSelected = selectedHubIndex === hubIdx;

            return (
              <TiltCard
                key={w.id}
                variants={itemVariants}
                isSelected={isSelected}
                onClick={() => {
                  if (hubIdx >= 0) setSelectedHubIndex(hubIdx);
                }}
                className={`p-5 cursor-pointer group transition-all duration-300 ${
                  isSelected 
                    ? 'border-[#c8ff2e] ring-2 ring-[#c8ff2e]/50 shadow-[0_0_30px_rgba(200,255,46,0.25)] scale-[1.02] z-10' 
                    : 'hover:border-white/20'
                } ${isCritical ? 'border-pulse-critical' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-[#06080a] bg-[#c8ff2e] px-2 py-0.5 rounded">
                    {w.code}
                  </span>
                  <span 
                    className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border inline-flex items-center gap-1"
                    style={{ 
                      color: statusColor, 
                      borderColor: `${statusColor}40`,
                      background: `${statusColor}15`
                    }}
                  >
                    {isCritical ? (
                      <span className="relative flex h-2 w-2 mr-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4444] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff4444]" />
                      </span>
                    ) : (
                      <span>●</span>
                    )}
                    {statusLabel}
                  </span>
                </div>

                <h4 className="font-['Syne'] font-extrabold text-base text-[#eef2e6] line-clamp-1 group-hover:text-[#c8ff2e] transition">
                  {w.name}
                </h4>

                <p className="font-mono text-xs text-[#7f8a79] mt-1 flex items-center gap-1">
                  <MapPinIcon size={12} className="text-[#7f8a79]" animateOnHover={true} /> {w.city}, {w.state}
                </p>

                <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-[#7f8a79]">Facility Load:</span>
                    <span className="font-bold flex items-center gap-1" style={{ color: statusColor }}>
                      {w.utilization}%
                    </span>
                  </div>

                  <div className="bar on h-1.5 rounded-full bg-white/5 overflow-visible relative">
                    <motion.div
                      className="h-full rounded-full bar-glow-head"
                      style={{ background: statusColor }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${w.utilization}%` }}
                      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                    />
                  </div>

                  <div className="flex justify-between font-mono text-[10px] text-[#7f8a79]">
                    <span>{(w.used_capacity_sqft / 1000).toFixed(0)}k sq ft used</span>
                    <span>{(w.total_capacity_sqft / 1000).toFixed(0)}k total</span>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </StaggerGrid>
      </div>

      {/* Quick Dispatch Modal */}
      <QuickDispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        initialToLocation={selectedCityCode}
        onSuccess={() => {
          setIsDispatchModalOpen(false);
        }}
      />
    </div>
  );
}
