import { useState, useEffect } from 'react';
import { useLogistics } from '../contexts/LogisticsContext';
import { getLocations, addOrder, type Location } from '../api';
import { X } from 'lucide-react';
import { SendIcon } from 'lucide-animated';
import { MorphButton } from './common/MorphButton';

interface QuickDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialToLocation?: string;
}

export default function QuickDispatchModal({ 
  isOpen, 
  onClose,
  onSuccess,
  initialToLocation
}: QuickDispatchModalProps) {
  const { products, logActivity } = useLogistics();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [destLocation, setDestLocation] = useState(initialToLocation || '');

  useEffect(() => {
    if (isOpen) {
      getLocations().then(locs => {
        setLocations(locs);
        if (initialToLocation) {
          const match = locs.find(l => l.name.toLowerCase().includes(initialToLocation.toLowerCase()) || l.id === initialToLocation);
          if (match) setDestLocation(match.id);
        }
      }).catch(console.error);
    }
  }, [isOpen, initialToLocation]);

  if (!isOpen) return null;

  const submitDispatch = async () => {
    const prod = products.find(p => p.id === selectedProduct);
    if (!prod || !destLocation) {
      alert("Please select both product and destination hub");
      throw new Error("Invalid selection");
    }
    
    const backendSource = locations.find(l => l.name.includes(prod.location) || l.id === prod.location)?.id;
    const backendDest = destLocation;

    if (backendSource && backendDest) {
      await addOrder({ source: backendSource, destination: backendDest });
      logActivity(`Created quick order for ${prod.name}`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
        setSelectedProduct('');
        setDestLocation('');
      }, 700);
    } else {
      alert("Please select valid network nodes mapping to the backend");
      throw new Error("Invalid network mapping");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#06080a]/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0d1114] border border-[#c8ff2e] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_0_40px_-10px_rgba(200,255,46,0.3)] relative space-y-5">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#c8ff2e]/20 text-[#c8ff2e] flex items-center justify-center font-bold">
              <SendIcon size={18} animateOnHover={true} />
            </div>
            <div>
              <h3 className="font-extrabold text-xl tracking-tight text-white font-['Syne'] uppercase">
                New Dijkstra Dispatch
              </h3>
              <p className="font-mono text-[10px] text-[#7f8a79] uppercase tracking-wider">
                Autonomous Corridor Route Allocation
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-[#7f8a79] hover:text-white hover:bg-white/5 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); submitDispatch(); }} className="space-y-4 text-xs font-sans">
          <div>
            <label className="font-mono text-[11px] text-[#7f8a79] uppercase block mb-1.5 font-bold">
              Select Inventory Stock
            </label>
            <select 
              className="input-dark text-xs"
              required 
              value={selectedProduct} 
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">-- Select SKU Product --</option>
              {products.filter(p => p.quantity > 0).map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Location: {p.location} · In Stock: {p.quantity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-mono text-[11px] text-[#7f8a79] uppercase block mb-1.5 font-bold">
              Destination Freight Node
            </label>
            <select 
              className="input-dark text-xs" 
              required 
              value={destLocation} 
              onChange={e => setDestLocation(e.target.value)}
            >
              <option value="">-- Select Dropoff Hub --</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} {loc.code ? `(${loc.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Path Preview Info */}
          <div className="p-4 rounded-xl bg-[#06080a] border border-white/10 space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-center text-[#c8ff2e] font-bold">
              <span>Dijkstra Algorithm Ready</span>
              <span>12ms SLA</span>
            </div>
            <p className="text-[#7f8a79]">
              Calculates shortest path across national highway corridors with real-time waypoint tracking.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-volt sm"
            >
              Cancel
            </button>
            <MorphButton
              label="Authorize & Dispatch →"
              loadingLabel="Routing..."
              successLabel="Dispatched ✓"
              errorLabel="Route Failed ✗"
              onClick={submitDispatch}
              variant="volt-primary"
              disabled={!selectedProduct || !destLocation}
            />
          </div>
        </form>

      </div>
    </div>
  );
}
