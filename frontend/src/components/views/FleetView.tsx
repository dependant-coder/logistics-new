import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLogistics } from '../../contexts/LogisticsContext';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Star, 
  Radio, 
  ShieldCheck,
  Zap,
  Navigation
} from 'lucide-react';
import { 
  UsersIcon, 
  TruckIcon, 
  ShieldCheckIcon, 
  ActivityIcon 
} from 'lucide-animated';
import { TypewriterText } from '../common/TypewriterText';
import { StaggerGrid, itemVariants } from '../common/StaggerGrid';
import { ScannedTitle } from '../common/ScannedTitle';
import { TiltCard } from '../common/TiltCard';

interface VehicleTelemetry {
  lat: number;
  lng: number;
  speedKmH: number;
  pingMs: number;
}

export default function FleetView() {
  const { drivers, vehicles } = useLogistics();
  const [viewTab, setViewTab] = useState<'drivers' | 'vehicles'>('drivers');
  const [searchTerm, setSearchTerm] = useState('');

  // Live CANBus GPS Telematics State (with 5s interval jitter)
  const [telemetry, setTelemetry] = useState<Record<string, VehicleTelemetry>>({
    'V-01': { lat: 19.0760, lng: 72.8777, speedKmH: 64, pingMs: 22 },
    'V-02': { lat: 28.6139, lng: 77.2090, speedKmH: 72, pingMs: 18 },
    'V-03': { lat: 12.9716, lng: 77.5946, speedKmH: 45, pingMs: 15 },
    'V-04': { lat: 13.0827, lng: 80.2707, speedKmH: 58, pingMs: 29 },
    'V-05': { lat: 22.5726, lng: 88.3639, speedKmH: 0, pingMs: 42 },
    'TRK-4821': { lat: 19.0760, lng: 72.8777, speedKmH: 64, pingMs: 22 },
    'TRK-1107': { lat: 28.6139, lng: 77.2090, speedKmH: 0, pingMs: 18 },
    'TRK-9034': { lat: 12.9716, lng: 77.5946, speedKmH: 45, pingMs: 15 },
    'TRK-2276': { lat: 13.0827, lng: 80.2707, speedKmH: 0, pingMs: 29 },
    'TRK-7712': { lat: 22.5726, lng: 88.3639, speedKmH: 0, pingMs: 42 },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          const item = next[key];
          const isRestingOrMaint = item.speedKmH === 0;
          next[key] = {
            lat: Number((item.lat + (Math.random() - 0.5) * 0.0016).toFixed(4)),
            lng: Number((item.lng + (Math.random() - 0.5) * 0.0016).toFixed(4)),
            speedKmH: isRestingOrMaint ? 0 : Math.max(25, Math.min(88, Math.round(item.speedKmH + (Math.random() - 0.5) * 6))),
            pingMs: Math.max(12, Math.min(55, Math.round(item.pingMs + (Math.random() - 0.5) * 4))),
          };
        });
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Default driver catalog if context is empty
  const activeDrivers = drivers.length > 0 ? drivers : [
    { id: 'DRV-101', name: 'James Wilson', status: 'On Route', vehicleId: 'TRK-4821', rating: 4.9 },
    { id: 'DRV-102', name: 'Sarah Connor', status: 'Available', vehicleId: 'TRK-1107', rating: 5.0 },
    { id: 'DRV-103', name: 'Mike Ross', status: 'On Route', vehicleId: 'TRK-9034', rating: 4.8 },
    { id: 'DRV-104', name: 'Elena Rostova', status: 'Available', vehicleId: 'TRK-2276', rating: 4.95 },
    { id: 'DRV-105', name: 'Rajesh Kumar', status: 'Resting', vehicleId: 'TRK-7712', rating: 4.7 }
  ];

  // Default vehicle fleet if context is empty
  const activeVehicles = vehicles.length > 0 ? vehicles : [
    { id: 'V-01', licensePlate: 'MH-12-DE-4821', type: 'Heavy Freight Hauler (16 Wheeler)', capacity: '32 Tons', status: 'Active' },
    { id: 'V-02', licensePlate: 'DL-01-TX-1107', type: 'Interstate Cargo Carrier (10 Wheeler)', capacity: '20 Tons', status: 'Active' },
    { id: 'V-03', licensePlate: 'KA-05-EX-9034', type: 'Express Delivery Van (EV)', capacity: '3.5 Tons', status: 'Active' },
    { id: 'V-04', licensePlate: 'TN-07-AR-2276', type: 'Heavy Freight Hauler (16 Wheeler)', capacity: '32 Tons', status: 'Active' },
    { id: 'V-05', licensePlate: 'WB-02-MN-7712', type: 'Autonomous Hub Feeder Drone', capacity: '800 Kg', status: 'Maintenance' }
  ];

  const filteredDrivers = activeDrivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVehicles = activeVehicles.filter(v => 
    v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* 1. HEADER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="chip v">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff2e] animate-ping" />
              Pan-India Fleet Telematics
            </span>
            <span className="font-mono text-xs text-[#7f8a79] flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
              NAVIC SATELLITE LOCK ACTIVE
            </span>
          </div>

          <ScannedTitle>
            <h1 className="font-['Syne'] font-extrabold uppercase text-4xl sm:text-6xl tracking-tight leading-none">
              FLEET &amp;<br />
              <span className="text-[#c8ff2e]">DRIVERS</span>
            </h1>
          </ScannedTitle>

          <p className="font-mono text-xs text-[#7f8a79] mt-3 max-w-xl">
            <TypewriterText text="FLEET TELEMETRY · 8 DRIVERS ACTIVE · LIVE GPS TRACKING" className="font-mono text-xs text-[#7f8a79]" />
          </p>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-3">
          <div className="flex bg-[#0d1114] border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setViewTab('drivers')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center gap-2 ${
                viewTab === 'drivers' ? 'bg-[#c8ff2e] text-[#06080a]' : 'text-[#7f8a79] hover:text-white'
              }`}
            >
              <UsersIcon size={15} animateOnHover={true} /> Drivers ({activeDrivers.length})
            </button>
            <button
              onClick={() => setViewTab('vehicles')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center gap-2 ${
                viewTab === 'vehicles' ? 'bg-[#c8ff2e] text-[#06080a]' : 'text-[#7f8a79] hover:text-white'
              }`}
            >
              <TruckIcon size={15} animateOnHover={true} /> Vehicles ({activeVehicles.length})
            </button>
          </div>

          <button
            onClick={() => alert('New operator registration portal online in admin cockpit.')}
            className="btn-volt primary px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider"
            data-mag
          >
            <Plus size={14} className="mr-1" />
            + Register New
          </button>
        </div>
      </div>

      {/* 2. SUMMARY KPI ROW */}
      <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TiltCard variants={itemVariants} className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79]">
              Authorized Pilots
            </span>
            <UsersIcon size={16} className="text-[#3ddc84]" animateOnHover={true} />
          </div>
          <div className="font-['Syne'] font-extrabold text-4xl text-[#eef2e6] leading-none">
            {activeDrivers.length}
          </div>
          <span className="font-mono text-[11px] text-[#3ddc84] block mt-2">
            ● 100% Certified Heavy Commercial
          </span>
        </TiltCard>

        <TiltCard variants={itemVariants} className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79]">
              Active Vehicles
            </span>
            <TruckIcon size={16} className="text-[#c8ff2e]" animateOnHover={true} />
          </div>
          <div className="font-['Syne'] font-extrabold text-4xl text-[#c8ff2e] leading-none">
            {activeVehicles.filter(v => v.status === 'Active').length}
          </div>
          <span className="font-mono text-[11px] text-[#7f8a79] block mt-2">
            In Active Dispatch Transit
          </span>
        </TiltCard>

        <TiltCard variants={itemVariants} className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79]">
              Fleet Safety Rating
            </span>
            <ShieldCheckIcon size={16} className="text-[#ff5a1f]" animateOnHover={true} />
          </div>
          <div className="font-['Syne'] font-extrabold text-4xl text-[#ff5a1f] leading-none">
            4.89 ★
          </div>
          <span className="font-mono text-[11px] text-[#7f8a79] block mt-2">
            Across 2.4M Safe Kilometers
          </span>
        </TiltCard>

        <TiltCard variants={itemVariants} className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#7f8a79]">
              Maintenance SLA
            </span>
            <ActivityIcon size={16} className="text-[#00f0ff]" animateOnHover={true} />
          </div>
          <div className="font-['Syne'] font-extrabold text-4xl text-[#00f0ff] leading-none">
            99.2%
          </div>
          <span className="font-mono text-[11px] text-[#7f8a79] block mt-2">
            Autonomous Depot Servicing
          </span>
        </TiltCard>
      </StaggerGrid>

      {/* 3. SEARCH & TABLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <input
            type="text"
            placeholder={viewTab === 'drivers' ? 'Search pilot by name or ID...' : 'Search vehicle by license plate or type...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-dark w-full max-w-sm text-xs font-mono"
          />
          <span className="font-mono text-xs text-[#7f8a79]">
            Displaying {viewTab === 'drivers' ? filteredDrivers.length : filteredVehicles.length} registered units
          </span>
        </div>

        <div className="card-bento p-0 overflow-hidden">
          <div className="overflow-x-auto">
            {viewTab === 'drivers' ? (
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#06080a] border-b border-white/10 text-[10px] uppercase text-[#7f8a79] tracking-wider">
                  <tr>
                    <th className="py-4 px-5">Pilot ID</th>
                    <th className="py-4 px-5">Pilot Name</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5">Assigned Vehicle</th>
                    <th className="py-4 px-5">Performance Rating</th>
                    <th className="py-4 px-5 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredDrivers.map((d, idx) => {
                    const isOnRoute = d.status === 'On Route';
                    const isAvail = d.status === 'Available';
                    const statusColor = isOnRoute ? '#00f0ff' : isAvail ? '#3ddc84' : '#ff5a1f';
                    const driverTelem = d.vehicleId && telemetry[d.vehicleId] 
                      ? telemetry[d.vehicleId] 
                      : { lat: 19.0760, lng: 72.8777, speedKmH: 0, pingMs: 24 };

                    return (
                      <motion.tr
                        key={d.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.3 }}
                        className="hover:bg-white/[0.02] transition"
                      >
                        <td className="py-4 px-5 font-bold text-[#c8ff2e]">{d.id}</td>
                        <td className="py-4 px-5 font-bold text-white text-sm">{d.name}</td>
                        <td className="py-4 px-5">
                          <span
                            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border inline-flex items-center gap-1.5"
                            style={{
                              color: statusColor,
                              borderColor: `${statusColor}40`,
                              background: `${statusColor}15`
                            }}
                          >
                            {isOnRoute && (
                              <motion.span
                                animate={{ y: [0, -2, 0] }}
                                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                                className="inline-flex items-center gap-1"
                              >
                                <TruckIcon size={13} className="text-[#00f0ff]" />
                                <Radio size={11} className="animate-pulse" />
                              </motion.span>
                            )}
                            {isAvail && <CheckCircle2 size={12} />}
                            {!isOnRoute && !isAvail && <Clock size={12} />}
                            {d.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-[#eef2e6]">
                          {d.vehicleId ? (
                            <div className="flex flex-col gap-1">
                              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white font-bold w-fit">
                                {d.vehicleId}
                              </span>
                              {isOnRoute && (
                                <span className="text-[10px] text-[#7f8a79] font-mono flex items-center gap-1">
                                  <Navigation size={10} className="text-[#00f0ff] animate-pulse" />
                                  {driverTelem.lat}°N, {driverTelem.lng}°E
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#7f8a79] italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-[#ff5a1f] font-bold">
                          <div className="flex items-center gap-1">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star, si) => (
                                <motion.span
                                  key={star}
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: star <= Math.round(d.rating) ? 1 : 0.25, scale: 1 }}
                                  transition={{ delay: idx * 0.05 + si * 0.08, duration: 0.2 }}
                                  className="text-[#ff5a1f]"
                                >
                                  <Star size={11} className={star <= Math.round(d.rating) ? 'fill-[#ff5a1f]' : ''} />
                                </motion.span>
                              ))}
                            </div>
                            <span className="text-xs text-white ml-1">{d.rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-right text-[#3ddc84]">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold">
                            <ShieldCheck size={14} /> FIDO2 Verified
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#06080a] border-b border-white/10 text-[10px] uppercase text-[#7f8a79] tracking-wider">
                  <tr>
                    <th className="py-4 px-5">Vehicle ID</th>
                    <th className="py-4 px-5">Registration Plate</th>
                    <th className="py-4 px-5">Model Specification</th>
                    <th className="py-4 px-5">Payload Capacity</th>
                    <th className="py-4 px-5">Operational Status</th>
                    <th className="py-4 px-5 text-right">Live Telemetry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredVehicles.map((v, idx) => {
                    const isActive = v.status === 'Active';
                    const isMaint = v.status === 'Maintenance';
                    const statusColor = isActive ? '#3ddc84' : '#ff5a1f';
                    const vehicleTelem = telemetry[v.id] || { lat: 19.0760, lng: 72.8777, speedKmH: 45, pingMs: 24 };

                    return (
                      <motion.tr
                        key={v.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.3 }}
                        className="hover:bg-white/[0.02] transition"
                      >
                        <td className="py-4 px-5 font-bold text-[#c8ff2e]">{v.id}</td>
                        <td className="py-4 px-5 font-bold text-white text-sm">{v.licensePlate}</td>
                        <td className="py-4 px-5 text-[#eef2e6]">{v.type}</td>
                        <td className="py-4 px-5 font-bold text-[#b7c1ae]">{v.capacity}</td>
                        <td className="py-4 px-5">
                          <span
                            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border inline-flex items-center gap-1.5"
                            style={{
                              color: statusColor,
                              borderColor: `${statusColor}40`,
                              background: `${statusColor}15`
                            }}
                          >
                            {isMaint ? (
                              <span className="relative flex h-2 w-2 mr-0.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                              </span>
                            ) : null}
                            {isActive ? <CheckCircle2 size={12} /> : <Wrench size={12} className="text-amber-400" />}
                            {v.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right font-mono">
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#00f0ff]">
                              <Zap size={13} className={isActive ? 'animate-pulse' : 'text-gray-500'} />
                              {isActive ? 'CANBus Live' : 'Depot Diagnostics'}
                              <span className="text-[10px] text-[#7f8a79] font-normal">
                                ({vehicleTelem.pingMs}ms)
                              </span>
                            </span>
                            <span className="text-[10px] text-[#7f8a79] flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#c8ff2e] animate-ping' : 'bg-amber-400'}`} />
                              <span>{vehicleTelem.lat}°N, {vehicleTelem.lng}°E</span>
                              {isActive && (
                                <span className="text-[#c8ff2e] font-semibold">· {vehicleTelem.speedKmH} km/h</span>
                              )}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
